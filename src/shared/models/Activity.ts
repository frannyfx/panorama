/**
 * @file The activity data model.
 * @author Francesco Compagnoni
 */

// Imports
import { Data } from "../Result";

export enum ActivityType {
	ANALYSIS = "analysis"
};

export interface Activity {
	type: ActivityType,
	data: Data,
	date: Date
};