import * as env from "../.env.js"; // look, I'm not here to fiddle with node all night. you can probably figure this one out yourself.
import * as mastodon from "./modules/mastodon.mjs";
import * as customElements from "./modules/custom_elements.mjs";

export enum Timelines {
	Public = "/api/v1/timelines/public",
	Hashtag = "/api/v1/timelines/tag/",
	Home = "/api/v1/timelines/home",
}

export const instanceUrl: URL = env.instanceUrl;
export var timeline: Timelines;
export var tag: string | null;
export var charLimit: number = env.charLimit;

let token = env.token;

let lastStatusId: string = "";

export async function getTimeline(url: URL, endpoint: Timelines, tag?: string, startAtId?: string) {
	let newEndpoint: string = endpoint;
	
	if(endpoint === Timelines.Hashtag) {
		newEndpoint = newEndpoint + tag;
	}
	
	console.log(`Fetching timeline ${newEndpoint} from instance ${url.href}...`);

	try {
		let response;

		if(startAtId) {
			response = await fetch(new URL(`${newEndpoint}?max_id=${startAtId}`, url), {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		} else {
			response = await fetch(new URL(newEndpoint, url), {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		}

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		console.log("Got it!");
		console.log(json);

		return json;
	} catch(error) {
		console.error(error.message);

		return null;
	}
}

export async function getAccountTimeline(id: string): Promise<mastodon.Status[]> | null {
	try {
		let response;

		if(token) {
			response = await fetch(new URL(`/api/v1/accounts/${id}/statuses`, instanceUrl), {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		} else {
			response = await fetch(new URL(`/api/v1/accounts/${id}/statuses`, instanceUrl));
		}

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const timeline = await response.json();

		return timeline;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getStatus(id: string): Promise<[mastodon.Status, boolean, mastodon.Account]> | null {
	try {
		let response;

		if(token) {
			response = await fetch(new URL(`/api/v1/statuses/${id}`, instanceUrl), {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		} else {
			response = await fetch(new URL(`/api/v1/statuses/${id}`, instanceUrl));
		}

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const status = new mastodon.Status(await response.json());

		return status.reblog ? [status.reblog, true, status.account] : [status, false, undefined];
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getAccount(id: string): Promise<mastodon.Account> | null {
	try {
		let response;

		if(token) {
			response = await fetch(new URL(`/api/v1/accounts/${id}`, instanceUrl), {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		} else {
			response = await fetch(new URL(`/api/v1/accounts/${id}`, instanceUrl));
		}

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const account = new mastodon.Account(await response.json());

		return account;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getAccountByHandle(acct: string) {
	try {
		let response;

		if(token) {
			response = await fetch(new URL(`/api/v1/accounts/lookup?acct=${acct}`, instanceUrl), {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		} else {
			response = await fetch(new URL(`/api/v1/accounts/lookup?acct=${acct}`, instanceUrl));
		}

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const account = new mastodon.Account(await response.json());

		return account;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function postStatus(
	status?: string,
	mediaIds?: string[],
	pollOptions?: string[],
	pollExpiresIn?: number,
	pollMultipleChoice?: boolean,
	pollHideTotals?: boolean,
	inReplyToId?: string,
	isSensitive?: boolean,
	spoilerText?: string,
	visibility?: string,
	language?: string,
	scheduledAt?: string
): Promise<mastodon.Status> | null {
	try {
		let params = new URLSearchParams([["status", status]]);
		let response = await fetch(new URL(`/api/v1/statuses?${params.toString()}`, instanceUrl), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const postedStatus = new mastodon.Status(await response.json());

		return postedStatus;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export function renderAttachments(attachments: mastodon.MediaAttachment[]): HTMLElement[] {
	let out: HTMLElement[] = [];

	for(const attachment of attachments) {
		switch(attachment.type) {
			case mastodon.AttachmentType.Image:
				const image = document.createElement("img")

				image.setAttribute("src", attachment.url.toString());
				if(attachment.description) {
					image.setAttribute("alt", attachment.description);
				}

				out.push(image);
				break;
			case mastodon.AttachmentType.GIFV:
				const gifv = document.createElement("video");
				const gifvSource = document.createElement("source");

				gifv.setAttribute("autoplay", "true");
				gifv.setAttribute("loop", "true");
				gifvSource.setAttribute("src", attachment.url.toString());
				if(attachment.description) {
					gifv.setAttribute("aria-label", attachment.description);
				}

				gifv.appendChild(gifvSource);
				out.push(gifv);
				break;
			case mastodon.AttachmentType.Video:
				const video = document.createElement("video");
				const videoSource = document.createElement("source");

				video.setAttribute("controls", "true");
				videoSource.setAttribute("src", attachment.url.toString());
				if(attachment.description) {
					video.setAttribute("aria-label", attachment.description);
				}

				video.appendChild(videoSource);
				out.push(video);
				break;
			case mastodon.AttachmentType.Audio:
				const audio = document.createElement("audio");

				audio.setAttribute("controls", "true");
				audio.setAttribute("src", attachment.url.toString());
				if(attachment.description) {
					audio.setAttribute("aria-label", attachment.description);
				}

				out.push(audio);
				break;
			default:
				const attachmentLink = document.createElement("a");

				attachmentLink.setAttribute("href", attachment.url.toString());
				attachmentLink.innerText = `[📎 ${attachment.description}]`;

				out.push(attachmentLink);
				break;
		}
	}

	return out;
}

export function renderEmojis(str: string, emojis: mastodon.CustomEmoji[]) {
	let processedString = str;

	for(const emoji of emojis) {
		processedString = processedString.replaceAll(`:${emoji.shortcode}:`, `<img class=\"custom-emoji\" src=\"${emoji.url.toString()}\" alt=\"${emoji.shortcode}\" />`);
	}

	return processedString;
}

function removeTrailingLink(postContent: string): string {
	let processedPostContent = new DOMParser().parseFromString(postContent, "text/html");

	const allLinks = processedPostContent.getElementsByTagName("a");

	for(let i = allLinks.length - 1; i >= 0; i--) {
		const linkElement = allLinks[i];
		var linkClass = linkElement.getAttribute("class");
		var lastChild = processedPostContent.body.lastChild;

		if(lastChild.hasChildNodes && lastChild.lastChild.nodeType != Node.TEXT_NODE) {
			lastChild = lastChild.lastChild;
		}

		if(linkElement == lastChild) {
			console.log(linkElement);
			console.log(lastChild);

			if(linkClass == null || (linkClass.indexOf("mention") === -1 && linkClass.indexOf("hashtag") === -1)) {
				linkElement.remove();
				break;
			}
		}
	}

	return processedPostContent.documentElement.innerHTML;
}

function renderStatusAccountInfo(account: mastodon.Account): HTMLElement {
	let out = document.createElement("address");

	const avatar = document.createElement("img");
	const infoContainer = document.createElement("div");
	const displayName = document.createElement("span");
	const handle = document.createElement("span");

	avatar.setAttribute("class", "avatar");
	avatar.setAttribute("src", account.avatar.toString());

	displayName.setAttribute("class", "display-name");
	if(account.displayName) {
		displayName.innerHTML = `<a href=\"/user/?acct=${account.acct}\">${renderEmojis(account.displayName, account.emojis)}</a>`;
	} else {
		displayName.innerHTML = `<a href=\"/user/?acct=${account.acct}\">${account.username}</a>`;
	}

	handle.setAttribute("class", "account-handle");
	handle.innerText = `@${account.acct}`;

	infoContainer.appendChild(displayName);
	infoContainer.appendChild(document.createElement("br"));
	infoContainer.appendChild(handle);
	
	out.appendChild(avatar);
	out.appendChild(infoContainer);

	return out;
}

function renderCard(card: mastodon.PreviewCard): HTMLElement {
	let out = document.createElement("a");

	let cardContainer = document.createElement("div");
	let cardTitle = document.createElement("h2");
	let cardDesc = document.createElement("p");

	out.setAttribute("href", card.url.toString());

	cardContainer.setAttribute("class", "embed-card");
	
	if(card.image != null) {
		let cardImage = document.createElement("img");
		cardImage.setAttribute("src", card.image.toString());
		cardImage.setAttribute("width", card.width.toString());
		cardImage.setAttribute("height", card.height.toString());
		cardContainer.appendChild(cardImage);
	}

	cardTitle.innerText = card.title;

	cardDesc.innerText = card.description;

	cardContainer.appendChild(cardTitle);
	cardContainer.appendChild(cardDesc);

	out.appendChild(cardContainer);

	return out;
}

function renderProfileInfo(account: mastodon.Account): HTMLElement {
	let out = document.createElement("div");

	out.setAttribute("class", "profile-info");
	out.style.backgroundImage = `url(\"${account.header.href}\"`;

	let avatar = document.createElement("img");

	avatar.setAttribute("class", "avatar");
	avatar.setAttribute("src", account.avatar.href);

	out.appendChild(avatar);

	return out;
}

export function renderStatus(status: mastodon.Status, label?: HTMLElement): HTMLElement {
	if(status.reblog) {
		let label = document.createElement("p");

		label.setAttribute("class", "label");

		label.innerHTML = `🔁 <span class=\"display-name\">${renderEmojis(status.account.displayName, status.account.emojis)}</span> boosted`;

		return renderStatus(status.reblog, label=label);
	}
	
	let nodeList = new DOMParser().parseFromString(status.content, "text/html").body.childNodes;
	let parsedContent: HTMLElement[] = [];
	let out = document.createElement("article");

	nodeList.forEach((node) => {
		if(node.nodeType == Node.ELEMENT_NODE) {
			parsedContent.push((node as HTMLElement));
		} else if(node.nodeType == Node.TEXT_NODE) {
			const paragraphElement = document.createElement("p");
			paragraphElement.innerText = node.nodeValue;
			parsedContent.push(paragraphElement);
		}
	});

	for(const element of parsedContent) {
		element.innerHTML = renderEmojis(element.innerHTML, status.emojis);
	}

	if(status.language) {
		out.setAttribute("lang", status.language.language);
	}

	if(label) {
		out.appendChild(label);
	}

	out.appendChild(renderStatusAccountInfo(status.account));

	if(status.sensitive || status.spoilerText != "") {
		const details = document.createElement("details");
		const summary = document.createElement("summary");

		summary.setAttribute("class", "content-warning");

		if(status.spoilerText != "") {
			summary.innerText = `⚠️ ${status.spoilerText}`;
		} else {
			summary.innerText = "⚠️ Sensitive content";
		}

		details.appendChild(summary);
		// if(status.card != null) {
		// 	details.innerHTML += removeTrailingLink(renderEmojis(status.content, status.emojis));
		// } else {
			for(const element of parsedContent) {
				details.appendChild(element);
			}
		// }

		if(status.mediaAttachments.length > 0) {
			for(const attachment of renderAttachments(status.mediaAttachments)) {
				details.appendChild(attachment);
			}
		}

		if(status.card != null) {
			details.appendChild(renderCard(status.card));
		}

		out.appendChild(details);
	} else {
		// if(status.card != null) {
		// 	out.innerHTML += removeTrailingLink(renderEmojis(status.content, status.emojis));
		// } else {
			for(const element of parsedContent) {
				out.appendChild(element);
			}
		// }

		if(status.mediaAttachments.length > 0) {
			for(const attachment of renderAttachments(status.mediaAttachments)) {
				out.appendChild(attachment);
			}
		}

		if(status.card != null) {
			out.appendChild(renderCard(status.card));
		}
	}

	const statusTimeContainer = document.createElement("p");
	const statusLink = document.createElement("a");
	const statusTime = document.createElement("time");

	const rtf = new Intl.RelativeTimeFormat(undefined, {
		numeric: "auto"
	});
	const timeSincePost = (status.createdAt.getTime() - Date.now()) / 1000;

	statusTimeContainer.setAttribute("class", "time-container");

	statusLink.setAttribute("href", `/status/?id=${status.id}`);

	statusTime.setAttribute("datetime", status.createdAt.toISOString());

	switch(true) {
		case timeSincePost <= -604800:
			statusTime.innerText = status.createdAt.toLocaleString();
			break;
		case timeSincePost <= -86400:
			statusTime.innerText = rtf.format(Math.floor(timeSincePost / 86400), "days") + ` (${status.createdAt.toLocaleString()})`;
			break;
		case timeSincePost <= -3600:
			statusTime.innerText = rtf.format(Math.floor(timeSincePost / 3600), "hours") + ` (${status.createdAt.toLocaleString()})`;
			break;
		case timeSincePost <= -60:
			statusTime.innerText = rtf.format(Math.floor(timeSincePost / 60), "minutes") + ` (${status.createdAt.toLocaleString()})`;
			break;
		case timeSincePost <= -1:
			statusTime.innerText = rtf.format(Math.floor(timeSincePost), "seconds") + ` (${status.createdAt.toLocaleString()})`;
			break;
		case timeSincePost > -1:
			statusTime.innerText = `now (${status.createdAt.toLocaleString()})`;
			break;
		default:
			statusTime.innerText = status.createdAt.toLocaleString();
	}

	statusLink.appendChild(statusTime);
	statusTimeContainer.appendChild(statusLink);

	out.appendChild(statusTimeContainer);

	return out;
}

export function renderTimeline(timeline: Timelines, tag?: string) {
	if(timeline == undefined) {
		console.warn("Attempted to render timeline, but timeline was undefined.");
		return;
	}

	getTimeline(instanceUrl, timeline, tag, lastStatusId).then((data: any) => {
		let statuses: DocumentFragment = new DocumentFragment();

		for(const status of data) {
			const statusElement = new customElements.Status;

			statusElement.setAttribute("statusid", status["id"]);

			statuses.appendChild(statusElement);
		}

		document.getElementById("timeline").appendChild(statuses);

		lastStatusId = data[data.length - 1]["id"];
	})
}

export function renderAccountTimeline(id: string) {
	getAccountTimeline(id).then((data: mastodon.Status[]) => {
		let statuses: DocumentFragment = new DocumentFragment();

		for(const status of data) {
			const statusElement = new customElements.Status;

			statusElement.setAttribute("statusid", status["id"]);

			statuses.appendChild(statusElement);
		}

		document.getElementById("timeline").appendChild(statuses);

		lastStatusId = data[data.length - 1]["id"];
	})
}

// export function renderStatusPage(id: string) {
// 	getStatus(id).then((status: mastodon.Status) => {
// 		document.body.appendChild(renderStatus(status));
// 	})
// }

export function renderAccountPage(id?: string, acct?: string) {
	if(id) {
		getAccount(id).then((account: mastodon.Account) => {
			document.body.insertBefore(renderProfileInfo(account), document.getElementById("timeline"));
		});
	} else if(acct) {
		getAccountByHandle(acct).then((account: mastodon.Account) => {
			document.body.insertBefore(renderProfileInfo(account), document.getElementById("timeline"));
		});
	}
}

export function setTimeline(endpoint: Timelines) {
	timeline = endpoint;
}

export function setTag(newTag: string) {
	tag = newTag;
}

export function resetLastStatus() {
	lastStatusId = "";
}

export async function getAccountIdFromHandle(acct: string): Promise<string> {
	const account = await getAccountByHandle(acct);
	
	return account.id;
}

export function getRelativeTimeString(date: Date): string {
	const rtf = new Intl.RelativeTimeFormat(undefined, {numeric: "auto"});
	const timeElapsed = (date.getTime() - Date.now()) / 1000;

	switch(true) {
		case timeElapsed <= -604800:
			return date.toLocaleString();
		case timeElapsed <= -86400:
			return rtf.format(Math.floor(timeElapsed / 86400), "days") + ` (${date.toLocaleString()})`;
		case timeElapsed <= -3600:
			return rtf.format(Math.floor(timeElapsed / 3600), "hours") + ` (${date.toLocaleString()})`;
		case timeElapsed <= -60:
			return rtf.format(Math.floor(timeElapsed / 60), "minutes") + ` (${date.toLocaleString()})`;
		case timeElapsed <= -1:
			return rtf.format(Math.floor(timeElapsed), "seconds") + ` (${date.toLocaleString()})`;
		case timeElapsed > -1:
			return `now (${date.toLocaleString()})`;
		default:
			return date.toLocaleString();
	}
}

// window.onscroll = function(ev) {
// 	if((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight) {
// 		renderTimeline();
// 	}
// }