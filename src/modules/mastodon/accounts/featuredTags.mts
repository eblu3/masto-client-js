import {FeaturedTag, Tag} from "../mastodon.mjs";

export async function featureTag(instanceUrl: URL, token: string, name: string): Promise<FeaturedTag> {
	if(name.charAt(0) === "#") {
		name = name.substring(1);
	}

	const response = await fetch(new URL("/api/v1/featured_tags", instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify({"name": name})
	});

	if(response.ok) {
		return new FeaturedTag(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function unfeatureTag(instanceUrl: URL, token: string, id: string) {
	const response = await fetch(new URL(`/api/v1/featured_tags/${id}`, instanceUrl), {
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

export async function getSuggestedFeaturedTags(instanceUrl: URL, token: string): Promise<Tag[]> {
	const response = await fetch(new URL("/api/v1/featured_tags/suggestions", instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: Tag[] = [];

		for(const tag of json) {
			out.push(new Tag(tag));
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