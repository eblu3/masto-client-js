export async function getUserPreferences(instanceUrl: URL, token: string): Promise<Map<string, string>> {
	const response = await fetch(new URL("/api/v1/preferences", instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		const json = await response.json();
		let out = new Map<string, string>();

		for(const [key, value] of Object.entries(json)) {
			out.set(key, value as string);
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