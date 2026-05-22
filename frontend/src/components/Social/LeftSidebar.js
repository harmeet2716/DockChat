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
      const backendUrl = process.env.REACT_APP_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
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
    <div className="flex flex-col h-full bg-white border-r border-slate-200 transition-all">
      {/* Search Bar */}
      <div className="flex-shrink-0 p-4 bg-slate-50 border-b border-slate-100">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#075E54] transition" size={18} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={activeTab === "chats" ? "Search or start new chat" : "Search mail"} 
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 transition-all"
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
            className="px-4 pb-4 border-b border-slate-100"
          >
            <h4 className="text-[10px] font-bold text-[#25D366] uppercase tracking-widest mb-3 px-2">Global Result</h4>
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
          <div className="divide-y divide-slate-50">
            {chats.map((chat) => (
              <motion.button 
                key={chat._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => handleSelect(chat)}
                className={`w-full flex items-center gap-4 px-4 py-4 transition-all relative group text-left ${
                  selectedChat?._id === chat._id ? "bg-slate-100" : "hover:bg-slate-50"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-[#075E54] font-bold border border-slate-100">
                    {getChatProfile(chat)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{getChatName(chat)}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {chat.latestMessage ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 truncate flex-1 pr-2">
                      {chat.latestMessage ? chat.latestMessage.content : "Tap to start chatting"}
                    </p>
                    {chat.unreadCount > 0 && selectedChat?._id !== chat._id && (
                      <span className="flex-shrink-0 min-w-[20px] h-5 bg-[#25D366] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 shadow-sm">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {emails.map((mail) => (
              <button 
                key={mail.id}
                className="w-full flex items-start gap-4 px-4 py-4 hover:bg-slate-50 transition-all relative group text-left border-l-4 border-transparent hover:border-l-[#ea4335]"
              >
                <div className="flex-shrink-0 mt-1">
                  <Star size={18} className={mail.starred ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{mail.sender}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{mail.time}</span>
                  </div>
                  <h5 className={`text-xs font-bold truncate mb-0.5 ${mail.important ? "text-[#ea4335]" : "text-slate-700"}`}>{mail.subject}</h5>
                  <p className="text-xs text-slate-500 truncate line-clamp-1">{mail.snippet}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex-shrink-0 flex p-3 bg-slate-50 items-center justify-around text-slate-400 border-t border-slate-100">
        <button className="p-2.5 hover:text-[#075E54] hover:bg-[#075E54]/5 rounded-xl transition-all"><Home size={20} /></button>
        <button className="p-2.5 hover:text-[#075E54] hover:bg-[#075E54]/5 rounded-xl transition-all"><Users size={20} /></button>
        <button className="p-2.5 hover:text-[#075E54] hover:bg-[#075E54]/5 rounded-xl transition-all"><FileText size={20} /></button>
        <button className="p-2.5 hover:text-[#075E54] hover:bg-[#075E54]/5 rounded-xl transition-all"><Settings size={20} /></button>
      </div>
    </div>
  );
};
