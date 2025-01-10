import * as env from "../../env.mjs";
import { getRelativeTimeString, renderEmojis, parseHandle, renderAttachments } from "../masto_ts.mjs";
import * as mastodon from "../mastodon/mastodon.mjs";
import * as oEmbed from "../oembed/oembed.mjs";
import { ReplyBox, Menu } from "./customElements.mjs";
import * as util from "./util.mjs";

const statusStylesheet = await util.getStylesheet("/css/components/status.css");
const statusUnfocusedStylesheet = await util.getStylesheet("/css/components/status-unfocused.css");
const linkCardStylesheet = await util.getStylesheet("/css/components/link-card.css");

const statusHeaderTemplate = await util.getTemplate("/templates/status.html", "header");
const statusFooterTemplate = await util.getTemplate("/templates/status.html", "footer");
const statusContentTemplate = await util.getTemplate("/templates/status.html", "content");
const statusContentWarnedTemplate = await util.getTemplate("/templates/status.html", "content-cw");
const statusTemplate = await util.getTemplate("/templates/status.html", "status");
const statusThreadTemplate = await util.getTemplate("/templates/status.html", "status-thread");
const linkCardTemplate = await util.getTemplate("/templates/link-card.html", "card");

export class StatusHeader extends HTMLElement {
	menuButton: HTMLButtonElement;
	displayMenuButton: boolean;

	#label: HTMLParagraphElement;
	#avatar: HTMLImageElement;
	#displayName: HTMLSpanElement;
	#handle: HTMLSpanElement;
	profileLink: HTMLAnchorElement;
	#postTime: HTMLTimeElement;

	constructor(displayMenuButton?: boolean) {
		super();

		displayMenuButton != undefined ? this.displayMenuButton = displayMenuButton : this.displayMenuButton = false;
	}

	setLabel(text: string) {
		this.#label.innerHTML = text;
	}

	setAvatar(url: URL) {
		this.#avatar.src = url.href;
	}

	setDisplayName(name: string) {
		this.#displayName.innerHTML = name;
	}

	setHandle(acct: string) {
		this.#handle.innerText = acct;
	}

	setProfileLink(url: URL) {
		this.profileLink.href = url.href;
	}

	setTime(time: Date) {
		this.#postTime.dateTime = time.toISOString();
		this.#postTime.innerText = getRelativeTimeString(time);
	}

	setProfileInfo(avatarUrl: URL, displayName: string, handle: string, profileLink: URL) {
		this.setAvatar(avatarUrl);
		this.setDisplayName(displayName);
		this.setHandle(handle);
		this.setProfileLink(profileLink);
	}

	connectedCallback() {
		this.appendChild(statusHeaderTemplate.cloneNode(true));

		this.menuButton = this.querySelector("#menu-button") as HTMLButtonElement;

		this.#label = this.querySelector("#label") as HTMLParagraphElement;
		this.#avatar = this.querySelector("#avatar") as HTMLImageElement;
		this.#displayName = this.querySelector("#display-name");
		this.#handle = this.querySelector("#acct");
		this.profileLink = this.querySelector("#profile-link") as HTMLAnchorElement;
		this.#postTime = this.querySelector("#time") as HTMLTimeElement;

		if (!this.displayMenuButton) {
			this.menuButton.remove();
		}
	}
}

export class StatusFooter extends HTMLElement {
	#replyButton: HTMLButtonElement;
	#boostButton: HTMLButtonElement;
	#favoriteButton: HTMLButtonElement;

	#statusId: string;
	#ableToBoost: boolean;
	#boosted: boolean;
	#faved: boolean;

	constructor() {
		super();
	}

	setStatusId(id: string) {
		this.#statusId = id;
	}

	setAbleToBoost(able: boolean) {
		this.#ableToBoost = able;
		this.#boostButton.disabled = !able;

		if (able) {
			this.#boostButton.title = "Boost";
			this.#boostButton.ariaLabel = "Boost";
		} else {
			this.#boostButton.title = "Cannot boost this post.";
			this.#boostButton.ariaLabel = "Cannot boost this post.";
		}
	}

