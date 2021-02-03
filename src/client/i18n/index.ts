// Imports
import Vue from "vue";
import VueI18n from "vue-i18n";

// Register i18n plugin.
Vue.use(VueI18n);

// Create i18n.
export const i18n =  new VueI18n();

// Array of loaded languages.
const loadedLanguages : string[] = [];

function setI18nLanguage(lang : string) {
	i18n.locale = lang;
	document.querySelector("html")!.setAttribute("lang", lang);
	return lang;
}

/**
 * Asynchronously load a locale file.
 * @param lang The language to load.
 */
export async function loadLanguageAsync(lang : string) {
	// Resolve immediately if the language requested has already been loaded.
	if (i18n.locale == lang || loadedLanguages.includes(lang)) return setI18nLanguage(lang);
	
	// Load the desired locale.
	let locale = await import(/* webpackChunkName: "lang-[request]" */ `./locales/${lang}.json`);
	i18n.setLocaleMessage(lang, locale);
	loadedLanguages.push(lang);
	return setI18nLanguage(lang);
}