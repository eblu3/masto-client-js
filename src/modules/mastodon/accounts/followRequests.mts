import {Account, Relationship} from "../mastodon.mjs";

// TODO: link header
export async function getPendingFollowRequests(instanceUrl: URL, token: string, limit?: number): Promise<Account[]> {
	const endpoint = new URL("/api/v1/follow_requests", instanceUrl);

	if(limit) {
		if(limit > 0 && limit <= 80) {
			endpoint.searchParams.set("limit", String(limit));
		} else {
			console.warn(`limit ${limit} out of bounds: must be between 0 and 80. defaulting to 40`);
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

export async function acceptFollowRequest(instanceUrl: URL, token: string, id: string): Promise<Relationship> {
	const response = await fetch(new URL(`/api/v1/follow_requests/${id}/authorize`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Relationship(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function rejectFollowRequest(instanceUrl: URL, token: string, id: string): Promise<Relationship> {
	const response = await fetch(new URL(`/api/v1/follow_requests/${id}/reject`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Relationship(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}