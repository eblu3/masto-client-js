import {DomainBlock, ExtendedDescription, Instance, Rule} from "../mastodon.mjs";

export * as trends from "./trends.mjs";
export * as directory from "./directory.mjs";
export * as customEmojis from "./customEmojis.mjs";
export * as announcements from "./announcements.mjs";

export async function getServerInformation(instanceUrl: URL): Promise<Instance> | null {
	try {
		const response = await fetch(new URL("/api/v2/instance", instanceUrl));

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		return new Instance(await response.json());
	} catch (error) {
		console.error(error.message);
		return null;
	}
}

/**
 * Queries an instance to get what domains that it is aware of.
 * @param instanceUrl The URL of the instance to query.
 * @param token The token of a logged in user. Required if this instance is in whitelist mode.
 * @returns An array of strings representing the domains that the instance is aware of, or `null` if there was an error.
 */
export async function getConnectedDomains(instanceUrl: URL, token?: string): Promise<string[]> | null {
	try {
		let response;

		if(token) {
			response = await fetch(new URL("/api/v1/instance/peers", instanceUrl), {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		} else {
			response = await fetch(new URL("/api/v1/instance/peers", instanceUrl));
		}

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		return await response.json();
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getWeeklyActivity(instanceUrl: URL, token?: string): Promise<object[]> | null {
	try {
		let response;

		if(token) {
			response = await fetch(new URL("/api/v1/instance/activity", instanceUrl), {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		} else {
			response = await fetch(new URL("/api/v1/instance/activity", instanceUrl));
		}

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: object[] = [];

		for(const hash of json) {
			out.push({
				week: new Date(Number(hash["week"])*1000),
				statuses: hash["statuses"],
				logins: hash["logins"],
				registrations: hash["registrations"]
			});
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getRules(instanceUrl: URL): Promise<Rule[]> | null {
	try {
		const response = await fetch(new URL("/api/v1/instance/rules", instanceUrl));

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		return await response.json();
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getModeratedServers(instanceUrl: URL, token?: string): Promise<DomainBlock[]> | null {
	try {
		let response;

		if(token) {
			response = await fetch(new URL("/api/v1/instance/domain_blocks", instanceUrl), {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		} else {
			response = await fetch(new URL("/api/v1/instance/domain_blocks", instanceUrl));
		}

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: DomainBlock[] = [];

		for(const blockObject of json) {
			out.push(new DomainBlock(blockObject));
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getExtendedDescription(instanceUrl: URL): Promise<ExtendedDescription> | null {
	try {
		const response = await fetch(new URL("/api/v1/instance/extended_description", instanceUrl));

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		return new ExtendedDescription(await response.json());
	} catch(error) {
		console.error(error.message);
		return null;
	}
}

export async function getTranslationLanguages(instanceUrl: URL): Promise<object> | null {
	try {
		const response = await fetch(new URL("/api/v1/instance/translation_languages", instanceUrl));

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		return await response.json();
	} catch(error) {
		console.error(error.message);
		return null;
	}
}