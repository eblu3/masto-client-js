import { setTimeline, Timelines, renderTimeline } from "./masto_ts.js";

document.getElementById("load-more-button").addEventListener("click", () => {
	renderTimeline(Timelines.Public);
});

setTimeline(Timelines.Public);

export {};