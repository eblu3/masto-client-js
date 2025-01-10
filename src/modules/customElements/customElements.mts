import * as mastodon from "../mastodon/mastodon.mjs";
import {renderEmojis, charLimit} from "../masto_ts.mjs";
import * as env from "../../env.mjs";
import * as statusElements from "./status.mjs";
import * as viewElements from "./views.mjs";
import * as util from "./util.mjs";

export { MenuCategory, MenuItem, StatusEvents } from "./util.mjs";
export * as status from "./status.mjs";
export * as views from "./views.mjs";

const profileHeaderStylesheet = await util.getStylesheet("/css/components/profile-header.css");
const postBoxStylesheet = await util.getStylesheet("/css/components/post-box.css");
const modalStylesheet = await util.getStylesheet("/css/components/modal.css");
const menuStylesheet = await util.getStylesheet("/css/components/menu.css");

const profileHeaderTemplate = await util.getTemplate("/templates/profile.html", "header");
const cardTemplate = await util.getTemplate("/templates/card.html", "card");
const timelineTemplate = await util.getTemplate("/templates/timeline.html", "timeline");
const postBoxTemplate = await util.getTemplate("/templates/post.html", "postbox");
const tagInputTemplate = await util.getTemplate("/templates/post.html", "taginput");

export class ProfileHeader extends HTMLElement {
	static observedAttributes = ["acctid", "acct"];

	account: mastodon.Account;

	#container: HTMLElement;
	#avatar: HTMLImageElement;
	#displayName: HTMLHeadingElement;
	#handle: HTMLParagraphElement;
	#bio: HTMLParagraphElement;
	#fields: HTMLTableElement;
	
	constructor(account: mastodon.Account) {
		super();

		this.account = account;
	}

