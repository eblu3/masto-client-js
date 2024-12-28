import * as mastodon from "./mastodon/mastodon.mjs";
import {getRelativeTimeString, renderEmojis, renderAttachments, parseHandle, charLimit} from "./masto_ts.mjs";
import { token } from "../env.mjs";
import * as env from "../env.mjs";

let commonStylesheet: CSSStyleSheet;
let profileHeaderStylesheet: CSSStyleSheet;
let statusStylesheet: CSSStyleSheet;
let linkCardStylesheet: CSSStyleSheet;
let timelineStylesheet: CSSStyleSheet;
let navigationStylesheet: CSSStyleSheet;
let postBoxStylesheet: CSSStyleSheet;
let modalStylesheet: CSSStyleSheet;

let profileHeaderTemplate: DocumentFragment;
let cardTemplate: DocumentFragment;
let statusHeaderTemplate: DocumentFragment;
let statusFooterTemplate: DocumentFragment;
let statusContentTemplate: DocumentFragment;
let statusContentWarnedTemplate: DocumentFragment;
let statusTemplate: DocumentFragment;
let linkCardTemplate: DocumentFragment;
let timelineTemplate: DocumentFragment;
let navigationSidebarTemplate: DocumentFragment;
let postBoxTemplate: DocumentFragment;
let tagInputTemplate: DocumentFragment;
let settingsModalTemplate: DocumentFragment;

let postSentEvent: CustomEvent;

export class ProfileHeader extends HTMLElement {
	static observedAttributes = ["acctid", "acct"];

	#container: HTMLElement;
	#avatar: HTMLImageElement;
	#displayName: HTMLHeadingElement;
	#handle: HTMLParagraphElement;
	#bio: HTMLParagraphElement;
	#fields: HTMLTableElement;
	
	constructor() {
		super();
	}

	setAccount(account: mastodon.Account) {
		this.#container.style.setProperty("--header-url", `url(${account.header.href})`);
		this.#avatar.src = account.avatar.href;
		this.#displayName.innerHTML = (account.displayName || account.displayName != "") ? renderEmojis(account.displayName, account.emojis) : account.username;
		this.#handle.innerText = `@${account.acct}`;
		this.#bio.innerHTML = renderEmojis(account.note, account.emojis);

		console.log(account.fields);

		for(const field of account.fields) {
			const newRow = this.#fields.insertRow();
			const rowName = newRow.insertCell();
			const rowValue = newRow.insertCell();

			if(field.verifiedAt) {
				newRow.classList.add("verified");
			}

			rowName.outerHTML = `<th>${renderEmojis(field.name, account.emojis)}</th>`;
			rowValue.innerHTML = renderEmojis(field.value, account.emojis);
		}
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet, profileHeaderStylesheet];
		shadow.appendChild(profileHeaderTemplate.cloneNode(true));

