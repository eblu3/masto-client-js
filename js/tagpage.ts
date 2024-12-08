import { setTimeline, Timelines, setTag, renderTimeline, resetLastStatus } from "./modules/masto_ts.mjs";

const tagToSearch = new URLSearchParams(document.location.search).get("tag");

document.title = `#${tagToSearch}`;

(document.getElementById("tag-input") as HTMLInputElement).value = `${tagToSearch}`; 

document.getElementById("tag-input").addEventListener("change", (event) => {
	document.getElementById("timeline-component").setAttribute("tag", (event.target as HTMLInputElement).value);
});

// document.getElementById("load-more-button").addEventListener("click", () => {
// 	renderTimeline(Timelines.Hashtag, tagToSearch);
// });

// setTimeline(Timelines.Hashtag);
document.getElementById("timeline-component").setAttribute("tag", tagToSearch);

// function regenTimeline(tag?: string) {
// 	console.log(tag);
	
// 	if(tag) {
// 		setTag(tag);
// 		document.title = `#${tag}`;

// 		const url = new URL(location.href);
// 		url.searchParams.set("tag", tag);
		
// 		history.pushState({}, "", url);
// 	}

// 	resetLastStatus();

// 	document.getElementById("timeline").replaceChildren();
// 	renderTimeline();
// }

export {};