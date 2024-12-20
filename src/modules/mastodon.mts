import * as env from "../env.mjs";

// === ENUMS === //

export enum AttachmentType {
	Unknown = "unknown",
	Image = "image",
	GIFV = "gifv",
	Video = "video",
	Audio = "audio"
}

export enum PreviewCardType {
	Link = "link",
	Photo = "photo",
	Video = "video",
	Rich = "rich"
}

export enum Timelines {
	Public = "/api/v1/timelines/public",
	Hashtag = "/api/v1/timelines/tag/",
	Home = "/api/v1/timelines/home"
}

// === API ENTITIES === //

/**
 * Represents a user of Mastodon and their associated profile.
 */
export class Account {
	/** The account id. */
	id: string;
	/** The username of the account, not including domain. */
	username: string;
	/** The Webfinger account URI. Equal to `username` for local users, or `username@domain` for remote users. */
	acct: string;
	/** The location of the user's profile page. */
	url: URL;
	/** The profile's display name.*/
	displayName: string;
	/** The profile's bio or description.*/
	note: string;
	/** An image icon that is shown next to statuses and in the profile.*/
	avatar: URL;
	/** A static version of the avatar. Equal to `avatar` if its value is a static image; different if `avatar` is an animated GIF. */
	avatarStatic: URL;
	/** An image banner that is shown above the profile and in profile cards. */
	header: URL;
	/** A static version of the header. Equal to `header` if its value is a static image; different if `header` is an animated GIF. */
	headerStatic: URL;
	/** Whether the account manually approves follow requests. */
	locked: boolean;
	/** Additional metadata attached to a profile as name-value pairs. */
	fields: Field[];
	/** Custom emoji entities to be used when rendering the profile. */
	emojis: CustomEmoji[];
	/** Indicates that the account may perform automated actions, may not be monitored, or identifies as a robot. */
	bot: boolean;
	/** Indicates that the account represents a Group actor. */
	group: boolean;
	/** Whether the account has opted into discovery features such as the profile directory. */
	discoverable: boolean | null;
	/** Whether the local user has opted out of being indexed by search engines. */
	noindex?: boolean | undefined;
	/** Indicates that the profile is currently inactive and that its user has moved to a new account. */
	moved?: Account | undefined;
	/** An extra attribute returned only when an account is suspended. */
	suspended?: boolean | undefined;
	/** An extra attribute returned only when an account is silenced. If true, indicates that the account should be hidden behind a warning screen. */
	limited?: boolean | undefined;
	/** When the account was created. */
	createdAt: Date;
	/** When the most recent status was posted. */
	lastStatusAt: Date | null;
	/** How many statuses are attached to this account. */
	statusesCount: number;
	/** The reported followers of this profile. */
	followersCount: number;
	/** The reported follows of this profile. */
	followingCount: number;

	constructor(data: any | undefined) {
		if(data == undefined) {
			return undefined;
		} else {
			this.id = data["id"];
			this.username = data["username"];
			this.acct = data["acct"];
			this.url = new URL(data["url"]);
			this.displayName = data["display_name"];
			this.note = data["note"];
			this.avatar = new URL(data["avatar"]);
			this.avatarStatic = new URL(data["avatar_static"]);
			this.header = new URL(data["header"]);
			this.headerStatic = new URL(data["header_static"]);
			this.locked = data["locked"];

			this.fields = [];
			for(const field of data["fields"]) {
				this.fields.push(new Field(field));
			}

			this.emojis = [];
			for(const emoji of data["emojis"]) {
				this.emojis.push(new CustomEmoji(emoji));
			}

			this.bot = data["bot"];
			this.group = data["group"];
			this.discoverable = data["discoverable"] ?? null;
			this.noindex = data["noindex"] ?? undefined;
			this.moved = new Account(data["moved"]) ?? undefined;
			this.suspended = data["suspended"] ?? undefined;
			this.limited = data["limited"] ?? undefined;
			this.createdAt = new Date(data["created_at"]);
			this.lastStatusAt = new Date(data["last_status_at"]) ?? null;
			this.statusesCount = data["statuses_count"];
			this.followersCount = data["followers_count"];
			this.followingCount = data["following_count"];
		}
	}
}