		this.#container = shadow.getElementById("container");
		this.#avatar = shadow.getElementById("avatar") as HTMLImageElement;
		this.#displayName = shadow.getElementById("display-name") as HTMLHeadingElement;
		this.#handle = shadow.getElementById("handle") as HTMLParagraphElement;
		this.#bio = shadow.getElementById("bio") as HTMLParagraphElement;
		this.#fields = shadow.getElementById("fields") as HTMLTableElement;
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if(name == "acctid") {
			mastodon.accounts.getAccount(env.instanceUrl, newValue, env.token).then((account) => {
				this.setAccount(account);
			});
		} else if(name == "acct") {
			mastodon.accounts.lookupUsername(env.instanceUrl, newValue).then((account) => {
				this.setAccount(account);
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
	#label: HTMLParagraphElement;
	#avatar: HTMLImageElement;
	#displayName: HTMLSpanElement;
	#handle: HTMLSpanElement;
	#profileLink: HTMLAnchorElement;

	constructor() {
		super();
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
		this.#profileLink.href = url.href;
	}

	setProfileInfo(avatarUrl: URL, displayName: string, handle: string, profileLink: URL) {
		this.setAvatar(avatarUrl);
		this.setDisplayName(displayName);
		this.setHandle(handle);
		this.setProfileLink(profileLink);
	}

	connectedCallback() {
		this.appendChild(statusHeaderTemplate.cloneNode(true));

		this.#label = this.querySelector("#label") as HTMLParagraphElement;
		this.#avatar = this.querySelector("#avatar") as HTMLImageElement;
		this.#displayName = this.querySelector("#display-name");
		this.#handle = this.querySelector("#acct");
		this.#profileLink = this.querySelector("#profile-link") as HTMLAnchorElement;
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
	}

	setBoosted(boosted: boolean) {
		this.#boosted = boosted;
		if(boosted) {
			this.#boostButton.innerText = "Boosted!";
		} else {
			this.#boostButton.innerText = "Boost";
		}
	}

	setFaved(faved: boolean) {
		this.#faved = faved;
		if(faved) {
			this.#favoriteButton.innerText = "Favorited!";
		} else {
			this.#favoriteButton.innerText = "Favorite";
		}
	}

	setStatusInfo(id: string, ableToBoost?: boolean, boosted?: boolean, favorited?: boolean) {
		this.setStatusId(id);
		if(ableToBoost != undefined) {
			this.setAbleToBoost(ableToBoost);
		}
		if(boosted != undefined) {
			this.setBoosted(boosted);
		}
		if(favorited != undefined) {
			this.setFaved(favorited);
		}
	}

	connectReplyButton(target: HTMLElement) {
		this.#replyButton.addEventListener("click", (event) => {
			const replyBox = new ReplyBox(env.instanceUrl); // TODO: make this un-hardcoded
			replyBox.setReplyingToId(this.#statusId);
			target.after(replyBox);
		})
	}

	connectedCallback() {
		this.appendChild(statusFooterTemplate.cloneNode(true));

		this.#replyButton = this.querySelector("#reply-button") as HTMLButtonElement;
		this.#boostButton = this.querySelector("#boost-button") as HTMLButtonElement;
		this.#favoriteButton = this.querySelector("#favorite-button") as HTMLButtonElement;
		
		this.#boostButton.addEventListener("click", (event) => {
			if(this.#statusId) {
				if(this.#boosted) {
					mastodon.unboostStatus(this.#statusId).then(() => this.setBoosted(false));
				} else {
					mastodon.boostStatus(this.#statusId).then((status) => {
						this.setBoosted(true);
					});
				}
			}
		});

		this.#favoriteButton.addEventListener("click", (event) => {
			if(this.#statusId) {
				if(this.#faved) {
					mastodon.unfavoriteStatus(this.#statusId).then(() => this.setFaved(false));
				} else {
					mastodon.favoriteStatus(this.#statusId).then((status) => {
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

	setContent(content: string) {
		if(this.postContent) {
			this.postContent.innerHTML = content;
		} else {
			console.error(`post content element on ${this} doesn't exist!`);
		}
	}

	setAttachments(attachments: HTMLElement[]) {
		for(const attachment of attachments) {
			this.attachmentContainer.appendChild(attachment);
		}
	}

	addCard(linkUrl?: URL, title?: string, imageUrl?: URL, description?: string, imageWidth?: number, imageHeight?: number) {
		if(this.#card) {
			console.warn("card already exists");
		} else {
			const card = new LinkCard;
			card.slot = "card";
			this.appendChild(card);
			this.#card = card;
			
			if(linkUrl && title) {
				card.setAll(linkUrl, title, imageUrl, description, imageWidth, imageHeight);
			}
		}
	}

	removeCard() {
		if(this.#card) {
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

export class Status extends Card {
	static observedAttributes = ["statusid", "sensitive", "spoilertext"];

	instanceUrl: URL;

	header: StatusHeader;
	footer: StatusFooter;
	content: StatusContent;

	#link: HTMLAnchorElement;
	#time: HTMLTimeElement;
	#postUrl: HTMLAnchorElement;

	constructor(instanceUrl: URL) {
		super();

		this.instanceUrl = instanceUrl;
	}

	setStatus(status: mastodon.Status, reblog?: boolean, reblogger?: mastodon.Account) {
		if(!(this.header && this.footer)) {
			setTimeout(() => {this.setStatus(status, reblog, reblogger)}, 100);
		} else {
			const localProfileUrl = new URL("./user/", window.location.origin);
			localProfileUrl.searchParams.append("acct", `@${status.account.acct}`);

			if(reblog) {
				this.header.setLabel(`<a href="/user/?acct=@${reblogger.acct}">🔁 <img class="avatar inline-img" src="${reblogger.avatar}" alt=""> <span class="display-name">${(reblogger.displayName || reblogger.displayName != "") ? renderEmojis(reblogger.displayName, reblogger.emojis) : reblogger.username}</span> boosted</a>`);
			} else if(status.inReplyToId) {
				this.header.setLabel("💬 reply");
			}

			let outDisplayName = (status.account.displayName || status.account.displayName != "") ? renderEmojis(status.account.displayName, status.account.emojis) : status.account.username;

			this.header.setProfileInfo(
				status.account.avatar,
				outDisplayName,
				parseHandle(`@${status.account.acct}`),
				localProfileUrl
			);

			this.footer.setStatusInfo(status.id, undefined, status.reblogged, status.favourited);
			this.footer.connectReplyButton(this);
			
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
					this.shadowRoot.getElementById("status-content-target").appendChild(this.content);
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
				this.shadowRoot.getElementById("status-content-target").appendChild(this.content);
			}

			this.content.setContent(renderEmojis(status.content, status.emojis));

			// TODO: separate these into a footer component
			this.#postUrl.href = new URL(`@${status.account.acct}/${status.id}`, this.instanceUrl).href;
			this.#link.href = `/status/?id=${status.id}`;
			this.#time.dateTime = status.createdAt.toISOString();
			this.#time.innerText = getRelativeTimeString(status.createdAt);

			if(status.mediaAttachments.length > 0) {
				this.content.setAttachments(renderAttachments(status.mediaAttachments));
			}

			if(status.card != null) {
				this.content.addCard(status.card.url, status.card.title, status.card.image, status.card.description, status.card.width, status.card.height);
			} else if(this.content.getElementsByTagName("app-link-card").length > 0) {
				this.content.removeCard();
			}
		}
	}

	setStatusById(statusId: string) {
		mastodon.getStatus(statusId).then(([status, reblog, reblogger]) => {
			this.setStatus(status, reblog, reblogger);
		});
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		const header = new StatusHeader;
		const footer = new StatusFooter;

		shadow.adoptedStyleSheets = [commonStylesheet, statusStylesheet];

		shadow.appendChild(statusTemplate.cloneNode(true));
		shadow.getElementById("status-root").prepend(header);
		shadow.getElementById("status-root").appendChild(footer);

		this.header = header;
		this.footer = footer;

		this.#link = shadow.getElementById("link") as HTMLAnchorElement;
		this.#time = shadow.getElementById("time") as HTMLTimeElement;
		this.#postUrl = shadow.getElementById("post-url") as HTMLAnchorElement;
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if(name == "statusid") {
			this.setStatusById(newValue);
		}
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

		this.#link = shadow.getElementById("link") as HTMLAnchorElement;
		this.#image = shadow.getElementById("image") as HTMLImageElement;
		this.#title = shadow.getElementById("title") as HTMLHeadingElement;
		this.#description = shadow.getElementById("description") as HTMLParagraphElement;
	}
}

export class Timeline extends HTMLElement {
	static observedAttributes = ["type", "tag", "acctid", "boosts", "replies"];

	instanceUrl: URL;

	#loadMoreButton: HTMLButtonElement;
	
	#lastPostId: string;
	#showBoosts: boolean;
	#showReplies: boolean;
	
	constructor(instanceUrl: URL) {
		super();

		this.instanceUrl = instanceUrl;
	}

	prependStatus(status: mastodon.Status) {
		const statusElement = new Status(this.instanceUrl);
		status.reblog ? statusElement.setStatus(status.reblog, true, status.account) : statusElement.setStatus(status);
		this.shadowRoot.prepend(statusElement);
	}

	addStatuses(data: mastodon.Status[]) {
		const statuses: DocumentFragment = new DocumentFragment();
						
		for(const status of data) {
			if((!this.#showReplies && status.inReplyToId) || (!this.#showBoosts && status.reblog)) {
				continue;
			} else {
				const statusElement = new Status(this.instanceUrl);
				status.reblog ? statusElement.setStatus(status.reblog, true, status.account) : statusElement.setStatus(status);
				statuses.appendChild(statusElement);
			}
		}

		try {
			this.#lastPostId = data[data.length - 1].id;
		} catch(error) {

		}

		this.shadowRoot.insertBefore(statuses, this.#loadMoreButton);
	}

	loadTimeline(type: string, value?: string) {
		console.log(`lt: ${this.instanceUrl} ${type} ${value}`);
		switch(type) {
			case "account":
				mastodon.accounts.getAccountStatuses(this.instanceUrl, value, token ?? null, this.#lastPostId).then((data: mastodon.Status[]) => {
					this.addStatuses(data);
				});
				break;
			case "tag":
				mastodon.getHashtagTimeline(this.instanceUrl, value, token ?? null, undefined, undefined, undefined, undefined, undefined, undefined, this.#lastPostId, undefined, undefined, undefined).then((data: mastodon.Status[]) => {
					this.addStatuses(data);
				});
				break;
			case "public":
				mastodon.getPublicTimeline(this.instanceUrl, token ?? null, undefined, undefined, undefined, this.#lastPostId, undefined, undefined, undefined).then((data: mastodon.Status[]) => {
					this.addStatuses(data);
				});
				break;
			case "local":
				mastodon.getPublicTimeline(this.instanceUrl, token ?? null, true, undefined, undefined, this.#lastPostId, undefined, undefined, undefined).then((data) => {
					this.addStatuses(data);
				});
				break;
			case "home":
				mastodon.getHomeTimeline(token, this.#lastPostId, undefined, undefined, undefined).then((data: mastodon.Status[]) => {
					this.addStatuses(data);
				});
				break;
			default:
				mastodon.getTimeline(this.instanceUrl, mastodon.Timelines[type as keyof typeof mastodon.Timelines], undefined, undefined).then((data: any) => {
					this.addStatuses(data);
				});
		}
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet, timelineStylesheet];
		shadow.appendChild(timelineTemplate.cloneNode(true));

		this.#showBoosts = this.getAttribute("boosts") != null ? this.getAttribute("boosts") == "true" : true;
		this.#showReplies = this.getAttribute("replies") != null ? this.getAttribute("replies") == "true" : true;

		console.log(this.#showBoosts + " " + this.#showReplies);

		this.#loadMoreButton = shadow.getElementById("load-more-button") as HTMLButtonElement;
		this.#loadMoreButton.addEventListener("click", (event) => {
			const timelineType = this.getAttribute("type");
			
			switch(timelineType) {
				case "tag":
					this.loadTimeline(timelineType, this.getAttribute("tag"));
					break;
				case "account":
					this.loadTimeline(timelineType, this.getAttribute("acctid"));
					break;
				default:
					this.loadTimeline(timelineType);
			}
			
			// const currentTimeline = this.getAttribute("type");

			// if(!(currentTimeline == "Account" || currentTimeline == "Hashtag")) {
			// 	mastodon.getTimeline(instanceUrl, mastodon.Timelines[currentTimeline as keyof typeof mastodon.Timelines], undefined, this.#lastPostId).then((data) => this.addStatuses(data));
			// } else if(currentTimeline == "Account") {
			// 	mastodon.getAccountTimeline(this.getAttribute("acctid"), this.#lastPostId).then((data) => this.addStatuses(data));
			// } else if(currentTimeline == "Hashtag") {
			// 	mastodon.getTimeline(instanceUrl, mastodon.Timelines.Hashtag, this.getAttribute("tag"), this.#lastPostId).then((data) => this.addStatuses(data));
			// }
		});

		document.addEventListener("postsent", (event) => {
			this.prependStatus((event as CustomEvent).detail.status);
		});
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		const timelineType = this.getAttribute("type");
		switch(name) {
			case "boosts":
				this.#showBoosts = newValue == "true";

				if(this.shadowRoot) {
					this.shadowRoot.replaceChildren(this.#loadMoreButton)
				}

				if(timelineType == "account" && this.getAttribute("acctid")) {
					this.loadTimeline("account", this.getAttribute("acctid"));
				} else if(timelineType == "tag" && this.getAttribute("tag")) {
					this.loadTimeline("tag", this.getAttribute("tag"));
				} else if(timelineType) {
					this.loadTimeline(timelineType);
				}

				break;
			case "replies":
				this.#showReplies = newValue == "true";

				console.log(this.#showReplies);

				if(this.shadowRoot) {
					this.shadowRoot.replaceChildren(this.#loadMoreButton)
				}

				if(timelineType == "account" && this.getAttribute("acctid")) {
					this.loadTimeline("account", this.getAttribute("acctid"));
				} else if(timelineType == "tag" && this.getAttribute("tag")) {
					this.loadTimeline("tag", this.getAttribute("tag"));
				} else if(timelineType) {
					this.loadTimeline(timelineType);
				}

				break;
			case "type":
				if(!(newValue == "account" || newValue == "tag")) {
					this.loadTimeline(newValue, undefined);
				}
				break;
			case "acctid":
				if(this.getAttribute("type") == "account") {
					this.loadTimeline("account", newValue);
				} else {
					console.warn("Changed account ID, but this timeline isn't set to type \"account\".");
				}
				break;
			case "tag":
				if(this.getAttribute("type") == "tag") {
					if(this.shadowRoot) {
						this.shadowRoot.replaceChildren(this.#loadMoreButton);
					}
					this.loadTimeline("tag", newValue);
				} else {
					console.warn("Changed tag, but this timeline isn't set to type \"tag\".");
				}
				break;
		}
	}
}

export class NavigationSidebar extends HTMLElement {
	#youLink: HTMLAnchorElement;
	
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet, navigationStylesheet];
		shadow.appendChild(navigationSidebarTemplate.cloneNode(true));

		this.#youLink = shadow.getElementById("you-link") as HTMLAnchorElement;
		
		mastodon.accounts.verifyCredentials(env.instanceUrl, env.token).then((account) => {
			this.#youLink.href = `/user/?acct=@${account.acct}`;
		})
	}
}

export class TagInput extends HTMLElement {
	hasSpawnedNextInput: boolean;
	
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet];
		shadow.appendChild(tagInputTemplate.cloneNode(true));

		this.hasSpawnedNextInput = false;
	}
}

export class PostBox extends Card {
	form: HTMLFormElement;
	postInput: HTMLDivElement;
	tagsInput: HTMLDivElement;
	characterCounter: HTMLParagraphElement;
	postButton: HTMLButtonElement;

	characterCount: number;

	constructor() {
		super();
	}

	post() {
		let postText = this.postInput.innerText;
		let tags = "";

		this.tagsInput.childNodes.forEach((tagInput: TagInput, index) => {
			tags += (tagInput.shadowRoot.getElementById("input") as HTMLInputElement).value;
			if(index < this.tagsInput.childNodes.length - 1) {
				tags += " ";
			}
		});

		if(tags != "") {
			postText += "\n\n" + tags;
		}

		mastodon.postStatus(postText).then((status) => {
			postSentEvent = new CustomEvent("postsent", {bubbles: false, cancelable: false, composed: true, detail: {
				status: status
			}})
			document.dispatchEvent(postSentEvent);

			this.postInput.innerText = "";
			this.postButton.disabled = true;
			this.characterCounter.innerText = `0/${charLimit}`;

			this.form.style.removeProperty("max-width");
			this.form.style.removeProperty("height");
		});
	}

	registerTagInputListener(input: TagInput) {
		if(!input.shadowRoot) {
			setTimeout(() => this.registerTagInputListener(input), 500);
		} else {
			const inputElement = input.shadowRoot.getElementById("input") as HTMLInputElement;

			inputElement.addEventListener("input", (event) => {
				const target = event.target as HTMLInputElement;
				
				if(target.value.includes(" ")) {
					target.value = target.value.replaceAll(" ", "");
				}

				if(target.value.includes(",")) {
					target.value = target.value.replaceAll(",", "");
				}

				if(target.value[0] != "#") {
					target.value = `#${target.value}`;
				}

				if((target.value != "" && target.value != "#") && !input.hasSpawnedNextInput) {
					const newTagInput = new TagInput;
					this.registerTagInputListener(newTagInput);
					this.tagsInput.appendChild(newTagInput);
					input.hasSpawnedNextInput = true;
				} else if((target.value == "" || target.value == "#") && input.hasSpawnedNextInput) {
					if(this.tagsInput.childElementCount > 1) {
						input.nextElementSibling.remove();
						input.hasSpawnedNextInput = false;
					}
				}

				this.characterCount = this.postInput.innerText.length + this.getTagsCharacterCount();
				this.characterCounter.innerText = `${this.characterCount}/${charLimit}`;
			});

			inputElement.addEventListener("focus", (event) => {
				const target = event.target as HTMLInputElement;

				if(target.value == "") {
					target.value = "#";
				}
			});

			inputElement.addEventListener("blur", (event) => {
				const target = event.target as HTMLInputElement;

				if(target.value == "" || target.value == "#") {
					target.value = "";
					if(this.tagsInput.childElementCount > 2) {
						input.remove();
					}
				} else if(!input.hasSpawnedNextInput) {
					const newTagInput = new TagInput;
					this.registerTagInputListener(newTagInput);
					this.tagsInput.appendChild(newTagInput);
					input.hasSpawnedNextInput = true;
				}

				if(target.value == "#") {
					target.value = "";
				}
			});

			inputElement.addEventListener("keyup", (event) => {
				const target = event.target as HTMLInputElement;

				if((event.key == " " || event.key == ",") && (target.value != "" && target.value != "#") && input.hasSpawnedNextInput) {
					input.nextElementSibling.shadowRoot.getElementById("input").focus();
				}
			});

			inputElement.addEventListener("keydown", (event) => {
				const target = event.target as HTMLInputElement;
				if(event.key == "Backspace" && (target.value == "" || target.value == "#")) {
					if(this.tagsInput.childElementCount > 1) {
						input.previousElementSibling.shadowRoot.getElementById("input").focus();
						(input.previousElementSibling as TagInput).hasSpawnedNextInput = false;
						input.remove();
					}
				}
			})
		}
	}

	getTagsCharacterCount(): number {
		let charCount = 0;

		this.tagsInput.childNodes.forEach((tagInput: TagInput, index) => {
			charCount += (tagInput.shadowRoot.getElementById("input") as HTMLInputElement).value.length;
			if(index < this.tagsInput.childNodes.length - 1) {
				charCount++;
			}
		});

		return charCount;
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet, postBoxStylesheet];
		shadow.appendChild(postBoxTemplate.cloneNode(true));

		this.form = shadow.getElementById("form") as HTMLFormElement;
		this.postInput = shadow.getElementById("post-input") as HTMLDivElement;
		this.characterCounter = shadow.getElementById("character-counter") as HTMLParagraphElement;
		this.postButton = shadow.getElementById("post-button") as HTMLButtonElement;
		
		this.tagsInput = document.createElement("div");
		this.tagsInput.slot = "tags";
		const firstTagInput = new TagInput;

		this.registerTagInputListener(firstTagInput);

		this.tagsInput.appendChild(firstTagInput);
		this.appendChild(this.tagsInput);

		this.characterCount = this.postInput.innerText.length + this.getTagsCharacterCount();

		this.characterCounter.innerText = `${this.characterCount}/${charLimit}`;

		this.postInput.addEventListener("input", (event) => {
			const target = event.target as HTMLDivElement;

			if(target.innerText == "\n") {
				target.innerText = "";
			}
			
			console.log(target.innerText + " " + target.innerText.length);

			this.characterCount = this.postInput.innerText.length + this.getTagsCharacterCount();

			target.style.height = "auto";
			target.style.height = `${target.scrollHeight}px`;
			

			if(target.innerText != "") {
				this.form.style.maxWidth = "calc(var(--max-item-width) * 1.05)";
				this.form.style.height = "auto";
			} else {
				this.form.style.removeProperty("max-width");
				this.form.style.removeProperty("height");
			}

			this.characterCounter.innerText = `${this.characterCount}/${charLimit}`;

			if(target.innerText == "" || this.characterCount > charLimit) {
				this.postButton.disabled = true;
			} else {
				this.postButton.disabled = false;
			}
		});

		this.postButton.addEventListener("click", (event) => {
			const target = event.target as HTMLButtonElement
			this.post();
		});
	}
}

export class ReplyBox extends PostBox {
	instanceUrl: URL;
	
