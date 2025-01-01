import {Account, CredentialAccount, FamiliarFollowers, FeaturedTag, fetchFromInstance, List, Relationship, Status, Token} from "../mastodon.mjs";

export * as bookmarks from "./bookmarks.mjs";
export * as favourites from "./favourites.mjs";
export * as mutes from "./mutes.mjs";
export * as blocks from "./blocks.mjs";
export * as domainBlocks from "./domainBlocks.mjs";
export * as filters from "./filters.mjs";
export * as reports from "./reports.mjs";
export * as followRequests from "./followRequests.mjs";
export * as endorsements from "./endorsements.mjs";
export * as featuredTags from "./featuredTags.mjs";
export * as preferences from "./preferences.mjs";
export * as followedTags from "./followedTags.mjs";
export * as suggestions from "./suggestions.mjs";
export * as tags from "./tags.mjs";

export async function register(
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

	const response = await fetchFromInstance(
		new URL("/api/v1/accounts", instanceUrl),
		token,
		undefined,
		"POST",
		requestBody
	);

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
	const response = await fetchFromInstance(new URL("/api/v1/accounts/verify_credentials", instanceUrl), token);

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

	const response = await fetchFromInstance(
		new URL("/api/v1/accounts/update_credentials", instanceUrl),
		token,
		undefined,
		"PATCH",
		formData
	);

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

export async function get(instanceUrl: URL, id: string, token?: string): Promise<Account> {
	const response = await fetchFromInstance(new URL(`/api/v1/accounts/${id}`, instanceUrl), token);

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

export async function getMultiple(instanceUrl: URL, ids: string[], token?: string): Promise<Account[]> {
	const params = new URLSearchParams();

	for(const id of ids) {
		params.append("id[]", id);
	}

	const response = await fetchFromInstance(
		new URL("/api/v1/accounts", instanceUrl),
		token,
		params
	);

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

export async function getStatuses(
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
	const params = new URLSearchParams();

	if(maxId) {
		params.set("max_id", maxId);
	}
	if(minId) {
		params.set("min_id", minId);
	}
	if(limit) {
		if(limit > 0 && limit <= 40) {
			params.set("limit", String(limit));
		} else {
			console.warn(`You requested ${limit} statuses. Mastodon only supports fetching between 1 and 40 statuses in a single request. Defaulting to 20.`);
		}
	}
	if(onlyMedia != undefined) {
		params.set("only_media", String(onlyMedia));
	}
	if(excludeReplies != undefined) {
		params.set("exclude_replies", String(excludeReplies));
	}
	if(excludeReblogs != undefined) {
		params.set("exclude_reblogs", String(excludeReblogs));
	}
	if(pinned != undefined) {
		params.set("pinned", String(pinned));
	}
	if(tagged) {
		params.set("tagged", tagged);
	}

	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts/${id}/statuses`, instanceUrl),
		token,
		params
	);

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
export async function getFollowers(
	instanceUrl: URL,
	id: string,
	token?: string,
	limit?: number
): Promise<Account[]> {
	const params = new URLSearchParams();

	if(limit) {
		if(limit > 0 && limit <= 80) {
			params.set("limit", String(limit));
		} else {
			console.warn(`You specified ${limit} accounts but Mastodon only supports returning between 1 and 80 accounts from this endpoint. Defaulting to 40.`);
		}
	}

	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts/${id}/followers`, instanceUrl),
		token,
		params
	);

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
export async function getFollowing(
	instanceUrl: URL,
	id: string,
	token?: string,
	limit?: number
): Promise<Account[]> {
	const params = new URLSearchParams();

	if(limit) {
		if(limit > 0 && limit <= 80) {
			params.set("limit", String(limit));
		} else {
			console.warn(`You specified ${limit} accounts but Mastodon only supports returning between 1 and 80 accounts from this endpoint. Defaulting to 40.`);
		}
	}

	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts/${id}/following`, instanceUrl),
		token,
		params
	);

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

export async function getFeaturedTags(instanceUrl: URL, id: string, token?: string): Promise<FeaturedTag[]> {
	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts/${id}/featured_tags`, instanceUrl),
		token
	);
	
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
	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts/${id}/lists`, instanceUrl),
		token
	);

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

export async function follow(
	instanceUrl: URL,
	id: string,
	token: string,
	reblogs?: boolean,
	notify?: boolean,
	languages?: Intl.Locale[]
): Promise<Relationship> {
	const params = new URLSearchParams();

	if(reblogs != undefined) {
		params.set("reblogs", String(reblogs));
	}
	if(notify != undefined) {
		params.set("notify", String(notify));
	}
	if(languages) {
		for(const lang of languages) {
			params.append("languages[]", lang.language);
		}
	}

	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts/${id}/follow`, instanceUrl),
		token,
		params,
		"POST"
	);

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

