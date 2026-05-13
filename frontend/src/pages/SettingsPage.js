import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Bell, Shield, Moon, LogOut, ArrowLeft, 
  Camera, Check, Trash2, ChevronRight, Globe, HelpCircle,
  Pencil, X, Save, User, Info, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsPage = () => {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const [editingField, setEditingField] = useState(null); // 'name' | 'about'
  const [tempValue, setTempValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEditClick = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleSave = async () => {
    setLoading(true);
    await updateProfile({ [editingField]: tempValue });
    setLoading(false);
    setEditingField(null);
  };

  const menuItems = [
    { icon: <Bell size={20} />, title: "Notifications", desc: "Sound, badges & message alerts", color: "text-[#075E54]", bg: "bg-[#D1F4CC]/30" },
    { icon: <Shield size={20} />, title: "Privacy & Security", desc: "Two-step verification, blocked contacts", color: "text-[#075E54]", bg: "bg-[#D1F4CC]/30" },
    { icon: <Moon size={20} />, title: "Appearance", desc: "Themes, wallpapers, font size", color: "text-[#075E54]", bg: "bg-[#D1F4CC]/30" },
    { icon: <Globe size={20} />, title: "App Language", desc: "English (System Default)", color: "text-[#075E54]", bg: "bg-[#D1F4CC]/30" },
    { icon: <HelpCircle size={20} />, title: "Help & Support", desc: "FAQ, contact us, privacy policy", color: "text-[#075E54]", bg: "bg-[#D1F4CC]/30" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#111b21] font-sans selection:bg-[#25D366]/30">
      {/* Header */}
      <header className="bg-[#075E54] text-white p-6 pb-20 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto -mt-16 px-6 relative z-30 pb-20">
        {/* Profile Info Section */}
        <div className="space-y-6">
          {/* Large Profile Picture */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group/avatar">
              <div className="w-40 h-40 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center text-5xl font-bold text-[#075E54] overflow-hidden">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  (user?.name?.[0] || "?").toUpperCase()
                )}
              </div>
              <label className="absolute bottom-1 right-1 p-3 bg-[#25D366] text-white rounded-full shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all">
                <Camera size={24} />
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>

          {/* WhatsApp Style Rows */}
          <section className="bg-white rounded-2xl shadow-sm border border-black/[0.03] overflow-hidden divide-y divide-black/[0.03]">
            {/* Name Row */}
            <button 
              onClick={() => handleEditClick('name', user?.name)}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group text-left"
            >
              <div className="flex items-start gap-6">
                <User className="text-[#075E54] mt-1" size={20} />
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Name</label>
                  <p className="text-base font-semibold text-[#111b21]">{user?.name || "No name set"}</p>
                </div>
              </div>
              <Pencil size={18} className="text-slate-300 group-hover:text-[#25D366] transition-colors" />
            </button>

            {/* About Row */}
            <button 
              onClick={() => handleEditClick('about', user?.about)}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group text-left"
            >
              <div className="flex items-start gap-6">
                <Info className="text-[#075E54] mt-1" size={20} />
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">About</label>
                  <p className="text-sm text-[#54656f]">{user?.about || "Available"}</p>
                </div>
              </div>
              <Pencil size={18} className="text-slate-300 group-hover:text-[#25D366] transition-colors" />
            </button>

            {/* Phone Row (Read Only) */}
            <div className="w-full flex items-center justify-between p-6 text-left opacity-60">
              <div className="flex items-start gap-6">
                <Phone className="text-[#075E54] mt-1" size={20} />
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Phone Number</label>
                  <p className="text-sm font-semibold text-[#111b21]">{user?.phoneNumber}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Menu Items */}
          <section className="bg-white rounded-2xl shadow-sm border border-black/[0.03] overflow-hidden">
            {menuItems.map((item, index) => (
              <button 
                key={index}
                className="w-full flex items-center justify-between p-5 hover:bg-[#f0f2f5] transition-all border-b border-black/[0.02] last:border-0 group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-full ${item.bg} ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-[#111b21]">{item.title}</h3>
                    <p className="text-[10px] font-medium text-[#54656f] uppercase tracking-widest mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-[#075E54] transition-colors" />
              </button>
            ))}
          </section>

          {/* Logout Section */}
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-white border border-rose-100 hover:bg-rose-50 transition-all text-rose-500 font-bold shadow-sm"
          >
            <LogOut size={20} />
            <span className="text-xs uppercase tracking-widest">Logout Session</span>
          </button>
        </div>
      </div>

      {/* Edit Pop-up Overlay */}
      <AnimatePresence>
        {editingField && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingField(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-t-[2rem] sm:rounded-2xl p-8 shadow-2xl z-50"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold capitalize">Edit {editingField}</h3>
                <button onClick={() => setEditingField(null)} className="p-2 hover:bg-slate-100 rounded-full transition">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    autoFocus
                    className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-slate-900 font-semibold focus:ring-4 focus:ring-[#25D366]/10 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs">
                    {tempValue.length}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setEditingField(null)}
                    className="flex-1 py-4 px-6 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={loading || !tempValue.trim()}
                    className="flex-1 py-4 px-6 rounded-xl bg-[#25D366] text-white font-bold shadow-lg shadow-[#25D366]/20 hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <><Save size={20} /> Save</>}
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

const RefreshCw = ({ className, size }) => (
  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
    <Save size={size} className={className} />
  </motion.div>
);

export default SettingsPage;
