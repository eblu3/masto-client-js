import { renderAccountPage } from "./masto_ts.js";
import { getInclude } from "./modules/includes.mjs";

const accountId: string | null = new URLSearchParams(document.location.search).get("id");
const accountHandle: string | null = new URLSearchParams(document.location.search).get("acct");

if(accountId) {
	renderAccountPage(accountId, undefined);
} else if(accountHandle) {
	renderAccountPage(undefined, accountHandle);
}

getInclude(new URL("/include/navbar.html", window.location.origin)).then((include: DocumentFragment) => {
	document.getElementsByTagName("header")[0].prepend(include);
});

export {};