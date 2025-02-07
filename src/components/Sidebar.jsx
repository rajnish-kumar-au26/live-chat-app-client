import React, { useContext, useEffect, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { IconButton } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import NightlightIcon from "@mui/icons-material/Nightlight";
import LightModeIcon from "@mui/icons-material/LightMode";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../features/themeSlice";
import axios from "axios";
import { myContext } from "./MainContainer";

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);
  const { refresh, setRefresh } = useContext(myContext);
  const [conversations, setConversations] = useState([]);
  const userData = JSON.parse(localStorage.getItem("userData"));

  // Redirect to login page if user data is not found
  if (!userData) {
    navigate("/");
  }

  const user = userData.data;

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    axios.get("http://localhost:8080/chat/", config).then((response) => {
      setConversations(response.data);
    });
  }, [refresh, user.token]);

  const conversationsStyle = {
    overflowY: "auto", // Enable vertical scrolling
    height: "calc(100vh - 150px)", // Adjust height based on the height of header and search bar
  };

  return (
    <div className="sidebar-container">
      <div className={"sb-header" + (lightTheme ? "" : " dark")}>
        <div className="other-icons">
          <IconButton onClick={() => navigate("/app/welcome")}>
            <AccountCircleIcon
              className={"icon" + (lightTheme ? "" : " dark")}
            />
          </IconButton>
          <IconButton onClick={() => navigate("users")}>
            <PersonAddIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton onClick={() => navigate("groups")}>
            <GroupAddIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton onClick={() => navigate("create-groups")}>
            <AddCircleIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton onClick={() => dispatch(toggleTheme())}>
            {lightTheme ? (
              <NightlightIcon className={"icon"} />
            ) : (
              <LightModeIcon className={"icon" + (lightTheme ? "" : " dark")} />
            )}
          </IconButton>
          <IconButton
            onClick={() => {
              localStorage.removeItem("userData");
              navigate("/");
            }}
          >
            <ExitToAppIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
        </div>
      </div>
      <div className={"sb-search" + (lightTheme ? "" : " dark")}>
        <IconButton className={"icon" + (lightTheme ? "" : " dark")}>
          <SearchIcon />
        </IconButton>
        <input
          placeholder="Search"
          className={"search-box" + (lightTheme ? "" : " dark")}
        />
      </div>
      <div
        className={"sb-conversations" + (lightTheme ? "" : " dark")}
        style={conversationsStyle}
      >
        {conversations.map((conversation, index) => {
          const isGroupChat = conversation.isGroupChat;
          const otherUser = !isGroupChat
            ? conversation.users.find((u) => u._id !== user._id)
            : null;

          return (
            <div
              key={index}
              className="conversation-container"
              onClick={() => {
                navigate(
                  isGroupChat
                    ? `chat/${conversation._id}&${conversation.chatName}`
                    : `chat/${conversation._id}&${otherUser.name}`
                );
                setRefresh(!refresh);
              }}
            >
              <p className={"con-icon" + (lightTheme ? "" : " dark")}>
                {isGroupChat ? conversation.chatName[0] : otherUser.name[0]}
              </p>
              <p className={"con-title" + (lightTheme ? "" : " dark")}>
                {isGroupChat ? conversation.chatName : otherUser.name}
              </p>
              <p className="con-lastMessage">
                {conversation.latestMessage
                  ? conversation.latestMessage.content
                  : "No previous Messages, click here to start a new chat"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;
