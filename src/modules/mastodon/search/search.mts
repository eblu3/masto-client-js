import { fetchFromInstance, Search } from "../mastodon.mjs";

export enum SearchType {
	Accounts = "accounts",
	Hashtags = "hashtags",
	Statuses = "statuses"
}

export async function search(
	instanceUrl: URL,
	token: string,
	query: string,
	type?: SearchType,
	resolve?: boolean,
	following?: boolean,
	accountId?: string,
	excludeUnreviewed?: boolean,
	maxId?: string,
	minId?: string,
	limit?: number,
	offset?: number
): Promise<Search> {
	const params = new URLSearchParams([["q", query]]);

	if(type) {
		params.set("type", type);
	}
	if(resolve != undefined && (!type || type == SearchType.Accounts)) {
		params.set("resolve", String(resolve));
	}
	if(following != undefined) {
		params.set("following", String(following));
	}
	if(accountId) {
		params.set("account_id", accountId);
	}
	if(excludeUnreviewed != undefined) {
		params.set("exclude_unreviewed", String(excludeUnreviewed));
	}
	if(maxId) {
		params.set("max_id", maxId);
	}
	if(minId) {
		params.set("min_id", minId);
	}
	if(limit % 1 == 0) {
		if(limit >= 0 && limit <= 40) {
			params.set("limit", String(limit));
		} else {
			console.warn(`Limit ${limit} is not within bounds of 0-40. Defaulting to 20.`);
		}
	} else if(limit) {
		console.warn("Limit must be an integer. Defaulting to 20.");
	}
	if(offset % 1 == 0) {
		params.set("offset", String(offset));
	} else if(offset) {
		console.warn("Offset must be an integer. Ignoring.");
	}

	const response = await fetchFromInstance(
		new URL("/api/v2/search", instanceUrl),
		token,
		params
	);

	if(response.ok) {
		return new Search(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json.error);
		} catch {
			console.error(response.statusText);
		}
	}
}