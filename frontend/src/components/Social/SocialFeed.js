import { motion } from "framer-motion";
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, 
  BadgeCheck, Smile, Image as ImageIcon,
  Mail, Bell, Star, AlertCircle
} from "lucide-react";

export const SocialFeed = ({ activeTab }) => {
  const posts = [
    {
      id: 1,
      user: { name: "Alex Rivera", username: "alex_v", isVerified: true, profile: "A" },
      caption: "Exploring the future of social design with DockChat! 🚀 #Design #Future",
      time: "2 hours ago",
      likes: 124,
      comments: 18,
      type: "update"
    }
  ];

  const notifications = [
    { id: 1, type: "mail", title: "New login detected", desc: "A new login was detected from a Chrome browser on Windows.", time: "10m ago", priority: "high" },
    { id: 2, type: "chat", title: "Alexander Blue", desc: "sent you a new message in 'Project Team'", time: "25m ago", priority: "medium" },
    { id: 3, type: "system", title: "System Update", desc: "DockChat v2.1.0 is now live with Hybrid mode.", time: "1h ago", priority: "low" },
  ];

  return (
    <div className="space-y-4">
      {/* Dynamic Header for Feed Area */}
      <div className="flex items-center justify-between px-2 mb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
          {activeTab === "chats" ? <><Bell size={18} className="text-[#25D366]" /> Recent Updates</> : <><Mail size={18} className="text-[#ea4335]" /> Inbox Highlights</>}
        </h3>
        <button className="text-[10px] font-bold text-[#075E54] hover:underline uppercase tracking-widest">Mark all as read</button>
      </div>

      {activeTab === "chats" ? (
        /* Chat Feed Style */
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-black/[0.03] p-4"
          >
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">U</div>
              <div className="flex-1 space-y-4">
                <input placeholder="Share a quick update..." className="w-full bg-[#f0f2f5] border-none rounded-lg py-2 px-4 text-sm focus:ring-0 placeholder:text-slate-500" />
                <div className="flex items-center justify-between pt-2 border-t border-black/[0.02]">
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 text-slate-500 hover:text-[#075E54] transition text-xs font-bold"><ImageIcon size={18} className="text-[#25D366]" /> Media</button>
                    <button className="flex items-center gap-2 text-slate-500 hover:text-[#075E54] transition text-xs font-bold"><Smile size={18} className="text-amber-500" /> Mood</button>
                  </div>
                  <button className="bg-[#25D366] text-white px-6 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-[#128C7E] transition-all">Publish</button>
                </div>
              </div>
            </div>
          </motion.div>

          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl shadow-sm border border-black/[0.03] overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#075E54]">{post.user.profile}</div>
                  <div>
                    <div className="flex items-center gap-1.5"><h4 className="text-sm font-bold text-slate-900">{post.user.name}</h4><BadgeCheck size={14} className="text-[#25D366]" /></div>
                    <p className="text-[10px] text-slate-400 font-bold">{post.time}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition"><MoreHorizontal size={18} /></button>
              </div>
              <div className="px-4 pb-3"><p className="text-sm text-slate-700 leading-relaxed">{post.caption}</p></div>
              <div className="p-2 border-t border-black/[0.02] flex items-center justify-between px-4">
                <div className="flex gap-4"><button className="flex items-center gap-1 text-slate-500 hover:text-rose-500 transition"><Heart size={18} /><span className="text-xs font-bold">{post.likes}</span></button><button className="flex items-center gap-1 text-slate-500 hover:text-[#075E54] transition"><MessageCircle size={18} /><span className="text-xs font-bold">{post.comments}</span></button></div>
                <button className="text-slate-500 hover:text-[#075E54] transition"><Share2 size={18} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Unified Notification/Mail Feed */
        <div className="space-y-4">
          {notifications.map((n, i) => (
            <motion.div 
              key={n.id} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.1 }} 
              className={`bg-white rounded-xl shadow-sm border p-4 flex gap-4 hover:shadow-md transition-all border-l-4 ${
                n.priority === "high" ? "border-l-[#ea4335]" : n.priority === "medium" ? "border-l-[#25D366]" : "border-l-slate-200"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                n.type === "mail" ? "bg-rose-50 text-[#ea4335]" : n.type === "chat" ? "bg-green-50 text-[#25D366]" : "bg-slate-50 text-slate-400"
              }`}>
                {n.type === "mail" ? <Mail size={20} /> : n.type === "chat" ? <MessageCircle size={20} /> : <Bell size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{n.title}</h4>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">{n.time}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{n.desc}</p>
                <div className="mt-3 flex gap-2">
                  <button className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition ${
                    n.priority === "high" ? "bg-[#ea4335] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>View Detail</button>
                  <button className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-slate-50 text-slate-400 hover:bg-slate-100 transition">Dismiss</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
