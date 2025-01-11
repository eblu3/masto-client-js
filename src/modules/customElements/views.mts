import * as env from "../../env.mjs";
import * as mastodon from "../mastodon/mastodon.mjs";
import { Timeline, PostBox, ProfileHeader, ReplyBox } from "./customElements.mjs";
import * as util from "./util.mjs";
import { Status } from "./status.mjs";

const settingsModalTemplate = await util.getTemplate("/templates/modal.html", "settings");

export class View extends HTMLElement {
	instanceUrl: URL;
	token: string;

	constructor(instanceUrl: URL, token?: string) {
		super();

		this.instanceUrl = instanceUrl;
		this.token = token;
	}
}

export class TimelineView extends View {
	timeline: Timeline;
	statuses: mastodon.Status[];
	statusEvents: util.StatusEvents;

	constructor(instanceUrl: URL, token?: string, statusEvents?: util.StatusEvents) {
		super(instanceUrl, token);

		this.statusEvents = statusEvents;
	}

	connectedCallback() {
		this.timeline = new Timeline(this.instanceUrl, this.statusEvents);
	}
}

export class HomeView extends TimelineView {
	constructor(instanceUrl: URL, token?: string, statusEvents?: util.StatusEvents) {
		super(instanceUrl, token, statusEvents);
	}

	connectedCallback() {
		super.connectedCallback();
		const postBox = new PostBox();

		this.timeline.setAttribute("type", "home");

		this.appendChild(postBox);
		this.appendChild(this.timeline);
	}
}

export class PublicTimelineView extends TimelineView {
	constructor(instanceUrl: URL, token?: string, statusEvents?: util.StatusEvents) {
		super(instanceUrl, token, statusEvents);
	}

	connectedCallback() {
		super.connectedCallback();
		this.timeline.setAttribute("type", "public");

		this.appendChild(this.timeline);
	}
}

export class LocalTimelineView extends TimelineView {
	constructor(instanceUrl: URL, token?: string, statusEvents?: util.StatusEvents) {
		super(instanceUrl, token, statusEvents);
	}

	connectedCallback() {
		super.connectedCallback();
		this.timeline.setAttribute("type", "local");

		this.appendChild(this.timeline);
	}
}

export class AccountView extends TimelineView {
	account: mastodon.Account;
	
	profileHeader: ProfileHeader;

	constructor(instanceUrl: URL, account: mastodon.Account, token?: string, statusEvents?: util.StatusEvents) {
		super(instanceUrl, token, statusEvents);

		this.account = account;
	}

	connectedCallback() {
		super.connectedCallback();

		this.profileHeader = new ProfileHeader(this.account);

		this.timeline.setAttribute("type", "account");
		this.timeline.setAttribute("acctid", this.account.id);

		this.appendChild(this.profileHeader);
		this.appendChild(this.timeline);
	}
}

export class StatusView extends HTMLElement {
	instanceUrl: URL;
	id: string;

	rootStatusEvents: util.StatusEvents;
	statusEvents: util.StatusEvents;

	status: mastodon.Status;

	statusElement: Status;

	constructor(instanceUrl: URL, status: mastodon.Status, statusEvents?: util.StatusEvents) {
		super();
		this.instanceUrl = instanceUrl;
		this.status = status;
		this.statusEvents = statusEvents;

		// we don't need to have a click handler for the status itself if we're already on the page!
		this.rootStatusEvents = this.statusEvents;
		this.rootStatusEvents.onStatusClick = null;
	}

	connectedCallback() {
		this.statusElement = new Status(this.instanceUrl, this.status, this.statusEvents);
		this.appendChild(this.statusElement);
		this.appendChild(new ReplyBox(this.instanceUrl, this.status.id));

		mastodon.statuses.getStatusContext(this.instanceUrl, this.status.id, env.token).then((context) => {
			for (const status of context.ancestors) {
				this.insertBefore(new Status(this.instanceUrl, status, this.statusEvents, true), this.statusElement);
			}

			for (const status of context.descendants) {
				this.appendChild(new Status(this.instanceUrl, status, this.statusEvents, true));
			}

			this.statusElement.scrollIntoView({ block: "center" });
		});
	}
}

export class ModalSettingsView extends HTMLElement {
	instanceUrlInput: HTMLInputElement;

	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({ mode: "open" });
		shadow.appendChild(settingsModalTemplate.cloneNode(true));

		this.instanceUrlInput = shadow.getElementById("setting-instance-url") as HTMLInputElement;

		this.instanceUrlInput.placeholder = env.instanceUrl.href;
		this.instanceUrlInput.value = localStorage.getItem("instanceUrl");
	}
}

export class ModalErrorView extends HTMLElement {
	errorTitle: string;
	errorDescription: string;
	
	constructor(errorTitle: string, errorDescription?: string) {
		super();

		this.errorTitle = errorTitle;
		this.errorDescription = errorDescription;
	}

	connectedCallback() {
		const shadow = this.attachShadow({mode: "open"});
		
		const errorTitleElement = document.createElement("h2");
		errorTitleElement.innerText = this.errorTitle;
		shadow.appendChild(errorTitleElement);

		if(this.errorDescription) {
			const errorDescElement = document.createElement("p");
			errorDescElement.innerText = this.errorDescription;
			shadow.appendChild(errorDescElement);
		}
	}
}

export function init() {
	customElements.define("app-view", View);

	customElements.define("app-view-home", HomeView);
	customElements.define("app-view-public", PublicTimelineView);
	customElements.define("app-view-local", LocalTimelineView);
	customElements.define("app-view-account", AccountView);
	customElements.define("app-view-status", StatusView);

	customElements.define("app-modal-view-settings", ModalSettingsView);
}