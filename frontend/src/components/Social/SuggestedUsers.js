import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Check, Plus, BadgeCheck } from "lucide-react";

export const SuggestedUsers = () => {
  const [suggestions, setSuggestions] = useState([]);
  const { getSuggestedUsers, toggleFollow } = useContext(AuthContext);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    const data = await getSuggestedUsers();
    setSuggestions(data);
  };

  const handleFollow = async (id) => {
    const res = await toggleFollow(id);
    if (res.isFollowing) {
      setSuggestions(prev => prev.filter(u => u._id !== id));
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="py-2 px-1">
      <div className="space-y-6">
        {suggestions.map((u, i) => (
          <motion.div
            key={u._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "circOut" }}
            className="flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="relative group-hover:scale-110 transition-all duration-300">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100/50 p-0.5 flex items-center justify-center shadow-sm">
                  <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
                    {u.profilePic ? (
                      <img src={u.profilePic} alt={u.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-black text-blue-600 italic">{(u.name?.[0] || "?").toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-black text-slate-950 italic tracking-tighter truncate">@{u.username}</p>
                  {u.isVerified && <BadgeCheck size={12} className="text-blue-500" />}
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.15em] truncate">{u.name}</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleFollow(u._id)}
              className="flex items-center gap-1 p-2.5 rounded-xl bg-slate-50 border border-black/[0.02] hover:bg-blue-600 text-slate-400 hover:text-white transition-all active:scale-95 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <Plus size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

