import { setInstanceUrl, setTimeline, Timelines, renderTimeline } from "./masto_ts.js";
import { getInclude } from "./modules/includes.mjs";

document.getElementById("load-more-button").addEventListener("click", () => {
	renderTimeline();
});

setInstanceUrl(new URL("https://wetdry.world"));
setTimeline(Timelines.Public);

getInclude(new URL("/include/navbar.html", window.location.origin)).then((include: DocumentFragment) => {
	document.body.prepend(include);
});

renderTimeline();

export {};