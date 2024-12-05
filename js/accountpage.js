import { renderAccountPage, renderAccountTimeline, getAccountIdFromHandle } from "./masto_ts.js";
import { getInclude } from "./modules/includes.mjs";
let accountId = new URLSearchParams(document.location.search).get("id");
const accountHandle = new URLSearchParams(document.location.search).get("acct");
if (accountId != null) {
    renderAccountPage(accountId, undefined);
    renderAccountTimeline(accountId);
}
else if (accountHandle != null) {
    renderAccountPage(undefined, accountHandle);
    getAccountIdFromHandle(accountHandle).then((id) => {
        accountId = id;
        renderAccountTimeline(accountId);
    });
}
document.getElementById("load-more-button").addEventListener("click", () => {
    renderAccountTimeline(accountId);
});
getInclude(new URL("/include/navbar.html", window.location.origin)).then((include) => {
    document.getElementsByTagName("header")[0].prepend(include);
});
//# sourceMappingURL=accountpage.js.map