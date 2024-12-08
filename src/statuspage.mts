const statusId = new URLSearchParams(document.location.search).get("id");

statusId ? document.getElementById("status")?.setAttribute("statusid", statusId) : document.getElementById("status")?.removeAttribute("statusid");