	#replyId: string;
	
	constructor(instanceUrl: URL) {
		super();

		this.instanceUrl = instanceUrl;
	}

	post() {
		let postText = this.postInput.innerText;
		let tags = "";

		this.tagsInput.childNodes.forEach((tagInput: TagInput, index) => {
			tags += (tagInput.shadowRoot.getElementById("input") as HTMLInputElement).value;
			if(index < this.tagsInput.childNodes.length - 1) {
				tags += " ";
			}
		});

		if(tags != "") {
			postText += "\n\n" + tags;
		}

		mastodon.postStatus(postText, undefined, undefined, undefined, undefined, undefined, this.#replyId).then((status) => {
			console.log(status);
			const newStatus = new Status(this.instanceUrl);
			newStatus.setStatus(status);
			this.parentNode.insertBefore(newStatus, this.nextElementSibling);
			this.remove();
		})
	}

	setReplyingToId(id: string) {
		this.#replyId = id;
	}

	connectedCallback() {
		super.connectedCallback();

		this.postButton.innerText = "Reply!";
	}
}

export class Modal extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const template = `<div id="bg"><div id="dialog"><button id="close">Close</button><slot></slot></div></div>`;
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [commonStylesheet, modalStylesheet];
		shadow.innerHTML = template;

		shadow.getElementById("close").addEventListener("click", (event) => {
			this.remove();
		});
	}
}

