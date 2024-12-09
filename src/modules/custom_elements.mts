import * as mastodon from "./mastodon.mjs";
import {instanceUrl, getStatus, getTimeline, getAccount, getAccountByHandle, getRelativeTimeString, renderEmojis, renderAttachments, renderTimeline, renderAccountTimeline, Timelines, getAccountTimeline} from "./masto_ts.mjs";

let commonStylesheet: CSSStyleSheet;
let profileHeaderStylesheet: CSSStyleSheet;
let statusStylesheet: CSSStyleSheet;
let cardStylesheet: CSSStyleSheet;
let timelineStylesheet: CSSStyleSheet;

let statusHeaderTemplate: DocumentFragment;
let statusContentTemplate: DocumentFragment;
let statusContentWarnedTemplate: DocumentFragment;
let statusTemplate: DocumentFragment;
let cardTemplate: DocumentFragment;
let timelineTemplate: DocumentFragment;

export class ProfileHeader extends HTMLElement {
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

		container.id = "container";

		header.id = "header";

		infoContainer.id = "info-container";

		avatar.id = "avatar";

		displayName.id = "display-name";
		displayName.className = "display-name";

		handle.id = "handle";

		bio.id = "bio";

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

export class StatusHeader extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});

		shadow.adoptedStyleSheets = [commonStylesheet, statusStylesheet];

		shadow.appendChild(statusHeaderTemplate.cloneNode(true));
	}
}

export class StatusContent extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet, statusStylesheet];
		shadow.appendChild(statusContentTemplate.cloneNode(true));
	}
}

export class StatusContentWarned extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet, statusStylesheet];
		shadow.appendChild(statusContentWarnedTemplate.cloneNode(true));
	}
}

export class Status extends HTMLElement {
	static observedAttributes = ["statusid", "sensitive", "spoilertext"];

	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		const header = new StatusHeader;

		shadow.adoptedStyleSheets = [commonStylesheet, statusStylesheet];

		header.slot = "header";

		shadow.appendChild(statusTemplate.cloneNode(true));
		this.appendChild(header);
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if(name == "statusid") {
			getStatus(newValue).then(([status, reblog, reblogger]) => {
				console.log(status);
				const shadowRoot = this.shadowRoot;
				const headerRoot = this.getElementsByTagName("header")[0].shadowRoot;

				let postTarget: HTMLElement;
				let content: HTMLElement;

				if(reblog) {
					headerRoot.getElementById("label").innerHTML = `🔁 ${renderEmojis(reblogger.displayName, reblogger.emojis)} boosted`
				} else if(status.inReplyToId) {
					headerRoot.getElementById("label").innerHTML = "💬 reply";
				}
				
				headerRoot.getElementById("avatar").setAttribute("src", status.account.avatar.href);
				headerRoot.getElementById("display-name").innerHTML = status.account.displayName ? renderEmojis(status.account.displayName, status.account.emojis) : status.account.username;
				headerRoot.getElementById("acct").innerText = `@${status.account.acct}`;
				(headerRoot.getElementById("profile-link") as HTMLAnchorElement).href = `/user/?acct=@${status.account.acct}`;
				
				if(status.language) {
					shadowRoot.getElementById("status-root").setAttribute("lang", status.language.language);
				} else if(shadowRoot.getElementById("status-root").hasAttribute("lang")) {
					shadowRoot.getElementById("status-root").removeAttribute("lang");
				}

				if(status.sensitive || status.spoilerText != "") {
					if(this.getElementsByTagName("app-status-content").length > 0) {
						this.getElementsByTagName("app-status-content")[0].remove;
					}

					if(this.getElementsByTagName("app-status-content-warned").length <= 0) {
						content = new StatusContentWarned;
						content.slot = "content";
						this.appendChild(content);
					}

					if(status.spoilerText != "") {
						content.shadowRoot.getElementById("cw").innerText = `⚠️ ${status.spoilerText}`;
					}

					postTarget = content.shadowRoot.getElementById("post-content");
				} else {
					if(this.getElementsByTagName("app-status-content-warned").length > 0) {
						this.getElementsByTagName("app-status-content-warned")[0].remove;
					}

					if(this.getElementsByTagName("app-status-content").length <= 0) {
						content = new StatusContent;
						content.slot = "content";
						this.appendChild(content);
					}

					postTarget = content.shadowRoot.getElementById("post-content");
				}

				postTarget.innerHTML = renderEmojis(status.content, status.emojis);
				shadowRoot.getElementById("post-url").setAttribute("href", new URL(`@${status.account.acct}/${status.id}`, instanceUrl).href);
				(shadowRoot.getElementById("link") as HTMLAnchorElement).href = `/status/?id=${status.id}`;
				(shadowRoot.getElementById("time") as HTMLTimeElement).dateTime = status.createdAt.toISOString();
				shadowRoot.getElementById("time").innerText = getRelativeTimeString(status.createdAt);

				if(status.mediaAttachments.length > 0) {
					const attachmentContainer = content.shadowRoot.getElementById("post-attachments");
					for(const attachment of renderAttachments(status.mediaAttachments)) {
						attachmentContainer.appendChild(attachment);
					}
				}

				if(status.card != null) {
					let cardRoot;

					if(content.getElementsByTagName("app-card").length <= 0) {
						const card = new Card;
						card.slot = "card";
						card.id = "card";
						content.appendChild(card);
						cardRoot = card.shadowRoot;
					} else {
						cardRoot = content.getElementsByTagName("app-card")[0].shadowRoot;
					}

					if(status.card.image != null) {
						const imageElement = (cardRoot.getElementById("image") as HTMLImageElement);
						imageElement.src = status.card.image.href;
						imageElement.hidden = false;

						cardRoot.getElementById("card-root").style.maxWidth = `${status.card.width}px`;
					} else {
						(cardRoot.getElementById("image") as HTMLImageElement).hidden = true;
						cardRoot.getElementById("card-root").style.maxWidth = null;
					}
					
					(cardRoot.getElementById("link") as HTMLAnchorElement).href = status.card.url.href;
					cardRoot.getElementById("title").innerText = status.card.title;
					cardRoot.getElementById("description").innerHTML = status.card.description;
				} else if(content.getElementsByTagName("app-card").length > 0) {
					content.getElementsByTagName("app-card")[0].remove;
				}
			});
		}
	}
}

