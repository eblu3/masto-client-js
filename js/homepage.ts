import { setTimeline, Timelines, renderTimeline } from "./masto_ts.js";

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

renderTimeline();

export {};