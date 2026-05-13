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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#efe7dd] relative">
      {/* WhatsApp Background Pattern Overlay */}
      <div className="absolute inset-0 bg-whatsapp-pattern opacity-[0.06] pointer-events-none"></div>

      {/* Active Chat Header */}
      <header className="flex-shrink-0 h-16 bg-[#f0f2f5] border-b border-black/[0.05] flex items-center justify-between px-4 z-10 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer overflow-hidden">
          {isMobile && (
            <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:bg-black/5 rounded-full transition">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[#075E54] border border-black/[0.05] shrink-0">
            {getChatProfile(selectedChat)}
          </div>
          <div className="min-w-0" onClick={isMobile ? onShowInfo : undefined}>
            <h3 className="text-sm font-bold text-slate-900 truncate">{getChatName(selectedChat)}</h3>
            <p className="text-[10px] text-[#25D366] font-bold uppercase tracking-widest">
              {isTyping ? "typing..." : "online"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="hidden sm:block p-2 text-slate-500 hover:bg-black/5 rounded-full transition"><Video size={20} /></button>
          <button className="hidden sm:block p-2 text-slate-500 hover:bg-black/5 rounded-full transition"><Phone size={18} /></button>
          <button onClick={onShowInfo} className="p-2 text-slate-500 hover:bg-black/5 rounded-full transition"><Info size={20} /></button>
          <button 
            title="Convert to Mail"
            className="p-2 text-[#075E54] hover:bg-[#075E54]/10 rounded-full transition"
            onClick={() => {
              // Extract chat history for the bridge
              const transcript = messages.map(m => `${m.sender.name}: ${m.content}`).join('\n');
              localStorage.setItem("dockchat_bridge_content", transcript);
              alert("Conversation captured! Go to the MAIL tab and click Compose to see the transcript.");
            }}
          >
            <Mail size={20} />
          </button>
          <button className="p-2 text-slate-500 hover:bg-black/5 rounded-full transition"><MoreVertical size={20} /></button>
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
                  className={`max-w-[75%] px-3 py-1.5 rounded-lg shadow-sm relative text-sm ${
                    isSentByMe 
                      ? "bg-[#DCF8C6] text-slate-900 rounded-tr-none" 
                      : "bg-white text-slate-900 rounded-tl-none"
                  }`}
                >
                  <div className={`absolute top-0 w-2 h-2 ${
                    isSentByMe 
                      ? "right-[-8px] border-l-[8px] border-l-[#DCF8C6] border-b-[8px] border-b-transparent" 
                      : "left-[-8px] border-r-[8px] border-r-white border-b-[8px] border-b-transparent"
                  }`}></div>
                  
                  <p className="pr-12">{msg.content}</p>
                  <div className="absolute bottom-1 right-2 flex items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-medium uppercase">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isSentByMe && (
                      msg.status === "read"
                        ? <CheckCheck size={14} className="text-[#34B7F1]" />
                        : msg.status === "delivered" 
                          ? <CheckCheck size={14} className="text-slate-400" />
                          : <Check size={14} className="text-slate-400" />
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
      <footer className="flex-shrink-0 bg-[#f0f2f5] p-3 flex items-center gap-3 z-10">
        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-500 hover:bg-black/5 rounded-full transition"><Smile size={24} /></button>
          <button className="p-2 text-slate-500 hover:bg-black/5 rounded-full transition"><Paperclip size={24} /></button>
        </div>
        <form 
          className="flex-1 flex gap-3 items-center"
          onSubmit={(e) => {
            e.preventDefault();
            if (messageText.trim()) {
              sendMessage(messageText);
              setMessageText("");
            }
          }}
        >
          <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm">
            <input 
              type="text" 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message"
              className="w-full px-4 py-2.5 text-sm focus:outline-none placeholder:text-slate-400"
            />
          </div>
          <button 
            type="submit"
            disabled={!messageText.trim()}
            className="w-12 h-12 bg-[#075E54] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md disabled:bg-slate-300"
          >
            {messageText.trim() ? <Send size={20} className="ml-0.5" /> : <Mic size={20} />}
          </button>
        </form>
      </footer>
    </div>
  );
};
