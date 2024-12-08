import { renderStatusPage } from "./modules/masto_ts.mjs";

const statusId = new URLSearchParams(document.location.search).get("id");

document.getElementById("status").setAttribute("statusid", statusId);

export {};