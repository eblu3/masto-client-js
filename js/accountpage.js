import { renderAccountPage } from "./masto_ts.js";
import { getInclude } from "./modules/includes.mjs";
const accountId = new URLSearchParams(document.location.search).get("id");
const accountHandle = new URLSearchParams(document.location.search).get("acct");
if (accountId) {
    renderAccountPage(accountId, undefined);
}
else if (accountHandle) {
    renderAccountPage(undefined, accountHandle);
}
getInclude(new URL("/include/navbar.html", window.location.origin)).then((include) => {
    document.getElementsByTagName("header")[0].prepend(include);
});
//# sourceMappingURL=accountpage.js.map