export class CredentialAccount extends Account {
	/** An extra attribute that contains source values to be used with API methods that [verify credentials](https://docs.joinmastodon.org/methods/accounts/#verify_credentials) and [update credentials](https://docs.joinmastodon.org/methods/accounts/#update_credentials). */
	source: object;
	/** The role assigned to the currently authorized user. */
	role: Role;

	constructor(data: any) {
		super(data);

		this.source = data["source"];
		this.role = data["role"];
	}
}

/**
 * Represents a custom emoji.
 */
export class CustomEmoji {
	/** The name of the custom emoji. */
	shortcode: string;
	/** A link to the custom emoji. */
	url: URL;
	/** A link to a static copy of the custom emoji. */
	staticUrl: URL;
	/** Whether this Emoji should be visible in the picker or unlisted. */
	visibleInPicker: boolean;
	/** Used for sorting custom emoji in the picker. */
	category: string | null;

	constructor(data: any) {
		this.shortcode = data["shortcode"];
		this.url = new URL(data["url"]);
		this.staticUrl = new URL(data["static_url"]);
		this.visibleInPicker = data["visible_in_picker"];
		this.category = data["category"];
	}
}

export class Field {
	/** The key of a given field's key-value pair. */
	name: string;
	/** The value associated with the `name` key. */
	value: string;
	/** Timestamp of when the server verified a URL value for a rel="me" link. */
	verifiedAt?: Date;

	constructor(data: any) {
		this.name = data["name"];
		this.value = data["value"];
		this.verifiedAt = data["verified_at"] ? new Date(data["verified_at"]) : null;
	}
}

/**
 * Represents the software instance of Mastodon running on this domain.
 */
export class Instance {
	/** The domain name of the instance. */
	domain: string;
	/** The title of the website. */
	title: string;
	/** The version of Mastodon installed on the instance. */
	version: string;
	/** The URL for the source code of the software running on this instance, in keeping with AGPL license requirements. */
	sourceUrl: URL;
	/** A short, plain-text description defined by the admin. */
	description: string;
	/** Usage data for this instance. */
	usage: object;
	/** An image used to represent this instance. */
	thumbnail: object;
	/** The list of available size variants for this instance configured icon. */
	icon: InstanceIcon[];
	/** Primary languages of the website and its staff. */
	languages: Intl.Locale[];
	/** Configured values and limits for this website. */
	configuration: object;
	/** Information about registering for this website. */
	registrations: object;
	/** Information about which version of the API is implemented by this server. It contains at least a `mastodon` attribute, and other implementations may have their own additional attributes. */
	apiVersions: object;
	/** Hints related to contacting a representative of the website. */
	contact: object;
	/** An itemized list of rules for this website. */
	rules: Rule[];

	constructor(data: any) {
		this.domain = data["domain"];
		this.title = data["title"];
		this.version = data["version"];
		this.sourceUrl = new URL(data["source_url"]);
		this.description = data["description"];
		this.usage = data["usage"];
		this.thumbnail = data["thumbnail"];
		this.icon = [];
		for(const icn of data["icon"]) {
			this.icon.push(new InstanceIcon(icn));
		}
		this.languages = [];
		for(const lang of data["languages"]) {
			this.languages.push(new Intl.Locale(lang));
		}
		this.configuration = data["configuration"];
		this.registrations = data["registrations"];
		this.apiVersions = data["api_versions"];
		this.contact = data["contact"];
		this.rules = [];
		for(const rule of data["rules"]) {
			this.rules.push(new Rule(rule));
		}
	}
}

export class InstanceIcon {
	/** The URL of this icon. */
	src: URL;
	/** The size of this icon. */
	size: string;

	constructor(data: any) {
		this.src = new URL(data["src"]);
		this.size = data["size"];
	}
}

/**
 * Represents a rich preview card that is generated using OpenGraph tags from a URL.
 */
