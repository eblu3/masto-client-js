import * as env from "./env.mjs";
import * as mastodon from "./modules/mastodon.mjs";
import * as customElements from "./modules/custom_elements.mjs";
import { getAccountIdFromHandle } from "./modules/masto_ts.mjs";

interface ViewObject {
	name: string;
	id?: string;
	acct?: string;
	modal?: ModalObject;
}

interface ModalObject {
	name: string;
}

let instanceUrl: URL;
let token: string;
let appInfo: mastodon.CredentialApplication;
let authCode: string;
let userToken: mastodon.Token;

const viewTarget = document.getElementById("view-target");
const initialState = {name: "public"};

let currentView: HTMLElement;
let modal: customElements.Modal;
let modalContent: HTMLElement;
let currentState: ViewObject;

async function showModal(content: string | HTMLElement) {
	modal = new customElements.Modal();
	document.body.appendChild(modal);
	if(typeof content === "string") {
		modal.innerHTML = content;
		modalContent = modal;
	} else {
		modal.appendChild(content);
		modalContent = content;
	}
}

function switchView(data: ViewObject, isPoppingState: boolean = false) {
	console.log(`switching view to ${data.name}`);
	viewTarget.innerText = "";

	if(data.modal) {
		switchModalView(data.modal);
	}

	switch(data.name) {
		case "home":
			currentState = data;
			currentView = new customElements.HomeView(instanceUrl);
			viewTarget.appendChild(currentView);
			if(!isPoppingState) {
				history.pushState(data, "", "/home");
			}
			break;
		case "public":
			currentState = data;
			currentView = new customElements.PublicTimelineView(instanceUrl);
			viewTarget.appendChild(currentView);
			if(!isPoppingState) {
				history.pushState(data, "", "/public");
			}
			break;
		case "local":
			currentState = data;
			currentView = new customElements.LocalTimelineView(instanceUrl);
			viewTarget.appendChild(currentView);
			if(!isPoppingState) {
				history.pushState(data, "", "/local");
			}
			break;
		case "account":
			currentState = data;
			currentView = new customElements.AccountView(instanceUrl);
			viewTarget.appendChild(currentView);
			(currentView as customElements.AccountView).accountTimeline.setAttribute("type", "account");
			if(data.acct) {
				mastodon.lookupUsername(instanceUrl, data.acct).then((account) => {
					(currentView as customElements.AccountView).profileHeader.setAccount(account);
				});
				getAccountIdFromHandle(data.acct).then((id) => {
					(currentView as customElements.AccountView).accountTimeline.setAttribute("acctid", id);
				});
			} else {
				mastodon.getAccount(instanceUrl, data.id, token).then((account) => {
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

function switchModalView(data: ModalObject) {
	switch(data.name) {
		case "settings":
			showModal(new customElements.ModalSettingsView()).then(() => {
				modalContent.shadowRoot.getElementById("btn-set-instance-url").addEventListener("click", (event) => {
					instanceUrl = new URL((modalContent as customElements.ModalSettingsView).instanceUrlInput.value);
					localStorage.setItem("instanceUrl", (modalContent as customElements.ModalSettingsView).instanceUrlInput.value);
					switchView(currentState);
				});
				modalContent.shadowRoot.getElementById("btn-remove-instance-url").addEventListener("click", (event) => {
					instanceUrl = env.instanceUrl;
					localStorage.removeItem("instanceUrl");
					(modalContent as customElements.ModalSettingsView).instanceUrlInput.value = "";
					switchView(currentState);
				});
			});
			break;
		case "test":
			showModal(`
				<h2>testttt</h2>
				<p>This is a test.</p>
				<button>This doesn't do anything</button>
				`);
			break;
		default:
			console.error(`undefined modal view ${data.name}`);
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

	const debugModalInput = document.getElementById("debug-modal") as HTMLInputElement;
	const showModalButton = document.getElementById("modal-button") as HTMLButtonElement;

	showModalButton.addEventListener("click", (event) => {
		switchModalView({name: debugModalInput.value});
	});
} catch {

}

if(localStorage.getItem("instanceUrl")) {
	instanceUrl = new URL(localStorage.getItem("instanceUrl"));
} else {
	instanceUrl = env.instanceUrl;
}
token = env.token;

console.log(instanceUrl);

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