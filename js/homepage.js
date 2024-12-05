import { setTimeline, Timelines, renderTimeline } from "./masto_ts.js";
import { getInclude } from "./modules/includes.mjs";
document.getElementById("load-more-button").addEventListener("click", () => {
    renderTimeline();
});
setTimeline(Timelines.Home);
getInclude(new URL("/include/navbar.html", window.location.origin)).then((include) => {
    document.getElementsByTagName("header")[0].prepend(include);
});
renderTimeline();
//# sourceMappingURL=homepage.js.map