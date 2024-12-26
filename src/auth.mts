const params = new URLSearchParams(document.location.search);

if(params.has("code")) {
	localStorage.setItem("authCode", params.get("code"));
}

close();