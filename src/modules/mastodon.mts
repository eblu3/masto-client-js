import * as env from "../env.mjs";

// === ENUMS === //

export enum AttachmentType {
	Unknown = "unknown",
	Image = "image",
	GIFV = "gifv",
	Video = "video",
	Audio = "audio"
}

export enum DomainBlockSeverity {
	Silence = "silence",
	Suspend = "suspend"
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

export class CredentialAccount extends Account {
	/** An extra attribute that contains source values to be used with API methods that [verify credentials](https://docs.joinmastodon.org/methods/accounts/#verify_credentials) and [update credentials](https://docs.joinmastodon.org/methods/accounts/#update_credentials). */
	source: object;
	/** The role assigned to the currently authorized user. */
	role?: Role;

	constructor(data: any) {
		super(data);

		this.source = data["source"];
		this.role = data["role"] ?? undefined;
	}
}

export class Announcement {
	id: string;
	content: DocumentFragment;
	startsAt: Date | null;
	endsAt: Date | null;
	published: boolean;
	allDay: boolean;
	publishedAt: Date;
	updatedAt: Date;
	read?: boolean;
	mentions: AnnouncementAccount[];
	statuses: AnnouncementStatus[];
	tags: StatusTag[];
	emojis: CustomEmoji[];
	reactions: Reaction[];

	constructor(data: any) {
		this.id = data["id"];
		this.content = new DOMParser().parseFromString(data["content"], "text/html");
		try {
			this.startsAt = new Date(data["starts_at"]);
		} catch {
			this.startsAt = null;
		}
		try {
			this.endsAt = new Date(data["ends_at"]);
		} catch {
			this.endsAt = null;
		}
		this.published = data["published"];
		this.allDay = data["all_day"];
		this.publishedAt = new Date(data["published_at"]);
		this.updatedAt = new Date(data["updated_at"]);
		this.read = data["read"] ?? undefined;
		this.mentions = [];
		for(const mention of data["mentions"]) {
			this.mentions.push(new AnnouncementAccount(mention));
		}
		this.statuses = [];
		for(const status of data["statuses"]) {
			this.statuses.push(new AnnouncementStatus(status));
		}
		this.tags = [];
		for(const tag of data["tags"]) {
			this.tags.push(new StatusTag(tag));
		}
		this.emojis = [];
		for(const emoji of data["emojis"]) {
			this.emojis.push(new CustomEmoji(emoji));
		}
		this.reactions = [];
		for(const reaction of data["reactions"]) {
			this.reactions.push(new Reaction(reaction));
		}
	}
}

export class AnnouncementAccount {
	id: string;
	username: string;
	url: URL;
	acct: string;

	constructor(data: any) {
		this.id = data["id"];
		this.username = data["username"];
		this.url = new URL(data["url"]);
		this.acct = data["acct"];
	}
}

export class AnnouncementStatus {
	id: string;
	url: URL;

	constructor(data: any) {
		this.id = data["id"];
		this.url = new URL(data["url"]);
	}
}

export class Application {
	name: string;
	website?: URL | null;
	scopes: string[];
	redirectUris: string[];

	constructor(data: any) {
		this.name = data["name"];
		try {
			this.website = data["website"];
		} catch {
			this.website = null;
		}
		this.scopes = data["scopes"];
		this.redirectUris = data["redirect_uris"];
	}
}

export class CredentialApplication extends Application {
	clientId: string;
	clientSecret: string;
	clientSecretExpiresAt: string;

