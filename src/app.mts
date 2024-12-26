import * as env from "./env.mjs";
import * as mastodon from "./modules/mastodon.mjs";
import * as customElements from "./modules/custom_elements.mjs";
import { getAccountIdFromHandle } from "./modules/masto_ts.mjs";

interface ViewObject {
	name: string;
	id?: string;
	acct?: string;
}

let instanceUrl: URL;
let token: string;
let appInfo: mastodon.CredentialApplication;
let authCode: string;
let userToken: mastodon.Token;

const viewTarget = document.getElementById("view-target");
const initialState = {name: "home"};

let currentView: HTMLElement;

function switchView(data: ViewObject, isPoppingState: boolean = false) {
	console.log(`switching view to ${data.name}`);
	viewTarget.innerText = "";

	switch(data.name) {
		case "home":
			currentView = new customElements.HomeView();
			viewTarget.appendChild(currentView);
			if(!isPoppingState) {
				history.pushState(data, "", "/home");
			}
			break;
		case "public":
			currentView = new customElements.PublicTimelineView();
			viewTarget.appendChild(currentView);
			if(!isPoppingState) {
				history.pushState(data, "", "/public");
			}
			break;
		case "account":
			currentView = new customElements.AccountView();
			viewTarget.appendChild(currentView);
			(currentView as customElements.AccountView).accountTimeline.setAttribute("type", "account");
			if(data.acct) {
				mastodon.getAccountByHandle(data.acct).then((account) => {
					(currentView as customElements.AccountView).profileHeader.setAccount(account);
				});
				getAccountIdFromHandle(data.acct).then((id) => {
					(currentView as customElements.AccountView).accountTimeline.setAttribute("acctid", id);
				});
			} else {
				mastodon.getAccount(data.id).then((account) => {
					(currentView as customElements.AccountView).profileHeader.setAccount(account);
				});
				(currentView as customElements.AccountView).accountTimeline.setAttribute("acctid", data.id);
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

function initView() {
	try {
		switchView(initialState);
		history.replaceState(initialState, "", document.location.href);
	} catch {
		setTimeout(() => {initView()}, 500);
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

instanceUrl = env.instanceUrl;
token = env.token;

if(localStorage.getItem("appInfo")) {
	appInfo = JSON.parse(localStorage.getItem("appInfo")) as mastodon.CredentialApplication;
}
if(localStorage.getItem("authCode")) {
	authCode = localStorage.getItem("authCode");
}
if(localStorage.getItem("userToken")) {
	userToken = JSON.parse(localStorage.getItem("userToken")) as mastodon.Token;
}

initView();
// mastodon.createApplication(instanceUrl, "thingy 3: god I hope this works", new URL("/auth", location.origin).href, "read", new URL("https://example.com")).then((app) => {
// 	localStorage.setItem("appInfo", JSON.stringify(app));
// 	appInfo = app;

// 	mastodon.authorizeUser(instanceUrl, app.clientId, app.redirectUris[0]);
// });

// if(appInfo && authCode) {
// 	console.log(appInfo);
// 	mastodon.obtainToken(instanceUrl, "authorization_code", authCode, appInfo.clientId, appInfo.clientSecret, appInfo.redirectUris[0]).then((obtainedToken) => {
// 		localStorage.setItem("userToken", JSON.stringify(obtainedToken));
// 		userToken = obtainedToken;
// 	});
// }