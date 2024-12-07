import * as mastodon from "./mastodon.mjs";
import {getStatus, getAccount, getAccountByHandle, renderEmojis} from "../masto_ts.js";

let commonStylesheet: CSSStyleSheet;
let profileHeaderStylesheet: CSSStyleSheet;
let appStatusStylesheet: CSSStyleSheet;

class ProfileHeader extends HTMLElement {
	constructor() {
		super();
	}

	#buildElement(account: mastodon.Account, targetElement: HTMLElement) {
		const header = document.createElement("div");
		const infoContainer = document.createElement("div");
		const avatar = document.createElement("img");
		const displayName = document.createElement("h1");
		const handle = document.createElement("p");
		const bio = document.createElement("p");

		header.setAttribute("id", "header");

		infoContainer.setAttribute("id", "info-container");

		avatar.setAttribute("id", "avatar");
		avatar.setAttribute("src", account.avatar.href);

		displayName.setAttribute("id", "display-name");
		displayName.innerHTML = renderEmojis(account.displayName, account.emojis);

		handle.setAttribute("id", "handle");
		handle.innerText = `@${account.acct}`;

		bio.setAttribute("id", "bio");
		bio.innerHTML = renderEmojis(account.note, account.emojis);

		infoContainer.appendChild(avatar);
		infoContainer.appendChild(displayName);
		infoContainer.appendChild(handle);
		infoContainer.appendChild(bio);
				
		targetElement.style.setProperty("--header-url", `url(${account.header.href})`);
		targetElement.appendChild(header);
		targetElement.appendChild(infoContainer);
	}

	#regenElement(account: mastodon.Account, shadowRoot: ShadowRoot, targetElement: HTMLElement) {
		shadowRoot.getElementById("avatar").setAttribute("src", account.avatar.href);
		shadowRoot.getElementById("display-name").innerHTML = renderEmojis(account.displayName, account.emojis);
		shadowRoot.getElementById("handle").innerText = `@${account.acct}`;
		shadowRoot.getElementById("bio").innerHTML = renderEmojis(account.note, account.emojis);
		
		targetElement.style.setProperty("--header-url", `url(${account.header.href})`);
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		const shadow = this.shadowRoot ?? this.attachShadow({mode: "open"});
		let container = shadow.getElementById("container");

		if(shadow.adoptedStyleSheets.length <= 0) {
			shadow.adoptedStyleSheets = [commonStylesheet, profileHeaderStylesheet];
		}

		if(container != null) {
			if(name == "acctid") {
				getAccount(newValue).then((account) => {
					this.#regenElement(account, shadow, container);
				});
			} else if(name == "acct") {
				getAccountByHandle(newValue).then((account) => {
					this.#regenElement(account, shadow, container);
				});
			}
		} else {
			container = document.createElement("address");
			container.setAttribute("id", "container");

			if(name == "acctid") {
				getAccount(newValue).then((account) => {
					this.#buildElement(account, container);
				});
			} else if(name == "acct") {
				getAccountByHandle(newValue).then((account) => {
					this.#buildElement(account, container);
				});
			}

			shadow.appendChild(container);
		}
	}

	static get observedAttributes() {
		return ["acctid", "acct"];
	}
}

class Status extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		const article = document.createElement("article");

		shadow.adoptedStyleSheets = [commonStylesheet, appStatusStylesheet];
		
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
	profileHeaderStylesheet = await getStylesheet("/css/components/app-profile-header.css");
	appStatusStylesheet = await getStylesheet("/css/components/app-status.css");
}

function initComponents() {
	initStylesheets().then(() => {
		customElements.define("app-profile-header", ProfileHeader, {extends: "address"});
		customElements.define("app-status", Status, {extends: "article"});
	});
}

initComponents();