import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Bell, MessageCircle, 
  MoreVertical, LogOut, Menu, X, 
  PenTool, Home, Users, FileText, Settings,
  Mail, Send, Phone, Video
} from "lucide-react";
import { LeftSidebar } from "../components/Social/LeftSidebar";
import { RightSidebar } from "../components/Social/RightSidebar";
import { ChatWidget } from "../components/Social/ChatWidget";
import { ChatContext } from "../context/ChatContext";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const { selectedChat, setSelectedChat } = useContext(ChatContext);
  const [activeTab, setActiveTab] = useState("chats"); // chats or mail
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-white font-sans selection:bg-[#25D366]/30 overflow-hidden flex flex-col">
      {/* Professional Hybrid Header */}
      <header className="flex-shrink-0 bg-[#075E54] text-white shadow-md z-50">
        <div className="max-w-full mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 hover:bg-white/10 rounded-full transition"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-bold tracking-tight">DockChat</h1>
          </div>

          {/* Tabbed Navigation */}
          <div className="flex h-full">
            <button
              onClick={() => setActiveTab("chats")}
              className={`px-8 h-full text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === "chats" ? "text-white" : "text-white/60 hover:text-white/80"
              }`}
            >
              Chats
              {activeTab === "chats" && (
                <motion.div layoutId="headerTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#25D366]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("mail")}
              className={`px-8 h-full text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === "mail" ? "text-white" : "text-white/60 hover:text-white/80"
              }`}
            >
              Mail
              {activeTab === "mail" && (
                <motion.div layoutId="headerTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#ea4335]" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-full transition relative">
              <Bell size={20} className="text-white/90" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#25D366] rounded-full border-2 border-[#075E54]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-white/10 p-0.5 border border-white/20">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <button 
              onClick={logout}
              className="p-2 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout - Full Screen Split-Pane */}
      <main className="flex-1 flex overflow-hidden bg-[#f0f2f5]">
        {/* Left: Chat List (Column 1) */}
        <div className={`${isMobileMenuOpen ? "fixed inset-0 z-40" : "hidden"} md:relative md:flex md:w-80 lg:w-96 flex-col bg-white border-r border-black/[0.05]`}>
          <LeftSidebar activeTab={activeTab} onSelectChat={(chat) => { setSelectedChat(chat); setIsMobileMenuOpen(false); }} />
        </div>

        {/* Center: Active Chat Area (Column 2) */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
          {activeTab === "chats" ? (
            <ChatWidget chat={selectedChat} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 bg-white">
              <div className="text-center">
                <Mail size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium">Select a mail to read</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Contact Info (Column 3) */}
        <div className="hidden xl:flex w-72 lg:w-80 flex-col bg-white border-l border-black/[0.05]">
          <RightSidebar chat={selectedChat} />
        </div>
      </main>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
