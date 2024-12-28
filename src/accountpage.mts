import { getAccountIdFromHandle } from "./modules/masto_ts.mjs";
import * as env from "./env.mjs";

let accountId: string | null = new URLSearchParams(document.location.search).get("id");
const accountHandle: string | null = new URLSearchParams(document.location.search).get("acct");

if(accountId != null) {
	document.getElementById("profile-header")?.setAttribute("acctid", accountId);
	document.getElementById("timeline-component")?.setAttribute("acctid", accountId);
} else if(accountHandle != null) {
	document.getElementById("profile-header")?.setAttribute("acct", accountHandle);
	getAccountIdFromHandle(env.instanceUrl, accountHandle).then((id: string) => {
		document.getElementById("timeline-component")?.setAttribute("acctid", id);
	});
}