	setAccount(account: mastodon.Account) {
		if(account != this.account) {
			this.account = account;
		}
		
		this.#container.style.setProperty("--header-url", `url(${account.header.href})`);
		this.#avatar.src = account.avatar.href;
		this.#displayName.innerHTML = (account.displayName || account.displayName != "") ? renderEmojis(account.displayName, account.emojis) as string : account.username;
		this.#handle.innerText = `@${account.acct}`;
		this.#bio.innerHTML = renderEmojis(account.note, account.emojis) as string;

		console.log(account.fields);

		for(const field of account.fields) {
			const newRow = this.#fields.insertRow();
			const rowName = newRow.insertCell();
			const rowValue = newRow.insertCell();

			if(field.verifiedAt) {
				newRow.classList.add("verified");
			}

			rowName.outerHTML = `<th>${renderEmojis(field.name, account.emojis)}</th>`;
			rowValue.innerHTML = renderEmojis(field.value, account.emojis) as string;
		}
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [util.commonStylesheet, profileHeaderStylesheet];
		shadow.appendChild(profileHeaderTemplate.cloneNode(true));

		this.#container = shadow.getElementById("container");
		this.#avatar = shadow.getElementById("avatar") as HTMLImageElement;
		this.#displayName = shadow.getElementById("display-name") as HTMLHeadingElement;
		this.#handle = shadow.getElementById("handle") as HTMLParagraphElement;
		this.#bio = shadow.getElementById("bio") as HTMLParagraphElement;
		this.#fields = shadow.getElementById("fields") as HTMLTableElement;

		this.setAccount(this.account);
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if(name == "acctid") {
			mastodon.accounts.get(env.instanceUrl, newValue, env.token).then((account) => {
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
		shadow.adoptedStyleSheets = [util.commonStylesheet];
		shadow.appendChild(cardTemplate.cloneNode(true));
	}
}

export class Timeline extends HTMLElement {
	static observedAttributes = ["type", "tag", "acctid", "boosts", "replies"];

	instanceUrl: URL;

	statuses: statusElements.Status[];

	statusEvents: util.StatusEvents;

	#loadMoreButton: HTMLButtonElement;
	
	#lastPostId: string;
	#showBoosts: boolean;
	#showReplies: boolean;
	
	constructor(instanceUrl: URL, statusEvents?: util.StatusEvents) {
		super();

		this.instanceUrl = instanceUrl;
		this.statuses = [];
		this.statusEvents = statusEvents;
	}

	prependStatus(status: mastodon.Status) {
		let statusElement: statusElements.Status;
		status.inReplyToId ? statusElement = new statusElements.StatusThread(
			this.instanceUrl,
			status,
			this.statusEvents
		) : statusElement = new statusElements.Status(
			this.instanceUrl,
			status,
			this.statusEvents
		);
		this.statuses.unshift(statusElement);
		this.prepend(statusElement);
	}

	addStatuses(data: mastodon.Status[]) {
		const statuses: DocumentFragment = new DocumentFragment();
						
		for(const status of data) {
			if((!this.#showReplies && status.inReplyToId) || (!this.#showBoosts && status.reblog)) {
				continue;
			} else {
				let statusElement: statusElements.Status;
				status.inReplyToId ? statusElement = new statusElements.StatusThread(
					this.instanceUrl,
					status,
					this.statusEvents
				) : statusElement = new statusElements.Status(
					this.instanceUrl,
					status,
					this.statusEvents
				);
				this.statuses.push(statusElement);
				statuses.appendChild(statusElement);
			}
		}

		try {
			this.#lastPostId = data[data.length - 1].id;
		} catch(error) {

		}

		this.insertBefore(statuses, this.#loadMoreButton);
	}

	loadTimeline(type: string, value?: string) {
		console.log(`lt: ${this.instanceUrl} ${type} ${value}`);
		switch(type) {
			case "account":
				mastodon.accounts.getStatuses(this.instanceUrl, value, env.token ?? null, this.#lastPostId).then((data: mastodon.Status[]) => {
					this.addStatuses(data);
				});
				break;
			case "tag":
				mastodon.timelines.getHashtagTimeline(this.instanceUrl, value, env.token ?? null, undefined, undefined, undefined, undefined, undefined, undefined, this.#lastPostId, undefined, undefined, undefined).then((data: mastodon.Status[]) => {
					this.addStatuses(data);
				});
				break;
			case "public":
				mastodon.timelines.getPublicTimeline(this.instanceUrl, env.token ?? null, undefined, undefined, undefined, this.#lastPostId, undefined, undefined, undefined).then((data: mastodon.Status[]) => {
					this.addStatuses(data);
					mastodon.timelines.streaming.establishWebSocketConnection(this.instanceUrl, env.token, mastodon.timelines.streaming.Streams.Public, undefined, undefined, true).addEventListener("message", (message) => {
						const data = JSON.parse(message.data);
						const event = data["event"] as string;
						const payload = JSON.parse(data.payload);

						if(event == mastodon.timelines.streaming.Events.NewStatus) {
							this.prependStatus(new mastodon.Status(payload));
						}

						if(event == mastodon.timelines.streaming.Events.StatusDeleted) {
							try {
								this.querySelector(`#status-${payload}`).remove();
							} catch {}
						}
					});
				});
				break;
			case "local":
				mastodon.timelines.getPublicTimeline(this.instanceUrl, env.token ?? null, true, undefined, undefined, this.#lastPostId, undefined, undefined, undefined).then((data) => {
					this.addStatuses(data);
				});
				break;
			case "home":
				mastodon.timelines.getHomeTimeline(this.instanceUrl, env.token, this.#lastPostId, undefined, undefined, undefined).then((data: mastodon.Status[]) => {
					this.addStatuses(data);
					mastodon.timelines.streaming.establishWebSocketConnection(this.instanceUrl, env.token, mastodon.timelines.streaming.Streams.User, undefined, undefined, true).addEventListener("message", (message) => {
						const data = JSON.parse(message.data);
						const event = data["event"] as string;
						const payload = JSON.parse(data.payload);

						if(event == mastodon.timelines.streaming.Events.NewStatus) {
							this.prependStatus(new mastodon.Status(payload));
						}
					});
				});
				break;
			default:
				mastodon.getTimeline(this.instanceUrl, mastodon.Timelines[type as keyof typeof mastodon.Timelines], undefined, undefined).then((data: any) => {
					this.addStatuses(data);
				});
		}
	}

