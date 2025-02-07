import React, { useContext, useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MessageSelf from "./MessageSelf";
import MessageOthers from "./MessageOthers";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import axios from "axios";
import { myContext } from "./MainContainer";
import io from "socket.io-client";

const ENDPOINT = "https://live-chat-app-backend-mxe2.onrender.com";
var socket;

function ChatArea() {
  const lightTheme = useSelector((state) => state.themeKey);
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef(null);
  const dyParams = useParams();
  const [chat_id, chat_user] = dyParams._id.split("&");
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [allMessages, setAllMessages] = useState([]);
  const { refresh, setRefresh } = useContext(myContext);
  const [loaded, setLoaded] = useState(false);

  // Function to send a message
  const sendMessage = async () => {
    setMessageContent("");
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };
    try {
      const { data } = await axios.post(
        "https://live-chat-app-backend-mxe2.onrender.com/message/",
        {
          content: messageContent,
          chatId: chat_id,
        },
        config
      );
      socket.emit("new message", data);
      setAllMessages((prevMessages) => [...prevMessages, data]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Initial setup for socket connection and event listeners
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", userData);

    socket.on("connected", () => {
      console.log("Socket connected");
    });

    socket.on("message received", (newMessage) => {
      if (!allMessages.some((msg) => msg._id === newMessage._id)) {
        setAllMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket.off("connected");
      socket.off("message received");
    };
  }, [userData, allMessages]);

  // Fetch messages for the chat
  useEffect(() => {
    const fetchMessages = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };
      try {
        const { data } = await axios.get(
          `https://live-chat-app-backend-mxe2.onrender.com/message/${chat_id}`,
          config
        );
        setAllMessages(data);
        setLoaded(true);
        socket.emit("join chat", chat_id);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [chat_id, userData.data.token]);

  if (!loaded) {
    return (
      <div
        style={{
          border: "20px",
          padding: "10px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{ width: "100%", borderRadius: "10px" }}
          height={60}
        />
        <Skeleton
          variant="rectangular"
          sx={{
            width: "100%",
            borderRadius: "10px",
            flexGrow: "1",
          }}
        />
        <Skeleton
          variant="rectangular"
          sx={{ width: "100%", borderRadius: "10px" }}
          height={60}
        />
      </div>
    );
  } else {
    return (
      <div className={"chatArea-container" + (lightTheme ? "" : " dark")}>
        <div className={"chatArea-header" + (lightTheme ? "" : " dark")}>
          <p className={"con-icon" + (lightTheme ? "" : " dark")}>
            {chat_user[0]}
          </p>
          <div className={"header-text" + (lightTheme ? "" : " dark")}>
            <p className={"con-title" + (lightTheme ? "" : " dark")}>
              {chat_user}
            </p>
          </div>
          <IconButton className={"icon" + (lightTheme ? "" : " dark")}>
            <DeleteIcon />
          </IconButton>
        </div>
        <div className={"messages-container" + (lightTheme ? "" : " dark")}>
          {allMessages
            .slice(0)
            .reverse()
            .map((message, index) => {
              const sender = message.sender;
              const self_id = userData.data._id;
              if (sender._id === self_id) {
                return <MessageSelf props={message} key={index} />;
              } else {
                return <MessageOthers props={message} key={index} />;
              }
            })}
        </div>
        <div ref={messagesEndRef} className="BOTTOM" />
        <div className={"text-input-area" + (lightTheme ? "" : " dark")}>
          <input
            placeholder="Type a Message"
            className={"search-box" + (lightTheme ? "" : " dark")}
            value={messageContent}
            onChange={(e) => {
              setMessageContent(e.target.value);
            }}
            onKeyDown={(event) => {
              if (event.code === "Enter") {
                sendMessage();
              }
            }}
          />
          <IconButton
            className={"icon" + (lightTheme ? "" : " dark")}
            onClick={sendMessage}
          >
            <SendIcon />
          </IconButton>
        </div>
      </div>
    );
  }
}

export default ChatArea;
