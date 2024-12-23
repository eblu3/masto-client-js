import * as env from "./env.mjs";
import * as mastodon from "./modules/mastodon.mjs";
import * as customElements from "./modules/custom_elements.mjs";
import { getAccountIdFromHandle } from "./modules/masto_ts.mjs";

interface ViewObject {
	name: string;
	id?: string;
	acct?: string;
}

const viewTarget = document.getElementById("view-target");
const initialState = {name: "home"};

function switchView(data: ViewObject, isPoppingState: boolean = false) {
	console.log(`switching view to ${data.name}`);
	viewTarget.innerText = "";

	switch(data.name) {
		case "home":
			viewTarget.appendChild(new customElements.HomeView());
			if(!isPoppingState) {
				history.pushState(data, "", "/home");
			}
			break;
		case "public":
			viewTarget.appendChild(new customElements.PublicTimelineView());
			if(!isPoppingState) {
				history.pushState(data, "", "/public");
			}
			break;
		case "account":
			console.log(data);
			const accountView = new customElements.AccountView();
			viewTarget.appendChild(accountView);
			accountView.accountTimeline.setAttribute("type", "Account");
			if(data.acct) {
				mastodon.getAccountByHandle(data.acct).then((account) => {
					accountView.profileHeader.setAccount(account);
				});
				getAccountIdFromHandle(data.acct).then((id) => {
					accountView.accountTimeline.setAttribute("acctid", id);
				});
			} else {
				mastodon.getAccount(data.id).then((account) => {
					accountView.profileHeader.setAccount(account);
				});
				accountView.accountTimeline.setAttribute("acctid", data.id);
			}
			if(!isPoppingState) {
				if(data.acct) {
					history.pushState(data, "", `/${data.acct}`);
				} else {
					history.pushState(data, "", `/user/${data.id}`);
				}
			}
			break;
		default:
			console.error(`undefined timeline ${data.name}`);
	}
}

function init() {
	try {
		switchView(initialState);
		history.replaceState(initialState, "", document.location.href);
	} catch {
		setTimeout(() => {init()}, 500);
	}
}

window.addEventListener("popstate", (event) => {
	if(event.state) {
		switchView(event.state, true);
	}
});

try {
	const debugViewSwitcher = document.getElementById("debug-view-switch") as HTMLInputElement;
	const debugAcctInput = document.getElementById("debug-acct") as HTMLInputElement;
	const goButton = document.getElementById("go-button") as HTMLButtonElement;

	goButton.addEventListener("click", (event) => {
		switchView({
			name: debugViewSwitcher.value,
			acct: debugAcctInput.value
		});
	});
} catch {

}

init();