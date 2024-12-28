import {Account, CredentialAccount, FamiliarFollowers, FeaturedTag, List, Relationship, Status, Token} from "../mastodon.mjs";

export * as bookmarks from "./bookmarks.mjs";
export * as favourites from "./favourites.mjs";
export * as mutes from "./mutes.mjs";
export * as blocks from "./blocks.mjs";
export * as domainBlocks from "./domainBlocks.mjs";
export * as filters from "./filters.mjs";

export async function registerAccount(
	instanceUrl: URL,
	token: string,
	username: string,
	email: string,
	password: string,
	agreement: boolean,
	locale: string = new Intl.Locale(navigator.language).language,
	reason?: string
): Promise<Token> {
	let requestBody = {
		"username": username,
		"email": email,
		"password": password,
		"agreement": agreement,
		"locale": locale,
		"reason": ""
	};

	if(reason) {
		requestBody.reason = reason;
	} else {
		delete requestBody.reason;
	}

	const response = await fetch(new URL("/api/v1/accounts", instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestBody)
	});

	if(response.ok) {
		return new Token(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
			console.error(json["details"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function verifyCredentials(instanceUrl: URL, token: string): Promise<CredentialAccount> {
	const response = await fetch(new URL("/api/v1/accounts/verify_credentials", instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new CredentialAccount(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

// TODO: finish this
export async function updateCredentials(
	instanceUrl: URL,
	token: string,
	displayName?: string,
	note?: string,
	avatar?: File,
	header?: File,
	locked?: boolean,
	bot?: boolean,
	discoverable?: boolean,
	hideCollections?: boolean,
	indexable?: boolean,
	fields?: Map<string, string>,
	privacy?: string,
	sensitive?: boolean,
	language?: string
): Promise<Account> {
	const formData = new FormData();

	if(displayName) {
		formData.append("display_name", displayName);
	}
	if(note) {
		formData.append("note", note);
	}
	if(avatar) {
		formData.append("avatar", avatar);
	}
	if(header) {
		formData.append("header", header);
	}
	if(locked != undefined) {
		formData.append("locked", String(locked));
	}
	if(bot != undefined) {
		formData.append("bot", String(bot));
	}
	if(discoverable != undefined) {
		formData.append("discoverable", String(discoverable));
	}
	if(hideCollections != undefined) {
		formData.append("hide_collections", String(hideCollections));
	}
	if(indexable != undefined) {
		formData.append("indexable", String(indexable));
	}
	if(fields) {
		let i = 0;
		for(const [key, value] of fields) {
			formData.append(`fields_attributes[${i}][name]`, key);
			formData.append(`fields_attributes[${i}][value]`, value);
			i++;
		}
	}
	if(privacy && (privacy === "public" || privacy === "unlisted" || privacy === "private")) {
		formData.append("source[privacy]", privacy);
	} else if(privacy) {
		console.warn(`Unrecognized privacy type ${privacy}. Not setting default post privacy.`);
	}
	if(sensitive) {
		formData.append("source[sensitive]", String(sensitive));
	}
	if(language && language.length == 2) {
		formData.append("source[language]", language);
	} else if(language) {
		console.warn(`Language ${language} does not seem like a valid country code. Not setting default post language.`);
	}

	const response = await fetch(new URL("/api/v1/accounts/update_credentials", instanceUrl), {
		method: "PATCH",
		headers: {
			"Authorization": `Bearer ${token}`
		},
		body: formData
	});

	if(response.ok) {
		return new CredentialAccount(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function getAccount(instanceUrl: URL, id: string, token?: string): Promise<Account> {
	let response; 
	
	if(token) {
		response = await fetch(new URL(`/api/v1/accounts/${id}`, instanceUrl), {
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});
	} else {
		response = await fetch(new URL(`/api/v1/accounts/${id}`, instanceUrl));
	}

	if(response.ok) {
		return new Account(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function getAccounts(instanceUrl: URL, ids: string[], token?: string): Promise<Account[]> {
	let endpoint = new URL("/api/v1/accounts", instanceUrl);
	let response: Response;

	for(const id of ids) {
		endpoint.searchParams.append("id[]", id);
	}

	if(token) {
		response = await fetch(endpoint, {
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});
	} else {
		response = await fetch(endpoint);
	}

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

export async function getAccountStatuses(
	instanceUrl: URL,
	id: string,
	token?: string,
	maxId?: string,
	minId?: string,
	limit?: number,
	onlyMedia?: boolean,
	excludeReplies?: boolean,
	excludeReblogs?: boolean,
	pinned?: boolean,
	tagged?: string
): Promise<Status[]> {
	const endpoint = new URL(`/api/v1/accounts/${id}/statuses`, instanceUrl);
	let response: Response;

	if(maxId) {
		endpoint.searchParams.set("max_id", maxId);
	}
	if(minId) {
		endpoint.searchParams.set("min_id", minId);
	}
	if(limit) {
		if(limit > 0 && limit <= 40) {
			endpoint.searchParams.set("limit", String(limit));
		} else {
			console.warn(`You requested ${limit} statuses. Mastodon only supports fetching between 1 and 40 statuses in a single request. Defaulting to 20.`);
		}
	}
	if(onlyMedia != undefined) {
		endpoint.searchParams.set("only_media", String(onlyMedia));
	}
	if(excludeReplies != undefined) {
		endpoint.searchParams.set("exclude_replies", String(excludeReplies));
	}
	if(excludeReblogs != undefined) {
		endpoint.searchParams.set("exclude_reblogs", String(excludeReblogs));
	}
	if(pinned != undefined) {
		endpoint.searchParams.set("pinned", String(pinned));
	}
	if(tagged) {
		endpoint.searchParams.set("tagged", tagged);
	}

	if(token) {
		response = await fetch(endpoint, {
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});
	} else {
		response = await fetch(endpoint);
	}

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
			console.error(response.status);
		}
	}
}

// TODO: add support for link header once I figure out how that works
export async function getAccountFollowers(
	instanceUrl: URL,
	id: string,
	token?: string,
	limit?: number
): Promise<Account[]> {
	const endpoint = new URL(`/api/v1/accounts/${id}/followers`, instanceUrl);
	let response: Response;

	if(limit) {
		if(limit > 0 && limit <= 80) {
			endpoint.searchParams.set("limit", String(limit));
		} else {
			console.warn(`You specified ${limit} accounts but Mastodon only supports returning between 1 and 80 accounts from this endpoint. Defaulting to 40.`);
		}
	}

	if(token) {
		response = await fetch(endpoint, {
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});
	} else {
		response = await fetch(endpoint);
	}

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

// TODO: same as above
export async function getAccountFollowing(
	instanceUrl: URL,
	id: string,
	token?: string,
	limit?: number
): Promise<Account[]> {
	const endpoint = new URL(`/api/v1/accounts/${id}/following`, instanceUrl);
	let response: Response;

	if(limit) {
		if(limit > 0 && limit <= 80) {
			endpoint.searchParams.set("limit", String(limit));
		} else {
			console.warn(`You specified ${limit} accounts but Mastodon only supports returning between 1 and 80 accounts from this endpoint. Defaulting to 40.`);
		}
	}

	if(token) {
		response = await fetch(endpoint, {
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});
	} else {
		response = await fetch(endpoint);
	}

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

export async function getAccountFeaturedTags(instanceUrl: URL, id: string, token?: string): Promise<FeaturedTag[]> {
	let response: Response;
	
	if(token) {
		response = await fetch(new URL(`/api/v1/accounts/${id}/featured_tags`, instanceUrl), {
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});
	} else {
		response = await fetch(new URL(`/api/v1/accounts/${id}/featured_tags`, instanceUrl));
	}

	if(response.ok) {
		const json = await response.json();
		let out: FeaturedTag[] = [];

		for(const tag of json) {
			out.push(new FeaturedTag(tag));
		}

		return out;
	} else {
		console.error(response.statusText);
		return [];
	}
}

export async function getListsContainingAccount(instanceUrl: URL, id: string, token: string): Promise<List[]> {
	const response = await fetch(new URL(`/api/v1/accounts/${id}/lists`, instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: List[] = [];

		for(const list of json) {
			out.push(new List(json));
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

export async function followAccount(
	instanceUrl: URL,
	id: string,
	token: string,
	reblogs?: boolean,
	notify?: boolean,
	languages?: Intl.Locale[]
): Promise<Relationship> {
	const endpoint = new URL(`/api/v1/accounts/${id}/follow`, instanceUrl);

	if(reblogs != undefined) {
		endpoint.searchParams.set("reblogs", String(reblogs));
	}
	if(notify != undefined) {
		endpoint.searchParams.set("notify", String(notify));
	}
	if(languages) {
		for(const lang of languages) {
			endpoint.searchParams.append("languages[]", lang.language);
		}
	}

	const response = await fetch(endpoint, {
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

export async function unfollowAccount(instanceUrl: URL, id: string, token: string): Promise<Relationship> {
	const response = await fetch(new URL(`/api/v1/accounts/${id}/unfollow`, instanceUrl), {
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

export async function removeAccountFromFollowers(instanceUrl: URL, id: string, token: string): Promise<Relationship> {
	const response = await fetch(new URL(`/api/v1/accounts/${id}/remove_from_followers`, instanceUrl), {
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

export async function blockAccount(instanceUrl: URL, id: string, token: string): Promise<Relationship> {
	const response = await fetch(new URL(`/api/v1/accounts/${id}/block`, instanceUrl), {
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

export async function unblockAccount(instanceUrl: URL, id: string, token: string): Promise<Relationship> {
	const response = await fetch(new URL(`/api/v1/accounts/${id}/unblock`, instanceUrl), {
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

export async function muteAccount(
	instanceUrl: URL,
	id: string,
	token: string,
	notifications?: boolean,
	duration?: number
): Promise<Relationship> {
	const endpoint = new URL(`/api/v1/accounts/${id}/mute`, instanceUrl);

	if(notifications != undefined) {
		endpoint.searchParams.set("notifications", String(notifications));
	}
	if(duration) {
		endpoint.searchParams.set("duration", String(duration));
	}

	const response = await fetch(endpoint, {
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

export async function unmuteAccount(instanceUrl: URL, id: string, token: string): Promise<Relationship> {
	const response = await fetch(new URL(`/api/v1/accounts/${id}/unmute`, instanceUrl), {
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

export async function featureAccount(instanceUrl: URL, id: string, token: string): Promise<Relationship> {
	const response = await fetch(new URL(`/api/v1/accounts/${id}/pin`, instanceUrl), {
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

export async function unfeatureAccount(instanceUrl: URL, id: string, token: string): Promise<Relationship> {
	const response = await fetch(new URL(`/api/v1/accounts/${id}/unpin`, instanceUrl), {
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

export async function setPrivateNote(instanceUrl: URL, id: string, token: string, comment?: string): Promise<Relationship> {
	const endpoint = new URL(`/api/v1/accounts/${id}/unblock`, instanceUrl);

	if(comment) {
		endpoint.searchParams.set("comment", comment);
	}
	
	const response = await fetch(endpoint, {
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

export async function getRelationships(instanceUrl: URL, token: string, ids?: string[], withSuspended?: boolean): Promise<Relationship[]> {
	const endpoint = new URL("/api/v1/accounts/relationships", instanceUrl);

	if(ids) {
		for(const id of ids) {
			endpoint.searchParams.append("id[]", id);
		}
	}
	if(withSuspended != undefined) {
		endpoint.searchParams.set("with_suspended", String(withSuspended));
	}

	const response = await fetch(endpoint, {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: Relationship[] = [];

		for(const relationship of json) {
			out.push(new Relationship(relationship));
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

export async function findFamiliarFollowers(instanceUrl: URL, token: string, ids?: string[]): Promise<FamiliarFollowers[]> {
	const endpoint = new URL("/api/v1/accounts/familiar_followers", instanceUrl);

	if(ids) {
		for(const id of ids) {
			endpoint.searchParams.append("id[]", id);
		}
	}

	const response = await fetch(endpoint, {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: FamiliarFollowers[] = [];

		for(const followList of json) {
			out.push(new FamiliarFollowers(followList));
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

export async function searchForAccounts(
	instanceUrl: URL,
	token: string,
	query: string,
	limit: number = 40,
	offset?: number,
	resolve?: boolean,
	following?: boolean
): Promise<Account[]> {
	const endpoint = new URL("/api/v1/accounts/search", instanceUrl);

	endpoint.searchParams.set("q", query);
	if(limit) {
		if(limit > 0 && limit <= 80) {
			endpoint.searchParams.set("limit", String(limit));
		} else {
			console.warn(`You specified ${limit} accounts but Mastodon only supports returning between 1 and 80 accounts from this endpoint. Defaulting to 40.`);
		}
	}
	if(offset) {
		endpoint.searchParams.set("offset", String(offset));
	}
	if(resolve != undefined) {
		endpoint.searchParams.set("resolve", String(resolve));
	}
	if(following != undefined) {
		endpoint.searchParams.set("following", String(following));
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

export async function lookupUsername(instanceUrl: URL, acct: string): Promise<Account> {
	const endpoint = new URL("/api/v1/accounts/lookup", instanceUrl);
	
	endpoint.searchParams.set("acct", acct);

	const response = await fetch(endpoint);

	if(response.ok) {
		return new Account(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}