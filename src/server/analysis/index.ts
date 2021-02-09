/**
 * @file Repository analysis system.
 * @author Francesco Compagnoni
 */

// Imports
import { promises as fs } from "fs";
import path from "path";
import BeeQueue from "bee-queue";
import Git, { Branch } from "nodegit";

// Config
import loadConfig, { Config } from "../Config";
const config : Config = loadConfig();

// Modules
const logger = require("../utils/logger")("analysis");
import cache, { getCacheDir, getRepository, insertRepository, removeRepository } from "./cache";
import queue, { AnalysisStage, RepoJob, RepoJobProgress, RepoJobResult } from "./queue";
import { buildResult, Result } from "../../shared/Result";
import { computeRepoBlame } from "./blame";
import { lexIterative, lex, testLexing } from "./lexing/Lexer";

// Test
import javascriptLexer from "./lexing/langs/javascript";

/**
 * Start the analysis system.
 */
export async function start() {
	// Initialise caching system.
	await cache.start();

	// Initialise queue system.
	await queue.start();

	// Get queue.
	let repoQueue = queue.getRepoQueue();
	if (!repoQueue) throw new Error("Unable to get queue.");

	// Set queue handlers.
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
function reportJobProgress(job: BeeQueue.Job<RepoJob>, stage: AnalysisStage) {
	// Create progress object.
	let progress : RepoJobProgress | null= null;

	// Switch stage.
	switch (stage) {
	case AnalysisStage.Starting: {
		progress = { value: .1, stage };
		break;
	}
	case AnalysisStage.Cloning: {
		progress = { value: .3, stage };
		break;
	}
	case AnalysisStage.Lexing: {
		progress = { value: .4, stage };
		break;
	}
	case AnalysisStage.Finalising: {
		progress = { value: .9, stage };
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
		let repositoryPath = path.join(getCacheDir(), job.data.repository.name);
		await fs.mkdir(repositoryPath, { recursive: true});

		// Clone the repository.
		let repository = await Git.Clone.clone(`https://github.com/${job.data.repository.name}.git`, repositoryPath, {
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
		console.log(e);
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
		logger.info(`Repository '${job.data.repository.name}' found in cache.`);
		
		// Open the repository.
		try {
			let repository = await Git.Repository.open(cachedRepository.path);
			// TODO: Pull changes, update analysis date.
			// ...

			return repository;
		} catch (e) {
			// Remove repository from cache.
			logger.warn(`Failed to open repository ${job.data.repository.id}. Removing and cloning...`);

			// If we couldn't remove the repository from the cache, fail.
			if (!(await removeRepository(job.data.repository.id))) {
				logger.warn(`Failed to remove repository ${job.data.repository.id} from cache.`);
				return null;
			}

			// Remove from filesystem.
			await fs.rmdir(cachedRepository.path, { recursive: true });
		}
	}

	// Cache miss: clone repo.
	reportJobProgress(job, AnalysisStage.Cloning);
	logger.info(`Repository '${job.data.repository.name}' not found in cache.`);

	// Clone the repository.
	let cloneResult = await cloneRepository(job);

	// Fail the job if we were unable to clone the repository.
	if (!cloneResult.status.ok) return null;

	// Save the cloned repository info to the cache.
	let cachedItem = await insertRepository({
		id: job.data.repository.id,
		name: job.data.repository.name,
		path: cloneResult.result!.path,
		updated_at: job.data.repository.updated_at,
		analysed_at: new Date(),
		size: job.data.repository.size
	});

	// Fail the job if we were unable to save the repository into the cache.
	if (!cachedItem) return null;

	// Set repository.
	return cloneResult.result!.repository;
}

/**
 * Get files from the repository.
 * @param repository The repository to get the files from.
 * @param directory The directory to search.
 */
function getRepoFiles(repository: Git.Repository) : Promise<string[] | null> {
	return new Promise(async resolve => {
		// Get the main branch from the repo.
		let branch = (await repository.getCurrentBranch()).shorthand();
		let masterCommit = await repository.getBranchCommit(branch);
		let fileTree = await masterCommit.getTree();

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
 * Handler for analysing a queued repository.
 * @param job The job queued and the repository's data.
 * @param done Callback for when the job is complete.
 */
export async function handleRepoJob(job : BeeQueue.Job<RepoJob>, done : BeeQueue.DoneCallback<RepoJobResult>) {
	logger.info(`Analysing repository '${job.data.repository.name}'.`);

	// Report progress that the job is starting.
	reportJobProgress(job, AnalysisStage.Starting);

	// Get the repository.
	let repository = await getJobRepository(job);
	if (!repository) return done(new Error("Could not retrieve the repository."));

	// Set stage to lexing.
	reportJobProgress(job, AnalysisStage.Lexing);
	logger.info(`Lexing code from repository '${job.data.repository.name}'.`);

	// Get the from the repository.
	let files = await getRepoFiles(repository);
	if (!files) return done(new Error("Could not analyse repository files."));

	// Process the files using Git blame.
	// TODO: Filter .panoramaignore files.
	//let fileBlames = computeRepoBlame(repository, files);
	
	// Lex files.
	//testLexing();

	// Commit analysis to database.
	// ...
	reportJobProgress(job, AnalysisStage.Finalising);

	done(null, {
		result: 12345
	});
}

export default {
	start, stop
};