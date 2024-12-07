import * as mastodon from "./mastodon.mjs";
import {instanceUrl, getStatus, getAccount, getAccountByHandle, renderEmojis} from "../masto_ts.js";

let commonStylesheet: CSSStyleSheet;
let profileHeaderStylesheet: CSSStyleSheet;
let appStatusStylesheet: CSSStyleSheet;

let statusHeaderTemplate: DocumentFragment;
let statusTemplate: DocumentFragment;
let cardTemplate: DocumentFragment;

class ProfileHeader extends HTMLElement {
	static observedAttributes = ["acctid", "acct"];
	
	constructor() {
		super();
	}

	#buildElement(shadowRoot: ShadowRoot) {
		const container = document.createElement("address");
		const header = document.createElement("div");
		const infoContainer = document.createElement("div");
		const avatar = document.createElement("img");
		const displayName = document.createElement("h1");
		const handle = document.createElement("p");
		const bio = document.createElement("p");

		container.setAttribute("id", "container");

		header.setAttribute("id", "header");

		infoContainer.setAttribute("id", "info-container");

		avatar.setAttribute("id", "avatar");

		displayName.setAttribute("id", "display-name");
		displayName.setAttribute("class", "display-name");

		handle.setAttribute("id", "handle");

		bio.setAttribute("id", "bio");

		infoContainer.appendChild(avatar);
		infoContainer.appendChild(displayName);
		infoContainer.appendChild(handle);
		infoContainer.appendChild(bio);
				
		container.appendChild(header);
		container.appendChild(infoContainer);
		shadowRoot.appendChild(container);
	}

	#genElement(account: mastodon.Account, shadowRoot: ShadowRoot) {
		shadowRoot.getElementById("container").style.setProperty("--header-url", `url(${account.header.href})`);
		shadowRoot.getElementById("avatar").setAttribute("src", account.avatar.href);
		shadowRoot.getElementById("display-name").innerHTML = renderEmojis(account.displayName, account.emojis);
		shadowRoot.getElementById("handle").innerText = `@${account.acct}`;
		shadowRoot.getElementById("bio").innerHTML = renderEmojis(account.note, account.emojis);
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet, profileHeaderStylesheet];

		this.#buildElement(shadow);
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if(name == "acctid") {
			getAccount(newValue).then((account) => {
				this.#genElement(account, this.shadowRoot);
			});
		} else if(name == "acct") {
			getAccountByHandle(newValue).then((account) => {
				this.#genElement(account, this.shadowRoot);
			});
		}
	}
}

class StatusHeader extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});

		shadow.adoptedStyleSheets = [commonStylesheet, appStatusStylesheet];

		shadow.appendChild(statusHeaderTemplate.cloneNode(true));
	}
}

class Status extends HTMLElement {
	static observedAttributes = ["statusid"];

	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});

		shadow.adoptedStyleSheets = [commonStylesheet, appStatusStylesheet];

		shadow.appendChild(statusTemplate.cloneNode(true));
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		console.log(`${name} changed from ${oldValue} to ${newValue}`);
		if(name == "statusid") {
			getStatus(newValue).then((status) => {
				const shadowRoot = this.shadowRoot;
				const headerRoot = this.getElementsByTagName("app-status-header")[0].shadowRoot;

				headerRoot.getElementById("avatar").setAttribute("src", status.account.avatar.href);
				headerRoot.getElementById("display-name").innerHTML = renderEmojis(status.account.displayName, status.account.emojis);
				headerRoot.getElementById("acct").innerText = `@${status.account.acct}`;
				
				if(status.language) {
					shadowRoot.getElementById("status-root").setAttribute("lang", status.language.language);
				} else if(shadowRoot.getElementById("status-root").hasAttribute("lang")) {
					shadowRoot.getElementById("status-root").removeAttribute("lang");
				}
				shadowRoot.getElementById("post-content").innerHTML = renderEmojis(status.content, status.emojis);
				shadowRoot.getElementById("post-url").setAttribute("href", new URL(`@${status.account.acct}/${status.id}`, instanceUrl).href);
			});
		}
	}
}

async function getStylesheet(url: string): Promise<CSSStyleSheet> {
	const stylesheet = new CSSStyleSheet();
	const response = await fetch(url);
	const stylesheetContent = await response.text();

	stylesheet.replace(stylesheetContent);

	return stylesheet;
}

async function getTemplate(url: string, templateId: string): Promise<DocumentFragment> {
	const response = await fetch(url);
	const template = (new DOMParser().parseFromString(await response.text(), "text/html").getElementById(templateId) as HTMLTemplateElement);

	return template.content;
}

async function initTemplates() {
	statusHeaderTemplate = await getTemplate("/templates/status.html", "header");
	statusTemplate = await getTemplate("/templates/status.html", "status");
	cardTemplate = await getTemplate("/templates/card.html", "card");
}

async function initStylesheets() {
	commonStylesheet = await getStylesheet("/css/components/common.css");
	profileHeaderStylesheet = await getStylesheet("/css/components/app-profile-header.css");
	appStatusStylesheet = await getStylesheet("/css/components/app-status.css");
}

function initComponents() {
	initTemplates().then(() => {
		initStylesheets().then(() => {
			customElements.define("app-profile-header", ProfileHeader, {extends: "address"});
			customElements.define("app-status-header", StatusHeader, {extends: "header"});
			customElements.define("app-status", Status, {extends: "article"});
		});
	});
}

initComponents();