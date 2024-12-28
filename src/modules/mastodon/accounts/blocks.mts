import {Account} from "../mastodon.mjs";

// TODO: link header
export async function getBlockedAccounts(
	instanceUrl: URL,
	token: string,
	limit?: number
): Promise<Account[]> {
	const endpoint = new URL("/api/v1/blocks", instanceUrl);

	if(limit) {
		if(limit > 0 && limit <= 40) {
			endpoint.searchParams.set("limit", String(limit));
		} else {
			console.warn(`Set limit to ${limit} but Mastodon only supports returning between 1 and 80 statuses. Defaulting to 40.`);
		}
	}

	const response = await fetch(endpoint, {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: Account[] = [];

		for(const account of json) {
			out.push(new Account(account));
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