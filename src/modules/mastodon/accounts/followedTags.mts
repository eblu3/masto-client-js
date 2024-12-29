import {Tag} from "../mastodon.mjs";

// TODO: link header
export async function getFollowedTags(instanceUrl: URL, token: string, limit?: number): Promise<Tag[]> {
	const endpoint = new URL("/api/v1/followed_tags", instanceUrl);

	if(limit) {
		if(limit > 0 && limit <= 200) {
			endpoint.searchParams.set("limit", String(limit));
		} else {
			console.warn(`limit ${limit} out of bounds: must be between 0 and 200. defaulting to 100`);
		}
	}

	const response = await fetch(endpoint, {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: Tag[] = [];

		for(const tag of json) {
			out.push(new Tag(tag));
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