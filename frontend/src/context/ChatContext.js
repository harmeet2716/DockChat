import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import io from "socket.io-client";

export const ChatContext = createContext();

const ENDPOINT = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
let socket;

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize Socket
  useEffect(() => {
    if (user) {
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const fetchChats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${ENDPOINT}/api/chat`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!selectedChat || !user) return;
    try {
      const res = await fetch(`${ENDPOINT}/api/message/${selectedChat._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setMessages(data);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [selectedChat, user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Listen for new messages
  useEffect(() => {
    if (socket) {
      socket.on("message recieved", (newMessageReceived) => {
        if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
          // Notify or update unread count in chats list
          fetchChats();
        } else {
          setMessages((prev) => [...prev, newMessageReceived]);
        }
      });
    }
    return () => {
      if (socket) socket.off("message recieved");
    };
  }, [selectedChat, fetchChats]);

  const sendMessage = async (content, messageType = "text", mediaUrl = "") => {
    if (!selectedChat || !user) return;
    try {
      socket.emit("stop typing", selectedChat._id);
      const res = await fetch(`${ENDPOINT}/api/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          content,
          chatId: selectedChat._id,
          messageType,
          mediaUrl,
        }),
      });
      const data = await res.json();
      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);
      fetchChats(); // Update latest message in sidebar
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        messages,
        setMessages,
        fetchChats,
        sendMessage,
        socket,
        socketConnected,
        isTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
