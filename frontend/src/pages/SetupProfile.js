import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, User, Info, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SetupProfile() {
  const { user, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [about, setAbout] = useState(user?.about || "Hey there! I am using DockChat.");
  const [profilePic, setProfilePic] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
      const res = await fetch(`${backendUrl}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setProfilePic(data.url);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleFinish = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      const res = await updateProfile({ 
        name: name.trim(), 
        about: about.trim(), 
        profilePic 
      });
      
      if (res && res._id) {
        // Successful update
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Profile setup failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 font-sans selection:bg-[#25D366]/30">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#25D366]/10 text-[#075E54] rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <CheckCircle2 size={12} /> Step 2: Finalize Identity
          </div>
          <h1 className="text-4xl font-black text-[#111b21] mb-2 tracking-tight">Setup Your Profile</h1>
          <p className="text-slate-500 text-sm">People will see your name and photo when you message them.</p>
        </div>

        {/* Profile Pic Upload Section */}
        <div className="relative w-40 h-40 mx-auto mb-12">
          <div className="w-full h-full rounded-full bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden group relative">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <User size={64} className="text-slate-200" />
            )}
            
            <AnimatePresence>
              {uploading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white"
                >
                  <Loader2 size={24} className="animate-spin mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Uploading...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <label className="absolute bottom-1 right-1 p-3 bg-[#25D366] text-white rounded-full shadow-xl cursor-pointer hover:bg-[#128C7E] hover:scale-110 transition-all active:scale-95 group">
            <Camera size={24} className="group-hover:rotate-12 transition-transform" />
            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
          </label>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleFinish} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#075E54] uppercase tracking-widest ml-1">Display Name</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 group-focus-within:text-[#25D366] transition-colors">
                <User size={20} />
              </div>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should we call you?"
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-4 text-slate-900 font-semibold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366]/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#075E54] uppercase tracking-widest ml-1">Status Message</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 group-focus-within:text-[#25D366] transition-colors">
                <Info size={20} />
              </div>
              <input 
                type="text" 
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="A bit about yourself..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-4 text-slate-900 font-semibold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366]/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim() || uploading}
            className="w-full mt-6 bg-[#25D366] text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#128C7E] disabled:opacity-50 disabled:grayscale transition-all shadow-2xl shadow-[#25D366]/30 active:scale-95 transform"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <span className="text-lg">Finish Setup</span>
                <ArrowRight size={22} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-xs px-8 leading-relaxed">
          By clicking finish, your name and photo will become visible to other users on the platform.
        </p>
      </motion.div>
    </div>
  );
}
