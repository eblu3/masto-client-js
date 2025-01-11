import * as mastodon from "../mastodon/mastodon.mjs";

export interface MenuCategory {
	categoryName: string;
	contents: MenuItem[];
}

export interface MenuItem {
	name: string;
	onClick: () => void;
	icon?: string | URL;
	iconOptions?: {option: string, value: string}[];
}

export interface StatusEvents {
	onStatusClick?: (id: string) => void;
	onProfileLinkClick?: (acct: string | mastodon.Account) => void;
}

export function clickOutsideHandler(event: Event, elementToDetect: HTMLElement) {
	if(event.target != elementToDetect) {
		elementToDetect.remove();
	}
}

export const materialIcons = await getStylesheet("/fonts/material-symbols-outlined-class.css");
export const commonStylesheet = await getStylesheet("/css/components/common.css");

export async function getStylesheet(url: string): Promise<CSSStyleSheet> {
	const stylesheet = new CSSStyleSheet();
	const response = await fetch(url);
	const stylesheetContent = await response.text();

	stylesheet.replace(stylesheetContent);

	return stylesheet;
}

export async function getTemplate(url: string, templateId: string): Promise<DocumentFragment> {
	const response = await fetch(url);
	const template = (new DOMParser().parseFromString(await response.text(), "text/html").getElementById(templateId) as HTMLTemplateElement);

	return template.content;
}
