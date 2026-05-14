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
    <div className="flex-1 flex overflow-hidden bg-white h-full">
      {/* Column 1: Folders */}
      <div className="hidden lg:flex w-64 border-r border-slate-100 flex-col bg-slate-50">
        <div className="p-6">
          <button 
            onClick={() => setIsComposeOpen(true)}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-sm font-bold text-slate-700 mb-8"
          >
            <Edit3 size={18} className="text-[#ea4335]" /> Compose
          </button>
          
          <nav className="space-y-1">
            {folders.map(f => (
              <button
                key={f.id}
                onClick={() => setFolder(f.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  folder === f.id ? "bg-[#ea4335]/10 text-[#ea4335]" : "text-slate-500 hover:bg-slate-200"
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Column 2: Inbox List */}
      <div className="w-full lg:w-[400px] border-r border-slate-100 flex flex-col bg-white shrink-0">
        <div className="p-4 border-b border-slate-100">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ea4335] transition" size={18} />
            <input 
              type="text" 
              placeholder="Search in mail"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-12 pr-4 text-sm text-slate-800 focus:ring-2 focus:ring-[#ea4335]/20 transition"
            />
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
                className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-all relative ${
                  selectedMail?._id === mail._id ? "bg-slate-100 shadow-inner" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm ${mail.isRead ? "text-slate-500 font-medium" : "text-slate-900 font-bold"}`}>
                    {mail.sender.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(mail.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-[#ea4335] truncate mb-0.5">{mail.subject}</h5>
                <p className="text-[11px] text-slate-500 line-clamp-1">{mail.content}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Column 3: Reading Pane */}
      <div className="hidden lg:flex flex-1 flex-col bg-white overflow-hidden">
        {selectedMail ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">{selectedMail.subject}</h2>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-[#ea4335] flex items-center justify-center font-bold text-sm border border-slate-200">
                    {selectedMail.sender.name[0]}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900">{selectedMail.sender.name}</span>
                    <span className="text-xs text-slate-500 ml-2">{`<${selectedMail.sender.email}>`}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"><Reply size={20} /></button>
                <button className="p-2.5 text-slate-400 hover:text-amber-400 hover:bg-amber-50 rounded-full transition"><StarIcon size={20} /></button>
                <button className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition"><Trash2 size={20} /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 max-w-4xl w-full">
              <div className="text-slate-800 leading-relaxed whitespace-pre-wrap text-sm">
                {selectedMail.content}
              </div>
            </div>

            <footer className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50">
              <button className="px-6 py-2.5 bg-[#ea4335] text-white font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-[#d93025] transition shadow-md active:scale-95">
                <Reply size={16} /> Reply
              </button>
              <button className="px-6 py-2.5 bg-white text-slate-600 font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-slate-100 transition active:scale-95 border border-slate-200">
                <Forward size={16} /> Forward
              </button>
            </footer>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
              <Mail size={40} className="text-[#ea4335]/20" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Select an item to read</h3>
            <p className="text-sm text-slate-400 max-w-xs">Nothing is selected</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsComposeOpen(false)}
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 bg-slate-800 text-white flex items-center justify-between">
                <h3 className="font-bold ml-2">New Message</h3>
                <button onClick={() => setIsComposeOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 border-b border-slate-100 py-2">
                    <label className="text-sm font-bold text-slate-400 w-12">To</label>
                    <input 
                      type="text" 
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="flex-1 bg-transparent border-none text-sm font-semibold focus:ring-0" 
                      placeholder="Recipients" 
                    />
                  </div>
                  <div className="flex items-center gap-4 border-b border-slate-100 py-2">
                    <label className="text-sm font-bold text-slate-400 w-12">Subject</label>
                    <input 
                      type="text" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="flex-1 bg-transparent border-none text-sm font-semibold focus:ring-0" 
                      placeholder="Subject" 
                    />
                  </div>
                </div>
                <textarea 
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full h-80 bg-transparent border-none text-sm font-medium focus:ring-0 resize-none leading-relaxed" 
                  placeholder="Type your message here..." 
                />
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition">
                    <Paperclip size={18} /> Attach files
                  </button>
                  <button 
                    onClick={handleSendMail}
                    disabled={loading || !to || !subject || !composeBody}
                    className="px-8 py-2.5 bg-[#ea4335] text-white font-bold rounded-xl shadow-lg hover:bg-[#d93025] transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>Send</>}
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
