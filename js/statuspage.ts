import { renderStatusPage } from "./masto_ts.js";

const statusId = new URLSearchParams(document.location.search).get("id");

renderStatusPage(statusId);

export {};