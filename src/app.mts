import * as env from "./env.mjs";
import * as mastodon from "./modules/mastodon.mjs";

mastodon.getServerInformation(env.instanceUrl).then((serverInfo) => {
	console.log(serverInfo);
});