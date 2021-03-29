/**
 * @file The activity data model.
 * @author Francesco Compagnoni
 */

// Imports
import { Data } from "../Result";

export enum ActivityType {
	ANALYSIS = "analysis"
};

export interface ActivityMap {
	[key: string]: Activity
};

export interface Activity {
	id: string,
	type: ActivityType,
	data: Data,
	date: Date
};