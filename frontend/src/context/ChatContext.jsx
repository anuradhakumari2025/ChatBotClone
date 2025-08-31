import axios from "axios";
import { useEffect } from "react";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const BACKEND_URL = "/api";
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const fetchChats = async () => {
    const res = await axios.get(`${BACKEND_URL}/chats`, {
      withCredentials: true,
    });
    console.log(res);
    setChatList(res.data.chats.reverse())
  };


  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      fetchChats();
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);
  return (
    <ChatContext.Provider
      value={{
        chatList,
        setChatList,
        selectedChat,
        setSelectedChat,
        navigate,
        BACKEND_URL,
        user,
        setUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
