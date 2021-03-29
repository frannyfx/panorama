/**
 * @file Repository analysis system.
 * @author Francesco Compagnoni
 */

// Imports
import { promises as fs } from "fs";
import path from "path";
import BeeQueue from "bee-queue";
import Git, { Branch } from "nodegit";
import util from "util";
import GitIgnoreParser from "gitignore-parser";

// Logger
import createLogger from "../utils/logger";
const logger = createLogger("analysis");

// Modules
import cache, { getCacheDir, getRepository, insertRepository, removeRepository, updateRepository } from "./cache";
import queue, { RepoJob, RepoJobResult } from "./queue";
import { AnalysisStage, RepoJobProgress } from "../../shared/Queue";
import { buildResult, Result } from "../../shared/Result";
import { ContributorMap, generateBlameGroups } from "./blame";
import lexing, { lexFile } from "./lexing";
import { generateTokenGroups } from "./lexing/Lexer";
import { AnalysedItem, generateFolderEntries, processFileAnalysis } from "./Item";

// Models
import Analysis, { DatabaseAnalysis, DatabaseAnalysisStatus } from "../database/models/Analysis";
import DatabaseAnalysedItem from "../database/models/AnalysedItem";
import { insertOrUpdate as insertOrUpdateContributor } from "../database/models/AnalysisContributor";
import { dedupe, lerp } from "../../shared/utils";
import { extractVibrant } from "./colours";
import { getConnection } from "../database";

/**
 * Start the analysis system.
 */
export async function start() {
	// Ensure queue has started.
	await queue.start();

	// Initialise caching system.
	await cache.start();

	// Register lexers.
	await lexing.registerLexers();

	// Get queue.
	let repoQueue = queue.getRepoQueue();
	if (!repoQueue) throw new Error("Unable to get queue.");

	// Enable/disable queue handler depending on config.
	repoQueue.process(handleRepoJob);
}

/**
 * Stop the analysis system.
 */
export async function stop() {
	await queue.stop();
	await cache.stop();
}

/**
 * Report progress for a specific job.
 * @param job The job.
 * @param progressStage The current stage of analysis.
 */
function reportJobProgress(job: BeeQueue.Job<RepoJob>, stage: AnalysisStage, subProgress: number = 0) {
	// Create progress object.
	let progress : RepoJobProgress | null= null;

	// Switch stage.
	switch (stage) {
	case AnalysisStage.Starting: {
		progress = { value: lerp(.1, .3, subProgress), stage };
		break;
	}
	case AnalysisStage.Cloning: {
		progress = { value: lerp(.3, .4, subProgress), stage };
		break;
	}
	case AnalysisStage.Lexing: {
		progress = { value: lerp(.4, .9, subProgress), stage };
		break;
	}
	case AnalysisStage.Finalising: {
		progress = { value: lerp(.9, 1, subProgress), stage };
		break;
	}
	case AnalysisStage.Done: {
		progress = { value: 1, stage };
		break;
	}
	}

	job.reportProgress(progress);
}

/**
 * Clone a repository and return the repository object and the path where it was cloned.
 * @param job The job the repository is from.
 */
async function cloneRepository(job : BeeQueue.Job<RepoJob>) : Promise<Result> {
	try {
		// Report progress that we are cloning the repo.
		reportJobProgress(job, AnalysisStage.Cloning);

		// Create repository path.
		let repositoryPath = path.join(getCacheDir(), job.data.repository.full_name);

		// Check whether the path is empty and clear it if it isn't.
		// If the path does not exist, ignore the error.
		try {
			await fs.readdir(repositoryPath);
			await fs.rmdir(repositoryPath, { recursive: true });
		} catch (e) { }
		
		// Create path to store the repository.
		await fs.mkdir(repositoryPath, { recursive: true});

		// Clone the repository.
		let repository = await Git.Clone.clone(`https://github.com/${job.data.repository.full_name}.git`, repositoryPath, {
			fetchOpts: {
				callbacks: {
					credentials: () => Git.Cred.userpassPlaintextNew(job.data.access_token, "x-oauth-basic"),
					certificateCheck: () => 1
				}
			}
		});
		
		return buildResult(true, {
			repository,
			path: repositoryPath 
		});
	} catch (e) {
		logger.error(`Unable to clone repository ${job.data.repository.full_name}: ${e}`);
		return buildResult(false, undefined, e);
	}
}

/**
 * Retrieve a repository, whether it be from cache or by cloning it.
 * @param job The job to get the repository for.
 */
