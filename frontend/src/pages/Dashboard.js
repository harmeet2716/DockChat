import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Bell, MessageCircle, 
  MoreVertical, LogOut, Menu, X, 
  Settings, User, LogOut as LogOutIcon, Mail, MessageSquare
} from "lucide-react";
import { LeftSidebar } from "../components/Social/LeftSidebar";
import { RightSidebar } from "../components/Social/RightSidebar";
import { ChatWidget } from "../components/Social/ChatWidget";
import { ContactSyncModal } from "../components/Social/ContactSyncModal";
import { ChatContext } from "../context/ChatContext";
import { MailWidget } from "../components/Mail/MailWidget";

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const { selectedChat, setSelectedChat, syncContacts } = useContext(ChatContext);
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const [activeTab, setActiveTab] = useState("chats"); // chats or mail
  const [currentView, setCurrentView] = useState("list"); // list, chat, profile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(!user?.isContactsSynced);

  // Sync currentView with selectedChat
  useEffect(() => {
    if (selectedChat && isMobile) {
      setCurrentView("chat");
    } else if (!selectedChat && isMobile) {
      setCurrentView("list");
    }
  }, [selectedChat, isMobile]);

  const handleSync = async () => {
    const mockPhoneBook = ["+1234567890", "+9876543210", "+1122334455"];
    await syncContacts(mockPhoneBook);
    setIsSyncModalOpen(false);
  };

  return (
    <div className={`h-screen font-sans selection:bg-[var(--accent)]/30 overflow-hidden flex flex-col transition-colors duration-300 ${
      activeTab === "chats" ? "theme-chat bg-[#f0f2f5]" : "theme-mail bg-white"
    }`}>
      {/* Traditional Header */}
      <header className={`flex-shrink-0 shadow-md z-50 transition-all duration-300 ${
        activeTab === "chats" ? "bg-[#075E54] text-white" : "bg-white text-slate-800 border-b border-slate-200"
      }`}>
        <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              className={`md:hidden p-2 rounded-full transition ${activeTab === "chats" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-600"}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="DockChat" className="w-8 h-8 object-contain" />
              <h1 className={`text-xl font-bold tracking-tight ${activeTab === "chats" ? "text-white" : "text-[#075E54]"}`}>DockChat</h1>
            </div>
          </div>

          <div className="flex h-full items-center">
            <button
              onClick={() => setActiveTab("chats")}
              className={`px-8 h-16 text-xs font-bold uppercase tracking-widest transition-all duration-300 relative ${
                activeTab === "chats" 
                  ? "text-white" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Chats
              {activeTab === "chats" && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#25D366]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("mail")}
              className={`px-8 h-16 text-xs font-bold uppercase tracking-widest transition-all duration-300 relative ${
                activeTab === "mail" 
                  ? "text-[#ea4335]" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Mail
              {activeTab === "mail" && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#ea4335]" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className={`hidden sm:block p-2 rounded-full transition relative ${activeTab === "chats" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-600"}`}>
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#25D366] rounded-full border-2 border-current"></span>
            </button>
            <Link to="/settings" className="w-9 h-9 rounded-full bg-slate-200 p-0.5 border border-white/20 hover:scale-105 transition-all active:scale-95 cursor-pointer block overflow-hidden">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-300 flex items-center justify-center font-bold text-xs uppercase text-slate-600">
                  {user?.username?.[0]}
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Column 1: List (Chats) - Hidden on mobile if viewing chat/profile */}
        {(!isMobile || currentView === "list") && activeTab === "chats" && (
          <div className={`${isMobile ? "w-full" : "w-[400px] border-r border-white/5"} bg-[var(--bg-secondary)] flex flex-col z-10 transition-all`}>
            <LeftSidebar 
              activeTab={activeTab} 
              onSelectChat={(chat) => {
                setSelectedChat(chat);
                if (isMobile) setCurrentView("chat");
              }} 
            />
          </div>
        )}

        {/* Column 2: Chat/Mail Content */}
        <div className="flex-1 flex overflow-hidden relative z-0">
          {activeTab === "chats" ? (
            <div className="flex-1 flex overflow-hidden">
              {(!isMobile || currentView === "chat") && (
                <div className="flex-1 flex flex-col relative">
                  <ChatWidget 
                    isMobile={isMobile} 
                    onBack={() => {
                      setSelectedChat(null);
                      setCurrentView("list");
                    }}
                    onShowInfo={() => setCurrentView("profile")}
                  />
                </div>
              )}
              {(!isMobile || currentView === "profile") && (
                <div className={`${isMobile ? "absolute inset-0 z-50" : "w-[350px] border-l border-white/5"} bg-[var(--bg-secondary)] flex flex-col transition-all`}>
                  <RightSidebar 
                    isMobile={isMobile}
                    onBack={() => setCurrentView("chat")}
                  />
                </div>
              )}
            </div>
          ) : (
            <MailWidget />
          )}
        </div>
      </main>

      {/* Mobile-First Navigation */}
      {isMobile && (
        <div className="mobile-nav">
          <button 
            onClick={() => setActiveTab("chats")}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === "chats" ? "text-[var(--chat-accent)] scale-110" : "text-white/40"}`}
          >
            <MessageSquare size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Chat</span>
          </button>
          <button 
            onClick={() => setActiveTab("mail")}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === "mail" ? "text-[var(--mail-accent)] scale-110" : "text-white/40"}`}
          >
            <Mail size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Mail</span>
          </button>
          <Link 
            to="/settings"
            className="flex flex-col items-center gap-1 text-white/40"
          >
            <Settings size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Intel</span>
          </Link>
        </div>
      )}

      <ContactSyncModal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)}
        onSync={handleSync}
      />
    </div>
  );
}
