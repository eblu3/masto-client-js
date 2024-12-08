import { setTimeline, Timelines, renderTimeline } from "./modules/masto_ts.mjs";

document.getElementById("load-more-button").addEventListener("click", () => {
	renderTimeline(Timelines.Public);
});

setTimeline(Timelines.Public);

export {};