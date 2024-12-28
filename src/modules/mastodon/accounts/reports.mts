import {Report, ReportCategory} from "../mastodon.mjs";

export async function fileReport(
	instanceUrl: URL,
	token: string,
	accountId: string,
	statusIds?: string[],
	comment?: string,
	forward?: boolean,
	category?: ReportCategory,
	ruleIds?: string[]
): Promise<Report> {
	const requestBody = {
		"account_id": accountId,
		"status_ids": [""],
		"comment": "",
		"forward": false,
		"category": "",
		"rule_ids": [""]
	};

	if(statusIds) {
		requestBody.status_ids = statusIds;
	} else {
		delete requestBody.status_ids;
	}
	if(comment && comment.length < 1000) {
		requestBody.comment = comment;
	} else {
		console.warn("Report comment cannot be more than 1,000 characters in length. Sending without comment.");
		delete requestBody.comment;
	}
	if(forward != undefined) {
		requestBody.forward = forward;
	} else {
		delete requestBody.forward;
	}
	if(category) {
		requestBody.category = category;
	} else {
		delete requestBody.category;
	}
	if(ruleIds) {
		requestBody.rule_ids = ruleIds;
	} else {
		delete requestBody.rule_ids;
	}

	const response = await fetch(new URL("/api/v1/reports", instanceUrl), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestBody)
	});

	if(response.ok) {
		return new Report(await response.json());
	} else {
		try {
			const json = await response.json();
			console.error(json["error"]);
		} catch {
			console.error(response.statusText);
		}
	}
}