	setBoosted(boosted: boolean) {
		this.#boosted = boosted;
		if (boosted) {
			this.#boostButton.style.color = "var(--accent-color)";
			this.#boostButton.style.fontVariationSettings = `'FILL' 100`;
		} else {
			this.#boostButton.style.color = "";
			this.#boostButton.style.fontVariationSettings = `'FILL' 0`;
		}
	}

	setFaved(faved: boolean) {
		this.#faved = faved;
		if (faved) {
			this.#favoriteButton.style.color = "var(--favorite-color)";
			this.#favoriteButton.style.fontVariationSettings = `'FILL' 100`;
		} else {
			this.#favoriteButton.style.color = "";
			this.#favoriteButton.style.fontVariationSettings = `'FILL' 0`;
		}
	}

	setStatusInfo(id: string, ableToBoost?: boolean, boosted?: boolean, favorited?: boolean) {
		this.setStatusId(id);
		if (ableToBoost != undefined) {
			this.setAbleToBoost(ableToBoost);
		}
		if (boosted != undefined) {
			this.setBoosted(boosted);
		}
		if (favorited != undefined) {
			this.setFaved(favorited);
		}
	}

	connectReplyButton(target: HTMLElement) {
		this.#replyButton.addEventListener("click", (event) => {
			const replyBox = new ReplyBox(env.instanceUrl, this.#statusId); // TODO: make this un-hardcoded
			replyBox.setReplyingToId(this.#statusId);
			target.after(replyBox);
		});
	}

	connectedCallback() {
		this.appendChild(statusFooterTemplate.cloneNode(true));

		this.#replyButton = this.querySelector("#reply-button") as HTMLButtonElement;
		this.#boostButton = this.querySelector("#boost-button") as HTMLButtonElement;
		this.#favoriteButton = this.querySelector("#favorite-button") as HTMLButtonElement;

		this.#boostButton.addEventListener("click", (event) => {
			if (this.#statusId) {
				if (this.#boosted) {
					mastodon.statuses.unboostStatus(env.instanceUrl, env.token, this.#statusId).then(() => this.setBoosted(false));
				} else {
					mastodon.statuses.boostStatus(env.instanceUrl, env.token, this.#statusId).then((status) => {
						this.setBoosted(true);
					});
				}
			}
		});

		this.#favoriteButton.addEventListener("click", (event) => {
			if (this.#statusId) {
				if (this.#faved) {
					mastodon.statuses.unfavouriteStatus(env.instanceUrl, env.token, this.#statusId).then(() => this.setFaved(false));
				} else {
					mastodon.statuses.favouriteStatus(env.instanceUrl, env.token, this.#statusId).then((status) => {
						this.setFaved(true);
					});
				}
			}
		});
	}
}

export class StatusContent extends HTMLElement {
	postContent: HTMLDivElement;
	attachmentContainer: HTMLDivElement;
	#card: LinkCard;

	constructor() {
		super();
	}

	setContent(content: string | DocumentFragment) {
		if (this.postContent) {
			if (typeof content == "string") {
			} else {
				this.postContent.appendChild(content);
			}
		} else {
			console.error(`post content element on ${this} doesn't exist!`);
		}
	}

	setAttachments(attachments: HTMLElement[]) {
		for (const attachment of attachments) {
			this.attachmentContainer.appendChild(attachment);
		}
	}

	addCard(linkUrl?: URL, title?: string, imageUrl?: URL, description?: string, imageWidth?: number, imageHeight?: number) {
		if (this.#card) {
			console.warn("card already exists");
		} else if (linkUrl && title && (imageUrl || description)) {
			const card = new LinkCard;
			this.querySelector("#post-content").appendChild(card);
			this.#card = card;

			card.setAll(linkUrl, title, imageUrl, description, imageWidth, imageHeight);
		}
	}

	removeCard() {
		if (this.#card) {
			this.#card.remove();
			this.#card = undefined;
		} else {
			console.warn("tried to remove card but it doesn't exist");
		}
	}

	connectedCallback() {
		this.appendChild(statusContentTemplate.cloneNode(true));

		this.postContent = this.querySelector("#post-content") as HTMLDivElement;
		this.attachmentContainer = this.querySelector("#post-attachments") as HTMLDivElement;
	}
}

