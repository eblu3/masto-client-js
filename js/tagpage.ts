import { setTimeline, Timelines, setTag, renderTimeline, resetLastStatus } from "./masto_ts.js";

const tagToSearch = new URLSearchParams(document.location.search).get("tag");

document.title = `#${tagToSearch}`;

(document.getElementById("tag-input") as HTMLInputElement).value = `${tagToSearch}`; 

document.getElementById("tag-input").addEventListener("change", (event) => {
	regenTimeline((event.target as HTMLInputElement).value);
});

document.getElementById("load-more-button").addEventListener("click", () => {
	renderTimeline();
});

setTimeline(Timelines.Hashtag);
setTag(tagToSearch);

function regenTimeline(tag?: string) {
	console.log(tag);
	
	if(tag) {
		setTag(tag);
		document.title = `#${tag}`;

		const url = new URL(location.href);
		url.searchParams.set("tag", tag);
		
		history.pushState({}, "", url);
	}

	resetLastStatus();

	document.getElementById("timeline").replaceChildren();
	renderTimeline();
}

renderTimeline();

export {};