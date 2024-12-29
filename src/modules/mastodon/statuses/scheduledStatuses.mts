import {ScheduledStatus} from "../mastodon.mjs";

export async function getScheduledStatuses(
	instanceUrl: URL,
	token: string,
	maxId: string,
	sinceId: string,
	minId: string,
	limit: number
): Promise<ScheduledStatus[]> {
	const endpoint = new URL("/api/v1/scheduled_statuses", instanceUrl);

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
		let out: ScheduledStatus[] = [];

		for(const status of json) {
			out.push(new ScheduledStatus(status));
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

export async function getScheduledStatus(instanceUrl: URL, token: string, id: string): Promise<ScheduledStatus> {
	const response = await fetch(new URL(`/api/v1/scheduled_statuses/${id}`, instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new ScheduledStatus(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function updateScheduledStatusDate(
	instanceUrl: URL,
	token: string,
	id: string,
	scheduledAt?: Date
) {
	const requestBody: any = {};

	if(scheduledAt) {
		requestBody["scheduled_at"] = scheduledAt.toISOString();
	}
	
	const response = await fetch(new URL(`/api/v1/scheduled_statuses/${id}`, instanceUrl), {
		method: "PUT",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new ScheduledStatus(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function cancelScheduledStatus(instanceUrl: URL, token: string, id: string) {
	const response = await fetch(new URL(`/api/v1/scheduled_statuses/${id}`, instanceUrl), {
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