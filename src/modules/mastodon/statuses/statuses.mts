import {Account, Context, ScheduledStatus, Status, StatusEdit, StatusSource, StatusVisibility, Translation} from "../mastodon.mjs";

export * as media from "./media.mjs";
export * as polls from "./polls.mjs";
export * as scheduledStatuses from "./scheduledStatuses.mjs";

export async function postStatus(
	instanceUrl: URL,
	token: string,
	idempotencyKey?: string,
	status?: string,
	mediaIds?: string[],
	poll?: {
		options: string[],
		expiresIn: number,
		multiple?: boolean,
		hideTotals?: boolean
	},
	inReplyToId?: string,
	sensitive?: boolean,
	spoilerText?: string,
	visibility?: StatusVisibility,
	language?: Intl.Locale,
	scheduledAt?: Date
): Promise<Status | ScheduledStatus> {
	if(mediaIds && poll) {
		console.error("Cannot attach media and a poll to the same status.");
		return;
	}

	if(!status && !mediaIds) {
		console.error("Either status text or attached media must be supplied.");
		return;
	}

	const endpoint = new URL("/api/v1/statuses", instanceUrl);
	const requestInit: RequestInit = {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	};

	if(status) {
		endpoint.searchParams.set("status", status);
	}
	if(mediaIds) {
		for(const id of mediaIds) {
			endpoint.searchParams.append("media_ids[]", id);
		}
	}
	if(poll) {
		for(const option of poll.options) {
			endpoint.searchParams.append("poll[options][]", option);
		}
		endpoint.searchParams.append("poll[expires_in]", String(poll.expiresIn));
		if(poll.multiple != undefined) {
			endpoint.searchParams.set("poll[multiple]", String(poll.multiple));
		}
		if(poll.hideTotals != undefined) {
			endpoint.searchParams.set("poll[hide_totals]", String(poll.hideTotals));
		}
	}
	if(inReplyToId) {
		endpoint.searchParams.set("in_reply_to_id", inReplyToId);
	}
	if(sensitive != undefined) {
		endpoint.searchParams.set("sensitive", String(sensitive));
	}
	if(spoilerText) {
		endpoint.searchParams.set("spoiler_text", spoilerText);
	}
	if(visibility) {
		endpoint.searchParams.set("visibility", visibility);
	}
	if(language) {
		endpoint.searchParams.set("language", language.language);
	}
	if(scheduledAt) {
		endpoint.searchParams.set("scheduled_at", scheduledAt.toISOString());
	}

	if(idempotencyKey) {
		(requestInit.headers as any)["Idempotency-Key"] = idempotencyKey;
	}

	const response = await fetch(endpoint, requestInit);

	if(response.ok) {
		return new Status(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function getStatus(instanceUrl: URL, id: string, token?: string): Promise<Status> {
	const requestInit: RequestInit = {}

	if(token) {
		requestInit.headers = {"Authorization": `Bearer ${token}`};
	}

	const response = await fetch(new URL(`/api/v1/statuses/${id}`, instanceUrl), requestInit);

	if(response.ok) {
		return new Status(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function getStatuses(instanceUrl: URL, ids: string[], token?: string): Promise<Status[]> {
	const endpoint = new URL("/api/v1/statuses", instanceUrl);
	const requestInit: RequestInit = {};

	for(const id of ids) {
		endpoint.searchParams.append("id[]", id);
	}

	if(token) {
		requestInit.headers = {"Authorization": `Bearer ${token}`};
	}

	const response = await fetch(endpoint, requestInit);

	if(response.ok) {
		const json = await response.json();
		let out: Status[] = [];

		for(const status of json) {
			out.push(status);
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

export async function deleteStatus(instanceUrl: URL, token: string, id: string): Promise<Status> {
	const response = await fetch(new URL(`/api/v1/statuses/${id}`, instanceUrl), {
		method: "DELETE",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Status(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function getStatusContext(instanceUrl: URL, id: string, token?: string): Promise<Context> {
	const requestInit: RequestInit = {};

	if(token) {
		requestInit.headers = {"Authorization": `Bearer ${token}`};
	}

	const response = await fetch(new URL(`/api/v1/statuses/${id}/context`, instanceUrl), requestInit);

	if(response.ok) {
		return new Context(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function translateStatus(instanceUrl: URL, id: string, token?: string, lang?: Intl.Locale): Promise<Translation> {
	const requestInit: RequestInit = {};
	let requestBody = {};

	if(token) {
		requestInit.headers = {"Authorization": `Bearer ${token}`};
	}
	if(lang) {
		(requestInit as any).headers["Content-Type"] = "application/json";
		(requestBody as any)["lang"] = lang.language;
	}

	requestInit.body = JSON.stringify(requestBody);

	const response = await fetch(new URL(`/api/v1/statuses/${id}/translate`, instanceUrl), requestInit);

	if(response.ok) {
		return new Translation(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

// TODO: link header
export async function getBoosters(instanceUrl: URL, id: string, token?: string, limit?: number): Promise<Account[]> {
	const endpoint = new URL(`/api/v1/status/${id}/reblogged_by`, instanceUrl);
	const requestInit: RequestInit = {};

	if(limit) {
		if(limit > 0 && limit <= 80) {
			endpoint.searchParams.set("limit", String(limit));
		} else {
			console.warn(`You specified ${limit} accounts but Mastodon only supports returning between 1 and 80 accounts from this endpoint. Defaulting to 40.`);
		}
	}

	if(token) {
		requestInit.headers = {"Authorization": `Bearer ${token}`};
	}

	const response = await fetch(endpoint, requestInit);

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

// TODO: link header
export async function getFavouriters(instanceUrl: URL, id: string, token?: string, limit?: number): Promise<Account[]> {
	const endpoint = new URL(`/api/v1/status/${id}/favourited_by`, instanceUrl);
	const requestInit: RequestInit = {};

	if(limit) {
		if(limit > 0 && limit <= 80) {
			endpoint.searchParams.set("limit", String(limit));
		} else {
			console.warn(`You specified ${limit} accounts but Mastodon only supports returning between 1 and 80 accounts from this endpoint. Defaulting to 40.`);
		}
	}

	if(token) {
		requestInit.headers = {"Authorization": `Bearer ${token}`};
	}

	const response = await fetch(endpoint, requestInit);

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

export async function favouriteStatus(instanceUrl: URL, token: string, id: string): Promise<Status> {
	const response = await fetch(new URL(`/api/v1/statuses/${id}/favourite`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Status(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function unfavouriteStatus(instanceUrl: URL, token: string, id: string): Promise<Status> {
	const response = await fetch(new URL(`/api/v1/statuses/${id}/unfavourite`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Status(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function boostStatus(instanceUrl: URL, token: string, id: string, visibility?: StatusVisibility): Promise<Status> {
	const requestInit: RequestInit = {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	};
	let requestBody = {};

	if(visibility) {
		(requestInit as any).headers["Content-Type"] = "application/json";
		(requestBody as any)["visibility"] = visibility;
	}

	requestInit.body = JSON.stringify(requestBody);
	
	const response = await fetch(new URL(`/api/v1/statuses/${id}/reblog`, instanceUrl), requestInit);

	if(response.ok) {
		return new Status(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function unboostStatus(instanceUrl: URL, token: string, id: string): Promise<Status> {
	const response = await fetch(new URL(`/api/v1/statuses/${id}/unboost`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Status(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function bookmarkStatus(instanceUrl: URL, token: string, id: string): Promise<Status> {
	const response = await fetch(new URL(`/api/v1/statuses/${id}/bookmark`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Status(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function unbookmarkStatus(instanceUrl: URL, token: string, id: string): Promise<Status> {
	const response = await fetch(new URL(`/api/v1/statuses/${id}/unbookmark`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Status(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function muteThread(instanceUrl: URL, token: string, id: string): Promise<Status> {
	const response = await fetch(new URL(`/api/v1/statuses/${id}/mute`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Status(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function unmuteThread(instanceUrl: URL, token: string, id: string): Promise<Status> {
	const response = await fetch(new URL(`/api/v1/statuses/${id}/unmute`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Status(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function pinStatus(instanceUrl: URL, token: string, id: string): Promise<Status> {
	const response = await fetch(new URL(`/api/v1/statuses/${id}/pin`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Status(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function unpinStatus(instanceUrl: URL, token: string, id: string): Promise<Status> {
	const response = await fetch(new URL(`/api/v1/statuses/${id}/unpin`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Status(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function editStatus(
	instanceUrl: URL,
	token: string,
	id: string,
	status?: string,
	mediaIds?: string[],
	mediaAttributes?: string[][],
	poll?: {
		options: string[],
		expiresIn: number,
		multiple?: boolean,
		hideTotals?: boolean
	},
	sensitive?: boolean,
	spoilerText?: string,
	language?: Intl.Locale,
): Promise<Status | ScheduledStatus> {
	if(mediaIds && poll) {
		console.error("Cannot attach media and a poll to the same status.");
		return;
	}

	if(!status && !mediaIds) {
		console.error("Either status text or attached media must be supplied.");
		return;
	}

	const requestBody: any = {};

	if(status) {
		requestBody["status"] = status;
	}
	if(mediaIds) {
		requestBody["media_ids"] = mediaIds;
	}
	if(mediaAttributes) {
		requestBody["media_attributes"] = mediaAttributes;
	}
	if(poll) {
		requestBody["poll"] = poll;
	}
	if(sensitive != undefined) {
		requestBody["sensitive"] = sensitive;
	}
	if(spoilerText) {
		requestBody["spoiler_text"] = spoilerText;
	}
	if(language) {
		requestBody["language"] = language.language;
	}

	const response = await fetch(new URL(`/api/v1/statuses/${id}`, instanceUrl), {
		method: "PUT",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestBody)
	});

	if(response.ok) {
		return new Status(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function getEditHistory(instanceUrl: URL, id: string, token?: string): Promise<StatusEdit[]> {
	const requestInit: RequestInit = {}

	if(token) {
		requestInit.headers = {"Authorization": `Bearer ${token}`};
	}

	const response = await fetch(new URL(`/api/v1/statuses/${id}/history`, instanceUrl), requestInit);

	if(response.ok) {
		const json = await response.json();
		let out: StatusEdit[] = [];

		for(const edit of json) {
			out.push(new StatusEdit(edit));
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

export async function getStatusSource(instanceUrl: URL, id: string, token?: string): Promise<StatusSource> {
	const requestInit: RequestInit = {}

	if(token) {
		requestInit.headers = {"Authorization": `Bearer ${token}`};
	}

	const response = await fetch(new URL(`/api/v1/statuses/${id}/source`, instanceUrl), requestInit);

	if(response.ok) {
		return new StatusSource(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}