export class HomeView extends HTMLElement {
	instanceUrl: URL;
	
	constructor(instanceUrl: URL) {
		super();

		this.instanceUrl = instanceUrl;
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});

		const postBox = new PostBox();
		
		const homeTimelineObject = new Timeline(this.instanceUrl);
		homeTimelineObject.setAttribute("type", "home");

		shadow.appendChild(postBox);
		shadow.appendChild(homeTimelineObject);

		homeTimelineObject.shadowRoot.addEventListener("click", (event) => {
			console.log((event.target as HTMLElement).nodeName);
		});
	}
}

export class PublicTimelineView extends HTMLElement {
	instanceUrl: URL;

	constructor(instanceUrl: URL) {
		super();

		this.instanceUrl = instanceUrl;
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});

		const publicTimelineObject = new Timeline(this.instanceUrl);
		publicTimelineObject.setAttribute("type", "public");

		shadow.appendChild(publicTimelineObject);
	}
}

export class LocalTimelineView extends HTMLElement {
	instanceUrl: URL;

	constructor(instanceUrl: URL) {
		super();

		this.instanceUrl = instanceUrl;
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});

		const localTimeline = new Timeline(this.instanceUrl);
		localTimeline.setAttribute("type", "local");

		shadow.appendChild(localTimeline);
	}
}

