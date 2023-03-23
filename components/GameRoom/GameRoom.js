import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "@/lib/supabase";
import { useUser } from "@supabase/auth-helpers-react";
import { useSelector } from "react-redux";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";

const GameRoom = ({ props }) => {
  //const user = useUser();
  const router = useRouter();
  const [presence, setPresence] = useState();
  const [player1, setPlayer1] = useState();
  const [player2, setPlayer2] = useState();
  const [currentUser, setCurrentUser] = useState();

  const user = useSelector((state) => state.user.user);

  console.log("this is props", props);

  useEffect(() => {
    const channel = supabase.channel("test", {
      config: {
        presence: { props },
      },
    });
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setPresence(state);
        console.log("this is presence", presence);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        console.log(newPresences.flat(), "Has Joined");
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        console.log(leftPresences, "has left");
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const status = await channel.track({
            presence: { props },
          });
          await channel.untrack();
        }
      });
  }, []);

  const leaveHandler = () => {
    supabase.removeAllChannels();
    console.log("removed all channels");
    console.log("this is to track presence status", presence);
    router.push("http://localhost:3000/");
  };

  return (
    <div>
      <h1>GameRoom</h1>
      <button onClick={leaveHandler}>Leave Room</button>
      <h3>Users In Lobby:</h3>
    </div>
  );
};

export default GameRoom;
