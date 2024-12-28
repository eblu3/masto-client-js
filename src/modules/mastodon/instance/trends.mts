import {Status, Tag, TrendsLink} from "../mastodon.mjs";

export async function getTrendingTags(instanceUrl: URL, limit: number = 10, offset?: number): Promise<Tag[]> | null {
	try {
		const endpoint = new URL("/api/v1/trends/tags", instanceUrl);

		if(limit != 10) {
			endpoint.searchParams.set("limit", String(limit));
		}

		if(offset) {
			endpoint.searchParams.set("offset", String(offset));
		}

		const response = await fetch(endpoint);

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: Tag[] = [];

		for(const tag of json) {
			out.push(new Tag(tag));
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getTrendingStatuses(instanceUrl: URL, limit: number = 10, offset?: number): Promise<Status[]> | null {
	try {
		const endpoint = new URL("/api/v1/trends/statuses", instanceUrl);

		if(limit != 10) {
			endpoint.searchParams.set("limit", String(limit));
		}

		if(offset) {
			endpoint.searchParams.set("offset", String(offset));
		}

		const response = await fetch(endpoint);

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: Status[] = [];

		for(const status of json) {
			out.push(new Status(status));
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getTrendingLinks(instanceUrl: URL, limit: number = 10, offset?: number): Promise<TrendsLink[]> | null {
	try {
		const endpoint = new URL("/api/v1/trends/links", instanceUrl);

		if(limit != 10) {
			endpoint.searchParams.set("limit", String(limit));
		}

		if(offset) {
			endpoint.searchParams.set("offset", String(offset));
		}

		const response = await fetch(endpoint);

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: TrendsLink[] = [];

		for(const link of json) {
			out.push(new TrendsLink(link));
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}