import {Announcement} from "../mastodon.mjs";

export async function getAnnouncements(instanceUrl: URL, token: string): Promise<Announcement[]> | null {
	try {
		const response = await fetch(new URL("/api/v1/announcements", instanceUrl), {
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: Announcement[] = [];

		for(const announcement of json) {
			out.push(announcement);
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function dismissAnnouncement(instanceUrl: URL, id: string, token: string) {
	await fetch(new URL(`/api/v1/announcements/${id}/dismiss`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});
}

export async function reactToAnnouncement(instanceUrl: URL, id: string, emojiName: string, token: string) {
	await fetch(new URL(`/api/v1/announcements/${id}/reactions/${emojiName}`, instanceUrl), {
		method: "PUT",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});
}

export async function removeReactionFromAnnouncement(instanceUrl: URL, id: string, emojiName: string, token: string) {
	await fetch(new URL(`/api/v1/announcements/${id}/reactions/${emojiName}`, instanceUrl), {
		method: "DELETE",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});
}