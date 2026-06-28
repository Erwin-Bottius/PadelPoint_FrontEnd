import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

import { useAuth } from "@/context/auth";

function resolveSocketUrl(): string {
  if (process.env.EXPO_PUBLIC_SOCKET_URL)
    return process.env.EXPO_PUBLIC_SOCKET_URL;
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  return `http://${host ?? "localhost"}:3334`;
}

const SOCKET_URL = resolveSocketUrl();

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const s = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket"],
    });

    s.on("new_message", () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    });

    s.on("error", ({ message }: { message: string }) =>
      console.warn("[socket]", message),
    );

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): Socket | null {
  return useContext(SocketContext);
}