export class PreviewCard {
	/** Location of linked resource. */
	url: URL;
	/** Title of linked resource. */
	title: string;
	/** Description of preview. */
	description: string;
	/** The type of the preview card. */
	type: PreviewCardType;
	/** Fediverse account of the authors of the original resource. */
	authors: PreviewCardAuthor[];
	/** The author of the original resource. Deprecated since 4.3.0, clients should use `authors` instead. */
	authorName: string;
	/** A link to the author of the original resource. Deprecated since 4.3.0, clients should use `authors` instead. */
	authorUrl: URL;
	/** The provider of the original resource. */
	providerName: string;
	/** A link to the provider of the original resource. */
	providerUrl: URL;
	/** HTML to be used for generating the preview card. */
	html: string;
	/** Width of preview, in pixels. */
	width: number;
	/** Height of preview, in pixels. */
	height: number;
	/** Preview thumbnail. */
	image: URL | null;
	/** Used for photo embeds, instead of custom `html`. */
	embedUrl: URL;
	/** A hash computed by [the BlurHash algorithm](https://github.com/woltapp/blurhash), for generating colorful preview thumbnails when media has not been downloaded yet. */
	blurhash: string | null;

	constructor(data: any) {
		this.url = new URL(data["url"]);
		this.title = data["title"];
		this.description = data["description"];
		this.type = data["type"];
		this.authors = data["authors"];
		this.authorName = data["author_name"];
		try {
			this.authorUrl = new URL(data["author_url"]);
		} catch {
			this.authorUrl = null;
		}
		this.providerName = data["provider_name"];
		try {
			this.providerUrl = new URL(data["provider_url"]);
		} catch {
			this.providerUrl = null;
		}
		this.html = data["html"];
		this.width = data["width"];
		this.height = data["height"];
		try {
			this.image = new URL(data["image"]);
		} catch {
			this.image = null;
		}
		this.embedUrl = data["embed_url"];
		this.blurhash = data["blurhash"];
	}
}

/**
 * Represents an author in a rich preview card.
 */
export class PreviewCardAuthor {
	/** The original resoure author's name. Replaces the deprecated `author_name` attribute of the preview card. */
	name: string;
	/** A link to the author of the original resource. Replaces the deprecated `author_url` attribute of the preview card. */
	url: URL;
	/** The fediverse account of the author. */
	account: Account | null;

	constructor(data: any) {
		this.name = data["name"];
		this.url = new URL(data["url"]);
		try {
			this.account = new Account(data["account"]);
		} catch {
			this.account = null;
		}
	}
}

/**
 * Represents a custom user role that grants permissions.
 */
export class Role {
	/** The ID of the Role in the database. */
	id: string;
	/** The name of the role. */
	name: string;
	/** The hex code assigned to this role. If no hex code is assigned, the string will be empty. */
	color: string;
	/** A bitmask that represents the sum of all permissions granted to the role. */
	permissions: string;
	/** Whether the role is publicly visible as a badge on user profiles. */
	highlighted: boolean;

	constructor(data: any) {
		this.id = data["id"];
		this.name = data["name"];
		this.color = data["color"];
		this.permissions = data["permissions"];
		this.highlighted = data["highlighted"];
	}
}

/**
 * Represents a rule that server users should follow.
 */
export class Rule {
	/** An identifier for the rule. */
	id: string;
	/** The rule to be followed. */
	text: string;
	/** Longer-form description of the rule. */
	hint: string;

	constructor(data: any) {
		this.id = data["id"];
		this.text = data["text"];
		this.hint = data["hint"];
	}
}

/**
 * Represents a status posted by an account.
 */
