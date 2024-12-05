export var AttachmentType;
(function (AttachmentType) {
    AttachmentType["Unknown"] = "unknown";
    AttachmentType["Image"] = "image";
    AttachmentType["GIFV"] = "gifv";
    AttachmentType["Video"] = "video";
    AttachmentType["Audio"] = "audio";
})(AttachmentType || (AttachmentType = {}));
export var PreviewCardType;
(function (PreviewCardType) {
    PreviewCardType["Link"] = "link";
    PreviewCardType["Photo"] = "photo";
    PreviewCardType["Video"] = "video";
    PreviewCardType["Rich"] = "rich";
})(PreviewCardType || (PreviewCardType = {}));
export class Account {
    constructor(data) {
        var _a, _b, _c, _d, _e, _f;
        if (data == undefined) {
            return undefined;
        }
        else {
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
            this.fields = data["fields"];
            this.emojis = data["emojis"];
            this.bot = data["bot"];
            this.group = data["group"];
            this.discoverable = (_a = data["discoverable"]) !== null && _a !== void 0 ? _a : null;
            this.noindex = (_b = data["noindex"]) !== null && _b !== void 0 ? _b : undefined;
            this.moved = (_c = new Account(data["moved"])) !== null && _c !== void 0 ? _c : undefined;
            this.suspended = (_d = data["suspended"]) !== null && _d !== void 0 ? _d : undefined;
            this.limited = (_e = data["limited"]) !== null && _e !== void 0 ? _e : undefined;
            this.createdAt = new Date(data["created_at"]);
            this.lastStatusAt = (_f = new Date(data["last_status_at"])) !== null && _f !== void 0 ? _f : null;
            this.statusesCount = data["statuses_count"];
            this.followersCount = data["followers_count"];
            this.followingCount = data["following_count"];
        }
    }
}
export class CustomEmoji {
    constructor(data) {
        this.shortcode = data["shortcode"];
        this.url = new URL(data["url"]);
        this.staticUrl = new URL(data["static_url"]);
        this.visibleInPicker = data["visible_in_picker"];
        this.category = data["category"];
    }
}
export class PreviewCard {
    constructor(data) {
        this.url = new URL(data["url"]);
        this.title = data["title"];
        this.description = data["description"];
        this.type = data["type"];
        this.authors = data["authors"];
        this.authorName = data["author_name"];
        try {
            this.authorUrl = new URL(data["author_url"]);
        }
        catch (_a) {
            this.authorUrl = null;
        }
        this.providerName = data["provider_name"];
        try {
            this.providerUrl = new URL(data["provider_url"]);
        }
        catch (_b) {
            this.providerUrl = null;
        }
        this.html = data["html"];
        this.width = data["width"];
        this.height = data["height"];
        try {
            this.image = new URL(data["image"]);
        }
        catch (_c) {
            this.image = null;
        }
        this.embedUrl = data["embed_url"];
        this.blurhash = data["blurhash"];
    }
}
export class PreviewCardAuthor {
    constructor(data) {
        this.name = data["name"];
        this.url = new URL(data["url"]);
        try {
            this.account = new Account(data["account"]);
        }
        catch (_a) {
            this.account = null;
        }
    }
}
export class Status {
    constructor(data) {
        if (data == null) {
            return null;
        }
        else {
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
            }
            catch (_a) {
                this.url = null;
            }
            this.inReplyToId = data["in_reply_to_id"];
            this.inReplyToAccountId = data["in_reply_to_account_id"];
            if (data["reblog"]) {
                this.reblog = new Status(data["reblog"]);
            }
            else {
                this.reblog = null;
            }
            this.poll = data["poll"];
            if (data["card"]) {
                this.card = new PreviewCard(data["card"]);
            }
            else {
                this.card = null;
            }
            try {
                this.language = new Intl.Locale(data["language"]);
            }
            catch (_b) {
                this.language = null;
            }
            this.text = data["text"];
            try {
                this.editedAt = new Date(data["editedAt"]);
            }
            catch (_c) {
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
    constructor(data) {
        this.id = data["id"];
        this.type = data["type"];
        this.url = new URL(data["url"]);
        try {
            this.previewUrl = new URL(data["preview_url"]);
        }
        catch (_a) {
            this.previewUrl = null;
        }
        try {
            this.remoteUrl = new URL(data["remote_url"]);
        }
        catch (_b) {
            this.remoteUrl = null;
        }
        this.meta = data["meta"];
        this.description = data["description"];
        this.blurhash = data["blurhash"];
    }
}
//# sourceMappingURL=mastodon.mjs.map