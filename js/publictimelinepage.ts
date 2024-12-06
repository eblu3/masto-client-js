import { setTimeline, Timelines, renderTimeline } from "./masto_ts.js";

document.getElementById("load-more-button").addEventListener("click", () => {
	renderTimeline();
});

setTimeline(Timelines.Public);

renderTimeline();

export {};