export class Status {
	/** ID of the status in the database. */
	id: string;
	/** URI of the status used for federation. */
	uri: string;
	/** The date when this status was created. */
	createdAt: Date;
	/** The account that authored this status. */
	account: Account;
	/** HTML-encoded status content. */
	content: string;
	/** Visibility of this status. */
	visibility: string; // TODO: make this an enum
	/** Is this status marked as sensitive content? */
	sensitive: boolean;
	/** Subject or summary line, below which status content is collapsed until expanded. */
	spoilerText: string;
	/** Media that is attached to this status. */
	mediaAttachments: MediaAttachment[]
	/** The application used to post this status. */
	application?: object
	/** Mentions of users within the status content. */
	mentions: object[]
	/** Hashtags used within the status content. */
	tags: object[]
	/** Custom emoji to be used when rendering status content. */
	emojis: CustomEmoji[]
	/** How many boosts this status has received. */
	reblogsCount: number;
	/** How many favourites this status has received. */
	favouritesCount: number;
	/** How many replies this status has received. */
	repliesCount: number;
	/** A link to the status's HTML representation. */
	url: URL | null;
	/** ID of the status being replied to. */
	inReplyToId: string | null;
	/** ID of the account that authored the status being replied to. */
	inReplyToAccountId: string | null;
	/** The status being reblogged. */
	reblog: Status | null;
	/** The poll attached to the status. */
	poll: object | null;
	/** Preview card for links included within status content. */
	card: PreviewCard | null;
	/** Primary language of this status. */
	language: Intl.Locale | null;
	/** Plain-text source of a status. Returned instead of `content` when status is deleted, so the user may redraft from the source text without the client having to reverse-engineer the original text from the HTML content. */
	text: string | null;
	/** Timestamp of when the status was last edited. */
	editedAt: Date | null;
	/** If the current token has an authorized user: Have you favourited this status? */
	favourited?: boolean;
	/** If the current token has an authorized user: Have you boosted this status? */
	reblogged?: boolean;
	/** If the current token has an authorized user: Have you muted notifications for this status's conversation? */
	muted?: boolean;
	/** If the current token has an authorized user: Have you bookmarked this status? */
	bookmarked?: boolean;
	/** If the current token has an authorized user: Have you pinned this status? Only appears if the status is pinnable. */
	pinned?: boolean;
	/** If the current token has an authorized user: The filter and keywords that matched this status. */
	filtered?: object[];

	constructor(data: any | null) {
		if(data == null) {
			return null;
		} else {
			this.id = data["id"];
			this.uri = data["uri"];
			this.createdAt = new Date(data["created_at"]);
			this.account = new Account(data["account"]);
			this.content = data["content"];
			this.visibility = data["visibility"];
			this.sensitive = data["sensitive"];
			this.spoilerText = data["spoiler_text"];
			this.mediaAttachments = data["media_attachments"];
			this.application = data["application"];
			this.mentions = data["mentions"];
			this.tags = data["tags"];
			this.emojis = data["emojis"];
			this.reblogsCount = data["reblogs_count"];
			this.favouritesCount = data["favourites_count"];
			this.repliesCount = data["replies_count"];
			try {
				this.url = new URL(data["url"]);
			} catch {
				this.url = null;
			}
			this.inReplyToId = data["in_reply_to_id"];
			this.inReplyToAccountId = data["in_reply_to_account_id"];
			if(data["reblog"]) {
				this.reblog = new Status(data["reblog"]);
			} else {
				this.reblog = null;
			}
			this.poll = data["poll"];
			if(data["card"]) {
				this.card = new PreviewCard(data["card"]);
			} else {
				this.card = null;
			}
			try {
				this.language = new Intl.Locale(data["language"]);
			} catch {
				this.language = null;
			}
			this.text = data["text"];
			try {
				this.editedAt = new Date(data["editedAt"]);
			} catch {
				this.editedAt = null;
			}
			this.favourited = data["favourited"];
			this.reblogged = data["reblogged"];
			this.muted = data["muted"];
			this.bookmarked = data["bookmarked"];
			this.pinned = data["pinned"];
			this.filtered = data["filtered"];
		}
	}
}

export class MediaAttachment {
	/** The ID of the attachment in the database. */
	id: string;
	/** The type of the attachment. */
	type: AttachmentType;
	/** The location of the original full-size attachment. */
	url: URL;
	/** The location of a scaled-down preview of the attachment. */
	previewUrl: URL | null;
	/** The location of the full-size original attachment on the remote website. */
	remoteUrl: URL | null;
	/** Metadata returned by Paperclip. */
	meta: object;
	/** Alternate text that describes what is in the media attachment, to be used for the visually impaired or when media attachments do not load. */
	description: string | null;
	/** A hash computed by [the BlurHash algorithm](https://github.com/woltapp/blurhash), for generating colorful preview thumbnails when media has not been downloaded yet. */
	blurhash: string | null;

