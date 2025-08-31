import { useState, useContext, useEffect } from "react";
import "./Home.css";
import { ChatContext } from "../../context/ChatContext";
import { toast } from "react-toastify";
import axios from "axios";
import { io } from "socket.io-client";

const Home = () => {
  const [closeSidebar, setCloseSidebar] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
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

  // Handle Logout
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

  // Handle New Chat
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
      if (res.statusText == "OK") {
        const newChat = res.data.newChat;
        setChatList([newChat, ...chatList]);
        setSelectedChat(newChat._id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle Send Message
  const handleSendMsg = async () => {
    if (!input.trim()) return;
    if (!selectedChat) {
      console.error("No chat selected");
      return;
    }

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
      setMessages(res.data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const tempSocket = io("https://chatgptclone-ws4s.onrender.com", {
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
      {/* Overlay for mobile */}
      {isMobileSidebarOpen && (
        <div
          className="sidebarOverlay"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar 
          ${closeSidebar ? "sidebarClosed" : ""} 
          ${isMobileSidebarOpen ? "mobileSidebarOpen" : ""}`}
      >
        <div className="sidebar-header">
          <div className={closeSidebar ? "closed" : "head"}>
            <div className="logo" onClick={handleSidebar}>
              <i className="ri-openai-line"></i>
            </div>

            {/* Desktop collapse icon */}
            <div className="sidebarLogo desktopOnly" onClick={handleSidebar}>
              <i className="ri-side-bar-line" title="collapse-sidebar"></i>
            </div>

            {/* Mobile close icon */}
            <div
              className="sidebarLogo mobileOnly"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <i className="ri-close-line" title="close-sidebar"></i>
            </div>
          </div>

          {/* New Chat (Desktop only) */}
          <div className="newChat desktopOnly" onClick={handleNewChat}>
            <i className="ri-add-large-fill"></i>
            <h3>New Chat</h3>
          </div>

          <h3>My Chats</h3>
        </div>

        <ul className="chat-list">
          {chatList.length === 0 ? (
            <li>No Conversation</li>
          ) : (
            chatList.map((chat) => (
              <li
                key={chat._id}
                onClick={() => handleSelectChat(chat._id)}
                className={selectedChat === chat._id ? "active-chat" : ""}
              >
                {chat.title}
              </li>
            ))
          )}
        </ul>

        <div className="logout" onClick={handleLogout}>
          <i className="ri-logout-circle-r-line"></i> <p>Logout</p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={closeSidebar ? "fullChatMain" : "chat-main"}>
        {/* Header */}
        <div className="chat-header">
          <i
            className="ri-menu-2-line"
            onClick={() => setIsMobileSidebarOpen(true)}
          ></i>
          <h2>AI Chat</h2>
          {/* New Chat (Mobile only) */}
          <i
            className="ri-add-large-fill mobileOnly"
            onClick={handleNewChat}
          ></i>
        </div>

        {/* Messages */}
        <div className="chat-messages" id="chatMessages">
          {messages && messages.length > 0 ? (
            messages.map((msg, i) => (
              <div className={`message ${msg.role}`} key={i}>
                <p>{msg.content}</p>
              </div>
            ))
          ) : (
            <div className="noChat">No messages in this conversation yet.</div>
          )}

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

        {/* Input */}
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMsg();
            }}
          />
          <button onClick={handleSendMsg}>Send</button>
        </div>
      </main>
    </div>
  );
};

export default Home;
