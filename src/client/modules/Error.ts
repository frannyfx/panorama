/**
 * @file Responsible for displaying fatal errors.
 * @author Francesco Compagnoni
 */

// Modules
import { i18n } from "../i18n";
import Store from "../store";

export enum Error {
	General = "general"
};

export function showError(error: Error, next: Function | undefined = undefined) {
	// Fail navigation if a valid next function was passed.
	if (next) next({ name: "error" });
	
	// Set error.
	Store.commit("setLoading", false);
	Store.commit("setError", error);
}