	constructor(data: any) {
		super(data);

		this.clientId = data["client_id"];
		this.clientSecret = data["client_secret"];
		this.clientSecretExpiresAt = data["client_secret_expires_at"];
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

export class DomainBlock {
	domain: string;
	digest: string;
	severity: DomainBlockSeverity;
	comment?: string;

	constructor(data: any) {
		this.domain = data["domain"];
		this.digest = data["digest"];
		this.severity = data["severity"];
		this.comment = data["comment"] ?? undefined;
	}
}

export class ExtendedDescription {
	updatedAt: Date;
	content: DocumentFragment;

	constructor(data: any) {
		this.updatedAt = new Date(data["updated_at"]);
		this.content = new DOMParser().parseFromString(data["content"], "text/html");
	}
}

export class FeaturedTag {
	id: string;
	name: string;
	url: URL;
	statusesCount: number;
	lastStatusAt: Date;

	constructor(data: any) {
		this.id = data["id"];
		this.name = data["name"];
		this.url = new URL(data["url"]);
		this.statusesCount = Number(data["statuses_count"]);
		this.lastStatusAt = new Date(data["last_status_at"]);
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

export class List {
	id: string;
	title: string;
	repliesPolicy: string;

	constructor(data: any) {
		this.id = data["id"];
		this.title = data["title"];
		this.repliesPolicy = data["replies_policy"];
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

export class TrendsLink extends PreviewCard {
	history: object[];

	constructor(data: any) {
		super(data);

		this.history = [];
		for(const historyObject of data["history"]) {
			this.history.push({
				day: new Date(Number(historyObject["day"])*1000),
				accounts: Number(historyObject["accounts"]),
				uses: Number(historyObject["uses"])
			});
		}
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

export class Reaction {
	name: string;
	count: number;
	me?: boolean;
	url?: URL;
	staticUrl?: URL;

	constructor(data: any) {
		this.name = data["name"];
		this.count = data["count"];
		this.me = data["me"] ?? undefined;
		try {
			this.url = new URL(data["url"]);
		} catch {
			this.url = undefined;
		}
		try {
			this.staticUrl = new URL(data["static_url"]);
		} catch {
			this.staticUrl = undefined;
		}
	}
}

export class Relationship {
	id: string;
	following: boolean;
	showingReblogs: boolean;
	notifying: boolean;
	languages: Intl.Locale[];
	followedBy: boolean;
	blocking: boolean;
	blockedBy: boolean;
	muting: boolean;
	mutingNotifications: boolean;
	requested: boolean;
	requestedBy: boolean;
	domainBlocking: boolean;
	endorsed: boolean;
	note: string;

	constructor(data: any) {
		this.id = data["id"];
		this.following = data["following"];
		this.showingReblogs = data["showing_reblogs"];
		this.notifying = data["notifying"];
		this.languages = [];
		for(const language of data["languages"]) {
			this.languages.push(new Intl.Locale(language));
		}
		this.followedBy = data["followed_by"];
		this.blocking = data["blocking"];
		this.blockedBy = data["blocked_by"];
		this.muting = data["muting"];
		this.mutingNotifications = data["muting_notifications"];
		this.requested = data["requested"];
		this.requestedBy = data["requested_by"];
		this.domainBlocking = data["domain_blocking"];
		this.endorsed = data["endorsed"];
		this.note = data["note"];
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

export class StatusMention {
	id: string;
	username: string;
	url: URL;
	acct: string;

	constructor(data: any) {
		this.id = data["id"];
		this.username = data["username"];
		this.url = new URL(data["url"]);
		this.acct = data["acct"];
	}
}

export class StatusTag {
	name: string;
	url: URL;

	constructor(data: any) {
		this.name = data["name"];
		this.url = new URL(data["url"]);
	}
}

export class Tag {
	name: string;
	url: URL;
	history: object[];
	following?: boolean;

	constructor(data: any) {
		this.name = data["name"];
		this.url = new URL(data["url"]);
		this.history = [];
		for(const historyObject of data["history"]) {
			this.history.push({
				day: new Date(Number(historyObject["day"])*1000),
				uses: Number(historyObject["uses"]),
				accounts: Number(historyObject["accounts"])
			});
		}
		this.following = data["following"] ?? undefined;
	}
}

export class AdminTag extends Tag {
	id: string;
	trendable: boolean;
	usable: boolean;
	requiresReview: boolean;

	constructor(data: any) {
		super(data);

		this.id = data["id"];
		this.trendable = data["trendable"];
		this.usable = data["usable"];
		this.requiresReview = data["requires_review"];
	}
}

export class Token {
	accessToken: string;
	tokenType: string;
	scope: string[];
	createdAt: Date;

	constructor(data: any) {
		this.accessToken = data["access_token"];
		this.tokenType = data["token_type"];
		this.scope = (data["scope"] as string).split(" ");
		this.createdAt = new Date(Number(data["created_at"])*1000);
	}
}

// === API METHODS === //

// == APPS == //

/**
 * Creates a new application on the instance, used to obtain OAuth 2 credentials.
 * 
 * It is recommended to treat the `clientId` and `clientSecret` values in the returned data as if they were passwords. Storing these values without encrypting them could be a security risk.
 * @param instanceUrl The URL of the instance to create the application on.
 * @param clientName The name of the application.
 * @param redirectUris A string or array of strings representing where the user should be redirected after authorization.
 * @param scopes A string or array of strings representing the OAuth scopes for this application. Defaults to `read`.
 * @param website The URL of the application's homepage.
 * @returns A `CredentialApplication` with the application's info as stored on the instance.
 */
export async function createApplication(
	instanceUrl: URL,
	clientName: string,
	redirectUris: string | string[],
	scopes: string | string[] = "read",
	website: URL
): Promise<CredentialApplication> {
	let requestBody = {
		"client_name": clientName,
		"redirect_uris": redirectUris,
		"scopes": "",
		"website": website.href
	};

	if(typeof scopes === "string") {
		requestBody.scopes = scopes;
	} else {
		requestBody.scopes = scopes.join(" ");
	}

	const response = await fetch(new URL("/api/v1/apps", instanceUrl), {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestBody)
	});

	if(response.ok) {
		const json = await response.json();

		if("error" in json) {
			console.error(json["error"]);
		} else {
			return new CredentialApplication(json);
		}
	} else {
		console.error(response.statusText);
	}
}

/**
 * Verifies that the application's credentials work.
 * @param instanceUrl The URL of the instance to query.
 * @param token The application's token.
 * @returns The application, as stored on the instance. Throws an error if not.
 */
export async function verifyApplication(instanceUrl: URL, token: string): Promise<Application> {
	const response = await fetch(new URL("/api/v1/apps/verify_credentials", instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();

		if("error" in json) {
			console.error(json["error"]);
		} else {
			return new Application(json);
		}
	} else {
		console.error(response.statusText);
	}
}

// = APPS/OAUTH = //

/**
 * Displays an authorization form to the user. If approved, it will create and return an authorization code, then redirect to the desired `redirect_uri`. The authorization code can be used while requesting a token to obtain access to user-level methods.
 * @param instanceUrl The URL of the instance to log in to.
 * @param clientId The client ID, obtained during app registration.
 * @param redirectUri Set a URI to redirect the user to. Must match one of the `redirect_uris` declared during app registration.
 * @param scope List of requested [OAuth scopes](https://docs.joinmastodon.org/api/oauth-scopes/). Must be a subset of `scopes` declared during app registration. If not provided, defaults to `read`.
 * @param state Arbitrary value to passthrough when the user authorizes or rejects the authorization request.
 * @param codeChallenge The [PKCE code challenge](https://docs.joinmastodon.org/spec/oauth/#pkce) for the authorization request.
 * @param forceLogin Forces the user to re-login, which is necessary for authorizing with multiple accounts from the same instance.
 * @param lang The ISO 639-1 two-letter language code to use while rendering the authorization form. Defaults to the browser's current language.
 */
export async function authorizeUser(
	instanceUrl: URL,
	clientId: string,
	redirectUri: string,
	scope?: string | string[],
	state?: string,
	codeChallenge?: string,
	forceLogin?: boolean,
	lang: string = new Intl.Locale(navigator.language).language
) {
	const endpoint = new URL("/oauth/authorize", instanceUrl);

	endpoint.searchParams.set("response_type", "code");
	endpoint.searchParams.set("client_id", clientId);
	endpoint.searchParams.set("redirect_uri", redirectUri);
	if(scope) {
		endpoint.searchParams.set("scope", typeof scope === "string" ? scope : scope.join("+"));
	}
	if(state) {
		endpoint.searchParams.set("state", state);
	}
	if(codeChallenge) {
		endpoint.searchParams.set("code_challenge", codeChallenge);
		endpoint.searchParams.set("code_challenge_method", "S256");
	}
	if(forceLogin != undefined) {
		endpoint.searchParams.set("force_login", String(forceLogin));
	}
	endpoint.searchParams.set("lang", lang);

	open(endpoint, "_blank");
}

export async function obtainToken(
	instanceUrl: URL,
	grantType: string,
	code: string,
	clientId: string,
	clientSecret: string,
	redirectUri: string,
	codeVerifier?: string,
	scope: string[] = ["read"]
): Promise<Token> {
	let requestBody = {
		"grant_type": grantType,
		"code": code,
		"client_id": clientId,
		"client_secret": clientSecret,
		"redirect_uri": redirectUri,
		"code_verifier": "",
		"scope": [""]
	};

	if(codeVerifier) {
		requestBody.code_verifier = codeVerifier;
	} else {
		delete requestBody.code_verifier;
	}
	if(scope) {
		requestBody.scope = scope;
	} else {
		delete requestBody.scope;
	}

	console.log(requestBody);
	console.log(JSON.stringify(requestBody));

	const response = await fetch(new URL("/oauth/token", instanceUrl), {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestBody)
	});

	if(response.ok) {
		return new Token(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(`${json["error"]}: ${json["error_description"]}`);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function revokeToken(
	instanceUrl: URL,
	clientId: string,
	clientSecret: string,
	token: string
) {
	const requestBody = {
		"client_id": clientId,
		"client_secret": clientSecret,
		"token": token
	};

	const response = await fetch(new URL("/oauth/revoke", instanceUrl), {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestBody)
	});

	if(!response.ok) {
		try {
			const json = await response.json();
			console.error(`${json["error"]}: ${json["error_description"]}`);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function getOAuthConfiguration(instanceUrl: URL): Promise<object> {
	const response = await fetch(new URL("/.well-known/oauth-authorization-server", instanceUrl));

	if(!response.ok) {
		console.error(response.statusText);
	} else {
		return await response.json();
	}
}

// = APPS/EMAILS = //

export async function resendConfirmationEmail(instanceUrl: URL, token: string, email: string) {
	let response;

	if(email) {
		response = await fetch(new URL("/api/v1/emails/confirmations", instanceUrl), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({"email": email})
		});
	} else {
		response = await fetch(new URL("/api/v1/emails/confirmations", instanceUrl), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});
	}

	if(!response.ok) {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

// == ACCOUNTS == //

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
	limit: number = 20,
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
	limit: number = 40
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
	limit: number = 40
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

/**
 * Queries an instance to get what domains that it is aware of.
 * @param instanceUrl The URL of the instance to query.
 * @param token The token of a logged in user. Required if this instance is in whitelist mode.
 * @returns An array of strings representing the domains that the instance is aware of, or `null` if there was an error.
 */
export async function getConnectedDomains(instanceUrl: URL, token?: string): Promise<string[]> | null {
	try {
		let response;

		if(token) {
			response = await fetch(new URL("/api/v1/instance/peers", instanceUrl), {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		} else {
			response = await fetch(new URL("/api/v1/instance/peers", instanceUrl));
		}

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		return await response.json();
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getWeeklyActivity(instanceUrl: URL, token?: string): Promise<object[]> | null {
	try {
		let response;

		if(token) {
			response = await fetch(new URL("/api/v1/instance/activity", instanceUrl), {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		} else {
			response = await fetch(new URL("/api/v1/instance/activity", instanceUrl));
		}

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: object[] = [];

		for(const hash of json) {
			out.push({
				week: new Date(Number(hash["week"])*1000),
				statuses: hash["statuses"],
				logins: hash["logins"],
				registrations: hash["registrations"]
			});
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getRules(instanceUrl: URL): Promise<Rule[]> | null {
	try {
		const response = await fetch(new URL("/api/v1/instance/rules", instanceUrl));

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		return await response.json();
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getModeratedServers(instanceUrl: URL, token?: string): Promise<DomainBlock[]> | null {
	try {
		let response;

		if(token) {
			response = await fetch(new URL("/api/v1/instance/domain_blocks", instanceUrl), {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		} else {
			response = await fetch(new URL("/api/v1/instance/domain_blocks", instanceUrl));
		}

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: DomainBlock[] = [];

		for(const blockObject of json) {
			out.push(new DomainBlock(blockObject));
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getExtendedDescription(instanceUrl: URL): Promise<ExtendedDescription> | null {
	try {
		const response = await fetch(new URL("/api/v1/instance/extended_description", instanceUrl));

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		return new ExtendedDescription(await response.json());
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getTranslationLanguages(instanceUrl: URL): Promise<object> | null {
	try {
		const response = await fetch(new URL("/api/v1/instance/translation_languages", instanceUrl));

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		return await response.json();
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

// = INSTANCE/TRENDS = //

export async function getTrendingTags(instanceUrl: URL, limit: number = 10, offset?: number): Promise<Tag[]> | null {
	try {
		const endpoint = new URL("/api/v1/trends/tags", instanceUrl);

		if(limit != 10) {
			endpoint.searchParams.set("limit", String(limit));
		}

		if(offset) {
			endpoint.searchParams.set("offset", String(offset));
		}

		const response = await fetch(endpoint);

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: Tag[] = [];

		for(const tag of json) {
			out.push(new Tag(tag));
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getTrendingStatuses(instanceUrl: URL, limit: number = 10, offset?: number): Promise<Status[]> | null {
	try {
		const endpoint = new URL("/api/v1/trends/statuses", instanceUrl);

		if(limit != 10) {
			endpoint.searchParams.set("limit", String(limit));
		}

		if(offset) {
			endpoint.searchParams.set("offset", String(offset));
		}

		const response = await fetch(endpoint);

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: Status[] = [];

		for(const status of json) {
			out.push(new Status(status));
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getTrendingLinks(instanceUrl: URL, limit: number = 10, offset?: number): Promise<TrendsLink[]> | null {
	try {
		const endpoint = new URL("/api/v1/trends/links", instanceUrl);

		if(limit != 10) {
			endpoint.searchParams.set("limit", String(limit));
		}

		if(offset) {
			endpoint.searchParams.set("offset", String(offset));
		}

		const response = await fetch(endpoint);

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: TrendsLink[] = [];

		for(const link of json) {
			out.push(new TrendsLink(link));
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

// = INSTANCE/DIRECTORY = //

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

// = INSTANCE/CUSTOM EMOJIS = //

export async function getCustomEmojis(instanceUrl: URL): Promise<CustomEmoji[]> | null {
	try {
		const response = await fetch(new URL("/api/v1/custom_emojis", instanceUrl));

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: CustomEmoji[] = [];

		for(const emoji of json) {
			out.push(new CustomEmoji(emoji));
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

// = INSTANCE/ANNOUNCEMENTS = //

export async function getAnnouncements(instanceUrl: URL, token: string): Promise<Announcement[]> | null {
	try {
		const response = await fetch(new URL("/api/v1/announcements", instanceUrl), {
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: Announcement[] = [];

		for(const announcement of json) {
			out.push(announcement);
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function dismissAnnouncement(instanceUrl: URL, id: string, token: string) {
	await fetch(new URL(`/api/v1/announcements/${id}/dismiss`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});
}

export async function reactToAnnouncement(instanceUrl: URL, id: string, emojiName: string, token: string) {
	await fetch(new URL(`/api/v1/announcements/${id}/reactions/${emojiName}`, instanceUrl), {
		method: "PUT",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});
}

export async function removeReactionFromAnnouncement(instanceUrl: URL, id: string, emojiName: string, token: string) {
	await fetch(new URL(`/api/v1/announcements/${id}/reactions/${emojiName}`, instanceUrl), {
		method: "DELETE",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});
}