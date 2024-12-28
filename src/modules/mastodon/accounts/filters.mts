import {Filter, FilterContext, FilterKeyword, FilterStatus} from "../mastodon.mjs";

export async function getAllFilters(instanceUrl: URL, token: string): Promise<Filter[]> {
	const response = await fetch(new URL("/api/v2/filters", instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: Filter[] = [];

		for(const filter of json) {
			out.push(new Filter(filter));
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

export async function getFilter(instanceUrl: URL, token: string, id: string): Promise<Filter> {
	const response = await fetch(new URL(`/api/v2/filters/${id}`, instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Filter(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function createFilter(
	instanceUrl: URL,
	token: string,
	title: string,
	context: FilterContext[],
	filterAction?: string, // TODO: make this an enum of warn/hide
	expiresIn?: number,
	keywords?: Map<string, boolean>
): Promise<Filter> {
	const endpoint = new URL("/api/v2/filters", instanceUrl);

	endpoint.searchParams.set("title", title);
	for(const ctx of context) {
		endpoint.searchParams.append("context[]", ctx);
	}
	if(filterAction) {
		endpoint.searchParams.set("filter_action", filterAction);
	}
	if(expiresIn) {
		endpoint.searchParams.set("expires_in", String(expiresIn));
	}
	if(keywords) {
		for(const [keyword, wholeWord] of keywords) {
			endpoint.searchParams.append("keywords_attributes[][keyword]", keyword);
			endpoint.searchParams.append("keywords_attributes[][whole_word]", String(wholeWord));
		}
	}

	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Filter(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function updateFilter(
	instanceUrl: URL,
	token: string,
	id: string,
	title?: string,
	context?: FilterContext[],
	filterAction?: string, // TODO: make this an enum of warn/hide
	expiresIn?: number,
	keywords?: {keyword?: string, wholeWord?: boolean, id?: string, destroy?: boolean}[]
): Promise<Filter> {
	const endpoint = new URL(`/api/v2/filters/${id}`, instanceUrl);

	if(title) {
		endpoint.searchParams.set("title", title);
	}
	for(const ctx of context) {
		endpoint.searchParams.append("context[]", ctx);
	}
	if(filterAction) {
		endpoint.searchParams.set("filter_action", filterAction);
	}
	if(expiresIn) {
		endpoint.searchParams.set("expires_in", String(expiresIn));
	}
	if(keywords) {
		for(const keyword of keywords) {
			if(keyword.keyword) {
				endpoint.searchParams.append("keywords_attributes[][keyword]", keyword.keyword);
			}
			if(keyword.wholeWord != undefined) {
				endpoint.searchParams.append("keywords_attributes[][whole_word]", String(keyword.wholeWord));
			}
			if(keyword.id) {
				endpoint.searchParams.append("keywords_attributes[][id]", keyword.id);
			}
			if(keyword.destroy) {
				endpoint.searchParams.append("keywords_attributes[][_destroy]", "true");
			}
		}
	}

	const response = await fetch(endpoint, {
		method: "PUT",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Filter(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function deleteFilter(instanceUrl: URL, token: string, id: string) {
	const response = await fetch(new URL(`/api/v2/filters/${id}`, instanceUrl), {
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

export async function getFilterKeywords(instanceUrl: URL, token: string, id: string): Promise<FilterKeyword[]> {
	const response = await fetch(new URL(`/api/v2/filters/${id}/keywords`, instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: FilterKeyword[] = [];

		for(const keyword of json) {
			out.push(new FilterKeyword(keyword));
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

export async function addKeywordToFilter(
	instanceUrl: URL,
	token: string,
	id: string,
	keyword: string,
	wholeWord?: boolean
): Promise<FilterKeyword> {
	const endpoint = new URL(`/api/v2/filters/${id}/keywords`, instanceUrl);

	endpoint.searchParams.set("keyword", keyword);
	if(wholeWord != undefined) {
		endpoint.searchParams.set("whole_word", String(wholeWord));
	}

	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new FilterKeyword(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function getKeyword(instanceUrl: URL, token: string, id: string): Promise<FilterKeyword> {
	const response = await fetch(new URL(`/api/v2/filters/keywords/${id}`, instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new FilterKeyword(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function editKeyword(instanceUrl: URL, token: string, id: string, keyword: string, wholeWord?: boolean): Promise<FilterKeyword> {
	const endpoint = new URL(`/api/v2/filters/keywords/${id}`, instanceUrl);

	endpoint.searchParams.set("keyword", keyword);
	if(wholeWord != undefined) {
		endpoint.searchParams.set("whole_word", String(wholeWord));
	}

	const response = await fetch(endpoint, {
		method: "PUT",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new FilterKeyword(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function removeKeyword(instanceUrl: URL, token: string, id: string) {
	const response = await fetch(new URL(`/api/v2/filters/keywords/${id}`, instanceUrl), {
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

export async function getStatusFilters(instanceUrl: URL, token: string, id: string): Promise<FilterStatus[]> {
	const response = await fetch(new URL(`/api/v2/filters/${id}/statuses`, instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: FilterStatus[] = [];

		for(const status of json) {
			out.push(new FilterStatus(status));
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

export async function addStatusToFilter(instanceUrl: URL, token: string, filterId: string, statusId: string): Promise<FilterStatus> {
	const response = await fetch(new URL(`/api/v2/filters/${filterId}/statuses`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({"status_id": statusId})
	});

	if(response.ok) {
		return new FilterStatus(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function getStatusFilter(instanceUrl: URL, token: string, id: string): Promise<FilterStatus> {
	const response = await fetch(new URL(`/api/v2/filters/statuses/${id}`, instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new FilterStatus(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function removeStatusFilter(instanceUrl: URL, token: string, id: string) {
	const response = await fetch(new URL(`/api/v2/filters/statuses/${id}`, instanceUrl), {
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