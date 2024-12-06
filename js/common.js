import { getInclude } from "./modules/includes.mjs";
function resizeAllImagesToFit() {
    for (const status of Object.values(document.getElementsByTagName("article"))) {
        for (const image of Object.values(status.getElementsByTagName("img"))) {
            if (image.parentElement.nodeName != "ADDRESS" && !image.parentElement.classList.contains("embed-card")) {
                if (image.naturalWidth >= status.clientWidth) {
                    image.style.marginLeft = "-1em";
                }
                else {
                    image.style.marginLeft = "auto";
                    image.style.marginRight = "auto";
                }
            }
        }
    }
}
addEventListener("resize", (event) => {
    resizeAllImagesToFit();
});
getInclude(new URL("/include/navbar.html", window.location.origin)).then((include) => {
    document.getElementsByTagName("header")[0].prepend(include);
});
setTimeout(function () {
    resizeAllImagesToFit();
}, 0);
//# sourceMappingURL=common.js.map