export async function unfollow(instanceUrl: URL, id: string, token: string): Promise<Relationship> {
	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts/${id}/unfollow`, instanceUrl),
		token,
		undefined,
		"POST"
	);

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

export async function removeFromFollowers(instanceUrl: URL, id: string, token: string): Promise<Relationship> {
	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts/${id}/remove_from_followers`, instanceUrl),
		token,
		undefined,
		"POST"
	);

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

export async function block(instanceUrl: URL, id: string, token: string): Promise<Relationship> {
	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts/${id}/block`, instanceUrl),
		token,
		undefined,
		"POST"
	);

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

export async function unblock(instanceUrl: URL, id: string, token: string): Promise<Relationship> {
	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts/${id}/unblock`, instanceUrl),
		token,
		undefined,
		"POST"
	);

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

export async function mute(
	instanceUrl: URL,
	id: string,
	token: string,
	notifications?: boolean,
	duration?: number
): Promise<Relationship> {
	const params = new URLSearchParams();

	if(notifications != undefined) {
		params.set("notifications", String(notifications));
	}
	if(duration) {
		params.set("duration", String(duration));
	}

	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts${id}/mute`, instanceUrl),
		token,
		params,
		"POST"
	);

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

export async function unmute(instanceUrl: URL, id: string, token: string): Promise<Relationship> {
	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts/${id}/unmute`, instanceUrl),
		token,
		undefined,
		"POST"
	);

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

export async function feature(instanceUrl: URL, id: string, token: string): Promise<Relationship> {
	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts/${id}/pin`, instanceUrl),
		token,
		undefined,
		"POST"
	);

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

export async function unfeature(instanceUrl: URL, id: string, token: string): Promise<Relationship> {
	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts/${id}/unpin`, instanceUrl),
		token,
		undefined,
		"POST"
	);

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
	const params = new URLSearchParams();

	if(comment) {
		params.set("comment", comment);
	}
	
	const response = await fetchFromInstance(
		new URL(`/api/v1/accounts/${id}/note`, instanceUrl),
		token,
		params,
		"POST"
	);

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
	const params = new URLSearchParams;

	if(ids) {
		for(const id of ids) {
			params.append("id[]", id);
		}
	}
	if(withSuspended != undefined) {
		params.set("with_suspended", String(withSuspended));
	}

	const response = await fetchFromInstance(
		new URL("/api/v1/accounts/relationships", instanceUrl),
		token,
		params
	);

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
	const params = new URLSearchParams();

	if(ids) {
		for(const id of ids) {
			params.append("id[]", id);
		}
	}

	const response = await fetchFromInstance(
		new URL("/api/v1/accounts/familiar_followers", instanceUrl),
		token,
		params
	);

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

export async function search(
	instanceUrl: URL,
	token: string,
	query: string,
	limit: number = 40,
	offset?: number,
	resolve?: boolean,
	following?: boolean
): Promise<Account[]> {
	const params = new URLSearchParams([["q", query]]);

	if(limit) {
		if(limit > 0 && limit <= 80) {
			params.set("limit", String(limit));
		} else {
			console.warn(`You specified ${limit} accounts but Mastodon only supports returning between 1 and 80 accounts from this endpoint. Defaulting to 40.`);
		}
	}
	if(offset) {
		params.set("offset", String(offset));
	}
	if(resolve != undefined) {
		params.set("resolve", String(resolve));
	}
	if(following != undefined) {
		params.set("following", String(following));
	}

	const response = await fetchFromInstance(
		new URL("/api/v1/accounts/search", instanceUrl),
		token,
		params
	);

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
	const response = await fetchFromInstance(
		new URL("/api/v1/accounts/lookup", instanceUrl),
		undefined,
		new URLSearchParams([["acct", acct]])
	);

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