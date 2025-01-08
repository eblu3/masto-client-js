import * as env from "../../env.mjs";
import * as mastodon from "../mastodon/mastodon.mjs";
import { Timeline, StatusEvents, PostBox, ProfileHeader, Status, ReplyBox, settingsModalTemplate } from "./customElements.mjs";


export class HomeView extends HTMLElement {
	instanceUrl: URL;

	timeline: Timeline;

	statusEvents: StatusEvents;

	constructor(instanceUrl: URL, statusEvents?: StatusEvents) {
		super();

		this.instanceUrl = instanceUrl;
		this.statusEvents = statusEvents;
	}

	connectedCallback() {
		const postBox = new PostBox();

		const homeTimelineObject = new Timeline(
			this.instanceUrl,
			this.statusEvents
		);
		homeTimelineObject.setAttribute("type", "home");
		this.timeline = homeTimelineObject;

		this.appendChild(postBox);
		this.appendChild(homeTimelineObject);
	}
}

export class PublicTimelineView extends HTMLElement {
	instanceUrl: URL;

	constructor(instanceUrl: URL) {
		super();

		this.instanceUrl = instanceUrl;
	}

	connectedCallback() {
		const publicTimelineObject = new Timeline(this.instanceUrl);
		publicTimelineObject.setAttribute("type", "public");

		this.appendChild(publicTimelineObject);
	}
}

export class LocalTimelineView extends HTMLElement {
	instanceUrl: URL;

	constructor(instanceUrl: URL) {
		super();

		this.instanceUrl = instanceUrl;
	}

	connectedCallback() {
		const localTimeline = new Timeline(this.instanceUrl);
		localTimeline.setAttribute("type", "local");

		this.appendChild(localTimeline);
	}
}

export class AccountView extends HTMLElement {
	instanceUrl: URL;

	profileHeader: ProfileHeader;
	accountTimeline: Timeline;

	constructor(instanceUrl: URL) {
		super();

		this.instanceUrl = instanceUrl;
	}

	connectedCallback() {
		this.profileHeader = new ProfileHeader();
		this.accountTimeline = new Timeline(this.instanceUrl);

		this.appendChild(this.profileHeader);
		this.appendChild(this.accountTimeline);
	}
}

export class StatusView extends HTMLElement {
	instanceUrl: URL;
	id: string;

	statusEvents: StatusEvents;

	status: mastodon.Status;

	statusElement: Status;

	constructor(instanceUrl: URL, status: mastodon.Status, statusEvents?: StatusEvents) {
		super();
		this.instanceUrl = instanceUrl;
		this.status = status;
		this.statusEvents = statusEvents;
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
