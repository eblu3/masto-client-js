import * as mastodon from "./mastodon.mjs";
import {getStatus, getAccount, getAccountByHandle, renderEmojis} from "../masto_ts.js";

let commonStylesheet: CSSStyleSheet;
let profileHeaderStylesheet: CSSStyleSheet;
let appStatusStylesheet: CSSStyleSheet;

class ProfileHeader extends HTMLElement {
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

	static get observedAttributes() {
		return ["acctid", "acct"];
	}
}

class StatusHeader extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		console.log("test");
	}

	AttributeChangedCallback(name: string, oldValue: string, newValue: string) {
		const shadow = this.shadowRoot ?? this.attachShadow({mode: "open"});
		const testElement = shadow.getElementById("test");

		if(testElement != null) {

		} else {
			testElement.innerText = "this is a test";
			shadow.appendChild(testElement);
		}
	}
}

class Status extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		const article = document.createElement("article");
		const header = document.createElement("app-status-header");

		article.setAttribute("id", "post-content");

		shadow.adoptedStyleSheets = [commonStylesheet, appStatusStylesheet];
		
		shadow.appendChild(header);
		shadow.appendChild(article);
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		console.log(`${name} changed from ${oldValue} to ${newValue}`);
		if(name == "statusid") {
			getStatus(newValue).then((status) => {
				this.shadowRoot.getElementById("post-content").innerHTML = status.content;
			});
		}
	}

	static get observedAttributes() {
		return ["statusid"];
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
	profileHeaderStylesheet = await getStylesheet("/css/components/app-profile-header.css");
	appStatusStylesheet = await getStylesheet("/css/components/app-status.css");
}

function initComponents() {
	initStylesheets().then(() => {
		customElements.define("app-profile-header", ProfileHeader, {extends: "address"});
		customElements.define("app-status-header", StatusHeader, {extends: "header"});
		customElements.define("app-status", Status, {extends: "article"});
	});
}

initComponents();