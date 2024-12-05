import { setInstanceUrl, renderStatusPage } from "./masto_ts.js";
const statusId = new URLSearchParams(document.location.search).get("id");
setInstanceUrl(new URL("https://wetdry.world"));
renderStatusPage(statusId);
//# sourceMappingURL=statuspage.js.map