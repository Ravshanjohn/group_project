"use client";

import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { auth_store } from "../stores/auth.store";

export default function SocketInitializer() {
  const getUser = auth_store((s) => s.getUser);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await getUser();

      const currentUser = auth_store.getState().user;
      const userId = currentUser?.id;
      connectSocket(userId?.toString());
    })();

    return () => {
      if (!mounted) return;
      disconnectSocket();
      mounted = false;
    };
  }, [getUser]);

  return null;
}
