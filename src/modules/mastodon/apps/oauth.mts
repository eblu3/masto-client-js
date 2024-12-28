import {Token} from "../mastodon.mjs";

/**
 * Displays an authorization form to the user. If approved, it will create and return an authorization code, then redirect to the desired `redirect_uri`. The authorization code can be used while requesting a token to obtain access to user-level methods.
 * @param instanceUrl The URL of the instance to log in to.
 * @param clientId The client ID, obtained during app registration.
 * @param redirectUri Set a URI to redirect the user to. Must match one of the `redirect_uris` declared during app registration.
 * @param scope List of requested [OAuth scopes](https://docs.joinmastodon.org/api/oauth-scopes/). Must be a subset of `scopes` declared during app registration. If not provided, defaults to `read`.
 * @param state Arbitrary value to passthrough when the user authorizes or rejects the authorization request.
 * @param codeChallenge The [PKCE code challenge](https://docs.joinmastodon.org/spec/oauth/#pkce) for the authorization request.
 * @param forceLogin Forces the user to re-login, which is necessary for authorizing with multiple accounts from the same instance.
 * @param lang The ISO 639-1 two-letter language code to use while rendering the authorization form. Defaults to the browser's current language.
 */
export async function authorizeUser(
	instanceUrl: URL,
	clientId: string,
	redirectUri: string,
	scope?: string | string[],
	state?: string,
	codeChallenge?: string,
	forceLogin?: boolean,
	lang: string = new Intl.Locale(navigator.language).language
) {
	const endpoint = new URL("/oauth/authorize", instanceUrl);

	endpoint.searchParams.set("response_type", "code");
	endpoint.searchParams.set("client_id", clientId);
	endpoint.searchParams.set("redirect_uri", redirectUri);
	if(scope) {
		endpoint.searchParams.set("scope", typeof scope === "string" ? scope : scope.join("+"));
	}
	if(state) {
		endpoint.searchParams.set("state", state);
	}
	if(codeChallenge) {
		endpoint.searchParams.set("code_challenge", codeChallenge);
		endpoint.searchParams.set("code_challenge_method", "S256");
	}
	if(forceLogin != undefined) {
		endpoint.searchParams.set("force_login", String(forceLogin));
	}
	endpoint.searchParams.set("lang", lang);

	open(endpoint, "_blank");
}

export async function obtainToken(
	instanceUrl: URL,
	grantType: string,
	code: string,
	clientId: string,
	clientSecret: string,
	redirectUri: string,
	codeVerifier?: string,
	scope: string[] = ["read"]
): Promise<Token> {
	let requestBody = {
		"grant_type": grantType,
		"code": code,
		"client_id": clientId,
		"client_secret": clientSecret,
		"redirect_uri": redirectUri,
		"code_verifier": "",
		"scope": [""]
	};

	if(codeVerifier) {
		requestBody.code_verifier = codeVerifier;
	} else {
		delete requestBody.code_verifier;
	}
	if(scope) {
		requestBody.scope = scope;
	} else {
		delete requestBody.scope;
	}

	console.log(requestBody);
	console.log(JSON.stringify(requestBody));

	const response = await fetch(new URL("/oauth/token", instanceUrl), {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestBody)
	});

	if(response.ok) {
		return new Token(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(`${json["error"]}: ${json["error_description"]}`);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function revokeToken(
	instanceUrl: URL,
	clientId: string,
	clientSecret: string,
	token: string
) {
	const requestBody = {
		"client_id": clientId,
		"client_secret": clientSecret,
		"token": token
	};

	const response = await fetch(new URL("/oauth/revoke", instanceUrl), {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestBody)
	});

	if(!response.ok) {
		try {
			const json = await response.json();
			console.error(`${json["error"]}: ${json["error_description"]}`);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function getOAuthConfiguration(instanceUrl: URL): Promise<object> {
	const response = await fetch(new URL("/.well-known/oauth-authorization-server", instanceUrl));

	if(!response.ok) {
		console.error(response.statusText);
	} else {
		return await response.json();
	}
}