	constructor(data: any) {
		this.id = data["id"];
		this.type = data["type"];
		this.url = new URL(data["url"]);
		try {
			this.previewUrl = new URL(data["preview_url"]);
		} catch {
			this.previewUrl = null;
		}
		try {
			this.remoteUrl = new URL(data["remote_url"]);
		} catch {
			this.remoteUrl = null;
		}
		this.meta = data["meta"];
		this.description = data["description"];
		this.blurhash = data["blurhash"];
	}
}

// === API METHODS === //

// == TIMELINES == //

export async function getTimeline(url: URL, endpoint: Timelines, tag?: string, startAtId?: string): Promise<Status[]> | null {
	let newEndpoint: string = endpoint;

	if (endpoint === Timelines.Hashtag) {
		newEndpoint = newEndpoint + tag;
	}

	console.log(`Fetching timeline ${newEndpoint} from instance ${url.href}...`);

	try {
		let response;

		if (startAtId) {
			response = await fetch(new URL(`${newEndpoint}?max_id=${startAtId}`, url), {
				headers: {
					"Authorization": `Bearer ${env.token}`
				}
			});
		} else {
			response = await fetch(new URL(newEndpoint, url), {
				headers: {
					"Authorization": `Bearer ${env.token}`
				}
			});
		}

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		console.log("Got it!");
		console.log(json);

		let processedStatuses: Status[] = [];

		for (const status of json) {
			processedStatuses.push(new Status(status));
		}

		return processedStatuses;
	} catch (error) {
		console.error(error.message);
		return null;
	}
}

