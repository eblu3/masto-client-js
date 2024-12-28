export async function resendConfirmationEmail(instanceUrl: URL, token: string, email: string) {
	let response;

	if(email) {
		response = await fetch(new URL("/api/v1/emails/confirmations", instanceUrl), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({"email": email})
		});
	} else {
		response = await fetch(new URL("/api/v1/emails/confirmations", instanceUrl), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});
	}

	if(!response.ok) {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}