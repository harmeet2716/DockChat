import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, Shield, Zap, Globe, ArrowRight, Share2, Heart, CheckCircle2, Mail, Layout } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-[#111b21] overflow-x-hidden selection:bg-[#25D366]/30 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#075E54] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-tight">DockChat</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a href="#features" className="hover:text-[#25D366] transition">Features</a>
            <a href="#security" className="hover:text-[#25D366] transition">Security</a>
            <a href="#hybrid" className="hover:text-[#25D366] transition">Hybrid Mode</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold hover:text-[#25D366] transition px-4 py-2">Log In</Link>
            <Link to="/signup" className="bg-[#25D366] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#128C7E] transition-all shadow-md">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 bg-[#D1F4CC]/50 text-[#075E54] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                <Layout size={14} /> The 2-in-1 Communication Suite
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 text-[#111b21]">
                IM & Email. <br />
                <span className="text-[#075E54]">Truly Hybrid.</span>
              </h1>
              <p className="text-[#54656f] text-lg md:text-xl max-w-xl mb-12 leading-relaxed font-medium">
                Switch seamlessly between instant messaging and professional email. 
                Experience the utility of WhatsApp and the power of Gmail in one unified workspace.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link to="/signup" className="w-full sm:w-auto px-10 py-4 bg-[#25D366] text-white font-bold rounded-full hover:bg-[#128C7E] transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                  Launch Your Identity <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-10 py-4 bg-white border border-[#075E54]/10 text-[#075E54] font-bold rounded-full hover:bg-[#f0f2f5] transition-all shadow-sm">
                  Web Terminal
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 relative">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="relative z-10">
              <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl border border-black/[0.05]">
                <img src="https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&q=80&w=2000" alt="App Preview" className="rounded-[2rem] shadow-inner" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-black/[0.03] flex items-center gap-3 animate-bounce">
                <div className="w-10 h-10 bg-[#ea4335] rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hybrid Mode</p>
                  <p className="text-sm font-bold text-slate-900">Email Integrated</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <MessageCircle className="text-[#075E54]" />, title: "Instant Messaging", desc: "Real-time communication with standard-setting performance and privacy." },
              { icon: <Mail className="text-[#ea4335]" />, title: "Email Services", desc: "A full-featured inbox for professional communication, integrated directly into your workflow." },
              { icon: <Zap className="text-[#25D366]" />, title: "Unified Notifications", desc: "Never miss an update. Get all your alerts from both IM and Email in one smart feed." }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-8 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-black/[0.03]">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-[#54656f] text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-[#111b21] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-6">DockChat</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
              The professional hybrid communication platform. IM speed, Email reliability. 
              Bridging the gap between casual and formal connectivity.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition"><Globe size={20} /></a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition"><Share2 size={20} /></a>
            </div>
          </div>
          <div><h4 className="font-bold mb-6 text-[#25D366]">Utility</h4><ul className="space-y-4 text-sm text-slate-400"><li>Chats</li><li>Inbox</li><li>Files</li><li>Contacts</li></ul></div>
          <div><h4 className="font-bold mb-6 text-[#ea4335]">Legal</h4><ul className="space-y-4 text-sm text-slate-400"><li>Privacy</li><li>Terms</li><li>Security</li><li>Cookie Policy</li></ul></div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <p>© 2024 DockChat Hybrid Inc.</p>
          <p className="flex items-center gap-2">Engineering the <Heart size={14} className="text-[#ea4335] fill-[#ea4335]" /> Future of Communication</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
