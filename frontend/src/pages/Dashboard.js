import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Bell, MessageCircle, 
  MoreVertical, LogOut, Menu, X, 
  Settings, User, LogOut as LogOutIcon, Mail
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
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(true);

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
            <button className="hidden sm:block p-2 hover:bg-white/10 rounded-full transition relative">
              <Bell size={20} className="text-white/90" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#25D366] rounded-full border-2 border-[#075E54]"></span>
            </button>
            <Link to="/settings" className="w-8 h-8 rounded-full bg-white/10 p-0.5 border border-white/20 hover:scale-110 transition-transform active:scale-95 cursor-pointer block overflow-hidden">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center font-bold text-xs uppercase">
                  {user?.username?.[0]}
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Column 1: List (Chats or Folders) */}
        {(!isMobile || currentView === "list") && activeTab === "chats" && (
          <div className={`${isMobile ? "w-full" : "w-[400px] border-r border-black/[0.05]"} bg-white flex flex-col z-10 transition-all`}>
            <LeftSidebar 
              activeTab={activeTab} 
              onSelectChat={(chat) => {
                setSelectedChat(chat);
                if (isMobile) setCurrentView("chat");
              }} 
            />
          </div>
        )}

        {/* Content View: Chat Widget or Mail Widget */}
        <div className="flex-1 flex overflow-hidden relative z-0">
          {activeTab === "chats" ? (
            <div className="flex-1 flex overflow-hidden">
              {(!isMobile || currentView === "chat") && (
                <div className="flex-1 flex flex-col bg-[#efe7dd] relative">
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
                <div className={`${isMobile ? "absolute inset-0 z-50" : "w-[350px] border-l border-black/[0.05]"} bg-white flex flex-col transition-all`}>
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            className="fixed inset-0 bg-white z-[60] flex flex-col"
          >
            <div className="p-6 bg-[#075E54] text-white flex items-center justify-between">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition"><X /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-[#075E54]/10 flex items-center justify-center text-2xl font-bold text-[#075E54]">
                  {user?.name?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{user?.name}</h3>
                  <p className="text-sm text-slate-500">{user?.username || "@user"}</p>
                </div>
              </div>
              <Link to="/settings" className="w-full flex items-center gap-4 text-lg font-bold text-slate-700 p-4 hover:bg-slate-50 rounded-2xl transition">
                <Settings size={24} /> Settings
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-4 text-lg font-bold text-rose-500 p-4 hover:bg-rose-50 rounded-2xl transition">
                <LogOutIcon size={24} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContactSyncModal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)}
        onSync={handleSync}
      />
    </div>
  );
}
