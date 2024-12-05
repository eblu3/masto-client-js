export async function getInclude(url: URL): Promise<DocumentFragment> | null {
	try {
		let include = new DocumentFragment();
		let response = await fetch(url);

		if(!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const includeHTML = await response.text();
		new DOMParser().parseFromString(includeHTML, "text/html").querySelectorAll("*").forEach((node: HTMLElement) => {
			include.appendChild(node);
		})

		return include;
	} catch(error) {
		console.error(error.message);
		return null;
	}
}