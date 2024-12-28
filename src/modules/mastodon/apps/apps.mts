import {Application, CredentialApplication} from "../mastodon.mjs";

export * as oauth from "./oauth.mjs";
export * as emails from "./emails.mjs";

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