"use client";
import { useEffect, useState } from "react";
import {socket} from "@/app/socket";

import Ping from "@/components/atoms/ping/Ping";
import HomeTemplate from "@/components/templates/HomeTemplate";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

    useEffect(() => {
    if (socket.connected) {
      onConnect();
    }
    function onConnect() {
       console.log("✅ Frontend connected to backend via socket");
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

     socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
   <main>
    <Ping />
    <HomeTemplate />
   </main>
  );
}