export class StatusContentWarned extends StatusContent {
	#contentWarning: HTMLElement;

	constructor() {
		super();
	}

	setContentWarning(cw: string) {
		this.#contentWarning.innerText = cw;
	}

	connectedCallback() {
		this.appendChild(statusContentWarnedTemplate.cloneNode(true));

		this.postContent = this.querySelector("#post-content") as HTMLDivElement;
		this.attachmentContainer = this.querySelector("#post-attachments") as HTMLDivElement;
		this.#contentWarning = this.querySelector("#cw");
	}
}

export class Status extends HTMLElement {
	instanceUrl: URL;
	isUnfocused: boolean;

	status: mastodon.Status;
	isReblog: boolean;

	header: StatusHeader;
	footer: StatusFooter;
	content: StatusContent;

	events: util.StatusEvents;

	template: DocumentFragment;

	constructor(
		instanceUrl: URL,
		status: mastodon.Status,
		events?: util.StatusEvents,
		isUnfocused?: boolean
	) {
		super();

		this.instanceUrl = instanceUrl;
		isUnfocused != undefined ? this.isUnfocused = isUnfocused : this.isUnfocused = false;
		this.status = status;
		status.reblog ? this.isReblog = true : this.isReblog = false;

		this.events = events;

		this.template = statusTemplate;
	}

	setStatus(status: mastodon.Status) {
		const localProfileUrl = new URL("./user/", window.location.origin);
		localProfileUrl.searchParams.append("acct", `@${status.account.acct}`);

		this.id = `status-${status.id}`;

		if (this.isReblog) {
			this.header.setLabel(`<a href="/user/?acct=@${this.status.account.acct}"><span class="material-symbols-outlined">repeat</span> <img class="avatar inline-img" src="${this.status.account.avatar}" alt=""> <span class="display-name">${(this.status.account.displayName || this.status.account.displayName != "") ? renderEmojis(this.status.account.displayName, this.status.account.emojis) : this.status.account.username}</span> boosted</a>`);
		} else if (this.status.inReplyToId) {
			// mastodon.accounts.getAccount(this.instanceUrl, status.inReplyToAccountId, env.token).then((repliedToAccount) => {
			// 	this.header.setLabel(`<span class="material-symbols-outlined">reply</span> in reply to <img class="avatar inline-img" src="${repliedToAccount.avatar}" alt=""> <span class="display-name">${(repliedToAccount.displayName || repliedToAccount.displayName != "") ? renderEmojis(repliedToAccount.displayName, repliedToAccount.emojis) : repliedToAccount.username}</span>`);
			// });
		}

		let outDisplayName = (status.account.displayName || status.account.displayName != "") ? renderEmojis(status.account.displayName, status.account.emojis) as string : status.account.username;

		// setting header info
		this.header.setProfileInfo(
			status.account.avatar,
			outDisplayName,
			parseHandle(`@${status.account.acct}`),
			new URL(`/@${status.account.acct}`, window.location.origin)
		);
		this.header.setTime(status.createdAt);

		// setting click events in header
		this.header.profileLink.addEventListener("click", (event) => {
			event.preventDefault();
			this.events.onProfileLinkClick(status.account.acct);
		});

		if (!this.isUnfocused) {
			this.footer.setStatusInfo(
				status.id,
				(status.visibility != mastodon.StatusVisibility.Private && status.visibility != mastodon.StatusVisibility.Direct),
				status.reblogged,
				status.favourited
			);
			this.footer.connectReplyButton(this);
		}

		if (status.language) {
			this.setAttribute("lang", status.language.language);
		} else if (this.hasAttribute("lang")) {
			this.removeAttribute("lang");
		}

		if (status.sensitive || status.spoilerText != "") {
			if (!(this.content instanceof StatusContentWarned)) {
				if (this.content) {
					this.content.remove();
				}

				this.content = new StatusContentWarned;
				this.shadowRoot.getElementById("status-content-target").appendChild(this.content);
			}

			if (status.spoilerText != "") {
				(this.content as StatusContentWarned).setContentWarning(`⚠️ ${status.spoilerText}`);
			}
		} else {
			if (this.content && this.content instanceof StatusContentWarned) {
				this.content.remove();
			}

			this.content = new StatusContent;
			this.content.slot = "content";
			this.shadowRoot.getElementById("status-content-target").appendChild(this.content);
		}

		this.content.setContent(renderEmojis(status.content, status.emojis));

		if (status.mediaAttachments.length > 0) {
			this.content.setAttachments(renderAttachments(status.mediaAttachments));
		}

		if (status.card != null && !this.isUnfocused) {
			oEmbed.getoEmbed(status.card.url, undefined, 512, "json").then((response) => {
				if (response) {
					console.log(response);
					if (response instanceof oEmbed.VideoResponse || response instanceof oEmbed.RichResponse) {
						let iframe: HTMLIFrameElement;

						// we add an exception for tumblr posts here since they do a thing where they return a script that then *loads* the tumblr post
						if (response.html.body.getElementsByTagName("iframe").length > 0 || response.html.body.querySelector(".tumblr-post")) {
							iframe = response.html.body.getElementsByTagName("iframe").item(0);
						} else {
							iframe = document.createElement("iframe");
							iframe.srcdoc = response.html.body.innerHTML;
						}

						iframe.width = "";
						iframe.height = "";
						iframe.style.aspectRatio = `${response.width}/${response.height}`;
						this.content.appendChild(iframe);
						iframe.addEventListener("load", (event) => {
							iframe.height = String(iframe.scrollHeight);
						});
					}
				} else {
					this.content.addCard(status.card.url, status.card.title, status.card.image, status.card.description, status.card.width, status.card.height);
				}
			});
		} else if (this.content.getElementsByTagName("app-link-card").length > 0) {
			this.content.removeCard();
		}
	}