export class Card extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});

		shadow.adoptedStyleSheets = [commonStylesheet, cardStylesheet];

		shadow.appendChild(cardTemplate.cloneNode(true));
	}
}

export class Timeline extends HTMLElement {
	static observedAttributes = ["type", "tag", "acctid"];
	
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet, timelineStylesheet];
		shadow.appendChild(timelineTemplate.cloneNode(true));
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		switch(name) {
			case "type":
				if(!(newValue == "Account" || newValue == "Hashtag")) {
					// renderTimeline(Timelines[newValue as keyof typeof Timelines]);
					getTimeline(instanceUrl, Timelines[newValue as keyof typeof Timelines], undefined, undefined).then((data: any) => {
						let statuses: DocumentFragment = new DocumentFragment();
						
						for(const status of data) {
							const statusElement = new Status;
							statusElement.setAttribute("statusid", status["id"]);
							statuses.appendChild(statusElement);
						}

						this.shadowRoot.appendChild(statuses);
					});
				}
				break;
			case "acctid":
				if(this.getAttribute("type") == "Account") {
					getAccountTimeline(newValue).then((data: mastodon.Status[]) => {
						let statuses: DocumentFragment = new DocumentFragment();

						for(const status of data) {
							const statusElement = new Status;
							statusElement.setAttribute("statusid", status["id"]);
							statuses.appendChild(statusElement);
						}

						this.shadowRoot.appendChild(statuses);
					});
				} else {
					console.warn("Changed account ID, but this timeline isn't set to Account.");
				}
				break;
			case "tag":
				if(this.getAttribute("type") == "Hashtag") {
					if(this.shadowRoot) {
						this.shadowRoot.innerHTML = "";
					}

					getTimeline(instanceUrl, Timelines.Hashtag, newValue, undefined).then((data: any) => {
						let statuses: DocumentFragment = new DocumentFragment();
						
						for(const status of data) {
							const statusElement = new Status;
							statusElement.setAttribute("statusid", status["id"]);
							statuses.appendChild(statusElement);
						}

						this.shadowRoot.appendChild(statuses);
					});
				} else {
					console.warn("Changed tag, but this timeline isn't set to Hashtag.");
				}
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
	statusContentTemplate = await getTemplate("/templates/status.html", "content");
	statusContentWarnedTemplate = await getTemplate("/templates/status.html", "content-cw");
	statusTemplate = await getTemplate("/templates/status.html", "status");
	cardTemplate = await getTemplate("/templates/card.html", "card");
	timelineTemplate = await getTemplate("/templates/timeline.html", "timeline");
}

async function initStylesheets() {
	commonStylesheet = await getStylesheet("/css/components/common.css");
	profileHeaderStylesheet = await getStylesheet("/css/components/profile-header.css");
	statusStylesheet = await getStylesheet("/css/components/status.css");
	cardStylesheet = await getStylesheet("/css/components/card.css");
	timelineStylesheet = await getStylesheet("/css/components/timeline.css");
}

function initComponents() {
	initTemplates().then(() => {
		initStylesheets().then(() => {
			customElements.define("app-timeline", Timeline);
			customElements.define("app-profile-header", ProfileHeader, {extends: "address"});
			customElements.define("app-status-header", StatusHeader, {extends: "header"});
			customElements.define("app-status-content", StatusContent);
			customElements.define("app-status-content-warned", StatusContentWarned);
			customElements.define("app-status", Status);
			customElements.define("app-card", Card);
		});
	});
}

initComponents();