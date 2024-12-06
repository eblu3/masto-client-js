import { setTimeline, Timelines, renderTimeline, postStatus, renderStatus } from "./masto_ts.js";
const postInput = document.getElementById("post-input");
const postButton = document.getElementById("post-button");
document.getElementById("load-more-button").addEventListener("click", () => {
    renderTimeline();
});
postInput.style.height = `${postInput.scrollHeight}px`;
postInput.addEventListener("input", (event) => {
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
});
postButton.addEventListener("click", (event) => {
    postStatus(postInput.value).then((status) => {
        postInput.value = "";
        const timeline = document.getElementById("timeline");
        timeline.insertBefore(renderStatus(status), timeline.getElementsByTagName("article")[0]);
    });
});
setTimeline(Timelines.Home);
renderTimeline();
//# sourceMappingURL=homepage.js.map