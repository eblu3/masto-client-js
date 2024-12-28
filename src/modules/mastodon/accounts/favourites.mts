import {Status} from "../mastodon.mjs";

// TODO: link header
export async function getFavouritedStatuses(
	instanceUrl: URL,
	token: string,
	limit?: number
): Promise<Status[]> {
	const endpoint = new URL("/api/v1/favourites", instanceUrl);

	if(limit) {
		if(limit > 0 && limit <= 40) {
			endpoint.searchParams.set("limit", String(limit));
		} else {
			console.warn(`Set limit to ${limit} but Mastodon only supports returning between 1 and 40 statuses. Defaulting to 20.`);
		}
	}

	const response = await fetch(endpoint, {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: Status[] = [];

		for(const status of json) {
			out.push(new Status(status));
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