	connectedCallback() {
		const shadow = this.attachShadow({ mode: "open" });
		const header = new StatusHeader(!this.isUnfocused);

		shadow.adoptedStyleSheets = [util.materialIcons, util.commonStylesheet, statusStylesheet];

		shadow.appendChild(this.template.cloneNode(true));
		shadow.getElementById("status-root").prepend(header);

		this.header = header;

		if (!this.isUnfocused) {
			const footer = new StatusFooter;

			shadow.getElementById("status-root").appendChild(footer);
			this.footer = footer;

			this.header.menuButton.addEventListener("click", (event) => {
				console.log(event);

				let localUrl: URL;
				let remoteUrl: URL;

				if (this.isReblog) {
					localUrl = new URL(`/@${this.status.reblog.account.acct}/${this.status.reblog.id}`, this.instanceUrl);
					remoteUrl = this.status.reblog.url;
				} else {
					localUrl = new URL(`/@${this.status.account.acct}/${this.status.id}`, this.instanceUrl);
					remoteUrl = this.status.url;
				}

				const menu = new Menu([
					{
						categoryName: "Debug",
						contents: [
							{ name: "Log status", onClick: () => { console.log(this.status); }, icon: "description" },
							{ name: "Log status ID", onClick: () => { console.log(this.status.id); }, icon: "id_card" },
							{ name: "Log status content", onClick: () => { console.log(this.status.content); }, icon: "description" }
						]
					},
					{
						categoryName: "Instance",
						contents: [
							{ name: "View on instance", onClick: () => { open(localUrl, "_blank"); }, icon: "language" },
							{ name: "View on remote instance", onClick: () => { open(remoteUrl, "_blank"); }, icon: "language" }
						]
					}
				]);
				const viewTarget = document.getElementById("view-target");
				if (viewTarget) {
					menu.style.top = `${this.header.menuButton.offsetTop - viewTarget.scrollTop}px`;
					menu.style.left = `${this.header.menuButton.offsetLeft - viewTarget.scrollLeft}px`;
				} else {
					menu.style.top = `${this.header.menuButton.offsetTop}px`;
					menu.style.left = `${this.header.menuButton.offsetLeft}px`;
				}
				this.parentElement.appendChild(menu);

				// we put the event listener on a timeout so that it doesn't try to detect a click before the menu opens
				setTimeout(() => {
					window.addEventListener("click", (event) => {
						util.clickOutsideHandler(event, menu);
					});
				}, 50);
			});
		} else {
			shadow.adoptedStyleSheets.push(statusUnfocusedStylesheet);
		}

		if (this.isReblog) {
			this.setStatus(this.status.reblog);
		} else {
			this.setStatus(this.status);
		}

		this.shadowRoot.addEventListener("click", (event) => {
			// clicking on these means that you probably don't want to go to the status page
			const ignoredTags = ["A", "SUMMARY", "IMG", "VIDEO", "BUTTON", "APP-LINK-CARD"];
			const clickedElementTagName = (event.target as HTMLElement).tagName;

			let ignoreEvent = false;

			for (const tagName of ignoredTags) {
				if (clickedElementTagName == tagName) {
					ignoreEvent = true;
				}
			}

			if (!ignoreEvent) {
				this.events.onStatusClick(this.status.id);
			}
		});
	}
}