async function getJobRepository(job: BeeQueue.Job<RepoJob>) : Promise<Git.Repository | null> {
	// Attempt to fetch repo from cache.
	let cachedRepository = await getRepository(job.data.repository.id);
	if (cachedRepository) {
		logger.info(`Repository '${job.data.repository.full_name}' found in cache.`);
		
		// Open the repository.
		try {
			// Open the repository.
			let repository = await Git.Repository.open(cachedRepository.path);

			// Get current branch. 
			let branchName = (await repository.getCurrentBranch()).shorthand();

			// Fetch and pull changes.
			await repository.fetch("origin", {
				callbacks: {
					credentials: () => Git.Cred.userpassPlaintextNew(job.data.access_token, "x-oauth-basic"),
					certificateCheck: () => 1
				}
			});

			// Update the repository in the manifest.
			cachedRepository.updatedAt = new Date(job.data.repository.pushed_at);
			cachedRepository.lastAnalysedAt = new Date();
			cachedRepository.size = job.data.repository.size;
			await updateRepository(cachedRepository);

			// Merge branches.
			await repository.mergeBranches(branchName, `refs/remotes/origin/${branchName}`);
			return repository;
		} catch (e) {
			// Remove repository from cache.
			logger.warn(`Failed to open repository ${job.data.repository.id}. Removing and cloning...`);

			// If we couldn't remove the repository from the cache, fail.
			if (!(await removeRepository(job.data.repository.id))) {
				logger.warn(`Failed to remove repository ${job.data.repository.id} from cache.`);
				return null;
			}
		}
	}

	// Cache miss: clone repo.
	reportJobProgress(job, AnalysisStage.Cloning);
	logger.info(`Repository '${job.data.repository.full_name}' not found in cache.`);

	// Clone the repository.
	let cloneResult = await cloneRepository(job);

	// Fail the job if we were unable to clone the repository.
	if (!cloneResult.status.ok) return null;

	// Save the cloned repository info to the cache.
	let cachedItem = await insertRepository({
		id: job.data.repository.id,
		name: job.data.repository.full_name,
		path: cloneResult.result!.path,
		updatedAt: new Date(job.data.repository.pushed_at),
		lastAnalysedAt: new Date(),
		size: job.data.repository.size
	});

	// Fail the job if we were unable to save the repository into the cache.
	if (!cachedItem) return null;

	// Set repository.
	return cloneResult.result!.repository;
}

async function getLatestCommit(repository: Git.Repository) : Promise<Git.Commit> {
	let branch = (await repository.getCurrentBranch()).shorthand();
	let masterCommit = await repository.getBranchCommit(branch);
	return masterCommit;
}

/**
 * Get files from the repository.
 * @param repository The repository to get the files from.
 * @param directory The directory to search.
 */
function getRepoFiles(commit: Git.Commit) : Promise<string[] | null> {
	return new Promise(async resolve => {
		// Get the main branch from the repo.
		let fileTree = await commit.getTree();

		// Explore the file tree.
		let walker = fileTree.walk();
		let files : string[] = [];
		walker.on("entry", (entry) => files.push(entry.path()));
		walker.on("error", () => resolve(null));
		walker.on("end", () => resolve(files));
		walker.start();
	});
}

/**
 * Filter out files specified in .panoramaignore.
 * @param files The files to apply the filter to.
 * @param repoDir The directory where the repository is stored.
 */
async function filterIgnoredFiles(files: string[], repoDir: string) : Promise<string[]> {
	try {
		// Load .panoramaignore
		let panoramaIgnore = (await fs.readFile(path.join(repoDir, ".panoramaignore"))).toString("utf-8");
		let compiled = GitIgnoreParser.compile(panoramaIgnore);
		return files.filter(compiled.accepts);
	} catch (e) {
		return files;
	}
}

/**
 * Handler for analysing a queued repository.
 * @param job The job queued and the repository's data.
 * @param done Callback for when the job is complete.
 */
