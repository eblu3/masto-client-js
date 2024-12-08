import { renderAccountPage, renderAccountTimeline, getAccountByHandle, getAccountIdFromHandle } from "./masto_ts.js";

let accountId: string | null = new URLSearchParams(document.location.search).get("id");
const accountHandle: string | null = new URLSearchParams(document.location.search).get("acct");

if(accountId != null) {
	document.getElementById("profile-header").setAttribute("acctid", accountId);
	document.getElementById("timeline-component").setAttribute("acctid", accountId);
	renderAccountTimeline(accountId);
} else if(accountHandle != null) {
	document.getElementById("profile-header").setAttribute("acct", accountHandle);
	getAccountIdFromHandle(accountHandle).then((id: string) => {
		document.getElementById("timeline-component").setAttribute("acctid", id);
	});
}

document.getElementById("load-more-button").addEventListener("click", () => {
	renderAccountTimeline(accountId);
});

export {};