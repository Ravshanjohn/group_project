import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(userId?: string) {
	if (socket) return socket;

	const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api$/, "");

	socket = io(apiUrl, {
		transports: ["websocket"],
		withCredentials: true,
		query: {
			userId: userId || "",
		},
	});

	socket.on("connect", () => {
		console.log("Socket connected", socket?.id);
	});

	socket.on("disconnect", () => {
		console.log("Socket disconnected");
	});

	socket.on("getOnlineUsers", (users: string[]) => {
		console.log("Online users:", users);
	});

	return socket;
}

export function disconnectSocket() {
	if (!socket) return;
	socket.disconnect();
	socket = null;
}


  


export default socket;

