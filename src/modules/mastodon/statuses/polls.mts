import {Poll} from "../mastodon.mjs";

export async function getPoll(instanceUrl: URL, id: string, token?: string): Promise<Poll> {
	const response = await fetch(new URL(`/api/v1/polls/${id}`, instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		return new Poll(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function vote(
	instanceUrl: URL,
	token: string,
	id: string,
	choices: number[]
): Promise<Poll> {
	const response = await fetch(new URL(`/api/v1/polls/${id}/votes`, instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			choices: choices
		})
	});

	if(response.ok) {
		return new Poll(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}