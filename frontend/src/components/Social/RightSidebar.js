import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { 
  FileText, Image as ImageIcon, 
  Link as LinkIcon, Bell, Star, Trash2,
  Lock, ChevronRight, X, Video, Mic, Search, Download, Eye, ExternalLink
} from "lucide-react";

export const RightSidebar = ({ isMobile, onBack, onClose }) => {
  const { user } = useContext(AuthContext);
  const { selectedChat, messages } = useContext(ChatContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("media");
  const [searchQuery, setSearchQuery] = useState("");

  const messagesList = messages || [];

  // Filter and extract all shared items
  const allShared = [];

  if (selectedChat && messagesList) {
    messagesList.forEach(msg => {
      if (msg.messageType === "image" || msg.messageType === "video") {
        allShared.push({
          type: "media",
          messageType: msg.messageType,
          mediaUrl: msg.mediaUrl,
          content: msg.content,
          createdAt: msg.createdAt,
          senderName: msg.sender?._id === user._id ? "You" : (msg.sender?.name || "User"),
          _id: msg._id
        });
      } else if (msg.messageType === "file" || msg.messageType === "audio") {
        allShared.push({
          type: "doc",
          messageType: msg.messageType,
          mediaUrl: msg.mediaUrl,
          content: msg.content,
          createdAt: msg.createdAt,
          senderName: msg.sender?._id === user._id ? "You" : (msg.sender?.name || "User"),
          _id: msg._id
        });
      } else if (!msg.messageType || msg.messageType === "text") {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = msg.content?.match(urlRegex);
        if (matches) {
          matches.forEach((url, i) => {
            allShared.push({
              type: "link",
              messageType: "link",
              mediaUrl: url,
              content: msg.content,
              createdAt: msg.createdAt,
              senderName: msg.sender?._id === user._id ? "You" : (msg.sender?.name || "User"),
              _id: `${msg._id}-${i}`
            });
          });
        }
      }
    });
  }

  // Reverse list to display most recent first
  const reversedShared = [...allShared].reverse();
  const mediaList = reversedShared.filter(item => item.type === "media");
  const docsList = reversedShared.filter(item => item.type === "doc");
  const linksList = reversedShared.filter(item => item.type === "link");

  // Get top 3 items to show in the sidebar grid
  const previewItems = reversedShared.slice(0, 3);

  const getFilteredItems = () => {
    let list = [];
    if (activeTab === "media") list = mediaList;
    else if (activeTab === "docs") list = docsList;
    else if (activeTab === "links") list = linksList;

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase();
    return list.filter(item => {
      if (item.content && item.content.toLowerCase().includes(query)) return true;
      if (item.mediaUrl && item.mediaUrl.toLowerCase().includes(query)) return true;
      if (item.senderName && item.senderName.toLowerCase().includes(query)) return true;
      return false;
    });
  };

  const filteredItems = getFilteredItems();

  const renderTabContent = () => {
    if (filteredItems.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400 border border-slate-100">
            {activeTab === "media" ? <ImageIcon size={28} /> : activeTab === "docs" ? <FileText size={28} /> : <LinkIcon size={28} />}
          </div>
          <h4 className="text-sm font-bold text-slate-700 mb-1">No shared {activeTab} found</h4>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            {searchQuery.trim() 
              ? "Try searching for a different keyword or check spelling."
              : `Shared ${activeTab} items in this chat will appear here automatically.`}
          </p>
        </div>
      );
    }

    if (activeTab === "media") {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
          {filteredItems.map(item => (
            <div 
              key={item._id}
              className="bg-white rounded-xl border border-slate-200/60 p-1.5 shadow-sm overflow-hidden relative group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              <div className="aspect-square rounded-lg bg-slate-50 overflow-hidden relative flex items-center justify-center">
                {item.messageType === "image" ? (
                  <img 
                    src={item.mediaUrl} 
                    alt={item.content || "Shared image"} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-950 relative flex items-center justify-center">
                    <video src={item.mediaUrl} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-md">
                      <Video size={18} fill="white" />
                    </div>
                  </div>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all duration-200">
                  <button 
                    onClick={() => window.open(item.mediaUrl, '_blank')}
                    className="p-2 bg-white/95 text-slate-800 rounded-full hover:bg-white hover:scale-110 shadow-sm transition"
                    title="Open in Fullscreen"
                  >
                    <Eye size={16} />
                  </button>
                  <a 
                    href={item.mediaUrl} 
                    download={item.content || "download"}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white/95 text-slate-800 rounded-full hover:bg-white hover:scale-110 shadow-sm transition flex items-center justify-center"
                    title="Download File"
                  >
                    <Download size={16} />
                  </a>
                </div>
              </div>
              
              {/* Info Bar */}
              <div className="p-2 pt-2.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 truncate">{item.content || (item.messageType === "image" ? "Image" : "Video")}</p>
                <div className="flex items-center justify-between text-[9px] text-slate-400">
                  <span className="font-bold">{item.senderName}</span>
                  <span>
                    {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "docs") {
      return (
        <div className="flex flex-col gap-2.5 animate-fade-in">
          {filteredItems.map(item => (
            <div 
              key={item._id}
              className="bg-white hover:bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                  item.messageType === "audio" 
                    ? "bg-rose-50 border-rose-100 text-rose-500" 
                    : "bg-blue-50 border-blue-100 text-blue-500"
                }`}>
                  {item.messageType === "audio" ? <Mic size={20} /> : <FileText size={20} />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate pr-2" title={item.content}>
                    {item.content || (item.messageType === "audio" ? "Voice Clip.mp3" : "Document.pdf")}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                    <span>By <strong className="text-slate-500 font-bold">{item.senderName}</strong></span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="uppercase font-bold text-[9px] px-1 py-0.5 rounded bg-slate-100 text-slate-500">{item.messageType}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={() => window.open(item.mediaUrl, '_blank')}
                  className="px-3.5 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition"
                >
                  Open
                </button>
                <a 
                  href={item.mediaUrl} 
                  download={item.content || "download"}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition flex items-center justify-center"
                  title="Download File"
                >
                  <Download size={15} />
                </a>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "links") {
      return (
        <div className="flex flex-col gap-2.5 animate-fade-in">
          {filteredItems.map(item => (
            <div 
              key={item._id}
              className="bg-white hover:bg-slate-50 border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                    <LinkIcon size={20} />
                  </div>
                  <div className="min-w-0">
                    <a 
                      href={item.mediaUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs font-bold text-[#075E54] hover:underline truncate block pr-2 cursor-pointer transition"
                    >
                      {item.mediaUrl}
                    </a>
                    {item.content && item.content !== item.mediaUrl && (
                      <p className="text-xs text-slate-600 mt-1.5 italic line-clamp-2 leading-relaxed bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                        "{item.content}"
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-medium">
                      <span>Shared by <strong className="text-slate-500 font-bold">{item.senderName}</strong></span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <a 
                  href={item.mediaUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 text-[#075E54] hover:bg-[#075E54]/5 rounded-xl transition flex items-center justify-center border border-slate-100 shrink-0"
                  title="Visit Link"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <aside className="flex flex-col h-full bg-white overflow-y-auto custom-scrollbar relative border-l border-slate-200">
      <div className="sticky top-0 bg-[#f0f2f5] z-20 flex items-center justify-between px-6 h-16 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose || onBack} 
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-200 rounded-full transition"
            title="Close Contact Info"
          >
            <X size={20} />
          </button>
          <h2 className="text-md font-bold text-slate-800">Contact Info</h2>
        </div>
      </div>
      
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
            {[0, 1, 2].map((index) => {
              const item = previewItems[index];
              if (!item) {
                return (
                  <div key={index} className="aspect-square bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-300">
                    <ImageIcon size={20} className="opacity-40" />
                  </div>
                );
              }
              
              if (item.messageType === "image") {
                return (
                  <div 
                    key={item._id}
                    onClick={() => {
                      setActiveTab("media");
                      setIsModalOpen(true);
                    }}
                    className="aspect-square bg-slate-100 rounded-lg border border-slate-200 hover:scale-[1.03] active:scale-95 cursor-pointer overflow-hidden relative group transition duration-200"
                  >
                    <img src={item.mediaUrl} alt="Shared item" className="w-full h-full object-cover group-hover:opacity-90 transition duration-200" />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-white text-[9px] bg-black/55 px-1.5 py-0.5 rounded-full font-bold">View</span>
                    </div>
                  </div>
                );
              }

              if (item.messageType === "video") {
                return (
                  <div 
                    key={item._id}
                    onClick={() => {
                      setActiveTab("media");
                      setIsModalOpen(true);
                    }}
                    className="aspect-square bg-slate-900 rounded-lg border border-slate-800 hover:scale-[1.03] active:scale-95 cursor-pointer overflow-hidden relative group transition duration-200 flex items-center justify-center"
                  >
                    <video src={item.mediaUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition duration-200" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition duration-200">
                        <Video size={12} fill="white" />
                      </div>
                    </div>
                  </div>
                );
              }

              if (item.messageType === "audio") {
                return (
                  <div 
                    key={item._id}
                    onClick={() => {
                      setActiveTab("docs");
                      setIsModalOpen(true);
                    }}
                    className="aspect-square bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 hover:scale-[1.03] active:scale-95 cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-1 transition duration-200"
                  >
                    <Mic className="text-rose-500" size={18} />
                    <span className="text-[8px] font-bold text-rose-600 uppercase tracking-wider">Audio</span>
                  </div>
                );
              }

              if (item.messageType === "file") {
                return (
                  <div 
                    key={item._id}
                    onClick={() => {
                      setActiveTab("docs");
                      setIsModalOpen(true);
                    }}
                    className="aspect-square bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 hover:scale-[1.03] active:scale-95 cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-1 transition duration-200 px-1"
                  >
                    <FileText className="text-blue-500" size={18} />
                    <span className="text-[8px] font-bold text-blue-600 uppercase tracking-wider truncate max-w-full text-center">{item.content || "Doc"}</span>
                  </div>
                );
              }

              if (item.messageType === "link") {
                return (
                  <div 
                    key={item._id}
                    onClick={() => {
                      setActiveTab("links");
                      setIsModalOpen(true);
                    }}
                    className="aspect-square bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-100 hover:scale-[1.03] active:scale-95 cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-1 transition duration-200 px-1"
                  >
                    <LinkIcon className="text-emerald-500" size={18} />
                    <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider truncate max-w-full text-center">Link</span>
                  </div>
                );
              }

              return null;
            })}
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-between py-1 text-xs font-bold text-slate-500 hover:text-[#075E54] transition"
          >
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

      {/* Shared Assets Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 transition-all duration-300">
          <div className="bg-white w-full max-w-3xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 transform transition-transform duration-300 scale-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200/60 shrink-0">
              <div>
                <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                  Shared Media, Links and Docs
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Total {reversedShared.length} items shared
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSearchQuery("");
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs & Search Bar Container */}
            <div className="p-6 pb-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 shrink-0">
              {/* Navigation Tabs */}
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
                {[
                  { id: "media", label: "Media", count: mediaList.length },
                  { id: "docs", label: "Docs", count: docsList.length },
                  { id: "links", label: "Links", count: linksList.length },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchQuery("");
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? "bg-white text-[#075E54] shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === tab.id 
                        ? "bg-[#075E54]/10 text-[#075E54]" 
                        : "bg-slate-200 text-slate-500"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Dynamic Search Bar */}
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 border-none text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#075E54]/20 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Modal Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
              {renderTabContent()}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
