import {Tag} from "../mastodon.mjs";

export async function getTag(instanceUrl: URL, id: string, token?: string): Promise<Tag> {
	const requestInit: RequestInit = {};

	if(token) {
		requestInit.headers = {"Authorization": `Bearer ${token}`};
	}

	const response = await fetch(new URL(`/api/v1/tags/${id}`, instanceUrl), requestInit);

	if(response.ok) {
		return new Tag(await response.json());
	} else {
		console.error(response.statusText);
	}
}

export async function followTag(instanceUrl: URL, token: string, id: string) {
	const response = await fetch(new URL(`/api/v1/tags/${id}/follow`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Tag(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function unfollowTag(instanceUrl: URL, token: string, id: string) {
	const response = await fetch(new URL(`/api/v1/tags/${id}/unfollow`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Tag(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}