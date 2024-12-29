import * as env from "../env.mjs";
import * as mastodon from "./mastodon/mastodon.mjs";
import * as customElements from "./custom_elements.mjs";
import { Timelines } from "./mastodon/mastodon.mjs";

export const instanceUrl: URL = env.instanceUrl;
export var timeline: Timelines;
export var tag: string | null;
export var charLimit: number = env.charLimit;

export let token = env.token;

let lastStatusId: string = "";

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

export function renderEmojis(input: string | DocumentFragment, emojis: mastodon.CustomEmoji[]): string | DocumentFragment {
	if(typeof input === "string") {
		for(const emoji of emojis) {
			input = input.replaceAll(`:${emoji.shortcode}:`, `<img class=\"custom-emoji\" src=\"${emoji.url.toString()}\" alt=\"${emoji.shortcode}\" />`);
		}
	} else {
		for(const emoji of emojis) {
			input.childNodes.forEach((node) => {
				console.log(node.textContent);
				if(node.nodeType == node.ELEMENT_NODE && node.textContent.includes(`:${emoji.shortcode}:`)) {
					const imgElem = document.createElement("img");
					imgElem.classList.add("custom-emoji");
					imgElem.src = emoji.url.href;
					imgElem.alt = emoji.shortcode;
					(node as HTMLElement).innerHTML = (node as HTMLElement).innerHTML.replaceAll(`:${emoji.shortcode}:`, imgElem.outerHTML);
				}
			});
		}
	}

	return input;
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

export async function getAccountIdFromHandle(instanceUrl: URL, acct: string): Promise<string> {
	const account = await mastodon.accounts.lookupUsername(instanceUrl, acct);
	
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