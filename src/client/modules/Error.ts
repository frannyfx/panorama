/**
 * @file Responsible for displaying fatal errors.
 * @author Francesco Compagnoni
 */

// Modules
import { Data } from "../../shared/Result";
import { i18n } from "../i18n";
import Store from "../store";

export enum Error {
	General = "general",
	NotFound = "notFound"
};

export function showError(error: Error, currentRoute: Data | undefined = undefined, next: Function | undefined = undefined) {
	// Fail navigation if a valid next function was passed.
	if (next) next({ name: "error", params: { locale: currentRoute?.params.locale ?? "en" }});
	
	// Set error.
	Store.commit("setLoading", false);
	Store.commit("setError", error);
}