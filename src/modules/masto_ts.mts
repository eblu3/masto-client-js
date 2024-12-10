import * as env from "../env.mjs";
import * as mastodon from "./mastodon.mjs";
import * as customElements from "./custom_elements.mjs";

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

export async function getTimeline(url: URL, endpoint: Timelines, tag?: string, startAtId?: string): Promise<mastodon.Status[]> | null {
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

		let processedStatuses: mastodon.Status[] = [];

		for(const status of json) {
			processedStatuses.push(new mastodon.Status(status));
		}

		return processedStatuses;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getAccountTimeline(id: string, startAtId?: string): Promise<mastodon.Status[]> | null {
	console.log(`Fetching account ID ${id}'s timeline from instance ${instanceUrl}...`);
	try {
		let response;

		if(token) {
			if(startAtId) {
				response = await fetch(new URL(`/api/v1/accounts/${id}/statuses?max_id=${startAtId}`, instanceUrl), {
					headers: {
						"Authorization": `Bearer ${token}`
					}
				});
			} else {
				response = await fetch(new URL(`/api/v1/accounts/${id}/statuses`, instanceUrl), {
					headers: {
						"Authorization": `Bearer ${token}`
					}
				});
			}
		} else {
			if(startAtId) {
				response = await fetch(new URL(`/api/v1/accounts/${id}/statuses?max_id=${startAtId}`, instanceUrl));
			} else {
				response = await fetch(new URL(`/api/v1/accounts/${id}/statuses`, instanceUrl));
			}
		}

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		console.log("Got it!");
		console.log(json);

		let processedStatuses: mastodon.Status[] = [];

		for(const status of json) {
			processedStatuses.push(new mastodon.Status(status));
		}

		return processedStatuses;
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

export async function getLoggedInAccount(): Promise<mastodon.CredentialAccount> | null {
	try {
		let response = await fetch(new URL("/api/v1/accounts/verify_credentials", instanceUrl), {
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		return new mastodon.CredentialAccount(await response.json());
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

export async function favoriteStatus(id: string): Promise<mastodon.Status> | null {
	console.log(`Favoriting status ${id}...`);
	try {
		let response = await fetch(new URL(`/api/v1/statuses/${id}/favourite`, instanceUrl), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		console.log("Status favorited!");
		
		return new mastodon.Status(await response.json());
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function unfavoriteStatus(id: string): Promise<mastodon.Status> | null {
	console.log(`Removing favorite from status ${id}...`);
	try {
		let response = await fetch(new URL(`/api/v1/statuses/${id}/unfavourite`, instanceUrl), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		console.log("Status unfavorited!");
		
		return new mastodon.Status(await response.json());
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

// TODO: change visibility to enum and implement it
export async function boostStatus(id: string, visibility?: string): Promise<mastodon.Status> | null {
	console.log(`Boosting status ${id}...`);
	try {
		let response = await fetch(new URL(`/api/v1/statuses/${id}/reblog`, instanceUrl), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		console.log("Status boosted!");
		
		return new mastodon.Status(await response.json());
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function unboostStatus(id: String): Promise<mastodon.Status> | null {
	console.log(`Removing boost from status ${id}...`);
	try {
		let response = await fetch(new URL(`/api/v1/statuses/${id}/unreblog`, instanceUrl), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		console.log("Status unboosted!");
		
		return new mastodon.Status(await response.json());
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

export function parseHandle(handle: string): string {
	let parsedHandle = handle;

	if(parsedHandle.includes("@bsky.brid.gy")) {
		parsedHandle += " 🦋";
	}

	return parsedHandle;
}

// window.onscroll = function(ev) {
// 	if((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight) {
// 		renderTimeline();
// 	}
// }