/**
 * @file Repository analysis system.
 * @author Francesco Compagnoni
 */

// Imports
import { promises as fs } from "fs";
import path from "path";
import BeeQueue from "bee-queue";
import Git from "nodegit";

// Config
import loadConfig, { Config } from "../Config";
const config : Config = loadConfig();

// Modules
const logger = require("../utils/logger")("analysis");
import cache, { getCacheDir, getRepository, insertRepository } from "./cache";
import queue, { AnalysisStage, RepoJob, RepoJobProgress, RepoJobResult } from "./queue";
import { buildResult, Result } from "../../shared/Result";

/**
 * 
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
 * 
 * @param job 
 * @param progressStage 
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
	case AnalysisStage.Processing: {
		progress = { value: .7, stage };
		break;
	}
	case AnalysisStage.Finalising: {
		progress = { value: .9, stage };
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
 * 
 * @param job 
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
 * Handler for analysing a queued repository.
 * @param job The job queued and the repository's data.
 * @param done Callback for when the job is complete.
 */
export async function handleRepoJob(job : BeeQueue.Job<RepoJob>, done : BeeQueue.DoneCallback<RepoJobResult>) {
	logger.info(`Analysing repository '${job.data.repository.name}' with access token '${job.data.access_token.substr(0, 10)}'...`);

	// Report progress that the job is starting.
	reportJobProgress(job, AnalysisStage.Starting);

	// Look-up repository in the cache.
	let cachedRepository = await getRepository(job.data.repository.id);

	// Cache miss, we have to clone the repo.
	var clonedRepository : Git.Repository | null = null;
	if (!cachedRepository) {
		logger.info(`Repository '${job.data.repository.name}' not found in cache. Cloning...`);

		// Clone the repository.
		let cloneResult = await cloneRepository(job);

		// Fail the job if we were unable to clone the repository.
		if (!cloneResult.status.ok) return done(new Error("Failed to clone the repository."));

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
		if (!cachedItem) return done(new Error("Failed to cache the repository."));

		// Set repository.
		clonedRepository = cloneResult.result!.repository;
	} else {
		logger.info(`Repository '${job.data.repository.name}' found in cache. Updating...`);
		// Repo already cached, open it.
		clonedRepository = await Git.Repository.open(cachedRepository.path);

		// Check if we need to pull changes.
		// TODO: Test pulling.
		if (cachedRepository.analysed_at < cachedRepository.updated_at) {
			let branch = (await clonedRepository.getCurrentBranch()).shorthand();
			clonedRepository.mergeBranches(branch, "refs/remotes/origin/" + branch);
		}
	}

	reportJobProgress(job, AnalysisStage.Lexing);
	logger.info(`Lexing code from repository '${job.data.repository.name}'.`);

	done(null, {
		result: 12345
	});
}

/**
 * 
 */
export async function stop() {
	await queue.stop();
	await cache.stop();
}

export default {
	start, stop
};