	connectedCallback() {
		// const shadow = this.attachShadow({mode: "open"});
		// shadow.adoptedStyleSheets = [commonStylesheet, timelineStylesheet];
		this.appendChild(timelineTemplate.cloneNode(true));

		this.#showBoosts = this.getAttribute("boosts") != null ? this.getAttribute("boosts") == "true" : true;
		this.#showReplies = this.getAttribute("replies") != null ? this.getAttribute("replies") == "true" : true;

		console.log(this.#showBoosts + " " + this.#showReplies);

		this.#loadMoreButton = this.querySelector("#load-more-button") as HTMLButtonElement;
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
	#items: {name: string, onClick: () => void, icon?: URL | string, link?: URL}[];
	#youLink: HTMLAnchorElement;
	
	constructor(items: {name: string, onClick: () => void, icon?: URL | string, link?: URL}[]) {
		super();

		this.#items = items;
	}

	connectedCallback() {
		for(const item of this.#items) {
			const navLink = document.createElement("a");

			navLink.innerText = item.name;

			if(item.icon) {
				let icon: HTMLElement;
				if(item.icon instanceof URL) {
					icon = document.createElement("img");
					(icon as HTMLImageElement).src = item.icon.href;
				} else {
					icon = document.createElement("span");
					icon.classList.add("material-symbols-outlined");
					icon.innerText = item.icon;
				}

				icon.ariaHidden = "true";
				navLink.prepend(icon);
			}

			if(item.link) {
				navLink.href = item.link.href;
			}

			this.appendChild(navLink);
			navLink.addEventListener("click", (event) => {
				event.preventDefault();
				item.onClick();
			});
		}
		// shadow.appendChild(navigationSidebarTemplate.cloneNode(true));

		// this.#youLink = shadow.getElementById("you-link") as HTMLAnchorElement;
		
		// mastodon.accounts.verifyCredentials(env.instanceUrl, env.token).then((account) => {
		// 	this.#youLink.href = `/user/?acct=@${account.acct}`;
		// })
	}
}

export class TagInput extends HTMLElement {
	hasSpawnedNextInput: boolean;
	
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [util.commonStylesheet];
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

		mastodon.statuses.postStatus(env.instanceUrl, env.token, undefined, postText).then((status) => {
			document.dispatchEvent(new CustomEvent("postsent", {bubbles: false, cancelable: false, composed: true, detail: {
				status: status
			}}));

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
		shadow.adoptedStyleSheets = [util.commonStylesheet, postBoxStylesheet];
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
	
	constructor(instanceUrl: URL, replyId: string) {
		super();

		this.instanceUrl = instanceUrl;
		this.#replyId = replyId;
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

		mastodon.statuses.postStatus(this.instanceUrl, env.token, undefined, postText, undefined, undefined, this.#replyId).then((status) => {
			const newStatus = new statusElements.Status(this.instanceUrl, status as mastodon.Status);
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
		shadow.adoptedStyleSheets = [util.commonStylesheet, modalStylesheet];
		shadow.innerHTML = template;

		shadow.getElementById("close").addEventListener("click", (event) => {
			this.remove();
		});
	}
}

export class Menu extends HTMLElement {
	options: util.MenuCategory[] | util.MenuItem[];
	menuRoot: HTMLUListElement;
	
	constructor(options: util.MenuCategory[] | util.MenuItem[]) {
		super();

		this.options = options;
	}

	addOptions(options: util.MenuItem[], target: HTMLUListElement) {
		for(const option of options) {
			const menuItem = document.createElement("li");
			menuItem.classList.add("menu-item");
			menuItem.role = "menuitem";
			menuItem.innerText = option.name;
			if(option.icon) {
				let icon: HTMLElement
				if(typeof option.icon === "string") {
					icon = document.createElement("span");
					icon.innerText = option.icon;
					icon.classList.add("material-symbols-outlined");
				} else {
					icon = document.createElement("img");
					(icon as HTMLImageElement).src = option.icon.href;
				}
				if(option.iconOptions) {
					for(const iconOption of option.iconOptions) {
						icon.setAttribute(iconOption.option, iconOption.value);
					}
				}
				icon.classList.add("menu-icon");
				icon.ariaHidden = "true";
				menuItem.prepend(icon);
			}
			menuItem.addEventListener(("click"), option.onClick);
			target.appendChild(menuItem);
			menuItem.addEventListener("click", (event) => {
				this.remove();
			});
		}
	}
	
	connectedCallback() {
		const template = `<ul id="root" role="menu"></ul>`;
		const shadow = this.attachShadow({mode: "open"});
		shadow.adoptedStyleSheets = [util.materialIcons, util.commonStylesheet, menuStylesheet];
		shadow.innerHTML = template;

		this.menuRoot = shadow.getElementById("root") as HTMLUListElement;

		if("categoryName" in this.options[0]) {
			for(const category of this.options as util.MenuCategory[]) {
				const categoryList = document.createElement("ul");
				categoryList.setAttribute("category", category.categoryName);
				this.addOptions(category.contents, categoryList);
				this.menuRoot.appendChild(categoryList);
			}
		} else {
			this.addOptions(this.options as util.MenuItem[], this.menuRoot);
		}
	}
}

export function init() {
	statusElements.init();
	viewElements.init();

	customElements.define("app-profile-header", ProfileHeader);

	customElements.define("app-timeline", Timeline);

	customElements.define("app-nav-sidebar", NavigationSidebar);

	customElements.define("app-tag-input", TagInput);
	customElements.define("app-post-box", PostBox);
	customElements.define("app-reply-box", ReplyBox);

	customElements.define("app-modal", Modal);

	customElements.define("app-menu", Menu);
}