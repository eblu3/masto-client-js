import * as env from "./env.mjs";
import * as mastodon from "./modules/mastodon/mastodon.mjs";
import * as oEmbed from "./modules/oembed/oembed.mjs";
import * as cstmElements from "./modules/customElements/customElements.mjs";
import { getAccountIdFromHandle } from "./modules/masto_ts.mjs";

interface ViewObject {
	name: string;
	id?: string;
	acct?: string;
	account?: string;
	status?: mastodon.Status;
	modal?: ModalObject;
}

interface ModalObject {
	name: string;
	title?: string;
	description?: string;
}

const statusEvents: cstmElements.StatusEvents = {
	onStatusClick: (id: string) => {
		switchView({name: "status", id: id});
	},
	onProfileLinkClick: (acct: string | mastodon.Account) => {
		if(typeof acct == "string") {
			switchView({name: "account", acct: acct});
		} else {
			console.log(acct);
			console.log(JSON.stringify(acct));
			switchView({name: "account", account: JSON.stringify(acct)});
		}
	}
}

let hostname: URL;
let instanceUrl: URL;
let token: string;
let appInfo: mastodon.CredentialApplication;
let authCode: string;
let userToken: mastodon.Token;
let preferences: Map<string, string | boolean | null>;
let currentAccount: mastodon.CredentialAccount;

const viewTarget = document.getElementById("view-target");
const initialState = {name: "home"};

let currentView: HTMLElement;
let modal: cstmElements.Modal;
let modalContent: HTMLElement;
let currentState: ViewObject;

