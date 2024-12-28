import {Account} from "../mastodon.mjs";

export async function getProfileDirectory(instanceUrl: URL, offset?: number, limit: number = 40, order: string = "active", local?: boolean): Promise<Account[]> | null {
	const endpoint = new URL("/api/v1/directory", instanceUrl);

	if(offset) {
		endpoint.searchParams.set("offset", String(offset));
	}
	if(limit != 40) {
		if(limit > 0 && limit <= 80) {
			endpoint.searchParams.set("limit", String(limit));
		} else {
			console.warn("Limit out of bounds, defaulting to 40");
		}
	}
	if(order === "new") {
		endpoint.searchParams.set("order", order);
	} else if(order !== "active") {
		console.warn("Order not set to \"active\" or \"new\", defaulting to active");
	}
	if(local != undefined) {
		endpoint.searchParams.set("local", String(local));
	}


	try {
		const response = await fetch(endpoint);

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: Account[] = [];

		for(const account of json) {
			out.push(new Account(account));
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}