export class StatusThread extends Status {
	rootStatus: mastodon.Status;

	constructor(
		instanceUrl: URL,
		status: mastodon.Status,
		events?: util.StatusEvents
	) {
		super(
			instanceUrl,
			status,
			events
		);

		this.template = statusThreadTemplate;
	}

	setStatus(status: mastodon.Status) {
		this.rootStatus = this.status;

		super.setStatus(status);

		mastodon.statuses.getStatusContext(this.instanceUrl, this.rootStatus.id, env.token).then((context) => {
			if (context.ancestors.length > 0) {
				const firstStatus = new Status(this.instanceUrl, context.ancestors[0], undefined, true);
				this.shadowRoot.getElementById("before-root-status").appendChild(firstStatus);
				if (context.ancestors.length > 1) {
					this.shadowRoot.insertBefore(new Text(`+${context.ancestors.length - 1} more`), this.shadowRoot.getElementById("status-root"));
				}
			}
		});
	}

	connectedCallback() {
		super.connectedCallback();
	}
}

export class LinkCard extends HTMLElement {
	#link: HTMLAnchorElement;
	#image: HTMLImageElement;
	#title: HTMLHeadingElement;
	#description: HTMLParagraphElement;

	constructor() {
		super();
	}

	setLink(url: URL) {
		this.#link.href = url.href;
	}

	setImage(url: URL, imageWidth?: number, imageHeight?: number) {
		// TODO: maybe some blurhash stuff here
		this.#image.src = url.href;
		this.#image.hidden = false;
		this.style.maxWidth = `${imageWidth}px`;
	}

	setTitle(text: string) {
		this.#title.innerText = text;
	}

	setDescription(text: string) {
		this.#description.innerHTML = text;
	}

	setAll(linkUrl: URL, title: string, imageUrl?: URL, description?: string, imageWidth?: number, imageHeight?: number) {
		this.setLink(linkUrl);
		this.setTitle(title);
		if (imageUrl) {
			this.setImage(imageUrl, imageWidth, imageHeight);
		}
		if (description) {
			this.setDescription(description);
		}
	}

	connectedCallback() {
		const shadow = this.attachShadow({ mode: "open" });
		shadow.adoptedStyleSheets = [util.commonStylesheet, linkCardStylesheet];
		shadow.appendChild(linkCardTemplate.cloneNode(true));

		this.#link = shadow.getElementById("link") as HTMLAnchorElement;
		this.#image = shadow.getElementById("image") as HTMLImageElement;
		this.#title = shadow.getElementById("title") as HTMLHeadingElement;
		this.#description = shadow.getElementById("description") as HTMLParagraphElement;
	}
}

export function init() {
	customElements.define("app-status-header", StatusHeader, {extends: "header"});
	customElements.define("app-status-footer", StatusFooter, {extends: "footer"});
	customElements.define("app-status-content", StatusContent);
	customElements.define("app-status-content-warned", StatusContentWarned);
	customElements.define("app-status", Status);
	customElements.define("app-status-thread", StatusThread);
	customElements.define("app-link-card", LinkCard);
}