/**
 * Fetches the public timeline.
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
	token?: string,
	local: boolean = false,
	remote: boolean = false,
	onlyMedia: boolean = false,
	maxId?: string,
	sinceId?: string,
	minId?: string,
	limit: number = 20
): Promise<Status[]> | null {
	let endpoint = new URL("/api/v1/timelines/public", env.instanceUrl);

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
	let endpoint = new URL(`/api/v1/timelines/tag/${hashtag}`, env.instanceUrl);

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
	token: string,
	maxId?: string,
	sinceId?: string,
	minId?: string,
	limit: number = 20
): Promise<Status[]> | null {
	let endpoint = new URL("/api/v1/timelines/home", env.instanceUrl);

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

export async function getAccountTimeline(id: string, startAtId?: string): Promise<Status[]> | null {
	console.log(`Fetching account ID ${id}'s timeline from instance ${env.instanceUrl}...`);
	try {
		let response;

		if (env.token) {
			if (startAtId) {
				response = await fetch(new URL(`/api/v1/accounts/${id}/statuses?max_id=${startAtId}`, env.instanceUrl), {
					headers: {
						"Authorization": `Bearer ${env.token}`
					}
				});
			} else {
				response = await fetch(new URL(`/api/v1/accounts/${id}/statuses`, env.instanceUrl), {
					headers: {
						"Authorization": `Bearer ${env.token}`
					}
				});
			}
		} else {
			if (startAtId) {
				response = await fetch(new URL(`/api/v1/accounts/${id}/statuses?max_id=${startAtId}`, env.instanceUrl));
			} else {
				response = await fetch(new URL(`/api/v1/accounts/${id}/statuses`, env.instanceUrl));
			}
		}

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		console.log("Got it!");
		console.log(json);

		let processedStatuses: Status[] = [];

		for (const status of json) {
			processedStatuses.push(new Status(status));
		}

		return processedStatuses;
	} catch (error) {
		console.error(error.message);
		return null;
	}
}

export async function getStatus(id: string): Promise<[Status, boolean, Account]> | null {
	try {
		let response;

		if (env.token) {
			response = await fetch(new URL(`/api/v1/statuses/${id}`, env.instanceUrl), {
				headers: {
					"Authorization": `Bearer ${env.token}`
				}
			});
		} else {
			response = await fetch(new URL(`/api/v1/statuses/${id}`, env.instanceUrl));
		}

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const status = new Status(await response.json());

		return status.reblog ? [status.reblog, true, status.account] : [status, false, undefined];
	} catch (error) {
		console.error(error.message);
		return null;
	}
}

export async function getAccount(id: string): Promise<Account> | null {
	try {
		let response;

		if (env.token) {
			response = await fetch(new URL(`/api/v1/accounts/${id}`, env.instanceUrl), {
				headers: {
					"Authorization": `Bearer ${env.token}`
				}
			});
		} else {
			response = await fetch(new URL(`/api/v1/accounts/${id}`, env.instanceUrl));
		}

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const account = new Account(await response.json());

		return account;
	} catch (error) {
		console.error(error.message);
		return null;
	}
}

export async function getAccountByHandle(acct: string) {
	try {
		let response;

		if (env.token) {
			response = await fetch(new URL(`/api/v1/accounts/lookup?acct=${acct}`, env.instanceUrl), {
				headers: {
					"Authorization": `Bearer ${env.token}`
				}
			});
		} else {
			response = await fetch(new URL(`/api/v1/accounts/lookup?acct=${acct}`, env.instanceUrl));
		}

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const account = new Account(await response.json());

		return account;
	} catch (error) {
		console.error(error.message);
		return null;
	}
}

export async function getCurrentAccount(): Promise<CredentialAccount> | null {
	try {
		let response = await fetch(new URL("/api/v1/accounts/verify_credentials", env.instanceUrl), {
			headers: {
				"Authorization": `Bearer ${env.token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		return new CredentialAccount(await response.json());
	} catch (error) {
		console.error(error.message);
		return null;
	}
}

// == POST == //

export async function postStatus(
	status?: string,
	mediaIds?: string[],
	pollOptions?: string[],
	pollExpiresIn?: number,
	pollMultipleChoice?: boolean,
	pollHideTotals?: boolean,
	inReplyToId?: string,
	isSensitive?: boolean,
	spoilerText?: string,
	visibility?: string,
	language?: string,
	scheduledAt?: string
): Promise<Status> | null {
	try {
		let params = new URLSearchParams([["status", status]]);

		if (inReplyToId) {
			params.append("in_reply_to_id", inReplyToId);
		}

		let response = await fetch(new URL(`/api/v1/statuses?${params.toString()}`, env.instanceUrl), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${env.token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const postedStatus = new Status(await response.json());

		return postedStatus;
	} catch (error) {
		console.error(error.message);
		return null;
	}
}

export async function favoriteStatus(id: string): Promise<Status> | null {
	console.log(`Favoriting status ${id}...`);
	try {
		let response = await fetch(new URL(`/api/v1/statuses/${id}/favourite`, env.instanceUrl), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${env.token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		console.log("Status favorited!");

		return new Status(await response.json());
	} catch (error) {
		console.error(error.message);
		return null;
	}
}

export async function unfavoriteStatus(id: string): Promise<Status> | null {
	console.log(`Removing favorite from status ${id}...`);
	try {
		let response = await fetch(new URL(`/api/v1/statuses/${id}/unfavourite`, env.instanceUrl), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${env.token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		console.log("Status unfavorited!");

		return new Status(await response.json());
	} catch (error) {
		console.error(error.message);
		return null;
	}
}

// TODO: change visibility to enum and implement it
export async function boostStatus(id: string, visibility?: string): Promise<Status> | null {
	console.log(`Boosting status ${id}...`);
	try {
		let response = await fetch(new URL(`/api/v1/statuses/${id}/reblog`, env.instanceUrl), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${env.token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		console.log("Status boosted!");

		return new Status(await response.json());
	} catch (error) {
		console.error(error.message);
		return null;
	}
}
export async function unboostStatus(id: String): Promise<Status> | null {
	console.log(`Removing boost from status ${id}...`);
	try {
		let response = await fetch(new URL(`/api/v1/statuses/${id}/unreblog`, env.instanceUrl), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${env.token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		console.log("Status unboosted!");

		return new Status(await response.json());
	} catch (error) {
		console.error(error.message);
		return null;
	}
}

// == INSTANCE == //

export async function getServerInformation(instanceUrl: URL): Promise<Instance> | null {
	try {
		const response = await fetch(new URL("/api/v2/instance", instanceUrl));

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		return new Instance(await response.json());
	} catch (error) {
		console.error(error.message);
		return null;
	}
}