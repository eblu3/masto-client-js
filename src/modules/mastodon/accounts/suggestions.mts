import {Suggestion} from "../mastodon.mjs";

export async function getFollowSuggestions(instanceUrl: URL, token: string, limit?: number): Promise<Suggestion[]> {
	const endpoint = new URL("/api/v2/suggestions", instanceUrl);

	if(limit) {
		if(limit > 0 && limit <= 80) {
			endpoint.searchParams.set("limit", String(limit));
		} else {
			console.warn(`Set limit to ${limit} but Mastodon only supports returning between 1 and 80 account suggestions. Defaulting to 40.`);
		}
	}

	const response = await fetch(endpoint, {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: Suggestion[] = [];

		for(const suggestion of json) {
			out.push(new Suggestion(suggestion));
		}

		return out;
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function removeFollowSuggestion(instanceUrl: URL, token: string, id: string) {
	const response = await fetch(new URL(`/api/v1/suggestions/${id}`, instanceUrl), {
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
			console.error(response.statusText);
		}
	}
}