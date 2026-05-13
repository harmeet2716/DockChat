import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Camera, ArrowRight, RefreshCw } from "lucide-react";

export function SetupProfile() {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("Hey there! I am using DockChat.");
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    const res = await updateProfile({ name, about });
    setLoading(false);
    
    if (res._id) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-6 selection:bg-[#25D366]/30 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="p-10 rounded-[2rem] bg-white shadow-xl border border-black/[0.03] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#075E54]" />
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 mb-6 p-3 bg-[#f0f2f5] rounded-full shadow-sm">
              <img src="/logo.png" alt="DockChat Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-[#111b21] tracking-tight mb-2">Profile Info</h2>
            <p className="text-[#54656f] text-center text-sm font-medium">
              Complete your identity to start chatting.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center">
              <div className="relative group/avatar">
                <div className="w-28 h-28 rounded-full bg-[#f0f2f5] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-[#075E54]/50 transition-all duration-500 overflow-hidden">
                  <User size={48} />
                </div>
                <button type="button" className="absolute bottom-1 right-1 w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all">
                  <Camera size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full bg-[#f0f2f5] border-none rounded-xl py-4 px-6 text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#075E54]/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">About / Bio</label>
                <input
                  type="text"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Hey there! I am using DockChat."
                  className="w-full bg-[#f0f2f5] border-none rounded-xl py-4 px-6 text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#075E54]/20 transition-all"
                />
              </div>
            </div>

            <button
              disabled={loading || !name.trim()}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Start Chatting</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
