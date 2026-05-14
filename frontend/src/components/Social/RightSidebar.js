import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { 
  Info, FileText, Image as ImageIcon, 
  Link as LinkIcon, Bell, Star, Trash2,
  Lock, ChevronRight, X
} from "lucide-react";

export const RightSidebar = ({ isMobile, onBack }) => {
  const { user } = useContext(AuthContext);
  const { selectedChat, messages } = useContext(ChatContext);
  
  // Filter messages that have media
  const mediaMessages = messages.filter(m => m.messageType === "image").slice(0, 6);
  const docMessages = messages.filter(m => m.messageType === "file" || m.messageType === "audio").slice(0, 3);
  return (
    <aside className="flex flex-col h-full bg-white overflow-y-auto custom-scrollbar relative border-l border-slate-200">
      {isMobile && (
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 flex items-center gap-4 px-6 py-4 border-b border-slate-100">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X size={20} />
          </button>
          <h2 className="text-lg font-bold text-slate-900">Contact Info</h2>
        </div>
      )}
      
      {/* Contact Profile Detail */}
      <div className="p-8 flex flex-col items-center border-b border-slate-50">
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-[#075E54] border border-slate-200 shadow-sm mb-4">
          {selectedChat ? (selectedChat.isGroupChat ? selectedChat.chatName[0] : selectedChat.users.find(u => u._id !== user._id)?.name[0]) : "U"}
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          {selectedChat ? (selectedChat.isGroupChat ? selectedChat.chatName : selectedChat.users.find(u => u._id !== user._id)?.name) : "Contact Info"}
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          {selectedChat?.isGroupChat ? `${selectedChat.users.length} members` : selectedChat?.users.find(u => u._id !== user._id)?.phoneNumber || "Available"}
        </p>
      </div>

      {/* Utility Sections */}
      <div className="p-6 space-y-8">
        {/* About/Status */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">About</h4>
          <p className="text-sm text-slate-700 leading-relaxed">
            {selectedChat?.isGroupChat 
              ? "Group communication channel." 
              : (selectedChat?.users.find(u => u._id !== user._id)?.about || "Hey there! I am using DockChat.")}
          </p>
        </div>

        {/* Media, Links and Docs */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Media, Links and Docs</h4>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 cursor-pointer overflow-hidden flex items-center justify-center transition-colors">
                <ImageIcon size={20} className="text-slate-300" />
              </div>
            ))}
          </div>
          <button className="w-full flex items-center justify-between py-1 text-xs font-bold text-slate-500 hover:text-[#075E54] transition">
            <span>View All</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Settings/Info */}
        <div className="space-y-2 pt-2">
          <button className="w-full flex items-center gap-4 text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-xl transition">
            <Star size={20} className="text-slate-400" />
            <span>Starred Messages</span>
          </button>
          <button className="w-full flex items-center gap-4 text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-xl transition">
            <Bell size={20} className="text-slate-400" />
            <span>Mute Notifications</span>
          </button>
          <button className="w-full flex items-center gap-4 text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-xl transition">
            <Lock size={20} className="text-slate-400" />
            <span>Encryption</span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-4 text-sm font-bold text-rose-500 hover:bg-rose-50 p-3 rounded-xl transition">
            <Trash2 size={20} />
            <span>Delete Chat</span>
          </button>
        </div>
      </div>

      <div className="mt-auto p-6 text-center border-t border-slate-50">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <Lock size={12} /> End-to-end encrypted
        </p>
      </div>
    </aside>
    </aside>
  );
};
