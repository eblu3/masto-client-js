import { getInclude } from "./modules/includes.mjs";
addEventListener("resize", (event) => {
});
getInclude(new URL("/include/navbar.html", window.location.origin)).then((include) => {
    document.getElementsByTagName("header")[0].prepend(include);
});
setTimeout(function () {
}, 200);
//# sourceMappingURL=common.js.map