import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BadgeCheck, MessageCircle, MoreVertical, 
  Search, Filter, CheckCheck, Star, Trash2, Archive,
  Mail, Send, AlertCircle, Home, Users, FileText, Settings
} from "lucide-react";

export const LeftSidebar = ({ activeTab, onSelectChat }) => {
  const { user } = useContext(AuthContext);
  const { 
    chats, selectedChat, setSelectedChat, 
    searchGlobalUser, searchResult, setSearchResult 
  } = useContext(ChatContext);
  const [query, setQuery] = useState("");

  const handleSelect = (chat) => {
    setSelectedChat(chat);
    if (onSelectChat) onSelectChat(chat);
  };

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3) {
        searchGlobalUser(query);
      } else {
        setSearchResult(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleAccessChat = async (targetUserId) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: targetUserId }),
      });
      const data = await res.json();
      setSelectedChat(data);
      setSearchResult(null);
      setQuery("");
      if (onSelectChat) onSelectChat(data);
    } catch (err) {
      console.error("Error accessing chat:", err);
    }
  };

  const getChatName = (chat) => {
    if (chat.isGroupChat) return chat.chatName;
    const otherUser = chat.users.find(u => u._id !== user._id);
    return otherUser ? otherUser.name : "Unknown";
  };

  const getChatProfile = (chat) => {
    if (chat.isGroupChat) return chat.chatName[0];
    const otherUser = chat.users.find(u => u._id !== user._id);
    return otherUser ? otherUser.name[0] : "U";
  };

  // Mock data for Mail
  const emails = [
    { id: 1, sender: "Google Cloud", subject: "Invoice for April 2024", snippet: "Your invoice is now available in the billing console...", time: "1:15 PM", starred: false, important: true },
    { id: 2, sender: "GitHub", subject: "[Security] Critical update for repository", snippet: "A security vulnerability was found in one of your dependencies...", time: "10:30 AM", starred: true, important: true },
    { id: 3, sender: "DockChat Team", subject: "Welcome to Hybrid Mode!", snippet: "Experience the best of both worlds with our new 2-in-1 interface...", time: "Yesterday", starred: false, important: false },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Pinned Search Bar */}
      <div className="flex-shrink-0 p-4 bg-white">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#075E54] transition" size={16} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={activeTab === "chats" ? "Search phone number..." : "Search mail"} 
            className="w-full bg-[#f0f2f5] border-none rounded-lg py-2 pl-10 pr-4 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#075E54]/20 transition"
          />
        </div>
      </div>

      {/* Global Search Results Overlay/Section */}
      <AnimatePresence>
        {searchResult ? (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 pb-4 border-b border-black/[0.05]"
          >
            <h4 className="text-[10px] font-black text-[#25D366] uppercase tracking-widest mb-3">Global Result</h4>
            <div className="flex items-center gap-3 p-3 bg-[#f0f9f4] rounded-xl border border-[#25D366]/10">
              <div className="w-10 h-10 rounded-full bg-[#075E54]/10 flex items-center justify-center font-bold text-[#075E54]">
                {searchResult.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold text-slate-900 truncate">{searchResult.name}</h5>
                <p className="text-[10px] text-slate-500 truncate">{searchResult.phoneNumber}</p>
              </div>
              <button 
                onClick={() => handleAccessChat(searchResult._id)}
                className="px-3 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded-lg hover:bg-[#128C7E] transition shadow-sm"
              >
                Message
              </button>
            </div>
          </motion.div>
        ) : query.length >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-6 py-4 text-center"
          >
            <p className="text-xs text-slate-400 italic">No registered user found with this number</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conditional List View */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "chats" ? (
          <div className="divide-y divide-black/[0.02]">
            {chats.map((chat) => (
              <motion.button 
                key={chat._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => handleSelect(chat)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors relative group text-left border-l-4 ${
                  selectedChat?._id === chat._id ? "bg-[#f5f6f6] border-l-[#25D366]" : "border-transparent hover:bg-[#f5f6f6]"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-black/[0.05]">
                    {getChatProfile(chat)}
                  </div>
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">{getChatName(chat)}</h4>
                    <span className="text-[10px] text-slate-400">
                      {chat.latestMessage ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 truncate">
                      {chat.latestMessage ? chat.latestMessage.content : "No messages yet"}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-black/[0.02]">
            {emails.map((mail) => (
              <button 
                key={mail.id}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#f5f6f6] transition-colors relative group text-left border-l-4 border-transparent hover:border-l-[#ea4335]"
              >
                <div className="flex-shrink-0 mt-1">
                  <Star size={18} className={mail.starred ? "text-amber-400 fill-amber-400" : "text-slate-300"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{mail.sender}</h4>
                    <span className="text-[10px] text-slate-400">{mail.time}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-950 truncate mb-0.5">{mail.subject}</h5>
                  <p className="text-xs text-slate-500 truncate line-clamp-1">{mail.snippet}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Global Bottom Navigation (Utility) */}
      <div className="flex-shrink-0 flex p-3 bg-[#f0f2f5] items-center justify-around text-slate-500 border-t border-black/[0.05]">
        <button className="p-2 hover:text-[#075E54] transition"><Home size={20} /></button>
        <button className="p-2 hover:text-[#075E54] transition"><Users size={20} /></button>
        <button className="p-2 hover:text-[#075E54] transition"><FileText size={20} /></button>
        <button className="p-2 hover:text-[#075E54] transition"><Settings size={20} /></button>
      </div>
    </div>
  );
};
