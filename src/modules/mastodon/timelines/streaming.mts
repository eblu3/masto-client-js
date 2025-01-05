export enum Events {
	NewStatus = "update",
	StatusDeleted = "delete",
	NewNotification = "notification",
	FiltersChanged = "filters_changed",
	NewConversation = "conversation",
	NewAnnouncement = "announcement",
	AnnouncementReaction = "announcement.reaction",
	AnnouncementDeleted = "announcement.delete",
	StatusEdited = "status.update",
	EncryptedMessageReceived = "encrypted_message",
	NotificationsMerged = "notifications_merged"
}

export enum Streams {
	Public = "public",
	PublicMediaOnly = "public:media",
	Local = "public:local",
	LocalMediaOnly = "public:local:media",
	Remote = "public:remote",
	RemoteMediaOnly = "public:remote:media",
	Hashtag = "hashtag",
	HashtagLocalOnly = "hashtag:local",
	User = "user",
	Notifications = "user:notification",
	List = "list",
	Direct = "direct"
}

export function establishWebSocketConnection(
	instanceUrl: URL,
	token: string,
	stream: Streams,
	list?: string,
	tag?: string,
	subscribe?: boolean
): WebSocket {
	let initJson: any = {
		"stream": stream
	};

	if(list) {
		initJson.list = list;
	}
	if(tag) {
		initJson.tag = tag;
	}
	if(subscribe != undefined) {
		subscribe ? initJson.type = "subscribe" : initJson.type = "unsubscribe";
	}

	const connection = new WebSocket(`wss://${instanceUrl.host}/api/v1/streaming?access_token=${token}`);

	connection.addEventListener("open", (event) => {
		connection.send(JSON.stringify(initJson));
	});

	connection.addEventListener("message", (message) => {
		const data = JSON.parse(message.data);
		const event = data["event"] as string;
		const payload = JSON.parse(data.payload);
	});

	return connection;
}