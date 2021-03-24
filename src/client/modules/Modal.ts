/**
 * @file Module to handle modals (pop-ups).
 * @author Francesco Compagnoni
 */

// Imports
import Store from "../store";
import { i18n } from "../i18n";

// Modules
import config from "../config";

// Interfaces
/**
 * Modal interfaces.
 */
export interface Modal {
	id: string,
	data: ModalData,
	onAction?: ModalActionCallback
};

/**
 * Callback method to the modal's action handler.
 */
export type ModalActionCallback = (modal: Modal, actionId: string) => unknown;

/**
 * The function gets called to return the content of a button. This helps with localised
 * strings as they may not yet be available.
 */
export type ModalActionContentFunction = () => string;

export interface ModalData {
	title: string,
	description: string,
	icon: string[],
	theme: "NORMAL" | "DESTRUCTIVE",
	actions: ModalAction[]
};

export interface ModalAction {
	type: "PRIMARY" | "NORMAL",
	id: string,
	icon?: string[],
	content: ModalActionContentFunction,
	handler?: Function
};

export interface ModalTemplate {
	icon: string[],
	theme: "NORMAL" | "DESTRUCTIVE",
	actions: ModalAction[]
};

/**
 * Modal templates.
 */
export const OK : ModalTemplate = {
	icon: ["fas", "info-circle"],
	theme: "NORMAL",
	actions: [{
		type: "PRIMARY",
		id: "OK",
		icon: ["fas", "check"],
		content: () => i18n.t("modals.templates.OK.actions.ok").toString(),
		handler: (modal: Modal) => handleModalAction(modal, "OK")
	}]
};

export const OK_CANCEL : ModalTemplate = {
	icon: ["fas", "info-circle"],
	theme: "NORMAL",
	actions: [{
		type: "NORMAL",
		id: "CANCEL",
		icon: ["fas", "chevron-left"],
		content: () => i18n.t("modals.templates.OK_CANCEL.actions.cancel").toString(),
		handler: (modal: Modal) => handleModalAction(modal, "CANCEL")
	}, {
		type: "PRIMARY",
		id: "OK",
		icon: ["fas", "check"],
		content: () => i18n.t("modals.templates.OK_CANCEL.actions.ok").toString(),
		handler: (modal: Modal) => handleModalAction(modal, "OK")
	}]
};

export const OK_CANCEL_DESTRUCTIVE : ModalTemplate = {
	icon: ["fas", "exclamation-circle"],
	theme: "DESTRUCTIVE",
	actions: [{
		type: "NORMAL",
		id: "CANCEL",
		icon: ["fas", "chevron-left"],
		content: () => i18n.t("modals.templates.OK_CANCEL_DESTRUCTIVE.actions.cancel").toString(),
		handler: (modal: Modal) => handleModalAction(modal, "CANCEL")
	}, {
		type: "PRIMARY",
		id: "OK",
		icon: ["fas", "check"],
		content: () => i18n.t("modals.templates.OK_CANCEL_DESTRUCTIVE.actions.ok").toString(),
		handler: (modal: Modal) => handleModalAction(modal, "OK")
	}]
};

/**
 * Vuex interfaces.
 */
export interface ModalsObject {
	[key: string]: Modal
};

// Variables 
var modalCounter = 0;

/**
 * Generate a unique ID for a modal
 * @returns The ID for a new modal.
 */
export function generateModalId() : string {
	return `modal_${modalCounter++}`;
}

/**
 * Generate a modal based on an existing template.
 * @param template The template to use to generate the modal.
 * @param title The title to give to the modal.
 * @param description The description to give to the modal.
 * @param icon An icon that can be specified to override the default template icon.
 */
export function createModal(template: ModalTemplate, title: string, description: string, icon: string[] | undefined = undefined, onAction: ModalActionCallback | undefined = undefined) {
	// Generate a modal based on the given template.
	let modal : Modal = {
		id: generateModalId(),
		data: {
			title, description,
			icon: icon ? icon : template.icon,
			theme: template.theme,
			actions: template.actions
		},
		onAction
	};

	// Add to store.
	Store.commit("Modals/add", modal);
}

/**
 * Add handlers to a list of actions.
 * @param actions The actions to add handlers to.
 */
function createActionHandlers(actions: ModalAction[]) {
	actions.map(action => {
		action.handler = (modal : Modal) => handleModalAction(modal, action.id);
		return action;
	});
}

/**
 * Display a custom modal.
 * @param data The data detailing the specifics of the modal.
 * @param onAction A handler for when an action has been clicked.
 */
export function createCustomModal(data: ModalData, onAction: ModalActionCallback | undefined = undefined) {
	// Add handlers to the given actions.
	createActionHandlers(data.actions);

	// Generate a modal based on the given data.
	let modal : Modal = {
		id: generateModalId(),
		data, onAction
	};

	// Add to store.
	Store.commit("Modals/add", modal);
}

/**
 * Dismiss a modal.
 * @param modal The modal object to be dismissed.
 */
export function dismissModal(modal: Modal) {
	// Remove the modal.
	Store.commit("Modals/remove", modal);
	
	// Lazy delete the modal data.
	setTimeout(() => Store.commit("Modals/deleteData", modal), config.store.lazyDataPurgeDelay);
}

/**
 * Handle an action being performed in a modal.
 * @param modal The modal whose action needs to be handled.
 * @param actionId The ID of the action.
 * @param dismiss Whether or not to dismiss the modal once the action has been called.
 */
function handleModalAction(modal: Modal, actionId: string, dismiss: boolean = true) {
	// Call the modal action handler.
	if (modal.onAction) modal.onAction(modal, actionId);

	// Dismiss the modal if desired.
	if (dismiss) dismissModal(modal);
}