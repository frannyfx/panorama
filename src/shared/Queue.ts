/**
 * @file Enums and interfaces for the queueing system.
 * @author Francesco Compagnoni
 */

export enum AnalysisStage {
	Starting,
	Cloning,
	Lexing,
	Finalising,
	Done
};

export interface RepoJobProgress {
	value: number,
	stage: AnalysisStage
};