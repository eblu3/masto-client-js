import {Filter} from "../mastodon.mjs";

export async function getAllFilters(instanceUrl: URL, token: string): Promise<Filter[]> {
	const response = await fetch(new URL("/api/v2/filters", instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: Filter[] = [];

		for(const filter of json) {
			out.push(new Filter(filter));
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

export async function getFilter(instanceUrl: URL, token: string, id: string) {
	
}