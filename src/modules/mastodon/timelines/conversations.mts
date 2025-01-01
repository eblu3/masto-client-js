import { Conversation } from "../mastodon.mjs";

// TODO: link header
export async function getAll(
	instanceUrl: URL,
	token: string,
	limit?: number
): Promise<Conversation[]> {
	const endpoint = new URL("/api/v1/conversations", instanceUrl);

	if(limit) {
		if(limit >= 0 && limit <= 40) {
			endpoint.searchParams.set("limit", String(limit));
		} else {
			console.warn(`Limit set to ${limit}, but can only return between 0 and 40 conversations. Defaulting to 20.`);
		}
	}

	const response = await fetch(endpoint, {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: Conversation[] = [];

		for(const conversation of json) {
			out.push(new Conversation(conversation));
		}

		return out;
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.status);
		}
	}
}

export async function remove(instanceUrl: URL, token: string, id: string) {
	const response = await fetch(new URL(`/api/v1/conversations/${id}`, instanceUrl), {
		method: "DELETE",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(!response.ok) {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.status);
		}
	}
}

export async function markRead(instanceUrl: URL, token: string, id: string): Promise<Conversation> {
	const response = await fetch(new URL(`/api/v1/conversations/${id}/read`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Conversation(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.status);
		}
	}
}