export async function handleRepoJob(job : BeeQueue.Job<RepoJob>, done : BeeQueue.DoneCallback<RepoJobResult>) : Promise<RepoJobResult> {
	logger.info(`Analysing repository '${job.data.repository.full_name}'.`);

	// Update the database analysis model.
	let analysis : DatabaseAnalysis = {
		analysisId: job.data.analysis.analysisId,
		repositoryId: job.data.analysis.repositoryId,
		requestedBy: job.data.analysis.requestedBy,
		status: DatabaseAnalysisStatus.STARTED,
		jobId: job.id,
		queuedAt: new Date(job.data.analysis.queuedAt),
		startedAt: new Date()
	};

	await Analysis.update(analysis);

	// Report to the user that the job is starting.
	reportJobProgress(job, AnalysisStage.Starting);

	// Get the repository.
	let repository = await getJobRepository(job);
	if (!repository) throw new Error("Could not retrieve the repository.");

	// Set the repository commit ID being analysed.
	let analysisCommit = await getLatestCommit(repository);
	analysis.commitId = analysisCommit.id().tostrS();
	await Analysis.update(analysis);

	// Set stage to lexing.
	reportJobProgress(job, AnalysisStage.Lexing);
	logger.info(`Lexing code from repository '${job.data.repository.full_name}'.`);

	// Get the repo directory.
	let repoDir = path.join(getCacheDir(), job.data.repository.full_name);

	// Get the files from the repository.
	var files = await getRepoFiles(analysisCommit);
	if (!files) throw new Error("Could not analyse repository files.");

	// Filter files specified in .panoramaignore.
	files = (await filterIgnoredFiles(files, repoDir));

	// Create list to hold the results of the analysis of each file.
	let analysisResults : AnalysedItem[] = [];

	// Create cache which maps contributor emails to their profiles.
	let contributorMap : ContributorMap = { "Anonymous": { id: null }};
	let unknownExtensions : Set<string> = new Set();
	let failedFiles = 0;

	// Lex and process blame on files, combining the analysis.
	for (var i = 0; i < files.length; i++) {
		// Get file.
		let file = files[i];

		// Run lexing.
		let result = await lexFile(repoDir, file);

		// If the lexing was successful, generate token and blame groups.
		if (result.ok) {
			let tokenGroups = await generateTokenGroups(result.tokens!);
			let blameGroups = await generateBlameGroups(job.data.repository.owner!.login, job.data.repository.name, job.data.access_token, repository, file, contributorMap);
			
			// Integrate the two analysis results together
			let analysis = processFileAnalysis(file, tokenGroups, blameGroups, contributorMap);
			analysisResults.push(analysis);
		} else {
			if (result.extension) unknownExtensions.add(result.extension);
			failedFiles++;
		}

		// Update progress.
		reportJobProgress(job, AnalysisStage.Lexing, i / files.length);
	}

	// Log a successful analysis.
	logger.success(`Analysed ${analysisResults.length} files from repository '${job.data.repository.full_name}'.`);
	if (failedFiles > 0) logger.warn(`${failedFiles} files with the following extensions failed lexing: ${[...unknownExtensions].join(", ")}.`);

	// Aggregate analysis data into subfolders.
	let folderEntries : AnalysedItem[] = generateFolderEntries(analysisResults);
	analysisResults.push(...folderEntries);
	logger.success(`Generated ${folderEntries.length} sub-folder aggregates from repository '${job.data.repository.full_name}'.`);

	// Finish up...
	reportJobProgress(job, AnalysisStage.Finalising);

	// Create ID map from contributor map (ID -> Contributor from Email -> Contributor).
	let idMap : ContributorMap = {};
	Object.keys(contributorMap).map(email => idMap[contributorMap[email].id] = contributorMap[email]);

	// Commit analysis to database.
	// - Remove duplicates from contributors.
	let contributors = dedupe(Object.keys(contributorMap).map(email => contributorMap[email]).filter(contributor => contributor && contributor.id), (a, b) => a.id === b.id);
	try {
		// - Get database connection.
		let connection = await getConnection();
		if (!connection) throw new Error();

		// - Create transaction to insert data.
		await connection.transaction(async transaction => {
			// - Insert contributors and update users with generated colours.
			await Promise.all(contributors.map(async contributor => {
				// Get vibrant colour from avatar.
				let vibrant = await extractVibrant(contributor.avatar_url);
	
				// Insert/update contributor.
				await insertOrUpdateContributor(analysis.analysisId!, {
					userId: contributor.id,
					login: contributor.login,
					colour: vibrant || undefined
				}, transaction);
			}));

			// - Insert analysed items and children.
			await DatabaseAnalysedItem.convertAndInsert(analysis, analysisResults, idMap, transaction);
		});

		// Set the job completion date.
		analysis.completedAt = new Date();
		analysis.status = DatabaseAnalysisStatus.COMPLETED;
		await Analysis.update(analysis);

		// Call the job completion callback returning the analysis ID.
		logger.success(`Completed analysis ${analysis.analysisId!} of '${job.data.repository.full_name}'.`);

		// Fetch final analysis data with joins and return it.
		return {
			analysis: (await Analysis.get(analysis.analysisId!))!
		};
	} catch (e) {
		console.log(e);
		throw new Error("Database insertion failed.");
	}
}

export default {
	start, stop
};