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
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");

  const handleSendMail = async () => {
    if (!to || !subject || !composeBody) return;
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/mail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          recipients: { to: [to] },
          subject,
          content: composeBody,
        }),
      });
      if (res.ok) {
        setIsComposeOpen(false);
        setComposeBody("");
        setTo("");
        setSubject("");
        fetchMails();
      }
    } catch (error) {
      console.error("Error sending mail:", error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="flex-1 flex overflow-hidden bg-[var(--bg-primary)] h-full">
      {/* Column 1: Folders (Hidden on small mobile, Sidebar on Tablet/Desktop) - Landing Page Themed */}
      <div className="hidden lg:flex w-64 border-r border-slate-200/60 flex-col bg-slate-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-[#ea4335] rounded-xl shadow-lg rotate-12 flex items-center justify-center text-white font-bold">M</div>
            <span className="text-sm font-bold uppercase tracking-wider text-slate-800">Mailbox</span>
          </div>
          <nav className="space-y-2">
            {folders.map(f => (
              <button
                key={f.id}
                onClick={() => setFolder(f.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  folder === f.id 
                    ? "bg-[#ea4335] text-white shadow-md shadow-rose-500/10 scale-105" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Column 2: Inbox List (Fluid) */}
      <div className={`w-full lg:w-[400px] border-r border-slate-200/60 flex-col bg-[var(--bg-secondary)] shrink-0 ${selectedMail ? "hidden lg:flex" : "flex"}`}>
        {/* Search & Folder Toggle (Mobile Only Toggle) */}
        <div className="p-6 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ea4335] transition" size={18} />
            <input 
              type="text" 
              placeholder="Search archives..."
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea4335]/30 transition shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setIsComposeOpen(true)}
              className="flex-shrink-0 p-3 bg-[#ea4335] text-white rounded-xl shadow-md shadow-rose-500/20 hover:bg-[#d93025] transition-all active:scale-95 flex items-center justify-center"
            >
              <Edit3 size={18} />
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1" />
            <div className="flex lg:hidden gap-3 overflow-x-auto scrollbar-hide">
              {folders.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFolder(f.id)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    folder === f.id 
                      ? "bg-[#ea4335] text-white shadow-sm" 
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                  }`}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mail List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-[#ea4335]" size={32} />
            </div>
          ) : mails.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Mail size={32} className="mx-auto mb-2 opacity-20 text-slate-600" />
              <p className="text-xs font-medium">Your inbox is empty</p>
            </div>
          ) : (
            mails.map((mail) => (
              <button
                key={mail._id}
                onClick={() => setSelectedMail(mail)}
                className={`w-full text-left p-6 border-b border-slate-100 hover:bg-slate-100/50 transition-all relative ${
                  selectedMail?._id === mail._id 
                    ? "bg-slate-100 after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-[#ea4335]" 
                    : ""
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`text-sm tracking-tight ${mail.isRead ? "text-slate-400 font-medium" : "text-slate-800 font-bold"}`}>
                    {mail.sender.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {new Date(mail.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-[#ea4335] truncate mb-1 uppercase tracking-tight">{mail.subject}</h5>
                <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">{mail.content}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Column 3: Reading Pane (Fluid) */}
      <div className={`flex-grow flex-col bg-white overflow-hidden ${selectedMail ? "flex" : "hidden lg:flex"}`}>
        {selectedMail ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <header className="p-6 sm:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 gap-4">
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setSelectedMail(null)} 
                  className="lg:hidden self-start flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition"
                >
                  <ChevronRight className="rotate-180" size={16} /> Back to Inbox
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 tracking-tight">{selectedMail.subject}</h2>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ea4335] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-rose-500/10">
                    {selectedMail.sender.name[0]}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 tracking-tight">{selectedMail.sender.name}</span>
                    <span className="text-xs text-slate-400 font-medium ml-3 block sm:inline">{`<${selectedMail.sender.email}>`}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2 border border-slate-200">
                  <Reply size={16} /> Reply
                </button>
                <button className="p-2.5 text-slate-400 hover:text-amber-400 hover:bg-slate-100 rounded-xl transition"><StarIcon size={20} /></button>
                <button className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"><Trash2 size={20} /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 max-w-4xl w-full mx-auto">
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-normal text-sm bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                {selectedMail.content}
              </div>
            </div>

            <footer className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/50">
              <button className="px-6 py-3 bg-[#ea4335] text-white font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-[#d93025] transition shadow-md active:scale-95">
                <Reply size={16} /> Reply
              </button>
              <button className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-slate-200 transition active:scale-95 border border-slate-200">
                <Forward size={16} /> Forward
              </button>
            </footer>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/30">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
              <Mail size={36} className="text-[#ea4335]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Select an email to read</h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Choose an email from your inbox on the left to view its full content in the reading pane.</p>
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
                    <input 
                      type="text" 
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-semibold focus:ring-4 focus:ring-[#25D366]/10 transition" 
                      placeholder="recipient@example.com" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#075E54] ml-1">Subject</label>
                    <input 
                      type="text" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-semibold focus:ring-4 focus:ring-[#25D366]/10 transition" 
                      placeholder="What's this about?" 
                    />
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
                  <button 
                    onClick={handleSendMail}
                    disabled={loading || !to || !subject || !composeBody}
                    className="px-10 py-4 bg-[#25D366] text-white font-black rounded-2xl shadow-xl shadow-[#25D366]/30 hover:bg-[#128C7E] transition active:scale-95 flex items-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Send Email <ChevronRight size={20} /></>}
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
