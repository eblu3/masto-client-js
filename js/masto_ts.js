var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as env from "../.env.js";
import * as mastodon from "./modules/mastodon.mjs";
export var Timelines;
(function (Timelines) {
    Timelines["Public"] = "/api/v1/timelines/public";
    Timelines["Hashtag"] = "/api/v1/timelines/tag/";
    Timelines["Home"] = "/api/v1/timelines/home";
})(Timelines || (Timelines = {}));
const instanceUrl = env.instanceUrl;
export var timeline;
export var tag;
console.log(env.token);
let token = env.token;
let lastStatusId = "";
function getTimeline(url, endpoint, tag, startAtId) {
    return __awaiter(this, void 0, void 0, function* () {
        let newEndpoint = endpoint;
        if (endpoint === Timelines.Hashtag) {
            newEndpoint = newEndpoint + tag;
        }
        console.log(`Fetching timeline ${newEndpoint} from instance ${url}...`);
        try {
            let response;
            if (startAtId) {
                response = yield fetch(new URL(`${newEndpoint}?max_id=${startAtId}`, url), {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
            }
            else {
                response = yield fetch(new URL(newEndpoint, url), {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
            }
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const json = yield response.json();
            console.log("Got it!");
            console.log(json);
            return json;
        }
        catch (error) {
            console.error(error.message);
            return null;
        }
    });
}
function getStatus(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let response;
            if (token) {
                response = yield fetch(new URL(`/api/v1/statuses/${id}`, instanceUrl), {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
            }
            else {
                response = yield fetch(new URL(`/api/v1/statuses/${id}`, instanceUrl));
            }
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const status = new mastodon.Status(yield response.json());
            return status;
        }
        catch (error) {
            console.error(error.message);
            return null;
        }
    });
}
function renderAttachments(attachments) {
    let out = [];
    console.log(attachments);
    for (let attachment of attachments) {
        console.log(attachment);
        if (attachment.type === mastodon.AttachmentType.Image) {
            const image = document.createElement("img");
            image.setAttribute("src", attachment.url.toString());
            if (attachment.description) {
                image.setAttribute("alt", attachment.description);
            }
            out.push(image);
        }
        else if (attachment.type === mastodon.AttachmentType.GIFV) {
            const gifv = document.createElement("video");
            const gifvSource = document.createElement("source");
            gifv.setAttribute("autoplay", "true");
            gifv.setAttribute("loop", "true");
            gifvSource.setAttribute("src", attachment.url.toString());
            if (attachment.description) {
                gifv.setAttribute("aria-label", attachment.description);
            }
            gifv.appendChild(gifvSource);
            out.push(gifv);
        }
        else if (attachment.type === mastodon.AttachmentType.Video) {
            const video = document.createElement("video");
            const videoSource = document.createElement("source");
            video.setAttribute("controls", "true");
            videoSource.setAttribute("src", attachment.url.toString());
            if (attachment.description) {
                video.setAttribute("aria-label", attachment.description);
            }
            video.appendChild(videoSource);
            out.push(video);
        }
        else if (attachment.type === mastodon.AttachmentType.Audio) {
            const audio = document.createElement("audio");
            audio.setAttribute("controls", "true");
            audio.setAttribute("src", attachment.url.toString());
            if (attachment.description) {
                audio.setAttribute("aria-label", attachment.description);
            }
            out.push(audio);
        }
        else {
            const attachmentLink = document.createElement("a");
            attachmentLink.setAttribute("href", attachment.url.toString());
            attachmentLink.innerText = `[📎 ${attachment.description}]`;
            out.push(attachmentLink);
        }
        return out;
    }
}
function renderEmojis(str, emojis) {
    let processedString = str;
    for (const emoji of emojis) {
        console.log(`replacing emoji ${emoji.shortcode}...`);
        processedString = processedString.replaceAll(`:${emoji.shortcode}:`, `<img class=\"custom-emoji\" src=\"${emoji.url.toString()}\" alt=\"${emoji.shortcode}\" />`);
    }
    if (emojis.length > 0) {
        console.log(processedString);
    }
    return processedString;
}
function removeTrailingLink(postContent) {
    let processedPostContent = new DOMParser().parseFromString(postContent, "text/html");
    const allLinks = processedPostContent.getElementsByTagName("a");
    for (let i = allLinks.length - 1; i >= 0; i--) {
        const linkElement = allLinks[i];
        var linkClass = linkElement.getAttribute("class");
        var lastChild = processedPostContent.body.lastChild;
        if (lastChild.hasChildNodes && lastChild.lastChild.nodeType != Node.TEXT_NODE) {
            lastChild = lastChild.lastChild;
        }
        if (linkElement == lastChild) {
            console.log(linkElement);
            console.log(lastChild);
            if (linkClass == null || (linkClass.indexOf("mention") === -1 && linkClass.indexOf("hashtag") === -1)) {
                linkElement.remove();
                break;
            }
        }
    }
    return processedPostContent.documentElement.innerHTML;
}
function renderStatusAccountInfo(account) {
    let out = document.createElement("address");
    const avatar = document.createElement("img");
    const infoContainer = document.createElement("div");
    const displayName = document.createElement("span");
    const handle = document.createElement("span");
    avatar.setAttribute("class", "avatar");
    avatar.setAttribute("src", account.avatar.toString());
    displayName.setAttribute("class", "display-name");
    if (account.displayName) {
        displayName.innerHTML = `<a href=\"${account.url.toString()}\">${renderEmojis(account.displayName, account.emojis)}</a>`;
    }
    else {
        displayName.innerHTML = `<a href=\"${account.url.toString()}\">${account.username}</a>`;
    }
    handle.setAttribute("class", "account-handle");
    handle.innerText = `@${account.acct}`;
    infoContainer.appendChild(displayName);
    infoContainer.appendChild(document.createElement("br"));
    infoContainer.appendChild(handle);
    out.appendChild(avatar);
    out.appendChild(infoContainer);
    return out;
}
function renderCard(card) {
    let out = document.createElement("a");
    let cardContainer = document.createElement("div");
    let cardTitle = document.createElement("h2");
    let cardDesc = document.createElement("p");
    out.setAttribute("href", card.url.toString());
    cardContainer.setAttribute("class", "embed-card");
    if (card.image != null) {
        let cardImage = document.createElement("img");
        cardImage.setAttribute("src", card.image.toString());
        cardImage.setAttribute("width", card.width.toString());
        cardImage.setAttribute("height", card.height.toString());
        cardContainer.appendChild(cardImage);
    }
    cardTitle.innerText = card.title;
    cardDesc.innerText = card.description;
    cardContainer.appendChild(cardTitle);
    cardContainer.appendChild(cardDesc);
    out.appendChild(cardContainer);
    return out;
}
function renderStatus(status, label) {
    if (status.reblog) {
        let label = document.createElement("p");
        label.innerHTML = `🔁 <span class=\"display-name\">${renderEmojis(status.account.displayName, status.account.emojis)}</span> boosted`;
        return renderStatus(status.reblog, label = label);
    }
    let out = document.createElement("article");
    if (status.language) {
        out.setAttribute("lang", status.language.language);
    }
    if (label) {
        out.appendChild(label);
    }
    out.appendChild(renderStatusAccountInfo(status.account));
    console.log(status.card);
    if (status.sensitive || status.spoilerText != "") {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.setAttribute("class", "content-warning");
        if (status.spoilerText != "") {
            summary.innerText = `⚠️ ${status.spoilerText}`;
        }
        else {
            summary.innerText = "⚠️ Sensitive content";
        }
        details.appendChild(summary);
        if (status.card != null) {
            details.innerHTML += removeTrailingLink(renderEmojis(status.content, status.emojis));
        }
        else {
            details.innerHTML += renderEmojis(status.content, status.emojis);
        }
        if (status.mediaAttachments.length > 0) {
            for (const attachment of renderAttachments(status.mediaAttachments)) {
                details.appendChild(attachment);
            }
        }
        if (status.card != null) {
            details.appendChild(renderCard(status.card));
        }
        out.appendChild(details);
    }
    else {
        if (status.card != null) {
            out.innerHTML += removeTrailingLink(renderEmojis(status.content, status.emojis));
        }
        else {
            out.innerHTML += renderEmojis(status.content, status.emojis);
        }
        if (status.mediaAttachments.length > 0) {
            for (const attachment of renderAttachments(status.mediaAttachments)) {
                out.appendChild(attachment);
            }
        }
        if (status.card != null) {
            out.appendChild(renderCard(status.card));
        }
    }
    const statusTimeContainer = document.createElement("p");
    const statusTime = document.createElement("time");
    statusTime.setAttribute("datetime", status.createdAt.toISOString());
    statusTime.innerText = status.createdAt.toLocaleString();
    statusTimeContainer.appendChild(statusTime);
    out.appendChild(statusTimeContainer);
    return out;
}
export function renderTimeline() {
    getTimeline(instanceUrl, timeline, tag, lastStatusId).then((data) => {
        let statuses = new DocumentFragment();
        for (const status of data) {
            statuses.appendChild(renderStatus(new mastodon.Status(status)));
        }
        document.getElementById("timeline").appendChild(statuses);
        lastStatusId = data[data.length - 1]["id"];
    });
}
export function renderStatusPage(id) {
    getStatus(id).then((status) => {
        document.body.appendChild(renderStatus(status));
    });
}
export function setTimeline(endpoint) {
    timeline = endpoint;
}
export function setTag(newTag) {
    tag = newTag;
}
export function resetLastStatus() {
    lastStatusId = "";
}
//# sourceMappingURL=masto_ts.js.map