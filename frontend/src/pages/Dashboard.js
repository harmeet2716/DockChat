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
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.12, time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(time);
        osc.stop(time + 0.35);
      };
      
      const now = audioCtx.currentTime;
      playPing(now, 523.25); // C5 tone
      playPing(now + 0.12, 659.25); // E5 tone
    } catch (e) {
      console.error("Failed to play notification chime via Web Audio:", e);
    }
  };

  // Helper to trigger both HTML5 Desktop Notification and In-App Toast Alert
  const triggerNotification = (payload) => {
    playNotificationChime();

    // Browser native desktop notification if window is minimized/backgrounded
    if (document.hidden && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || "/default-avatar.png",
        });
      } catch (err) {
        console.error("Native notification failed:", err);
      }
    }

    setActiveNotification(payload);
  };

  // Toast clicked action: auto-activate correct folder/tab and switch views
  const handleNotificationClick = () => {
    if (!activeNotification) return;

    if (activeNotification.type === "chat") {
      setActiveTab("chats");
      setSelectedChat(activeNotification.data.chat || activeNotification.data);
    } else if (activeNotification.type === "mail") {
      setActiveTab("mail");
    }
    setActiveNotification(null);
  };

  // Auto-dismiss toast notification after 5 seconds
  useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        setActiveNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeNotification]);

  // Request browser desktop notification permissions on load
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Listen to Socket.io events for real-time messages and emails
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (msg) => {
      const isCurrentChat = selectedChat && selectedChat._id === msg.chat._id;
      
      // Trigger notification if not in this chat room right now, or app is hidden
      if (!isCurrentChat || activeTab !== "chats" || document.hidden) {
        triggerNotification({
          title: `Message from ${msg.sender.name}`,
          body: msg.messageType === "text" ? msg.content : `[Shared ${msg.messageType}]`,
          icon: msg.sender.profilePic,
          type: "chat",
          data: msg
        });
      }
    };

    const handleMailReceived = (mail) => {
      // Always trigger notification for new emails in real-time
      triggerNotification({
        title: `Email: ${mail.subject}`,
        body: `From: ${mail.sender.name}\n${mail.content.substring(0, 60)}...`,
        icon: mail.sender.profilePic,
        type: "mail",
        data: mail
      });
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

          <div className="flex h-11 items-center bg-white/10 rounded-full p-1 border border-white/20 shadow-inner">
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
