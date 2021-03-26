/**
 * @file Routes handling live ticket updates.
 * @author Francesco Compagnoni
 */

// Imports
import crypto from "crypto";

// Logger
import createLogger from "../../../../../utils/logger";
const logger = createLogger("q_sock");

// Modules
import { Method } from "../../../../../../shared/Method";
import { Request, Route } from "../../../Route";
import { SocketStream } from "fastify-websocket";
import { Data } from "../../../../../../shared/Result";
import queue, { RepoJobResult } from "../../../../../analysis/queue";
import ticket, { TicketVerificationResult } from "../../../../../crypto/ticket";
import { buildResponse, Codes } from "../../../API";
import { checkAuth } from "../../../../../github";
import { AnalysisStage, RepoJobProgress } from "../../../../../../shared/Queue";

/**
 * Serialise and send a payload to a connected client.
 * @param connection The connection to send it on.
 * @param data The data to send.
 */
function send(connection: SocketStream, data: Data) {
	try {
		connection.socket.send(JSON.stringify(data));
	} catch (e) {
		logger.warn(`Failed to send update to socket - ${e}`);
	}
	
}

/**
 * Send a progress update to the client about a job.
 * @param connection The connection to send it on.
 * @param jobId The ID of the job.
 * @param status The status of the job.
 * @param progress The current progress.
 */
function sendJobProgress(connection: SocketStream, jobId: number, status: string, progress: RepoJobProgress, result: RepoJobResult | null = null) {
	send(connection, buildResponse(Codes.OK, { jobId, status, progress, result }));
}

let route : Route = {
	method: Method.WS,
	url: "/api/queue/updates",
	on: {
		open(connection: SocketStream, request: Request) {
			// ...
		},
		async message(connection: SocketStream, message: string) {
			// Parse JSON.
			var payload : Data | null = null;
			try { 
				payload = JSON.parse(message);
			} catch (e) { 
				return send(connection, buildResponse(Codes.BadRequest));
			}

			// Validate payload.
			if (!payload || !payload.ticket || !payload.accessToken)
				return send(connection, buildResponse(Codes.BadRequest));

			// Verify ticket signature.
			let ticketValidation : TicketVerificationResult = await ticket.verify(payload.ticket);
			if (!ticketValidation.ok)
				return send(connection, buildResponse(Codes.Forbidden));

			// Verify authentication.
			let authResult = await checkAuth(payload.accessToken);
			if (!authResult.status.ok)
				return send(connection, buildResponse(Codes.NoAuth));

			// Ensure the hash in the ticket matches the hash of our current valid access token.
			let accessTokenHash = crypto.createHash("sha256").update(payload.accessToken).digest("hex");
			if (accessTokenHash != ticketValidation.decoded!.accessTokenHash)
				return send(connection, buildResponse(Codes.NoAuth));

			// Retrieve the job from the queue.
			let jobId = ticketValidation.decoded!.jobId;
			let job = await queue.getRepoQueue()?.getJob(jobId);
			if (!job)
				return send(connection, buildResponse(Codes.NotFound));

			// Subscribe to job events and immediately send the current progress.
			sendJobProgress(connection, jobId, job!.status, job!.progress);
			job.on("progress", progress => sendJobProgress(connection, jobId, job!.status, progress));
			job.on("succeeded", (result : RepoJobResult) => sendJobProgress(connection, jobId, "succeeded", { value: 1, stage: AnalysisStage.Done }, result));
			job.on("failed", () => sendJobProgress(connection, jobId, "failed", job!.progress));
			job.on("retrying", () => sendJobProgress(connection, jobId, "retrying", job!.progress));
			logger.success(`Subscribed to updates on job ${job.id}.`);
		},
		close(connection: SocketStream, event: any) {
			// ...
		}
	}
};

export default route;