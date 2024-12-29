import {CredentialAccount} from "../mastodon.mjs";

export async function deleteAvatar(instanceUrl: URL, token: string): Promise<CredentialAccount> {
	const response = await fetch(new URL("/api/v1/profile/avatar", instanceUrl), {
		method: "DELETE",
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

export async function deleteHeader(instanceUrl: URL, token: string): Promise<CredentialAccount> {
	const response = await fetch(new URL("/api/v1/profile/header", instanceUrl), {
		method: "DELETE",
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