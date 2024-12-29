import {Status} from "../mastodon.mjs";

/**
 * Fetches the public timeline.
 * @param instanceUrl The URL of the instance to retrieve the timeline from.
 * @param token The user token. Required if the instance does not share a public timeline.
 * @param local Shows only statuses from this instance. Defaults to false.
 * @param remote Shows only statuses from other instances. Defaults to false.
 * @param onlyMedia Shows only statuses that have attachments. Defaults to false.
 * @param maxId Only returns statuses that were posted before the status with this ID.
 * @param sinceId Only returns statuses that were posted after the status with this ID.
 * @param minId Returns statuses that were posted immediately after the status with this ID.
 * @param limit Sets the maximum number of statuses to get. Must be between 0 and 40. Defaults to 20.
 * @returns An array of `Status` objects, or `null` if an error occurred.
 */
export async function getPublicTimeline(
	instanceUrl: URL,
	token?: string,
	local: boolean = false,
	remote: boolean = false,
	onlyMedia: boolean = false,
	maxId?: string,
	sinceId?: string,
	minId?: string,
	limit: number = 20
): Promise<Status[]> | null {
	let endpoint = new URL("/api/v1/timelines/public", instanceUrl);

	// setting query parameters
	if(local && !remote) {
		endpoint.searchParams.set("local", "true");
	} else if(remote && !local) {
		endpoint.searchParams.set("remote", "true");
	} else if(local && remote) {
		console.warn("Specified both local and remote public timelines, fetching neither as a fallback.");
	}

	if(onlyMedia) {
		endpoint.searchParams.set("only_media", "true");
	}

	if(maxId) {
		endpoint.searchParams.set("max_id", maxId);
	}
	if(sinceId) {
		endpoint.searchParams.set("since_id", sinceId);
	}
	if(minId) {
		endpoint.searchParams.set("min_id", minId);
	}

	if(limit != 20) {
		if(limit > 40) {
			console.warn("Cannot return more than 40 results, defaulting to 20.");
		} else if(limit <= 0) {
			console.warn("Cannot return zero or a negative number of results, defaulting to 20.");
		} else {
			endpoint.searchParams.set("limit", limit.toString());
		}
	}

	try {
		let response;
		if(token) {
			response = await fetch(endpoint, {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		} else {
			response = await fetch(endpoint);
		}

		if(!response.ok) {
			throw new Error(`Error fetching timeline: ${response.statusText}`);
		}

		const json = await response.json();

		if("error" in json) {
			throw new Error(`Error fetching timeline: ${json["error"]}`);
		}

		let processedStatuses: Status[] = [];

		for(const status of json) {
			processedStatuses.push(new Status(status));
		}

		return processedStatuses;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

/**
 * Gets all statuses with the specified hashtag(s).
 * @param instanceUrl The URL of the instance to retrieve the timeline from.
 * @param hashtag The hashtag to search for.
 * @param token The user token.
 * @param any Additional hashtags to include in the search.
 * @param all Specifies all hashtags that search results must contain.
 * @param none Hashtags to exclude from the search.
 * @param local Shows only statuses from this instance. Defaults to false.
 * @param remote Shows only statuses from other instances. Defaults to false.
 * @param onlyMedia Shows only statuses that have attachments. Defaults to false.
 * @param maxId Only returns statuses that were posted before the status with this ID.
 * @param sinceId Only returns statuses that were posted after the status with this ID.
 * @param minId Returns statuses that were posted immediately after the status with this ID.
 * @param limit Sets the maximum number of statuses to get. Must be between 0 and 40. Defaults to 20.
 * @returns An array of `Status` objects, or `null` if an error occurred.
 */
export async function getHashtagTimeline(
	instanceUrl: URL,
	hashtag: string,
	token?: string,
	any?: string[],
	all?: string[],
	none?: string[],
	local: boolean = false,
	remote: boolean = false,
	onlyMedia: boolean = false,
	maxId?: string,
	sinceId?: string,
	minId?: string,
	limit: number = 20
): Promise<Status[]> | null {
	let endpoint = new URL(`/api/v1/timelines/tag/${hashtag}`, instanceUrl);

	if(any) {
		for(const tag of any) {
			endpoint.searchParams.append("any", tag);
		}
	}
	if(all) {
		for(const tag of all) {
			endpoint.searchParams.append("all", tag);
		}
	}
	if(none) {
		for(const tag of none) {
			endpoint.searchParams.append("none", tag);
		}
	}

	/* everything below here is reused from the public timeline getter.
	   let's try optimizing this eventually */
	if(local && !remote) {
		endpoint.searchParams.set("local", "true");
	} else if(remote && !local) {
		endpoint.searchParams.set("remote", "true");
	} else if(local && remote) {
		console.warn("Specified both local and remote tag timelines, fetching neither as a fallback.");
	}

	if(onlyMedia) {
		endpoint.searchParams.set("only_media", "true");
	}

	if(maxId) {
		endpoint.searchParams.set("max_id", maxId);
	}
	if(sinceId) {
		endpoint.searchParams.set("since_id", sinceId);
	}
	if(minId) {
		endpoint.searchParams.set("min_id", minId);
	}

	if(limit != 20) {
		if(limit > 40) {
			console.warn("Cannot return more than 40 results, defaulting to 20.");
		} else if(limit <= 0) {
			console.warn("Cannot return zero or a negative number of results, defaulting to 20.");
		} else {
			endpoint.searchParams.set("limit", limit.toString());
		}
	}

	try {
		let response;
		if(token) {
			response = await fetch(endpoint, {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		} else {
			response = await fetch(endpoint);
		}

		if(!response.ok) {
			throw new Error(`Error fetching timeline: ${response.statusText}`);
		}

		const json = await response.json();

		if("error" in json) {
			throw new Error(`Error fetching timeline: ${json["error"]}`);
		}

		let processedStatuses: Status[] = [];

		for(const status of json) {
			processedStatuses.push(new Status(status));
		}

		return processedStatuses;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

/**
 * Gets the statuses in the user's home timeline.
 * @param token The user token.
 * @param maxId Only returns statuses that were posted before the status with this ID.
 * @param sinceId Only returns statuses that were posted after the status with this ID.
 * @param minId Returns statuses that were posted immediately after the status with this ID.
 * @param limit Sets the maximum number of statuses to get. Must be between 0 and 40. Defaults to 20.
 * @returns An array of `Status` objects, or `null` if an error occurred.
 */
export async function getHomeTimeline(
	instanceUrl: URL,
	token: string,
	maxId?: string,
	sinceId?: string,
	minId?: string,
	limit: number = 20
): Promise<Status[]> | null {
	let endpoint = new URL("/api/v1/timelines/home", instanceUrl);

	if(maxId) {
		endpoint.searchParams.set("max_id", maxId);
	}
	if(sinceId) {
		endpoint.searchParams.set("since_id", sinceId);
	}
	if(minId) {
		endpoint.searchParams.set("min_id", minId);
	}

	if(limit != 20) {
		if(limit > 40) {
			console.warn("Cannot return more than 40 results, defaulting to 20.");
		} else if(limit <= 0) {
			console.warn("Cannot return zero or a negative number of results, defaulting to 20.");
		} else {
			endpoint.searchParams.set("limit", limit.toString());
		}
	}

	try {
		const response = await fetch(endpoint, {
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});

		if(!response.ok) {
			throw new Error(`Error fetching timeline: ${response.statusText}`);
		}

		const json = await response.json();

		if("error" in json) {
			throw new Error(`Error fetching timeline: ${json["error"]}`);
		}

		let processedStatuses: Status[] = [];

		for(const status of json) {
			processedStatuses.push(new Status(status));
		}

		return processedStatuses;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getLinkTimeline(
	instanceUrl: URL,
	url: URL,
	token?: string,
	maxId?: string,
	sinceId?: string,
	minId?: string,
	limit?: number
): Promise<Status[]> {
	const endpoint = new URL("/api/v1/timelines/link", instanceUrl);
	const requestInit: RequestInit = {};

	endpoint.searchParams.set("url", url.href);
	if(maxId) {
		endpoint.searchParams.set("max_id", maxId);
	}
	if(sinceId) {
		endpoint.searchParams.set("since_id", sinceId);
	}
	if(minId) {
		endpoint.searchParams.set("min_id", minId);
	}
	if(limit) {
		if(limit > 40) {
			console.warn("Cannot return more than 40 results, defaulting to 20.");
		} else if(limit <= 0) {
			console.warn("Cannot return zero or a negative number of results, defaulting to 20.");
		} else {
			endpoint.searchParams.set("limit", limit.toString());
		}
	}

	if(token) {
		requestInit.headers = {"Authorization": `Bearer ${token}`};
	}

	const response = await fetch(endpoint, requestInit);

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

export async function getListTimeline(
	instanceUrl: URL,
	token: string,
	listId: string,
	maxId?: string,
	sinceId?: string,
	minId?: string,
	limit?: number
): Promise<Status[]> {
	const endpoint = new URL(`/api/v1/timelines/list/${listId}`, instanceUrl);

	if(maxId) {
		endpoint.searchParams.set("max_id", maxId);
	}
	if(sinceId) {
		endpoint.searchParams.set("since_id", sinceId);
	}
	if(minId) {
		endpoint.searchParams.set("min_id", minId);
	}
	if(limit) {
		if(limit > 40) {
			console.warn("Cannot return more than 40 results, defaulting to 20.");
		} else if(limit <= 0) {
			console.warn("Cannot return zero or a negative number of results, defaulting to 20.");
		} else {
			endpoint.searchParams.set("limit", limit.toString());
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