import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Inbox, Send, Star, Trash2, Edit3, 
  Search, Paperclip, MoreVertical, Star as StarIcon,
  Reply, Forward, Trash, ChevronRight, User, Loader2
} from "lucide-react";

export const MailWidget = () => {
  const { user } = useContext(AuthContext);
  const [folder, setFolder] = useState("inbox");
  const [mails, setMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

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

  const folders = [
    { id: "inbox", icon: <Inbox size={18} />, label: "Inbox" },
    { id: "sent", icon: <Send size={18} />, label: "Sent" },
    { id: "starred", icon: <Star size={18} />, label: "Starred" },
    { id: "trash", icon: <Trash2 size={18} />, label: "Trash" },
  ];

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* Column 1: Folders Sidebar */}
      <div className="w-64 border-r border-black/[0.05] flex flex-col p-4 bg-slate-50/50">
        <button 
          onClick={() => setIsComposeOpen(true)}
          className="w-full bg-[#25D366] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 hover:bg-[#128C7E] transition-all mb-8 active:scale-95"
        >
          <Edit3 size={18} /> Compose
        </button>

        <nav className="space-y-1">
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => setFolder(f.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                folder === f.id 
                  ? "bg-[#075E54] text-white shadow-md" 
                  : "text-slate-500 hover:bg-slate-200/50"
              }`}
            >
              <div className="flex items-center gap-3">
                {f.icon}
                {f.label}
              </div>
              {f.id === "inbox" && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${folder === f.id ? "bg-white/20" : "bg-slate-200 text-slate-600"}`}>
                  12
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Column 2: Email List Pane */}
      <div className="w-[450px] border-r border-black/[0.05] flex flex-col">
        <div className="p-4 border-b border-black/[0.05]">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#075E54] transition" size={16} />
            <input 
              type="text" 
              placeholder="Search mail..."
              className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#075E54]/10 transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-slate-300" size={32} />
            </div>
          ) : mails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 p-8 text-center">
              <Inbox size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No emails in this folder</p>
            </div>
          ) : (
            mails.map((mail) => (
              <button
                key={mail._id}
                onClick={() => setSelectedMail(mail)}
                className={`w-full text-left p-4 border-b border-black/[0.02] hover:bg-slate-50 transition-all relative ${
                  selectedMail?._id === mail._id ? "bg-[#f0f9f4] border-l-4 border-l-[#25D366]" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm ${mail.isRead ? "text-slate-600 font-medium" : "text-slate-900 font-black"}`}>
                    {mail.sender.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {new Date(mail.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h5 className={`text-xs mb-1 truncate ${mail.isRead ? "text-slate-500 font-medium" : "text-[#075E54] font-bold"}`}>
                  {mail.subject}
                </h5>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {mail.content}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Column 3: Reading Pane */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {selectedMail ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-white shadow-inner">
            <header className="p-6 border-b border-black/[0.05] flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedMail.subject}</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition"><StarIcon size={20} /></button>
                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition"><Trash size={20} /></button>
                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition"><MoreVertical size={20} /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-[#075E54]/10 flex items-center justify-center font-bold text-[#075E54] text-lg">
                  {selectedMail.sender.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{selectedMail.sender.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedMail.sender.email}</p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                {selectedMail.content}
              </div>
            </div>

            <footer className="p-6 border-t border-black/[0.05] flex gap-3">
              <button className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition active:scale-95">
                <Reply size={18} /> Reply
              </button>
              <button className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition active:scale-95">
                <Forward size={18} /> Forward
              </button>
            </footer>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-black/[0.03]">
              <Edit3 size={40} className="text-[#25D366]/20" />
            </div>
            <h3 className="text-lg font-bold text-slate-400 mb-2">No email selected</h3>
            <p className="text-sm max-w-xs leading-relaxed">Select an email from the list to read it or compose a new message.</p>
          </div>
        )}
      </div>

      {/* Compose Modal (Simplified) */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsComposeOpen(false)}
            />
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-[#075E54] text-white flex items-center justify-between">
                <h3 className="text-xl font-bold">New Message</h3>
                <button onClick={() => setIsComposeOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                  <ChevronRight size={24} className="rotate-90" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">To</label>
                  <input type="text" className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-sm font-semibold focus:ring-2 focus:ring-[#075E54]/10 transition" placeholder="recipient@example.com" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Subject</label>
                  <input type="text" className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-sm font-semibold focus:ring-2 focus:ring-[#075E54]/10 transition" placeholder="Enter subject" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Message</label>
                  <textarea 
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="w-full h-48 bg-slate-50 border-none rounded-xl py-4 px-4 text-sm font-semibold focus:ring-2 focus:ring-[#075E54]/10 transition resize-none" 
                    placeholder="Write your professional message here..." 
                  />
                </div>
                <div className="flex gap-4">
                  <button className="p-4 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition"><Paperclip size={20} /></button>
                  <button className="flex-1 bg-[#25D366] text-white font-bold rounded-xl py-4 shadow-lg shadow-[#25D366]/20 hover:bg-[#128C7E] transition active:scale-95">Send Email</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
