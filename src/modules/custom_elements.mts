import * as mastodon from "./mastodon.mjs";
import {instanceUrl, getStatus, getTimeline, getAccount, getAccountByHandle, getRelativeTimeString, renderEmojis, renderAttachments, renderTimeline, renderAccountTimeline, Timelines, getAccountTimeline, parseHandle} from "./masto_ts.mjs";

let commonStylesheet: CSSStyleSheet;
let profileHeaderStylesheet: CSSStyleSheet;
let statusStylesheet: CSSStyleSheet;
let linkCardStylesheet: CSSStyleSheet;
let timelineStylesheet: CSSStyleSheet;

let cardTemplate: DocumentFragment;
let statusHeaderTemplate: DocumentFragment;
let statusContentTemplate: DocumentFragment;
let statusContentWarnedTemplate: DocumentFragment;
let statusTemplate: DocumentFragment;
let linkCardTemplate: DocumentFragment;
let timelineTemplate: DocumentFragment;
let navigationSidebarTemplate: DocumentFragment;

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

export class Card extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet];
		shadow.appendChild(cardTemplate.cloneNode(true));
	}
}

export class StatusHeader extends HTMLElement {
	label: HTMLParagraphElement;
	avatar: HTMLImageElement;
	displayName: HTMLSpanElement;
	handle: HTMLSpanElement;
	profileLink: HTMLAnchorElement;

	constructor() {
		super();
	}

	setLabel(text: string) {
		this.label.innerHTML = text;
	}

	setAvatar(url: URL) {
		this.avatar.src = url.href;
	}

	setDisplayName(name: string) {
		this.displayName.innerHTML = name;
	}

	setHandle(acct: string) {
		this.handle.innerText = acct;
	}

	setProfileLink(url: URL) {
		this.profileLink.href = url.href;
	}

	setProfileInfo(avatarUrl: URL, displayName: string, handle: string, profileLink: URL) {
		this.setAvatar(avatarUrl);
		this.setDisplayName(displayName);
		this.setHandle(handle);
		this.setProfileLink(profileLink);
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet, statusStylesheet];
		shadow.appendChild(statusHeaderTemplate.cloneNode(true));

		this.label = shadow.getElementById("label") as HTMLParagraphElement;
		this.avatar = shadow.getElementById("avatar") as HTMLImageElement;
		this.displayName = shadow.getElementById("display-name");
		this.handle = shadow.getElementById("acct");
		this.profileLink = shadow.getElementById("profile-link") as HTMLAnchorElement;
	}
}

export class StatusContent extends HTMLElement {
	postContent: HTMLDivElement;
	attachmentContainer: HTMLDivElement;
	card: LinkCard;

	constructor() {
		super();
	}

	setContent(content: string) {
		this.postContent.innerHTML = content;
	}

	setAttachments(attachments: HTMLElement[]) {
		for(const attachment of attachments) {
			this.attachmentContainer.appendChild(attachment);
		}
	}

	addCard(linkUrl?: URL, title?: string, imageUrl?: URL, description?: string, imageWidth?: number, imageHeight?: number) {
		if(this.card) {
			console.warn("card already exists");
		} else {
			const card = new LinkCard;
			card.slot = "card";
			this.appendChild(card);
			this.card = card;
			
			if(linkUrl && title) {
				card.setAll(linkUrl, title, imageUrl, description, imageWidth, imageHeight);
			}
		}
	}

	removeCard() {
		if(this.card) {
			this.card.remove();
			this.card = undefined;
		} else {
			console.warn("tried to remove card but it doesn't exist");
		}
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet, statusStylesheet];
		shadow.appendChild(statusContentTemplate.cloneNode(true));

		this.postContent = shadow.getElementById("post-content") as HTMLDivElement;
		this.attachmentContainer = shadow.getElementById("post-attachments") as HTMLDivElement;
	}
}

export class StatusContentWarned extends StatusContent {
	contentWarning: HTMLElement;
	
	constructor() {
		super();
	}

	setContentWarning(cw: string) {
		this.contentWarning.innerText = cw;
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet, statusStylesheet];
		shadow.appendChild(statusContentWarnedTemplate.cloneNode(true));

		this.contentWarning = shadow.getElementById("cw");
	}
}

export class Status extends Card {
	static observedAttributes = ["statusid", "sensitive", "spoilertext"];

	header: StatusHeader;
	content: StatusContent;

	link: HTMLAnchorElement;
	time: HTMLTimeElement;
	postUrl: HTMLAnchorElement;

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

		this.header = header;

