import {CustomEmoji} from "../mastodon.mjs";

export async function getCustomEmojis(instanceUrl: URL): Promise<CustomEmoji[]> | null {
	try {
		const response = await fetch(new URL("/api/v1/custom_emojis", instanceUrl));

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		const out: CustomEmoji[] = [];

		for(const emoji of json) {
			out.push(new CustomEmoji(emoji));
		}

		return out;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}