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
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] border-r border-white/5 transition-all">
      {/* Pinned Search Bar */}
      <div className="flex-shrink-0 p-6 bg-[var(--bg-secondary)] border-b border-white/5">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--accent)] transition" size={18} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={activeTab === "chats" ? "Identify contact..." : "Index archives..."} 
            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 transition-all shadow-inner"
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
          <div className="divide-y divide-white/5">
            {chats.map((chat) => (
              <motion.button 
                key={chat._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => handleSelect(chat)}
                className={`w-full flex items-center gap-4 px-6 py-5 transition-all relative group text-left border-l-4 ${
                  selectedChat?._id === chat._id ? "bg-white/[0.03] border-l-[var(--accent)] shadow-inner" : "border-transparent hover:bg-white/[0.01]"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 font-black border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                    {getChatProfile(chat)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--bg-secondary)] shadow-sm"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-black text-white truncate tracking-tight uppercase italic">{getChatName(chat)}</h4>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                      {chat.latestMessage ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-white/40 truncate font-medium">
                      {chat.latestMessage ? chat.latestMessage.content : "Secure channel established..."}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {emails.map((mail) => (
              <button 
                key={mail.id}
                className="w-full flex items-start gap-4 px-6 py-5 hover:bg-white/[0.02] transition-all relative group text-left border-l-4 border-transparent hover:border-l-[var(--mail-accent)]"
              >
                <div className="flex-shrink-0 mt-1">
                  <Star size={20} className={mail.starred ? "text-amber-500 fill-amber-500" : "text-white/10"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-black text-white truncate tracking-tight">{mail.sender}</h4>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{mail.time}</span>
                  </div>
                  <h5 className={`text-xs font-bold truncate mb-1 ${mail.important ? "text-[var(--mail-alert)]" : "text-white/80"}`}>{mail.subject}</h5>
                  <p className="text-xs text-white/40 truncate line-clamp-1 italic font-medium">{mail.snippet}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Global Bottom Navigation (Utility) */}
      <div className="flex-shrink-0 flex p-4 glass-dark items-center justify-around text-white/20 border-t border-white/5">
        <button className="p-3 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Home size={22} /></button>
        <button className="p-3 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Users size={22} /></button>
        <button className="p-3 hover:text-white hover:bg-white/5 rounded-xl transition-all"><FileText size={22} /></button>
        <button className="p-3 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Settings size={22} /></button>
      </div>
    </div>
  );
};
