import { useState } from "react";
import "./Home.css";
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { toast } from "react-toastify";
import axios from "axios";
import { io } from "socket.io-client";
import { useEffect } from "react";

const Home = () => {
  const [closeSidebar, setCloseSidebar] = useState(false);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]); // new state for chat messages
  const [loading, setLoading] = useState(false);

  const {
    selectedChat,
    setSelectedChat,
    chatList,
    setChatList,
    BACKEND_URL,
    navigate,
    setUser,
  } = useContext(ChatContext);
  const handleSidebar = () => {
    setCloseSidebar(!closeSidebar);
  };

  //Handle Logout Function
  const handleLogout = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/auth/logout`);
      if (res.statusText == "OK") {
        localStorage.removeItem("user");
        setUser(null);
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      toast.error(error);
    }
  };

  //Handle New Chat Function
  const handleNewChat = async () => {
    const title = prompt("Please enter chat title:");
    try {
      const res = await axios.post(
        `${BACKEND_URL}/chats`,
        { title },
        {
          withCredentials: true,
        }
      );
      console.log("res from 57", res);
      if (res.statusText == "OK") {
        const newChat = res.data.newChat;
        console.log(newChat);
        setChatList([newChat, ...chatList]);
        setSelectedChat(newChat._id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Handle Send Message Function
  const handleSendMsg = async () => {
    if (!input.trim()) return;
    if (!selectedChat) {
      console.error("No chat selected");
      return;
    }

    // add user message to state
    const newMessage = {
      content: input,
      role: "user",
    };

    setMessages((prev) => [...prev, newMessage]);

    socket.emit("ai-message", {
      chat: selectedChat,
      content: input,
    });
    setInput("");
    setLoading(true);
  };

  const handleSelectChat = async (chatId) => {
    setSelectedChat(chatId);
    try {
      const res = await axios.get(`${BACKEND_URL}/chats/messages/${chatId}`, {
        withCredentials: true,
      });
      setMessages(res.data.messages); // set messages of that chat
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const tempSocket = io("http://localhost:4000", {
      withCredentials: true,
    });
    tempSocket.on("ai-reply", (message) => {
      setMessages((prev) => [...prev, message]);
      setLoading(false);
    });
    setSocket(tempSocket);
  }, []);

  return (
    <div className="chat-container">
      {/* <!-- Sidebar --> */}
      <aside
        className={closeSidebar ? "sidebarClosed" : "sidebar"}
        id="sidebar"
      >
        <div className="sidebar-header">
          <div className={closeSidebar ? "closed" : "head"}>
            <div className="logo" onClick={handleSidebar}>
              <i className="ri-openai-line"></i>
            </div>
            <div className="sidebarLogo" onClick={handleSidebar}>
              <i className="ri-side-bar-line" title="close-sidebar"></i>
            </div>
          </div>

          {/* Handle New Chat */}
          <div className="newChat" onClick={handleNewChat}>
            <i className="ri-add-large-fill"></i>
            <h3>New Chat</h3>
          </div>

          {/* Sub Title */}
          <h3>My Chats</h3>
        </div>

        <ul className="chat-list">
          {chatList.length == 0 ? (
            <li>No Conversation</li>
          ) : (
            chatList.map((chat) => (
              <li
                key={chat._id}
                // onClick={() => setSelectedChat(chat._id)}
                onClick={() => handleSelectChat(chat._id)}
                className={selectedChat === chat._id ? "active-chat" : ""}
              >
                {chat.title}
              </li>
            ))
          )}
        </ul>

        {/* Handle Logout */}
        <div className="logout" onClick={handleLogout}>
          <i className="ri-logout-circle-r-line"></i> <p>Logout</p>
        </div>
      </aside>

      {/* <!-- Main Chat Area --> */}
      <main className={closeSidebar ? "fullChatMain" : "chat-main"}>
        {/* Header */}
        <div className="chat-header">
          <i className="ri-menu-2-line"></i>
          <h2>AI Chat</h2>
          <i className="ri-add-large-fill" onClick={handleNewChat}></i>
        </div>

        {/* <div className="chat-messages" id="chatMessages">
          {chatList[selectedChat] &&
          chatList[selectedChat].messages?.length > 0 ? (
            chatList[selectedChat].messages.map((msg, i) => (
              <div className={`message ${msg.sender}`} key={i}>
                <p>{msg.content}</p>
                <span className="time">{msg.time}</span>
              </div>
            ))
          ) : (
            <div className="noChat">No messages in this conversation yet.</div>
          )}
        </div> */}

        <div className="chat-messages" id="chatMessages">
          {messages && messages.length > 0 ? (
            messages.map((msg, i) => (
              <div className={`message ${msg.role}`} key={i}>
                <p>{msg.content}</p>
                {/* <span className="time">
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span> */}
              </div>
            ))
          ) : (
            <div className="noChat">No messages in this conversation yet.</div>
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="message bot typing">
              <p>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </p>
            </div>
          )}
        </div>

        {/* Handle Input message */}
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key == "Enter") handleSendMsg();
            }}
          />
          <button onClick={handleSendMsg}>Send</button>
        </div>
      </main>
    </div>
  );
};

export default Home;
