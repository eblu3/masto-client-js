import * as mastodon from "./mastodon.mjs";
import {getStatus} from "../masto_ts.js";

let commonStylesheet: CSSStyleSheet;
let appStatusStylesheet: CSSStyleSheet;

class Status extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		const article = document.createElement("article");

		shadow.adoptedStyleSheets = [appStatusStylesheet];
		
		getStatus(this.getAttribute("statusid")).then((status) => {
			article.innerHTML += status.content;
		});

		shadow.appendChild(article);
	}
}

async function getStylesheet(url: string): Promise<CSSStyleSheet> {
	const stylesheet = new CSSStyleSheet();
	const response = await fetch(url);
	const stylesheetContent = await response.text();

	stylesheet.replace(stylesheetContent);

	return stylesheet;
}

async function initStylesheets() {
	commonStylesheet = await getStylesheet("/css/components/common.css");
	appStatusStylesheet = await getStylesheet("/css/components/app-status.css");
}

function initComponents() {
	initStylesheets().then(() => {
		customElements.define("app-status", Status, {extends: "article"});
	});
}

initComponents();