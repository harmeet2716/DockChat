import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Bell, Shield, Moon, LogOut, ArrowLeft, 
  Camera, Check, Trash2, ChevronRight, Globe, HelpCircle 
} from 'lucide-react';

const SettingsPage = () => {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [about, setAbout] = useState(user?.about || "Hey there! I'm using DockChat.");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    await updateProfile({ name, about });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const menuItems = [
    { icon: <Bell size={20} />, title: "Notifications", desc: "Sound, badges & message alerts", color: "text-[#075E54]", bg: "bg-[#D1F4CC]/30" },
    { icon: <Shield size={20} />, title: "Privacy & Security", desc: "Two-step verification, blocked contacts", color: "text-[#075E54]", bg: "bg-[#D1F4CC]/30" },
    { icon: <Moon size={20} />, title: "Appearance", desc: "Themes, wallpapers, font size", color: "text-[#075E54]", bg: "bg-[#D1F4CC]/30" },
    { icon: <Globe size={20} />, title: "App Language", desc: "English (System Default)", color: "text-[#075E54]", bg: "bg-[#D1F4CC]/30" },
    { icon: <HelpCircle size={20} />, title: "Help & Support", desc: "FAQ, contact us, privacy policy", color: "text-[#075E54]", bg: "bg-[#D1F4CC]/30" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#111b21] p-6 md:p-12 font-sans selection:bg-[#25D366]/30">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-10">
          <Link to="/dashboard" className="p-2 hover:bg-black/5 rounded-full transition text-[#075E54]">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </header>

        <div className="space-y-6">
          {/* Profile Card */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-black/[0.03] relative overflow-hidden group">
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="relative group/avatar">
                <div className="w-24 h-24 rounded-full bg-[#f0f2f5] border border-black/[0.05] flex items-center justify-center text-3xl font-bold text-[#075E54] shadow-inner overflow-hidden">
                  {user?.profilePic ? (
                    <img src={user.profilePic} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    (user?.name?.[0] || "?").toUpperCase()
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-[#25D366] text-white rounded-full shadow-md hover:scale-110 active:scale-95 transition-all">
                  <Camera size={16} />
                </button>
              </div>

              <div className="flex-1 space-y-4 w-full text-center md:text-left">
                <div className="space-y-1">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="bg-transparent text-xl font-bold border-none focus:ring-0 p-0 w-full text-center md:text-left text-[#111b21] placeholder:text-slate-300"
                  />
                  <input 
                    type="text" 
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Status"
                    className="bg-transparent text-sm text-[#54656f] border-none focus:ring-0 p-0 w-full text-center md:text-left"
                  />
                </div>
                <button 
                  onClick={handleSave}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 mx-auto md:mx-0 shadow-sm ${
                    isSaved 
                      ? "bg-[#075E54] text-white" 
                      : "bg-[#25D366] text-white hover:bg-[#128C7E]"
                  }`}
                >
                  {isSaved ? <><Check size={16} /> Updated</> : "Save Changes"}
                </button>
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

          {/* Danger Zone */}
          <section className="space-y-3">
            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-4 p-5 rounded-2xl bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-all text-rose-500 font-bold group"
            >
              <div className="p-2.5 rounded-full bg-white text-rose-500 shadow-sm">
                <LogOut size={20} />
              </div>
              <span className="text-xs uppercase tracking-widest">Logout Session</span>
            </button>
            <button className="w-full flex items-center gap-4 p-5 rounded-2xl bg-slate-100 border border-black/[0.02] hover:bg-slate-200 transition-all text-slate-400 font-bold group">
              <div className="p-2.5 rounded-full bg-white text-slate-400 shadow-sm">
                <Trash2 size={20} />
              </div>
              <span className="text-xs uppercase tracking-widest">Delete Account</span>
            </button>
          </section>

          <footer className="text-center py-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">DockChat v2.1.0 • WhatsApp Edition</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
