import { renderAccountPage, renderAccountTimeline, getAccountByHandle, getAccountIdFromHandle } from "./masto_ts.js";
import { getInclude } from "./modules/includes.mjs";

let accountId: string | null = new URLSearchParams(document.location.search).get("id");
const accountHandle: string | null = new URLSearchParams(document.location.search).get("acct");

if(accountId != null) {
	renderAccountPage(accountId, undefined);
	renderAccountTimeline(accountId);
} else if(accountHandle != null) {
	renderAccountPage(undefined, accountHandle);
	getAccountIdFromHandle(accountHandle).then((id: string) => {
		accountId = id;
		renderAccountTimeline(accountId);
	});
}

document.getElementById("load-more-button").addEventListener("click", () => {
	renderAccountTimeline(accountId);
});

getInclude(new URL("/include/navbar.html", window.location.origin)).then((include: DocumentFragment) => {
	document.getElementsByTagName("header")[0].prepend(include);
});

export {};