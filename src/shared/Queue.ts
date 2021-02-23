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