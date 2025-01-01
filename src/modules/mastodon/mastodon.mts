import * as env from "../../env.mjs";

export * as apps from "./apps/apps.mjs";
export * as accounts from "./accounts/accounts.mjs";
export * as profile from "./profile/profile.mjs";
export * as statuses from "./statuses/statuses.mjs";
export * as timelines from "./timelines/timelines.mjs";
export * as instance from "./instance/instance.mjs";

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

export enum FilterAction {
	Warn = "warn",
	Hide = "hide"
}

export enum FilterContext {
	Home = "home",
	Notifications = "notifications",
	Public = "public",
	Thread = "thread",
	Account = "account"
}

export enum PreviewCardType {
	Link = "link",
	Photo = "photo",
	Video = "video",
	Rich = "rich"
}

export enum ReportCategory {
	Spam = "spam",
	Legal = "legal",
	Violation = "violation",
	Other = "other"
}

export enum StatusVisibility {
	Public = "public",
	Unlisted = "unlisted",
	Private = "private",
	Direct = "direct"
}

export enum SuggestionSource {
	Featured = "featured",
	MostFollowed = "most_followed",
	MostInteractions = "most_interactions",
	SimilarToRecentlyFollowed = "similar_to_recently_followed",
	FriendsOfFriends = "friends_of_friends"
}

// 4.2 is still getting updates as of the time of writing, so I'm including this anyway
export enum SuggestionSourceDeprecated {
	Staff = "staff",
	PastInteractions = "past_interactions",
	Global = "global"
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

export class Context {
	ancestors: Status[];
	descendants: Status[];

	constructor(data: any) {
		this.ancestors = [];
		for(const status of data["ancestors"]) {
			this.ancestors.push(new Status(status));
		}
		this.descendants = [];
		for(const status of data["descendants"]) {
			this.descendants.push(new Status(status));
		}
	}
}

export class Conversation {
	id: string;
	unread: boolean;
	accounts: Account[];
	lastStatus: Status | null;

