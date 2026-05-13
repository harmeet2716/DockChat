import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Inbox, Send, Star, Trash2, Edit3, 
  Search, Paperclip, MoreVertical, Star as StarIcon,
  Reply, Forward, Trash, ChevronRight, User, Loader2,
  Mail, X
} from "lucide-react";

export const MailWidget = () => {
  const { user } = useContext(AuthContext);
  const [folder, setFolder] = useState("inbox");
  const [mails, setMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeBody, setComposeBody] = useState("");

  const fetchMails = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/mail?folder=${folder}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setMails(data);
    } catch (error) {
      console.error("Error fetching mails:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMails();
  }, [folder]);

  useEffect(() => {
    if (isComposeOpen) {
      const bridgeContent = localStorage.getItem("dockchat_bridge_content");
      if (bridgeContent) {
        setComposeBody(`--- Captured Chat Transcript ---\n\n${bridgeContent}\n\n-------------------------------`);
        localStorage.removeItem("dockchat_bridge_content");
      }
    }
  }, [isComposeOpen]);

  const folders = [
    { id: "inbox", icon: <Inbox size={16} />, label: "Inbox" },
    { id: "sent", icon: <Send size={16} />, label: "Sent" },
    { id: "starred", icon: <Star size={16} />, label: "Starred" },
  ];

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* Column 1: Inbox List (30%) */}
      <div className="w-[30%] min-w-[350px] border-r border-black/[0.05] flex flex-col bg-white">
        {/* Search & Folder Toggle */}
        <div className="p-4 space-y-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#075E54] transition" size={16} />
            <input 
              type="text" 
              placeholder="Search mail..."
              className="w-full bg-slate-100 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#075E54]/10 transition"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setIsComposeOpen(true)}
              className="flex-shrink-0 p-2.5 bg-[#25D366] text-white rounded-xl shadow-lg shadow-[#25D366]/20 hover:bg-[#128C7E] transition active:scale-95"
            >
              <Edit3 size={18} />
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-1" />
            {folders.map(f => (
              <button
                key={f.id}
                onClick={() => setFolder(f.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  folder === f.id ? "bg-[#075E54] text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mail List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-slate-300" size={32} />
            </div>
          ) : mails.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Mail size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-xs font-medium">Your inbox is empty</p>
            </div>
          ) : (
            mails.map((mail) => (
              <button
                key={mail._id}
                onClick={() => setSelectedMail(mail)}
                className={`w-full text-left p-5 border-b border-black/[0.02] hover:bg-[#f8f9fa] transition-all relative ${
                  selectedMail?._id === mail._id ? "bg-[#f0f9f4] after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-[#25D366]" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm ${mail.isRead ? "text-slate-600 font-medium" : "text-slate-900 font-black"}`}>
                    {mail.sender.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {new Date(mail.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-[#075E54] truncate mb-1">{mail.subject}</h5>
                <p className="text-[11px] text-slate-400 line-clamp-1">{mail.content}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Column 2: Reading Pane (70%) */}
      <div className="flex-1 flex flex-col bg-slate-50/20">
        {selectedMail ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <header className="p-8 border-b border-black/[0.03] flex items-center justify-between bg-white">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">{selectedMail.subject}</h2>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#075E54] text-white flex items-center justify-center font-bold text-xs">
                    {selectedMail.sender.name[0]}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900">{selectedMail.sender.name}</span>
                    <span className="text-xs text-slate-400 font-medium ml-2">{`<${selectedMail.sender.email}>`}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition flex items-center gap-2">
                  <Reply size={14} /> Reply
                </button>
                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition"><StarIcon size={18} /></button>
                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition"><Trash2 size={18} /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-12 max-w-4xl">
              <div className="prose prose-slate prose-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {selectedMail.content}
              </div>
            </div>

            <footer className="p-8 border-t border-black/[0.03] flex gap-4">
              <button className="px-6 py-3 bg-[#075E54] text-white font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-[#128C7E] transition shadow-lg shadow-[#075E54]/10 active:scale-95">
                <Reply size={18} /> Send Reply
              </button>
              <button className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-slate-200 transition active:scale-95">
                <Forward size={18} /> Forward
              </button>
            </footer>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
            <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-sm border border-black/[0.03]">
              <Mail size={48} className="text-[#25D366]/20" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Select a mail to read</h3>
            <p className="text-sm text-slate-400 max-w-sm">Choose an email from your inbox on the left to view its full content here.</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#075E54]/40 backdrop-blur-md"
              onClick={() => setIsComposeOpen(false)}
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-8 bg-[#075E54] text-white flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">New Message</h3>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Productivity Mode Active</p>
                </div>
                <button onClick={() => setIsComposeOpen(false)} className="p-3 hover:bg-white/10 rounded-full transition"><X /></button>
              </div>
              <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#075E54] ml-1">To</label>
                    <input type="text" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-semibold focus:ring-4 focus:ring-[#25D366]/10 transition" placeholder="recipient@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#075E54] ml-1">Subject</label>
                    <input type="text" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-semibold focus:ring-4 focus:ring-[#25D366]/10 transition" placeholder="What's this about?" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#075E54] ml-1">Message Body</label>
                  <textarea 
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="w-full h-64 bg-slate-50 border-none rounded-3xl py-6 px-6 text-sm font-semibold focus:ring-4 focus:ring-[#25D366]/10 transition resize-none leading-relaxed" 
                    placeholder="Type your professional message..." 
                  />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <button className="flex items-center gap-2 text-slate-400 hover:text-[#075E54] font-bold text-sm transition">
                    <Paperclip size={20} /> Add Attachment
                  </button>
                  <button className="px-10 py-4 bg-[#25D366] text-white font-black rounded-2xl shadow-xl shadow-[#25D366]/30 hover:bg-[#128C7E] transition active:scale-95 flex items-center gap-3">
                    Send Email <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
