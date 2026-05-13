import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { motion } from "framer-motion";
import { 
  BadgeCheck, MessageCircle, MoreVertical, 
  Search, Filter, CheckCheck, Star, Trash2, Archive,
  Mail, Send, AlertCircle, Home, Users, FileText, Settings
} from "lucide-react";

export const LeftSidebar = ({ activeTab, onSelectChat }) => {
  const { user } = useContext(AuthContext);
  const { chats, selectedChat, setSelectedChat } = useContext(ChatContext);

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
    { id: 3, sender: "DockChat Team", subject: "Welcome to Hybrid Mode!", snippet: "Experience the best of both worlds with our new 2-in-1 interface...", time: "昨天", starred: false, important: false },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Pinned Search Bar */}
      <div className="flex-shrink-0 p-4 bg-white">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#075E54] transition" size={16} />
          <input 
            type="text" 
            placeholder={activeTab === "chats" ? "Search or start new chat" : "Search mail"} 
            className="w-full bg-[#f0f2f5] border-none rounded-lg py-2 pl-10 pr-4 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#075E54]/20 transition"
          />
        </div>
      </div>

      {/* Conditional List View */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "chats" ? (
          <div className="divide-y divide-black/[0.02]">
            {chats.map((chat) => (
              <button 
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors relative group text-left border-l-4 ${
                  selectedChat?._id === chat._id ? "bg-[#f5f6f6] border-l-[#25D366]" : "border-transparent hover:bg-[#f5f6f6]"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-black/[0.05]">
                    {getChatProfile(chat)}
                  </div>
                  {/* online status logic could be added here */}
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
              </button>
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
