import { setTimeline, Timelines, renderTimeline } from "./masto_ts.js";
import { getInclude } from "./modules/includes.mjs";

const postInput: HTMLElement = document.getElementById("post-input");

document.getElementById("load-more-button").addEventListener("click", () => {
	renderTimeline();
});

postInput.style.height = `${postInput.scrollHeight}px`;

postInput.addEventListener("input", (event) => {
	(event.target as HTMLInputElement).style.height = "auto";
	(event.target as HTMLInputElement).style.height = `${(event.target as HTMLInputElement).scrollHeight}px`;
});

setTimeline(Timelines.Home);

getInclude(new URL("/include/navbar.html", window.location.origin)).then((include: DocumentFragment) => {
	document.getElementsByTagName("header")[0].prepend(include);
});

renderTimeline();

export {};