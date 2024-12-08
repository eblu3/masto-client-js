import { setTimeline, Timelines, renderTimeline, postStatus, renderStatus, charLimit } from "./masto_ts.js";

const postInput: HTMLTextAreaElement = (document.getElementById("post-input") as HTMLTextAreaElement);
const postButton: HTMLButtonElement = (document.getElementById("post-button") as HTMLButtonElement);
const characterCounter: HTMLParagraphElement = (document.getElementById("character-counter") as HTMLParagraphElement);

document.getElementById("load-more-button").addEventListener("click", () => {
	renderTimeline(Timelines.Home);
});

postInput.style.height = `${postInput.scrollHeight}px`;

postInput.addEventListener("input", (event) => {
	(event.target as HTMLInputElement).style.height = "auto";
	(event.target as HTMLInputElement).style.height = `${(event.target as HTMLInputElement).scrollHeight}px`;

	characterCounter.innerText = `${(event.target as HTMLInputElement).value.length}/${charLimit}`;

	if((event.target as HTMLInputElement).value === "") {
		postButton.disabled = true;
	} else {
		postButton.disabled = false;
	}
});

postButton.addEventListener("click", (event) => {
	postStatus(postInput.value).then((status) => {
		postInput.value = "";
		postButton.disabled = true;
		
		const timeline = document.getElementById("timeline");
		timeline.insertBefore(renderStatus(status),timeline.getElementsByTagName("article")[0]);
	});
});

setTimeline(Timelines.Home);

characterCounter.innerText = `${postInput.value.length}/${charLimit}`;

// customElements.whenDefined("app-status").then(() => {
// 	renderTimeline();
// });

export {};