export class AccountView extends HTMLElement {
	instanceUrl: URL;

	profileHeader: ProfileHeader;
	accountTimeline: Timeline;

	constructor(instanceUrl: URL) {
		super();

		this.instanceUrl = instanceUrl;
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});

		this.profileHeader = new ProfileHeader();
		this.accountTimeline = new Timeline(this.instanceUrl);
		
		shadow.appendChild(this.profileHeader);
		shadow.appendChild(this.accountTimeline);
	}
}

export class ModalSettingsView extends HTMLElement {
	instanceUrlInput: HTMLInputElement;

	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(settingsModalTemplate.cloneNode(true));

		this.instanceUrlInput = shadow.getElementById("setting-instance-url") as HTMLInputElement;

		this.instanceUrlInput.placeholder = env.instanceUrl.href;
		this.instanceUrlInput.value = localStorage.getItem("instanceUrl");
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
	profileHeaderTemplate = await getTemplate("/templates/profile.html", "header");
	cardTemplate = await getTemplate("/templates/card.html", "card");
	statusHeaderTemplate = await getTemplate("/templates/status.html", "header");
	statusFooterTemplate = await getTemplate("/templates/status.html", "footer");
	statusContentTemplate = await getTemplate("/templates/status.html", "content");
	statusContentWarnedTemplate = await getTemplate("/templates/status.html", "content-cw");
	statusTemplate = await getTemplate("/templates/status.html", "status");
	linkCardTemplate = await getTemplate("/templates/link-card.html", "card");
	timelineTemplate = await getTemplate("/templates/timeline.html", "timeline");
	navigationSidebarTemplate = await getTemplate("/templates/navigation.html", "sidebar");
	postBoxTemplate = await getTemplate("/templates/post.html", "postbox");
	tagInputTemplate = await getTemplate("/templates/post.html", "taginput");
	settingsModalTemplate = await getTemplate("/templates/modal.html", "settings");
}

