import { setTimeline, Timelines, renderTimeline } from "./masto_ts.js";
const postInput = document.getElementById("post-input");
document.getElementById("load-more-button").addEventListener("click", () => {
    renderTimeline();
});
postInput.style.height = `${postInput.scrollHeight}px`;
postInput.addEventListener("input", (event) => {
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
});
setTimeline(Timelines.Home);
renderTimeline();
//# sourceMappingURL=homepage.js.map