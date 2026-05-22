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
  const { selectedChat, setSelectedChat, syncContacts, socket } = useContext(ChatContext);
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(!isMobile);

  const [activeTab, setActiveTab] = useState("chats"); // chats or mail
  const [activeNotification, setActiveNotification] = useState(null);

  // Play a premium organic notification sound using Web Audio API (sine waves)
  const playNotificationChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playPing = (time, pitch) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(pitch, time);
        
        gainNode.gain.setValueAtTime(0.12, time);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.5);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(time);
        osc.stop(time + 0.6);
      };

      const now = audioCtx.currentTime;
      // Double ping signature sound
      playPing(now, 880); // high note
      playPing(now + 0.12, 1109); // premium interval note
    } catch (err) {
      console.warn("Audio Context block or unsupported:", err);
    }
  };

  // Browser desktop notification orchestrator
  const showDesktopNotification = (title, body, iconUrl, onClickAction) => {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      const options = {
        body: body,
        icon: iconUrl || "/favicon.ico",
        silent: true, // We play our own high quality synthesized sound
      };
      
      const notification = new Notification(title, options);
      notification.onclick = () => {
        window.focus();
        onClickAction();
        notification.close();
      };
    }
  };

  // Switch to correct view and open relevant sections when notification clicked
  const handleNotificationClick = () => {
    if (!activeNotification) return;

    if (activeNotification.type === "chat") {
      setActiveTab("chats");
      setSelectedChat(activeNotification.data);
      if (isMobile) setCurrentView("chat");
    } else if (activeNotification.type === "mail") {
      setActiveTab("mail");
    }
    
    setActiveNotification(null);
  };

  // Request desktop notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Listen for socket events to push notifications
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (msg) => {
      // Don't notify if we are actively viewing this chat
      if (selectedChat && selectedChat._id === msg.chat._id && activeTab === "chats") {
        return;
      }

      playNotificationChime();

      const senderName = msg.sender.name || msg.sender.username;
      const title = `New Message from ${senderName}`;
      const body = msg.content || "Sent an attachment";
      const icon = msg.sender.profilePic;

      const clickAction = () => {
        setActiveTab("chats");
        setSelectedChat(msg.chat);
        if (isMobile) setCurrentView("chat");
      };

      // Toast Notification
      setActiveNotification({
        type: "chat",
        title: title,
        body: body,
        icon: icon,
        data: msg.chat
      });

      // Browser System Notification (only when minimized or tab is in background)
      if (document.hidden) {
        showDesktopNotification(title, body, icon, clickAction);
      }
    };

    const handleMailReceived = (mail) => {
      // Don't notify if we are actively viewing mailbox
      if (activeTab === "mail") {
        return;
      }

      playNotificationChime();

      const senderName = mail.sender.name || mail.sender.username;
      const title = `New Mail: ${mail.subject}`;
      const body = `${senderName}: ${mail.body.substring(0, 100)}...`;
      const icon = mail.sender.profilePic;

      const clickAction = () => {
        setActiveTab("mail");
      };

      // Toast Notification
      setActiveNotification({
        type: "mail",
        title: title,
        body: body,
        icon: icon,
        data: mail
      });

      // Browser System Notification
      if (document.hidden) {
        showDesktopNotification(title, body, icon, clickAction);
      }
    };

    socket.on("message recieved", handleMessageReceived);
    socket.on("mail recieved", handleMailReceived);

    return () => {
      socket.off("message recieved", handleMessageReceived);
      socket.off("mail recieved", handleMailReceived);
    };
  }, [socket, selectedChat, activeTab]);

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
    <div className={`h-screen font-sans selection:bg-[var(--accent)]/30 overflow-hidden flex flex-col transition-colors duration-500 ${
      activeTab === "chats" ? "theme-chat bg-[#f0f2f5]" : "theme-mail bg-[#f8fafc]"
    }`}>
      {/* Professional Hybrid Header - Landing Page Themed */}
      <header className={`flex-shrink-0 shadow-md z-50 transition-all duration-500 ${
        activeTab === "chats" ? "bg-[#075E54] text-white" : "bg-[#ea4335] text-white"
      }`}>
        <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              className="md:hidden p-2 hover:bg-white/10 rounded-full transition text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm">
                <span className={`font-black text-xs ${activeTab === "chats" ? "text-[#075E54]" : "text-[#ea4335]"}`}>DC</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">DockChat</span>
            </div>
          </div>

          {/* Hidden on mobile, shown on md and up */}
          <div className="hidden md:flex h-11 items-center bg-white/10 rounded-full p-1 border border-white/20 shadow-inner">
            <button
              onClick={() => setActiveTab("chats")}
              className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                activeTab === "chats" 
                  ? "bg-white text-[#075E54] shadow-md scale-105" 
                  : "text-white/80 hover:text-white hover:bg-white/5"
              }`}
            >
              IM Chats
            </button>
            <button
              onClick={() => setActiveTab("mail")}
              className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                activeTab === "mail" 
                  ? "bg-white text-[#ea4335] shadow-md scale-105" 
                  : "text-white/80 hover:text-white hover:bg-white/5"
              }`}
            >
              Inbox Mail
            </button>
          </div>

          <div className="flex items-center gap-6">
            <button className="hidden sm:block p-2 hover:bg-white/10 rounded-full transition relative text-white">
              <Bell size={20} />
              <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white ${
                activeTab === "chats" ? "bg-[#25D366]" : "bg-white"
              }`}></span>
            </button>
            <Link to="/settings" className="w-10 h-10 rounded-full bg-white/10 p-0.5 border border-white/30 hover:scale-110 transition-all active:scale-95 cursor-pointer block overflow-hidden">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-sm uppercase bg-white ${
                  activeTab === "chats" ? "text-[#075E54]" : "text-[#ea4335]"
                }`}>
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
        <div className="flex-1 min-w-0 flex overflow-hidden relative z-0">
          {activeTab === "chats" ? (
            <div className="flex-1 min-w-0 flex overflow-hidden">
              {(!isMobile || currentView === "chat") && (
                <div className="flex-1 min-w-0 flex flex-col relative">
                  <ChatWidget 
                    isMobile={isMobile} 
                    onBack={() => {
                      setSelectedChat(null);
                      setCurrentView("list");
                    }}
                    onShowInfo={() => {
                      if (isMobile) {
                        setCurrentView("profile");
                      } else {
                        setIsRightSidebarOpen(!isRightSidebarOpen);
                      }
                    }}
                    onNavigateToMail={() => {
                      setActiveTab("mail");
                    }}
                  />
                </div>
              )}
              <AnimatePresence>
                {((!isMobile && isRightSidebarOpen) || (isMobile && currentView === "profile")) && (
                  <motion.div 
                    initial={isMobile ? { x: "100%" } : { width: 0, opacity: 0 }}
                    animate={isMobile ? { x: 0 } : { width: 350, opacity: 1 }}
                    exit={isMobile ? { x: "100%" } : { width: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    className={`${isMobile ? "absolute inset-0 z-50" : "w-[350px] border-l border-slate-200 shrink-0"} bg-white flex flex-col overflow-hidden`}
                  >
                    <RightSidebar 
                      isMobile={isMobile}
                      onBack={() => {
                        if (isMobile) {
                          setCurrentView("chat");
                        } else {
                          setIsRightSidebarOpen(false);
                        }
                      }}
                      onClose={() => {
                        if (isMobile) {
                          setCurrentView("chat");
                        } else {
                          setIsRightSidebarOpen(false);
                        }
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <MailWidget />
          )}
        </div>
      </main>



      {/* Responsive Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-[#0b141a]/60 backdrop-blur-sm"
            />

            {/* Sliding Drawer Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-80 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl z-10"
            >
              {/* Drawer Header */}
              <div className={`p-6 flex items-center justify-between text-white transition-all duration-500 ${
                activeTab === "chats" ? "bg-[#075E54]" : "bg-[#ea4335]"
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm shrink-0">
                    <span className={`font-black text-xs ${activeTab === "chats" ? "text-[#075E54]" : "text-[#ea4335]"}`}>DC</span>
                  </div>
                  <span className="text-lg font-bold tracking-tight">DockChat</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-95 text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {/* User Profile Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 relative group">
                  <div className="w-14 h-14 rounded-full border-2 border-white shadow-md bg-white flex items-center justify-center text-xl font-bold text-[#075E54] overflow-hidden shrink-0">
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (user?.name?.[0] || user?.username?.[0] || "?").toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{user?.name || user?.username}</h4>
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{user?.about || "Active Now"}</p>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 bg-white hover:bg-slate-100 active:scale-95 text-slate-400 hover:text-slate-600 rounded-full shadow-sm border border-slate-100 transition-all shrink-0"
                  >
                    <Settings size={16} />
                  </Link>
                </div>

                {/* Section Toggle list */}
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block px-1">Navigation</span>
                  
                  {/* IM Chats Toggle */}
                  <button
                    onClick={() => {
                      setActiveTab("chats");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-semibold transition-all text-sm group ${
                      activeTab === "chats"
                        ? "bg-[#25D366]/10 text-[#075E54] border border-[#25D366]/20 shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-all ${
                      activeTab === "chats" ? "bg-[#25D366] text-white" : "bg-slate-100 text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-200"
                    }`}>
                      <MessageSquare size={18} />
                    </div>
                    <span className="flex-1 text-left">IM Chats</span>
                    {activeTab === "chats" && <div className="w-2 h-2 rounded-full bg-[#25D366]" />}
                  </button>

                  {/* Inbox Mail Toggle */}
                  <button
                    onClick={() => {
                      setActiveTab("mail");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-semibold transition-all text-sm group ${
                      activeTab === "mail"
                        ? "bg-[#ea4335]/10 text-[#ea4335] border border-[#ea4335]/20 shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-all ${
                      activeTab === "mail" ? "bg-[#ea4335] text-white" : "bg-slate-100 text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-200"
                    }`}>
                      <Mail size={18} />
                    </div>
                    <span className="flex-1 text-left">Inbox Mail</span>
                    {activeTab === "mail" && <div className="w-2 h-2 rounded-full bg-[#ea4335]" />}
                  </button>
                </div>

                {/* Account Settings / Help */}
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block px-1">Settings</span>

                  <button
                    onClick={() => {
                      setIsSyncModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 text-slate-600 text-sm font-semibold transition-all text-left"
                  >
                    <div className="p-2 bg-slate-100 text-slate-400 rounded-xl">
                      <User size={18} />
                    </div>
                    <span>Sync Contacts</span>
                  </button>

                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 text-slate-600 text-sm font-semibold transition-all block text-left"
                  >
                    <div className="p-2 bg-slate-100 text-slate-400 rounded-xl inline-block mr-4 align-middle">
                      <Settings size={18} />
                    </div>
                    <span className="align-middle">Profile Settings</span>
                  </Link>
                </div>
              </div>

              {/* Drawer Footer (Logout) */}
              <div className="p-6 border-t border-slate-100">
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all text-xs uppercase tracking-widest"
                >
                  <LogOut size={16} />
                  <span>Logout Session</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            onClick={handleNotificationClick}
            className="fixed top-6 right-6 z-[99999] w-[360px] bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-2xl p-4 shadow-2xl flex gap-3.5 cursor-pointer hover:bg-white transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {activeNotification.icon ? (
                <img src={activeNotification.icon} alt="Sender" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-white font-bold text-sm ${activeNotification.type === 'chat' ? 'bg-[#075E54]' : 'bg-[#ea4335]'}`}>
                  {activeNotification.title ? activeNotification.title[0] : 'N'}
                </div>
              )}
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="text-xs font-bold text-slate-800 truncate leading-tight group-hover:text-[#ea4335] transition-colors">{activeNotification.title}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal font-medium">{activeNotification.body}</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveNotification(null);
              }}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition"
            >
              <X size={14} />
            </button>
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