async function initStylesheets() {
	commonStylesheet = await getStylesheet("/css/components/common.css");
	profileHeaderStylesheet = await getStylesheet("/css/components/profile-header.css");
	statusStylesheet = await getStylesheet("/css/components/status.css");
	linkCardStylesheet = await getStylesheet("/css/components/link-card.css");
	timelineStylesheet = await getStylesheet("/css/components/timeline.css");
	navigationStylesheet = await getStylesheet("/css/components/navigation.css");
	postBoxStylesheet = await getStylesheet("/css/components/post-box.css");
	modalStylesheet = await getStylesheet("/css/components/modal.css");
}

function initComponents() {
	initTemplates().then(() => {
		initStylesheets().then(() => {
			customElements.define("app-card", Card);
			customElements.define("app-profile-header", ProfileHeader);

			customElements.define("app-status-header", StatusHeader, {extends: "header"});
			customElements.define("app-status-footer", StatusFooter, {extends: "footer"});
			customElements.define("app-status-content", StatusContent);
			customElements.define("app-status-content-warned", StatusContentWarned);
			customElements.define("app-status", Status);
			customElements.define("app-link-card", LinkCard);

			customElements.define("app-timeline", Timeline);

			customElements.define("app-nav-sidebar", NavigationSidebar);

			customElements.define("app-tag-input", TagInput);
			customElements.define("app-post-box", PostBox);
			customElements.define("app-reply-box", ReplyBox);

			customElements.define("app-modal", Modal);

			customElements.define("app-view-home", HomeView);
			customElements.define("app-view-public", PublicTimelineView);
			customElements.define("app-view-local", LocalTimelineView);
			customElements.define("app-view-account", AccountView);

			customElements.define("app-modal-view-settings", ModalSettingsView);
		});
	});
}

initComponents();