	constructor(data: any) {
		this.id = data["id"];
		this.unread = data["unread"];
		this.accounts = [];
		for(const account of data["accounts"]) {
			this.accounts.push(new Account(account));
		}
		try {
			this.lastStatus = new Status(data["last_status"]);
		} catch {
			this.lastStatus = null;
		}
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

export class FamiliarFollowers {
	id: string;
	accounts: Account[];

	constructor(data: any) {
		this.id = data["id"];
		this.accounts = [];
		for(const account of data["accounts"]) {
			this.accounts.push(new Account(account));
		}
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

export class Filter {
	id: string;
	title: string;
	context: FilterContext[];
	expiresAt: Date | null;
	filterAction: FilterAction;
	keywords: FilterKeyword[];
	statuses: FilterStatus[];

	constructor(data: any) {
		this.id = data["id"];
		this.title = data["title"];
		this.context = [];
		for(const context of data["context"]) {
			this.context.push(context);
		}
		try {
			this.expiresAt = new Date(data["expires_at"]);
		} catch {
			this.expiresAt = null;
		}
		this.filterAction = data["filter_action"];
		this.keywords = [];
		for(const keyword of data["keywords"]) {
			this.keywords.push(new FilterKeyword(keyword));
		}
		this.statuses = [];
		for(const status of data["statuses"]) {
			this.statuses.push(new FilterStatus(status));
		}
	}
}

export class FilterKeyword {
	id: string;
	keyword: string;
	wholeWord: boolean;

	constructor(data: any) {
		this.id = data["id"];
		this.keyword = data["keyword"];
		this.wholeWord = data["whole_word"];
	}
}

export class FilterResult {
	filter: Filter;
	keywordMatches: String[] | null;
	statusMatches: String[] | null;

	constructor(data: any) {
		this.filter = new Filter(data["filter"]);
		this.keywordMatches = data["keyword_matches"];
		this.statusMatches = data["status_matches"];
	}
}

export class FilterStatus {
	id: string;
	statusId: string;

	constructor(data: any) {
		this.id = data["id"];
		this.statusId = data["status_id"];
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

export class Marker {
	lastReadId: string;
	version: number;
	updatedAt: Date;

	constructor(data: any) {
		this.lastReadId = data["last_read_id"];
		this.version = data["version"];
		this.updatedAt = new Date(data["updated_at"]);
	}
}

export class MediaAttachment {
	/** The ID of the attachment in the database. */
	id: string;
	/** The type of the attachment. */
	type: AttachmentType;
	/** The location of the original full-size attachment. */
	url?: URL;
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
		try {
			this.url = new URL(data["url"]);
		} catch {}
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

export class Poll {
	id: string;
	expiresAt: Date | null;
	expired: boolean;
	multiple: boolean;
	votesCount: number;
	votersCount: number | null;
	options: PollOption[];
	emojis: CustomEmoji[];
	voted?: boolean;
	ownVotes?: number[];

	constructor(data: any) {
		this.id = data["id"];
		try {
			this.expiresAt = new Date(data["expires_at"]);
		} catch {
			this.expiresAt = null;
		}
		this.expired = data["expired"];
		this.multiple = data["multiple"];
		this.votesCount = data["votes_count"];
		this.votersCount = data["voters_count"];
		this.options = [];
		for(const option of data["options"]) {
			this.options.push(new PollOption(option));
		}
		this.emojis = [];
		for(const emoji of data["emojis"]) {
			this.emojis.push(new CustomEmoji(data));
		}
		this.voted = data["voted"] ?? undefined;
		this.ownVotes = data["own_votes"] ?? undefined;
	}
}

export class PollOption {
	title: string;
	votesCount: number | null;

	constructor(data: any) {
		this.title = data["title"];
		this.votesCount = data["votes_count"];
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

export class Report {
	id: string;
	actionTaken: boolean;
	actionTakenAt: Date | null;
	category: ReportCategory;
	comment: string;
	forwarded: boolean;
	createdAt: Date;
	statusIds: string[] | null;
	ruleIds: string[] | null;
	targetAccount: Account;

	constructor(data: any) {
		this.id = data["id"];
		this.actionTaken = data["action_taken"];
		try {
			this.actionTakenAt = new Date(data["action_taken_at"]);
		} catch {
			this.actionTakenAt = null;
		}
		this.category = data["category"];
		this.comment = data["comment"];
		this.forwarded = data["forwarded"];
		this.createdAt = new Date(data["created_at"]);
		this.statusIds = data["status_ids"];
		this.ruleIds = data["rule_ids"];
		this.targetAccount = data["target_account"];
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

export class ScheduledStatus {
	id: string;
	scheduledAt: Date;
	params: Map<string, string | Map<string, string[] | string | boolean> | boolean | StatusVisibility | number | null>;
	mediaAttachments: MediaAttachment[];

	constructor(data: any) {
		this.id = data["id"];
		this.scheduledAt = new Date(data["scheduled_at"]);
		for(const [key, value] of Object.entries(data["params"])) {
			this.params.set(key, value as string | Map<string, string[] | string | boolean> | boolean | StatusVisibility | number | null);
		}
		this.mediaAttachments = [];
		for(const attachment of data["media_attachments"]) {
			this.mediaAttachments.push(new MediaAttachment(attachment));
		}
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
	content: DocumentFragment;
	/** Visibility of this status. */
	visibility: StatusVisibility;
	/** Is this status marked as sensitive content? */
	sensitive: boolean;
	/** Subject or summary line, below which status content is collapsed until expanded. */
	spoilerText: string;
	/** Media that is attached to this status. */
	mediaAttachments: MediaAttachment[]
	/** The application used to post this status. */
	application?: {
		name: string,
		website: URL | null
	}
	/** Mentions of users within the status content. */
	mentions: StatusMention[]
	/** Hashtags used within the status content. */
	tags: StatusTag[]
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
	poll: Poll | null;
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
	filtered?: FilterResult[];

	constructor(data: any | null) {
		if(data == null) {
			return null;
		} else {
			this.id = data["id"];
			this.uri = data["uri"];
			this.createdAt = new Date(data["created_at"]);
			this.account = new Account(data["account"]);

			const parsedContent = new DOMParser().parseFromString(data["content"], "text/html");
			const parsedBodyElement = parsedContent.querySelector("body");
			this.content = new DocumentFragment();
			while(parsedBodyElement.hasChildNodes()) {
				this.content.appendChild(parsedBodyElement.removeChild(parsedBodyElement.firstChild));
			}

			this.visibility = data["visibility"];
			this.sensitive = data["sensitive"];
			this.spoilerText = data["spoiler_text"];
			this.mediaAttachments = data["media_attachments"];
			this.application = data["application"];
			this.mentions = data["mentions"];
			this.tags = data["tags"];
			this.emojis = [];
			for(const emoji of data["emojis"]) {
				this.emojis.push(new CustomEmoji(emoji));
			}
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
			if(data["edited_at"] != null) {
				this.editedAt = new Date(data["edited_at"]);
			} else {
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

export class StatusEdit {
	content: DocumentFragment;
	spoilerText: DocumentFragment;
	sensitive: boolean;
	createdAt: Date;
	account: Account;
	poll?: {
		options: {title: string}[]
	};
	mediaAttachments: MediaAttachment[];
	emojis: CustomEmoji[];

	constructor(data: any) {
		const domParser = new DOMParser();
		this.content = domParser.parseFromString(data["content"], "text/html");
		this.spoilerText = domParser.parseFromString(data["spoiler_text"], "text/html");
		this.sensitive = data["sensitive"];
		this.createdAt = new Date(data["created_at"]);
		this.account = new Account(data["account"]);
		this.poll = data["poll"] ?? undefined;
		this.mediaAttachments = [];
		for(const attachment of data["media_attachments"]) {
			this.mediaAttachments.push(new MediaAttachment(attachment));
		}
		this.emojis = [];
		for(const emoji of data["emojis"]) {
			this.emojis.push(new CustomEmoji(emoji));
		}
	}
}

export class StatusSource {
	id: string;
	text: string;
	spoilerText: string;

	constructor(data: any) {
		this.id = data["id"];
		this.text = data["text"];
		this.spoilerText = data["spoiler_text"];
	}
}

export class Suggestion {
	source?: SuggestionSourceDeprecated;
	sources?: SuggestionSource[];
	account: Account;

	constructor(data: any) {
		try {
			this.sources = data["sources"];
		} catch {
			this.source = data["source"];
		}
		this.account = new Account(data["account"]);
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

export class Translation {
	content: DocumentFragment;
	spoilerText: string;
	poll?: TranslationPoll;
	mediaAttachments: TranslationAttachment[];
	detectedSourceLanguage: Intl.Locale;
	provider: string;

	constructor(data: any) {
		this.content = new DOMParser().parseFromString(data["content"], "text/html");
		this.spoilerText = data["spoiler_text"];
		try {
			this.poll = new TranslationPoll(data["poll"]);
		} catch {}
		this.mediaAttachments = [];
		for(const attachment of data["media_attachments"]) {
			this.mediaAttachments.push(new TranslationAttachment(attachment));
		}
		this.detectedSourceLanguage = new Intl.Locale(data["detected_source_language"]);
		this.provider = data["provider"];
	}
}

export class TranslationAttachment {
	id: string;
	description: string;

	constructor(data: any) {
		this.id = data["id"];
		this.description = data["description"];
	}
}

export class TranslationPoll {
	id: string;
	options: TranslationPollOption[];

	constructor(data: any) {
		this.id = data["id"];
		this.options = [];
		for(const option of data["options"]) {
			this.options.push(new TranslationPollOption(option));
		}
	}
}

export class TranslationPollOption {
	title: string;

	constructor(data: any) {
		this.title = data["title"];
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

export async function fetchFromInstance(
	endpoint: URL,
	token?: string,
	searchParams?: {key: string, value: string}[],
	method?: string,
	body?: any
): Promise<Response> {
	const requestInit: RequestInit = {};

	if(method) {
		requestInit.method = method;
	}

	if(token) {
		(requestInit.headers as any)["Authorization"] = `Bearer ${token}`;
	}

	if(body) {
		(requestInit.headers as any)["Content-Type"] = "application/json";
		requestInit.body = JSON.stringify(body);
	}

	if(searchParams) {
		for(const pair of searchParams) {
			endpoint.searchParams.append(pair.key, pair.value);
		}
	}

	return fetch(endpoint, requestInit);
}