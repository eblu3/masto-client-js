const tagToSearch = new URLSearchParams(document.location.search).get("tag");

document.title = `#${tagToSearch}`;

(document.getElementById("tag-input") as HTMLInputElement).value = `${tagToSearch}`; 

document.getElementById("tag-input")?.addEventListener("change", (event) => {
	const newTag = (event.target as HTMLInputElement).value;
	document.getElementById("timeline-component")?.setAttribute("tag", newTag);
	document.title = `#${newTag}`;
	
	const url = new URL(location.href);
	url.searchParams.set("tag", newTag);
		
	history.pushState({}, "", url);
});

tagToSearch ? document.getElementById("timeline-component")?.setAttribute("tag", tagToSearch) : document.getElementById("timeline-component")?.removeAttribute("tag");