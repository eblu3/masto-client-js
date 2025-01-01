import {Account, List} from "../mastodon.mjs";

export enum RepliesPolicy {
	Followed = "followed",
	List = "list",
	None = "none"
}

export async function getAll(instanceUrl: URL, token: string): Promise<List[]> {
	const response = await fetch(new URL("/api/v1/lists", instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: List[] = [];

		for(const list of json) {
			out.push(new List(list));
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

export async function get(instanceUrl: URL, token: string, id: string): Promise<List> {
	const response = await fetch(new URL(`/api/v1/lists/${id}`, instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new List(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.status);
		}
	}
}

export async function create(
	instanceUrl: URL,
	token: string,
	title: string,
	repliesPolicy?: RepliesPolicy,
	exclusive?: boolean
): Promise<List> {
	let requestBody: any = {
		"title": title
	}

	if(repliesPolicy) {
		requestBody.replies_policy = repliesPolicy;
	}
	if(exclusive != undefined) {
		requestBody.exclusive = String(exclusive);
	}

	const response = await fetch(new URL("/api/v1/lists", instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestBody)
	});

	if(response.ok) {
		return new List(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.status);
		}
	}
}

export async function update(
	instanceUrl: URL,
	token: string,
	id: string,
	title: string,
	repliesPolicy?: RepliesPolicy,
	exclusive?: boolean
): Promise<List> {
	let requestBody: any = {
		"title": title
	}

	if(repliesPolicy) {
		requestBody.replies_policy = repliesPolicy;
	}
	if(exclusive != undefined) {
		requestBody.exclusive = String(exclusive);
	}

	const response = await fetch(new URL(`/api/v1/lists/${id}`, instanceUrl), {
		method: "PUT",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestBody)
	});

	if(response.ok) {
		return new List(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.status);
		}
	}
}

export async function deleteList(instanceUrl: URL, token: string, id: string) {
	const response = await fetch(new URL(`/api/v1/lists/${id}`, instanceUrl), {
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

// TODO: link header
export async function getAccounts(
	instanceUrl: URL,
	token: string,
	id: string,
	limit?: number
): Promise<Account[]> {
	const endpoint = new URL(`/api/v1/lists/${id}/accounts`, instanceUrl);
	
	if(limit) {
		if(limit > 0 && limit <= 40) {
			endpoint.searchParams.set("limit", String(limit));
			if(limit == 0) {
				console.log("Limit set to 0, getting all accounts.");
			}
		} else {
			console.warn(`Limit set to ${limit}, but can only return between 1 and 40 accounts. Defaulting to 20.`);
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

		for(const conversation of json) {
			out.push(new Account(conversation));
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

export async function addAccounts(
	instanceUrl: URL,
	token: string,
	id: string,
	accountIds: string[]
) {
	const endpoint = new URL(`/api/v1/lists/${id}/accounts`, instanceUrl);

	for(const id of accountIds) {
		endpoint.searchParams.append("account_ids[]", id);
	}

	const response = await fetch(endpoint, {
		method: "POST",
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

export async function removeAccounts(
	instanceUrl: URL,
	token: string,
	id: string,
	accountIds: string[]
) {
	const endpoint = new URL(`/api/v1/lists/${id}/accounts`, instanceUrl);

	for(const id of accountIds) {
		endpoint.searchParams.append("account_ids[]", id);
	}

	const response = await fetch(endpoint, {
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