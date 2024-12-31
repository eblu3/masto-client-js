const providers: {
	provider_name: string,
	provider_url: string,
	endpoints: {schemes: string[], url: string}[]
}[] = await (await fetch("/node_modules/oembed-providers/providers.json")).json();

export enum ResourceType {
	Photo = "photo",
	Video = "video",
	Link = "link",
	Rich = "rich"
}

export class Response {
	type: ResourceType;
	version: string;
	title?: string;
	authorName?: string;
	authorUrl?: URL;
	providerName?: string;
	providerUrl?: URL;
	cacheAge?: number;
	thumbnailUrl?: URL;
	thumbnailWidth?: number;
	thumbnailHeight?: number;

	constructor(data: any) {
		this.type = data["type"];
		this.version = data["version"];
		this.title = data["title"];
		this.authorName = data["author_name"];
		try {
			this.authorUrl = new URL(data["author_url"]);
		} catch {}
		this.providerName = data["provider_name"];
		try {
			this.providerUrl = new URL(data["provider_url"]);
		} catch {}
		this.cacheAge = data["cache_age"];
		try {
			this.thumbnailUrl = new URL(data["thumbnail_url"]);
		} catch {}
		this.thumbnailWidth = data["thumbnail_width"];
		this.thumbnailHeight = data["thumbnail_height"];
	}
}

export class PhotoResponse extends Response {
	url: URL;
	width: number;
	height: number;

	constructor(data: any) {
		super(data);

		this.url = new URL(data["url"]);
		this.width = data["width"];
		this.height = data["height"];
	}
}

export class VideoResponse extends Response {
	html: Document;
	width: number;
	height: number;

	constructor(data: any) {
		super(data);

		this.html = new DOMParser().parseFromString(data["html"], "text/html");
		this.width = data["width"];
		this.height = data["height"];
	}
}

export class LinkResponse extends Response {
	constructor(data: any) {
		super(data);
	}
}

export class RichResponse extends Response {
	html: Document;
	width: number;
	height: number;

	constructor(data: any) {
		super(data);

		this.html = new DOMParser().parseFromString(data["html"], "text/html");
		this.width = data["width"];
		this.height = data["height"];
	}
}

export async function getoEmbed(url: URL): Promise<PhotoResponse | VideoResponse | LinkResponse | RichResponse | Response> {
	let provider: {
		provider_name: string,
		provider_url: string,
		endpoints: {schemes: string[], url: string}[]
	};
	let endpoint: {schemes: string[], url: string};

	if(url.hostname == "www.tumblr.com") {
		url = handleTumblrLink(url); // tumblr oembeds can't really do new tumblr links so we hardcode a converter to the old one here
	}

	for(const site of providers) {
		if(provider) {
			break;
		}
		
		if(url.origin == site.provider_url || url.origin + "/" == site.provider_url) {
			console.log(`setting provider to ${site.provider_name}`);
			provider = site;
			break;
		}

		for(const oendpoint of site.endpoints) {
			if(oendpoint.schemes) {
				for(const scheme of oendpoint.schemes) {
					if(url.href.match(wildcardToRegex(scheme))) {
						console.log(`setting endpoint to ${oendpoint.url}`);
						endpoint = oendpoint;
						break;
					}
				}
			}
		}
	}

	if(provider) {
		for(const oendpoint of provider.endpoints) {
			for(const scheme of oendpoint.schemes) {
				if(url.href.match(wildcardToRegex(scheme))) {
					console.log(`setting endpoint to ${oendpoint.url}`);
					endpoint = oendpoint;
					break;
				}
			}
		}
	}

	if(endpoint) {
		const fetchEndpoint = new URL(endpoint.url);
		fetchEndpoint.searchParams.set("format", "json");
		fetchEndpoint.searchParams.set("url", url.href);

		const response = await (await fetch(fetchEndpoint)).json();

		switch(response.type) {
			case ResourceType.Photo:
				return new PhotoResponse(response);
			case ResourceType.Video:
				return new VideoResponse(response);
			case ResourceType.Link:
				return new LinkResponse(response);
			case ResourceType.Rich:
				return new RichResponse(response);
			default:
				return new Response(response);
		}
	} else {
		console.log("no provider, attempting to get oembed link from html");
		const firstFetch = await fetch(url);

		let oEmbedUrl: URL;

		const ffLinks = new DOMParser().parseFromString(await firstFetch.text(), "text/html").getElementsByTagName("link");
		for(let i = 0; i < ffLinks.length; i++) {
			if(ffLinks.item(i).type = "application/json+oembed") {
				oEmbedUrl = new URL(ffLinks.item(i).href);
			}
		}

		const response = await (await fetch(oEmbedUrl)).json();

			switch(response.type) {
				case ResourceType.Photo:
					return new PhotoResponse(response);
				case ResourceType.Video:
					return new VideoResponse(response);
				case ResourceType.Link:
					return new LinkResponse(response);
				case ResourceType.Rich:
					return new RichResponse(response);
				default:
					return new Response(response);
			}
	}
}

function wildcardToRegex(wcstring: string): string {
	let out = wcstring;

	out = out.replaceAll(`/`, `\\/`);
	out = out.replaceAll(`.`, `\\.`);
	out = out.replaceAll(`*`, `.+`);

	return out;
}

function handleTumblrLink(url: URL): URL {
	const urlPath = url.pathname.split("/");
	return new URL(`https://${urlPath[1]}.tumblr.com/post/${urlPath[2]}/${urlPath[3]}`);
}