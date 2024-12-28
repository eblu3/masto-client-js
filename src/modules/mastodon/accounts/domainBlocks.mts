// TODO: link header
export async function getBlockedDomains(
	instanceUrl: URL,
	token: string,
	limit?: number
): Promise<string[]> {
	const endpoint = new URL("/api/v1/domain_blocks", instanceUrl);

	if(limit) {
		if(limit > 0 && limit <= 200) {
			endpoint.searchParams.set("limit", String(limit));
		} else {
			console.warn(`Set limit to ${limit} but Mastodon only supports returning between 1 and 200 domain blocks. Defaulting to 100.`);
		}
	}

	const response = await fetch(endpoint, {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out: string[] = [];

		for(const domain of json) {
			out.push(domain);
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

export async function blockDomain(instanceUrl: URL, token: string, domain: string) {
	const endpoint = new URL("/api/v1/domain_blocks", instanceUrl);

	endpoint.searchParams.set("domain", domain);

	const response = await fetch(endpoint, {
		method: "POST",
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

export async function unblockDomain(instanceUrl: URL, token: string, domain: string) {
	const endpoint = new URL("/api/v1/domain_blocks", instanceUrl);

	endpoint.searchParams.set("domain", domain);

	const response = await fetch(endpoint, {
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