async function showModal(content: string | HTMLElement) {
	modal = new cstmElements.Modal();
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
			customElements.whenDefined("app-view-home").then((view) => {
				currentView = new cstmElements.views.HomeView(instanceUrl, token, statusEvents);
				viewTarget.appendChild(currentView);
				if(!isPoppingState) {
					history.pushState(data, "", "/home");
				}
			});
			break;
		case "public":
			currentState = data;
			currentView = new cstmElements.views.PublicTimelineView(instanceUrl, token, statusEvents);
			viewTarget.appendChild(currentView);
			if(!isPoppingState) {
				history.pushState(data, "", "/public");
			}
			break;
		case "local":
			currentState = data;
			currentView = new cstmElements.views.LocalTimelineView(instanceUrl, token, statusEvents);
			viewTarget.appendChild(currentView);
			if(!isPoppingState) {
				history.pushState(data, "", "/local");
			}
			break;
		case "account":
			currentState = data;
			let parsedAccount: mastodon.Account;
			if(data.account) {
				parsedAccount = JSON.parse(data.account, (key, value) => {
					const urlKeys = [
						"url",
						"avatar",
						"avatarStatic",
						"header",
						"headerStatic"
					];
					const dateKeys = [
						"createdAt",
						"lastStatusAt"
					];

					if(value != null) {
						for(const urlKey of urlKeys) {
							if(key == urlKey) {
								return new URL(value);
							}
						}
						for(const dateKey of dateKeys) {
							if(key == dateKey) {
								return new Date(value);
							}
						}
					}

					return value;
				}) as mastodon.Account;

				console.log(data.account);
				console.log(parsedAccount);
				
				currentView = new cstmElements.views.AccountView(instanceUrl, parsedAccount, token, statusEvents);
				viewTarget.appendChild(currentView);
			} else if(data.acct) {
				mastodon.accounts.lookupUsername(instanceUrl, data.acct).then((account) => {
					currentView = new cstmElements.views.AccountView(instanceUrl, account, token, statusEvents);
					viewTarget.appendChild(currentView);
				});
			} else if(data.id) {
				mastodon.accounts.get(instanceUrl, data.id, token).then((account) => {
					currentView = new cstmElements.views.AccountView(instanceUrl, account, token, statusEvents);
					viewTarget.appendChild(currentView);
				});
			}
			if(!isPoppingState) {
				if(data.account) {
					history.pushState(data, "", `/@${parsedAccount.acct}`);
				} else if(data.acct) {
					history.pushState(data, "", `/@${data.acct}`);
				} else {
					history.pushState(data, "", `/user/${data.id}`);
				}
			}
			break;
		case "status":
			currentState = data;
			if(data.id && !data.status) {
				mastodon.statuses.getStatus(instanceUrl, data.id, token).then((status) => {
					currentView = new cstmElements.views.StatusView(instanceUrl, status, {
						onStatusClick: (id: string) => {
							switchView({name: "status", id: id});
						},
						onProfileLinkClick: (acct: string) => {
							switchView({name: "account", acct: acct});
						}
					});
					viewTarget.appendChild(currentView);
				});
			} else if(data.status) {
				currentView = new cstmElements.views.StatusView(instanceUrl, data.status, {
					onStatusClick: (id: string) => {
						switchView({name: "status", id: id});
					},
					onProfileLinkClick: (acct: string) => {
						switchView({name: "account", acct: acct});
					}
				});
				viewTarget.appendChild(currentView);
			}
			if(!isPoppingState) {
				if(data.acct) {
					history.pushState(data, "", `/@${data.acct}/${data.id}`);
				} else {
					history.pushState(data, "", `/status/${data.id}`);
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
			showModal(new cstmElements.views.ModalSettingsView()).then(() => {
				modalContent.shadowRoot.getElementById("btn-set-instance-url").addEventListener("click", (event) => {
					instanceUrl = new URL((modalContent as cstmElements.views.ModalSettingsView).instanceUrlInput.value);
					localStorage.setItem("instanceUrl", (modalContent as cstmElements.views.ModalSettingsView).instanceUrlInput.value);
					switchView(currentState);
				});
				modalContent.shadowRoot.getElementById("btn-remove-instance-url").addEventListener("click", (event) => {
					instanceUrl = env.instanceUrl;
					localStorage.removeItem("instanceUrl");
					(modalContent as cstmElements.views.ModalSettingsView).instanceUrlInput.value = "";
					switchView(currentState);
				});
			});
			break;
		case "error":
			showModal(new cstmElements.views.ModalErrorView(data.title, data.description));
		default:
			console.error(`undefined modal view ${data.name}`);
	}
}

function initView() {
	customElements.whenDefined("app-view").then(() => {
		switchView(initialState);
		history.replaceState(initialState, "", document.location.href);
	});
}

function initSidebar() {
	window.customElements.whenDefined("app-nav-sidebar").then((sidebar) => {
		document.getElementById("sidebar-target").appendChild(new sidebar([
			{
				name: "Home",
				onClick: () => {
					switchView({name: "home"});
				},
				icon: "home",
				link: new URL("/home", hostname)
			},
			{
				name: "Public",
				onClick: () => {
					switchView({name: "public"});
				},
				icon: "public",
				link: new URL("/public", hostname)
			},
			{
				name: "Local",
				onClick: () => {
					switchView({name: "local"});
				},
				icon: "communities",
				link: new URL("/local", hostname)
			},
			{
				name: "You",
				onClick: () => {
					switchView({name: "account", acct: currentAccount.acct});
				},
				icon: new URL(currentAccount.avatar),
				link: new URL(`/@${currentAccount.acct}`, hostname)
			}
		]));
	});
}

cstmElements.init();

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

if(localStorage.getItem("appInfo")) {
	appInfo = JSON.parse(localStorage.getItem("appInfo")) as mastodon.CredentialApplication;
}
if(localStorage.getItem("authCode")) {
	authCode = localStorage.getItem("authCode");
}
if(localStorage.getItem("userToken")) {
	userToken = JSON.parse(localStorage.getItem("userToken")) as mastodon.Token;
}

hostname = new URL("http://localhost:3000");

mastodon.accounts.preferences.getUserPreferences(instanceUrl, token).then((prefs) => {
	preferences = prefs;
});

mastodon.accounts.verifyCredentials(instanceUrl, token).then((account) => {
	currentAccount = account;
	initSidebar();
	initView();
});

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