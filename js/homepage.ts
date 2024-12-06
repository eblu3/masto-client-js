import { setTimeline, Timelines, renderTimeline, postStatus, renderStatus } from "./masto_ts.js";

const postInput: HTMLTextAreaElement = (document.getElementById("post-input") as HTMLTextAreaElement);
const postButton: HTMLButtonElement = (document.getElementById("post-button") as HTMLButtonElement);

document.getElementById("load-more-button").addEventListener("click", () => {
	renderTimeline();
});

postInput.style.height = `${postInput.scrollHeight}px`;

postInput.addEventListener("input", (event) => {
	(event.target as HTMLInputElement).style.height = "auto";
	(event.target as HTMLInputElement).style.height = `${(event.target as HTMLInputElement).scrollHeight}px`;
});

postButton.addEventListener("click", (event) => {
	postStatus(postInput.value).then((status) => {
		postInput.value = "";
		
		const timeline = document.getElementById("timeline");
		timeline.insertBefore(renderStatus(status),timeline.getElementsByTagName("article")[0]);
	});
});

setTimeline(Timelines.Home);

renderTimeline();

export {};