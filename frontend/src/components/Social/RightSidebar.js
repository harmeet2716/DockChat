import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { 
  Info, FileText, Image as ImageIcon, 
  Link as LinkIcon, Bell, Star, Trash2,
  Lock, ChevronRight
} from "lucide-react";

export const RightSidebar = ({ isMobile, onBack }) => {
  const { user } = useContext(AuthContext);
  const { selectedChat, messages } = useContext(ChatContext);
  
  // Filter messages that have media
  const mediaMessages = messages.filter(m => m.messageType === "image").slice(0, 6);
  const docMessages = messages.filter(m => m.messageType === "file" || m.messageType === "audio").slice(0, 3);
  return (
    <aside className="flex flex-col h-full bg-white overflow-y-auto custom-scrollbar relative">
      {isMobile && (
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 flex items-center gap-4 px-6 py-4 border-b border-black/[0.03]">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:bg-black/5 rounded-full transition">
            <X size={20} />
          </button>
          <h2 className="text-lg font-bold text-slate-900">Contact Info</h2>
        </div>
      )}
      {/* Contact Profile Detail */}
      <div className="p-8 flex flex-col items-center border-b border-black/[0.03]">
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-[#075E54] border-4 border-slate-50 shadow-sm mb-4">
          {selectedChat ? (selectedChat.isGroupChat ? selectedChat.chatName[0] : selectedChat.users.find(u => u._id !== user._id)?.name[0]) : "U"}
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          {selectedChat ? (selectedChat.isGroupChat ? selectedChat.chatName : selectedChat.users.find(u => u._id !== user._id)?.name) : "Contact Info"}
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          {selectedChat?.isGroupChat ? `${selectedChat.users.length} members` : selectedChat?.users.find(u => u._id !== user._id)?.phoneNumber || "Active"}
        </p>
      </div>

      {/* Utility Sections */}
      <div className="p-6 space-y-8">
        {/* About/Status */}
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">About</h4>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            Hey there! I am using DockChat. Professional focus, high-fidelity utility.
          </p>
        </div>

        {/* Media, Links and Docs */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Media, Links and Docs</h4>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-slate-100 rounded-lg border border-black/[0.05] hover:opacity-80 cursor-pointer overflow-hidden flex items-center justify-center">
                <ImageIcon size={20} className="text-slate-300" />
              </div>
            ))}
          </div>
          <button className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-600 hover:text-[#075E54] transition">
            <span>View All</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Settings/Info */}
        <div className="space-y-4 pt-4">
          <button className="w-full flex items-center gap-4 text-sm font-medium text-slate-700 hover:bg-slate-50 p-2 rounded-lg transition">
            <Star size={20} className="text-slate-400" />
            <span>Starred Messages</span>
          </button>
          <button className="w-full flex items-center gap-4 text-sm font-medium text-slate-700 hover:bg-slate-50 p-2 rounded-lg transition">
            <Bell size={20} className="text-slate-400" />
            <span>Mute Notifications</span>
          </button>
          <button className="w-full flex items-center gap-4 text-sm font-medium text-slate-700 hover:bg-slate-50 p-2 rounded-lg transition">
            <Lock size={20} className="text-slate-400" />
            <span>Encryption</span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-black/[0.03]">
          <button className="w-full flex items-center gap-4 text-sm font-bold text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition">
            <Trash2 size={20} />
            <span>Delete Chat</span>
          </button>
        </div>
      </div>

      <div className="mt-auto p-6 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <Lock size={12} /> End-to-end encrypted
        </p>
      </div>
    </aside>
  );
};