		this.link = shadow.getElementById("link") as HTMLAnchorElement;
		this.time = shadow.getElementById("time") as HTMLTimeElement;
		this.postUrl = shadow.getElementById("post-url") as HTMLAnchorElement;
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if(name == "statusid") {
			getStatus(newValue).then(([status, reblog, reblogger]) => {
				if(reblog) {
					this.header.setLabel(`🔁 ${renderEmojis(reblogger.displayName, reblogger.emojis)} boosted`);
				} else if(status.inReplyToId) {
					this.header.setLabel("💬 reply");
				}
				
				this.header.setProfileInfo(
					status.account.avatar,
					status.account.displayName ? renderEmojis(status.account.displayName, status.account.emojis) : status.account.username,
					parseHandle(`@${status.account.acct}`),
					new URL(status.account.acct, new URL("/user/?acct=@", instanceUrl))
				);
				
				if(status.language) {
					this.setAttribute("lang", status.language.language);
				} else if(this.hasAttribute("lang")) {
					this.removeAttribute("lang");
				}

				if(status.sensitive || status.spoilerText != "") {
					if(!(this.content instanceof StatusContentWarned)) {
						if(this.content) {
							this.content.remove();
						}

						this.content = new StatusContentWarned;
						this.content.slot = "content";
						this.appendChild(this.content);
					}

					if(status.spoilerText != "") {
						(this.content as StatusContentWarned).setContentWarning(`⚠️ ${status.spoilerText}`);
					}
				} else {
					if(this.content && this.content instanceof StatusContentWarned) {
						this.content.remove();
					}

					this.content = new StatusContent;
					this.content.slot = "content";
					this.appendChild(this.content);
				}

				this.content.setContent(renderEmojis(status.content, status.emojis));

				// TODO: separate these into a footer component
				this.postUrl.href = new URL(`@${status.account.acct}/${status.id}`, instanceUrl).href;
				this.link.href = `/status/?id=${status.id}`;
				this.time.dateTime = status.createdAt.toISOString();
				this.time.innerText = getRelativeTimeString(status.createdAt);

				if(status.mediaAttachments.length > 0) {
					this.content.setAttachments(renderAttachments(status.mediaAttachments));
				}

				if(status.card != null) {
					this.content.addCard(status.card.url, status.card.title, status.card.image, status.card.description, status.card.width, status.card.height);
				} else if(this.content.getElementsByTagName("app-link-card").length > 0) {
					this.content.removeCard();
				}
			});
		}
	}
}

export class LinkCard extends HTMLElement {
	link: HTMLAnchorElement;
	image: HTMLImageElement;
	titleElement: HTMLHeadingElement;
	description: HTMLParagraphElement;
	
	constructor() {
		super();
	}

	setLink(url: URL) {
		this.link.href = url.href;
	}

	setImage(url: URL, imageWidth?: number, imageHeight?: number) {
		// TODO: maybe some blurhash stuff here

		this.image.src = url.href;
		this.image.hidden = false;
		this.style.maxWidth = `${imageWidth}px`;
	}

	setTitle(text: string) {
		this.titleElement.innerText = text;
	}

	setDescription(text: string) {
		this.description.innerHTML = text;
	}

	setAll(linkUrl: URL, title: string, imageUrl?: URL, description?: string, imageWidth?: number, imageHeight?: number) {
		this.setLink(linkUrl);
		this.setTitle(title);
		if(imageUrl) {
			this.setImage(imageUrl, imageWidth, imageHeight);
		}
		if(description) {
			this.setDescription(description);
		}
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet, linkCardStylesheet];
		shadow.appendChild(linkCardTemplate.cloneNode(true));

		this.link = shadow.getElementById("link") as HTMLAnchorElement;
		this.image = shadow.getElementById("image") as HTMLImageElement;
		this.titleElement = shadow.getElementById("title") as HTMLHeadingElement;
		this.description = shadow.getElementById("description") as HTMLParagraphElement;
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

export class NavigationSidebar extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet];
		shadow.appendChild(navigationSidebarTemplate.cloneNode(true));
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
	cardTemplate = await getTemplate("/templates/card.html", "card");
	statusHeaderTemplate = await getTemplate("/templates/status.html", "header");
	statusContentTemplate = await getTemplate("/templates/status.html", "content");
	statusContentWarnedTemplate = await getTemplate("/templates/status.html", "content-cw");
	statusTemplate = await getTemplate("/templates/status.html", "status");
	linkCardTemplate = await getTemplate("/templates/link-card.html", "card");
	timelineTemplate = await getTemplate("/templates/timeline.html", "timeline");
	navigationSidebarTemplate = await getTemplate("/templates/navigation.html", "sidebar");
}

async function initStylesheets() {
	commonStylesheet = await getStylesheet("/css/components/common.css");
	profileHeaderStylesheet = await getStylesheet("/css/components/profile-header.css");
	statusStylesheet = await getStylesheet("/css/components/status.css");
	linkCardStylesheet = await getStylesheet("/css/components/link-card.css");
	timelineStylesheet = await getStylesheet("/css/components/timeline.css");
}

function initComponents() {
	initTemplates().then(() => {
		initStylesheets().then(() => {
			customElements.define("app-card", Card);
			customElements.define("app-timeline", Timeline);
			customElements.define("app-profile-header", ProfileHeader, {extends: "address"});
			customElements.define("app-status-header", StatusHeader, {extends: "header"});
			customElements.define("app-status-content", StatusContent);
			customElements.define("app-status-content-warned", StatusContentWarned);
			customElements.define("app-status", Status);
			customElements.define("app-link-card", LinkCard);
			customElements.define("app-nav-sidebar", NavigationSidebar);
		});
	});
}

initComponents();