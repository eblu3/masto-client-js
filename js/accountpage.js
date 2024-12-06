import { renderAccountPage, renderAccountTimeline, getAccountIdFromHandle } from "./masto_ts.js";
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
//# sourceMappingURL=accountpage.js.map