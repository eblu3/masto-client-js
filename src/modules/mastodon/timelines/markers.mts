import {Marker} from "../mastodon.mjs";

export enum Timelines {
	Home = "home",
	Notifications = "notifications"
}

export async function get(instanceUrl: URL, token: string, timeline?: Timelines[]): Promise<Record<Timelines, Marker>> {
	const endpoint = new URL("/api/v1/markers", instanceUrl);

	for(const tl of timeline) {
		endpoint.searchParams.append("timeline[]", tl);
	}

	const response = await fetch(endpoint, {headers: {"Authorization": `Bearer ${token}`}});

	if(response.ok) {
		return await response.json() as Record<Timelines, Marker>;
	} else {
		try {
			const json = await response.json();
			console.error(json.error);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function save(instanceUrl: URL, token: string, lastReadHomeId?: string, lastReadNotificationsId?: string): Promise<Record<Timelines, Marker>> {
	const endpoint = new URL("/api/v1/markers", instanceUrl);

	if(lastReadHomeId) {
		endpoint.searchParams.set("home[last_read_id]", lastReadHomeId);
	}
	if(lastReadNotificationsId) {
		endpoint.searchParams.set("notifications[last_read_id]", lastReadNotificationsId);
	}

	const response = await fetch(endpoint, {method: "POST", headers: {"Authorization": `Bearer ${token}`}});

	if(response.ok) {
		return await response.json();
	} else {
		try {
			const json = await response.json();
			console.error(json.error);
		} catch {
			console.error(response.statusText);
		}
	}
}