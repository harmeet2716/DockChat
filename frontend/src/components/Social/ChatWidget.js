import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Smile, Paperclip, Mic, Send, 
  MoreVertical, Phone, Video, Search,
  Check, CheckCheck, ChevronLeft, Info, MessageCircle, Mail
} from "lucide-react";

export const ChatWidget = ({ isMobile, onBack, onShowInfo }) => {
  const { user } = useContext(AuthContext);
  const { selectedChat, messages, sendMessage, isTyping } = useContext(ChatContext);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);

  const getChatName = (chat) => {
    if (!chat) return "";
    if (chat.isGroupChat) return chat.chatName;
    const otherUser = chat.users.find(u => u._id !== user._id);
    return otherUser ? otherUser.name : "User";
  };

  const getChatProfile = (chat) => {
    if (!chat) return "";
    if (chat.isGroupChat) return chat.chatName[0];
    const otherUser = chat.users.find(u => u._id !== user._id);
    return otherUser ? otherUser.name[0] : "U";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat, messages]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-primary)] relative">
      {/* Dynamic Theme Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-[var(--accent)]/5 pointer-events-none"></div>

      {/* Active Chat Header */}
      <header className="flex-shrink-0 h-20 glass-dark border-b border-white/5 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4 cursor-pointer overflow-hidden">
          {isMobile && (
            <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:bg-white/5 rounded-full transition">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-black text-xl text-white border border-white/10 shrink-0 shadow-lg">
            {getChatProfile(selectedChat)}
          </div>
          <div className="min-w-0" onClick={isMobile ? onShowInfo : undefined}>
            <h3 className="text-base font-black text-white truncate tracking-tight">{getChatName(selectedChat)}</h3>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isTyping ? "bg-white animate-pulse" : "bg-emerald-500"}`}></span>
              <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em]">
                {isTyping ? "typing..." : "secure connection"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:block p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition"><Video size={20} /></button>
          <button className="hidden sm:block p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition"><Phone size={18} /></button>
          <button onClick={onShowInfo} className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition"><Info size={20} /></button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button 
            title="Convert to Mail"
            className="p-2.5 text-[var(--accent)] hover:scale-110 transition-all"
            onClick={() => {
              const transcript = messages.map(m => `${m.sender.name}: ${m.content}`).join('\n');
              localStorage.setItem("dockchat_bridge_content", transcript);
              alert("Conversation captured! Go to the MAIL tab and click Compose to see the transcript.");
            }}
          >
            <Mail size={22} />
          </button>
        </div>
      </header>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-2 relative z-0">
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select a chat to start messaging
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <MessageCircle size={32} className="text-[#25D366]/40" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">
              This is the start of your conversation with <span className="text-[#075E54] font-bold">{getChatName(selectedChat)}</span>
            </p>
            <p className="text-xs">Say hi to start chatting!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSentByMe = msg.sender?._id === user._id;
            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex ${isSentByMe ? "justify-end" : "justify-start"} mb-1`}
              >
                <div 
                   className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-premium relative text-sm font-medium ${
                    isSentByMe 
                      ? "bg-[var(--accent)] text-white rounded-tr-none border border-white/10" 
                      : "bg-[var(--bubble-bg)] text-[var(--text-primary)] rounded-tl-none border border-white/5"
                  }`}
                >
                  <div className={`absolute top-0 w-2 h-2 ${
                    isSentByMe 
                      ? "right-[-8px] border-l-[8px] border-l-[var(--accent)] border-b-[8px] border-b-transparent" 
                      : "left-[-8px] border-r-[8px] border-r-[var(--bubble-bg)] border-b-[8px] border-b-transparent"
                  }`}></div>
                  
                  <p className="pr-12">{msg.content}</p>
                  <div className="mt-1 flex items-center justify-end gap-1.5 opacity-60">
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isSentByMe && (
                      msg.status === "read"
                        ? <CheckCheck size={12} className="text-[var(--accent)]" />
                        : <CheckCheck size={12} className="text-white/40" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Bar */}
      <footer className="flex-shrink-0 glass-dark p-6 flex items-center gap-4 z-10 border-t border-white/5">
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition"><Smile size={24} /></button>
          <button className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition"><Paperclip size={24} /></button>
        </div>
        <form 
          className="flex-1 flex gap-4 items-center"
          onSubmit={(e) => {
            e.preventDefault();
            if (messageText.trim()) {
              sendMessage(messageText);
              setMessageText("");
            }
          }}
        >
          <div className="flex-1 bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-inner group">
            <input 
              type="text" 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Communicate securely..."
              className="w-full px-6 py-4 text-sm bg-transparent text-white focus:outline-none placeholder:text-white/20 transition-all focus:bg-white/[0.08]"
            />
          </div>
          <button 
            type="submit"
            disabled={!messageText.trim()}
            className="w-14 h-14 bg-[var(--accent)] text-white rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-black/40 disabled:opacity-30 disabled:grayscale"
          >
            {messageText.trim() ? <Send size={24} className="ml-0.5" /> : <Mic size={24} />}
          </button>
        </form>
      </footer>
    </div>
  );
};
