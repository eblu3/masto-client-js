import {MediaAttachment} from "../mastodon.mjs";

export async function uploadMedia(
	instanceUrl: URL,
	token: string,
	file: File,
	thumbnail?: File,
	description?: string,
	focus?: {x: number, y: number}
): Promise<MediaAttachment> {
	const formData = new FormData();

	formData.set("file", file);
	if(thumbnail) {
		formData.set("thumbnail", thumbnail);
	}
	if(description) {
		formData.set("description", description);
	}
	if(focus) {
		formData.set("focus", `${focus.x},${focus.y}`);
	}

	const response = await fetch(new URL("/api/v2/media", instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`
		},
		body: formData
	});

	if(response.ok) {
		return new MediaAttachment(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function getAttachment(instanceUrl: URL, token: string, id: string): Promise<MediaAttachment | null> {
	const response = await fetch(new URL(`/api/v1/media/${id}`, instanceUrl), {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});

	if(response.ok) {
		if(response.status == 200) {
			return new MediaAttachment(await response.json());
		} else if(response.status == 206) {
			return null;
		}
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}

export async function updateAttachment(
	instanceUrl: URL,
	token: string,
	id: string,
	thumbnail?: File,
	description?: string,
	focus?: {x: number, y: number}
): Promise<MediaAttachment> {
	const formData = new FormData();

	if(thumbnail) {
		formData.set("thumbnail", thumbnail);
	}
	if(description) {
		formData.set("description", description);
	}
	if(focus) {
		formData.set("focus", `${focus.x},${focus.y}`);
	}

	const response = await fetch(new URL(`/api/v1/media/${id}`, instanceUrl), {
		method: "PUT",
		headers: {
			"Authorization": `Bearer ${token}`
		},
		body: formData
	});

	if(response.ok) {
		return new MediaAttachment(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}