import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Smile, Paperclip, Mic, Send, 
  MoreVertical, Phone, Video, Search,
  Check, CheckCheck, ChevronLeft, Info, MessageCircle, Mail, Loader2, Download
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

export const ChatWidget = ({ isMobile, onBack, onShowInfo, onNavigateToMail }) => {
  const { user } = useContext(AuthContext);
  const { selectedChat, messages, sendMessage, isTyping, clearChat, deleteChat } = useContext(ChatContext);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        // Stop all tracks on the stream to release the mic
        stream.getTracks().forEach(track => track.stop());

        // Only upload and send if we didn't cancel
        if (audioChunksRef.current.length > 0) {
          await sendVoiceMessage(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure microphone permissions are granted.");
    }
  };

  const sendVoiceMessage = async (blob) => {
    setIsUploading(true);
    try {
      const file = new File([blob], "voice_message.webm", { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", file);

      const backendUrl = process.env.REACT_APP_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
      const res = await fetch(`${backendUrl}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload voice message");
      }

      const data = await res.json();
      
      // Format the duration nicely
      const mins = Math.floor(recordingTime / 60);
      const secs = recordingTime % 60;
      const durationStr = `${mins}:${secs.toString().padStart(2, '0')}`;
      
      await sendMessage(`Voice message (${durationStr})`, "audio", data.url);
    } catch (err) {
      console.error("Error uploading voice message:", err);
      alert("Error sending voice message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Clear the chunks so onstop doesn't upload
      audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMoreMenu]);

  const handleEmojiClick = (emojiData) => {
    setMessageText(prev => prev + emojiData.emoji);
  };

  const handleDownload = async (fileUrl, fileName) => {
    const resolvedUrl = getAttachmentUrl(fileUrl);
    setDownloadingFiles(prev => ({ ...prev, [fileUrl]: true }));
    try {
      const res = await fetch(resolvedUrl, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Failed to download file");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error during download:", err);
      window.open(resolvedUrl, "_blank");
    } finally {
      setDownloadingFiles(prev => ({ ...prev, [fileUrl]: false }));
    }
  };

  const getAttachmentUrl = (url) => {
    if (!url) return "";
    const backendUrl = process.env.REACT_APP_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
    if (url.startsWith("/")) {
      return `${backendUrl}${url}`;
    }
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") {
        const backendParsed = new URL(backendUrl);
        parsedUrl.protocol = backendParsed.protocol;
        parsedUrl.host = backendParsed.host;
        return parsedUrl.toString();
      }
    } catch (e) {}
    return url;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const backendUrl = process.env.REACT_APP_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
      const res = await fetch(`${backendUrl}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await res.json();
      
      // Determine messageType
      let messageType = "file";
      const mime = file.type;
      if (mime.startsWith("image/")) {
        messageType = "image";
      } else if (mime.startsWith("video/")) {
        messageType = "video";
      } else if (mime.startsWith("audio/")) {
        messageType = "audio";
      }

      // Send the file message
      await sendMessage(file.name, messageType, data.url);
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getChatName = (chat) => {
    if (!chat) return "";
    if (chat.isGroupChat) return chat.chatName;
    const otherUser = chat.users.find(u => u._id !== user._id);
    return otherUser ? otherUser.name : "User";
  };

  const getChatProfile = (chat) => {
    if (!chat) return "";
    if (chat.isGroupChat) return chat.chatName[0];
    const otherUser = chat.users.find(u => u._id !== user._id);
    return otherUser ? otherUser.name[0] : "U";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat, messages]);

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-whatsapp-pattern relative">
      {/* Active Chat Header */}
      <header className="flex-shrink-0 h-16 bg-[#f0f2f5] border-b border-slate-200 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-3 cursor-pointer overflow-hidden">
          {isMobile && (
            <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-200 rounded-full transition">
              <ChevronLeft size={24} />
            </button>
          )}
          {selectedChat && (
            <>
              <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center font-bold text-slate-600 border border-slate-200 shrink-0">
                {getChatProfile(selectedChat)}
              </div>
              <div className="min-w-0" onClick={isMobile ? onShowInfo : undefined}>
                <h3 className="text-sm font-bold text-slate-900 truncate">{getChatName(selectedChat)}</h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  {isTyping ? "typing..." : "online"}
                </p>
              </div>
            </>
          )}
        </div>
        {selectedChat && (
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"><Video size={20} /></button>
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"><Phone size={18} /></button>
            <button onClick={onShowInfo} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"><Info size={20} /></button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button 
              title="Convert to Mail"
              className="p-2 text-[#075E54] hover:bg-[#075E54]/5 rounded-full transition-all"
              onClick={() => {
                const otherUser = selectedChat?.users?.find(u => u._id !== user._id);
                const email = otherUser?.email || "";
                const transcript = messages
                  .map(m => {
                    const senderName = m.sender?.name || (m.sender === user._id ? user.name : "User");
                    return `${senderName}: ${m.content || ""}`;
                  })
                  .join('\n');
                
                localStorage.setItem("dockchat_bridge_content", transcript);
                localStorage.setItem("dockchat_bridge_to", email);
                localStorage.setItem("dockchat_bridge_subject", `Chat Transcript with ${otherUser?.name || 'User'}`);
                
                if (onNavigateToMail) {
                  onNavigateToMail();
                }
              }}
            >
              <Mail size={20} />
            </button>
            
            {/* Clear/Delete Chat Action Menu */}
            <div className="relative" ref={moreMenuRef}>
              <button 
                onClick={() => setShowMoreMenu(prev => !prev)}
                className={`p-2 rounded-full transition ${showMoreMenu ? "text-slate-800 bg-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"}`}
                title="More options"
              >
                <MoreVertical size={20} />
              </button>
              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        if (window.confirm("Are you sure you want to clear all messages in this chat? This cannot be undone.")) {
                          clearChat(selectedChat._id);
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition flex items-center gap-2"
                    >
                      Clear Chat
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        if (window.confirm("Are you sure you want to delete this chat room entirely? This will remove the chat and all its messages permanently.")) {
                          deleteChat(selectedChat._id);
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition flex items-center gap-2"
                    >
                      Delete Chat
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </header>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-2 relative z-0 scrollbar-hide">
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">Select a chat to start messaging</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center mb-4 shadow-sm">
              <MessageCircle size={32} className="text-[#075E54]/20" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">
              Start a conversation with <span className="text-[#075E54] font-bold">{getChatName(selectedChat)}</span>
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSentByMe = msg.sender?._id === user._id;
            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex ${isSentByMe ? "justify-end" : "justify-start"} mb-1`}
              >
                <div 
                   className={`max-w-[85%] sm:max-w-[70%] px-3 py-1.5 rounded-lg shadow-sm relative text-[13px] leading-relaxed ${
                    isSentByMe 
                      ? "bg-[#dcf8c6] text-slate-900 rounded-tr-none" 
                      : "bg-white text-slate-900 rounded-tl-none"
                  }`}
                >
                  <div className={`absolute top-0 w-2 h-2 ${
                    isSentByMe 
                      ? "right-[-8px] border-l-[8px] border-l-[#dcf8c6] border-b-[8px] border-b-transparent" 
                      : "left-[-8px] border-r-[8px] border-r-white border-b-[8px] border-b-transparent"
                  }`}></div>
                  
                  {msg.messageType === "image" && msg.mediaUrl ? (
                    <div className="mb-1 max-w-sm rounded-lg overflow-hidden border border-slate-100 shadow-sm bg-slate-50 relative group/img">
                      <img 
                        src={getAttachmentUrl(msg.mediaUrl)} 
                        alt={msg.content} 
                        className="w-full h-auto object-cover max-h-60 cursor-zoom-in hover:opacity-95 transition" 
                        onClick={() => window.open(getAttachmentUrl(msg.mediaUrl), '_blank')} 
                      />
                      <button 
                        onClick={() => handleDownload(msg.mediaUrl, msg.content || "image.png")}
                        className="absolute bottom-2 right-2 p-2 bg-white/95 text-slate-800 rounded-lg hover:bg-white hover:scale-105 active:scale-95 transition shadow-sm border border-slate-200/50 flex items-center justify-center"
                        disabled={downloadingFiles[msg.mediaUrl]}
                      >
                        {downloadingFiles[msg.mediaUrl] ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#075E54]" /> : <Download size={14} />}
                      </button>
                    </div>
                  ) : msg.messageType === "video" && msg.mediaUrl ? (
                    <div className="mb-1 max-w-sm rounded-lg overflow-hidden border border-slate-100 bg-slate-900 shadow-sm relative group/vid">
                      <video src={getAttachmentUrl(msg.mediaUrl)} controls className="w-full max-h-60" />
                      <button 
                        onClick={() => handleDownload(msg.mediaUrl, msg.content || "video.mp4")}
                        className="absolute top-2 right-2 p-2 bg-white/90 text-slate-800 rounded-lg hover:bg-white hover:scale-105 active:scale-95 transition shadow-sm border border-slate-200/50 flex items-center justify-center z-10"
                        disabled={downloadingFiles[msg.mediaUrl]}
                      >
                        {downloadingFiles[msg.mediaUrl] ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#075E54]" /> : <Download size={14} />}
                      </button>
                    </div>
                  ) : msg.messageType === "audio" && msg.mediaUrl ? (
                    <div className="mb-1 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 p-2 shadow-sm flex items-center gap-2 max-w-xs relative">
                      <audio src={getAttachmentUrl(msg.mediaUrl)} controls className="w-full scale-90" />
                      <button 
                        onClick={() => handleDownload(msg.mediaUrl, msg.content || "audio.mp3")}
                        className="p-2 bg-white text-slate-800 rounded-lg hover:bg-slate-100 hover:scale-105 active:scale-95 transition shadow-sm border border-slate-200/50 flex items-center justify-center shrink-0"
                        disabled={downloadingFiles[msg.mediaUrl]}
                      >
                        {downloadingFiles[msg.mediaUrl] ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#075E54]" /> : <Download size={14} />}
                      </button>
                    </div>
                  ) : msg.messageType === "file" && msg.mediaUrl ? (
                    <div className="mb-1 flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 transition max-w-xs text-slate-800 decoration-none no-underline block">
                      <div className="w-10 h-10 rounded-lg bg-[#075E54] text-white flex items-center justify-center shrink-0">
                        <Paperclip size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate pr-1 text-slate-800">{msg.content || "Attachment"}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Click download icon to save</p>
                      </div>
                      <button 
                        onClick={() => handleDownload(msg.mediaUrl, msg.content || "attachment.bin")}
                        className="p-2 bg-white text-slate-800 rounded-lg hover:bg-slate-100 hover:scale-105 active:scale-95 transition shadow-sm border border-slate-200/50 flex items-center justify-center shrink-0"
                        disabled={downloadingFiles[msg.mediaUrl]}
                      >
                        {downloadingFiles[msg.mediaUrl] ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#075E54]" /> : <Download size={14} />}
                      </button>
                    </div>
                  ) : (
                    <p className="pr-10">{msg.content}</p>
                  )}
                  <div className="mt-1 flex items-center justify-end gap-1 opacity-50">
                    <span className="text-[9px] font-medium">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isSentByMe && (
                      msg.status === "read"
                        ? <CheckCheck size={14} className="text-[#34b7f1]" />
                        : <CheckCheck size={14} className="text-slate-400" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef}
          className="absolute bottom-[72px] left-4 z-50 shadow-2xl rounded-2xl overflow-hidden bg-white max-w-[calc(100vw-32px)] border border-slate-200/50"
        >
          <EmojiPicker 
            onEmojiClick={handleEmojiClick} 
            width={isMobile ? "100%" : 350} 
            height={350} 
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* Bottom Input Bar */}
      {selectedChat && (
        <footer className="flex-shrink-0 bg-[#f0f2f5] p-3 flex items-center gap-2 z-10 border-t border-slate-200">
          {isRecording ? (
            <div className="flex-1 flex items-center justify-between bg-white rounded-full px-4 py-2 shadow-sm border border-slate-200/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-slate-700">
                  Recording... {Math.floor(recordingTime / 60)}:{((recordingTime % 60)).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-750 hover:bg-slate-105 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-1.5 text-xs font-bold bg-[#075E54] text-white rounded-full hover:scale-105 transition"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(prev => !prev)}
                  className={`p-2 rounded-full transition ${showEmojiPicker ? "text-[#075E54] bg-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"}`}
                >
                  <Smile size={24} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: "none" }} 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="animate-spin text-[#075E54]" size={24} /> : <Paperclip size={24} />}
                </button>
              </div>
              <form 
                className="flex-1 min-w-0 flex gap-2 items-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (messageText.trim()) {
                    sendMessage(messageText);
                    setMessageText("");
                  }
                }}
              >
                <input 
                  type="text" 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 min-w-0 px-4 py-2 text-sm bg-white text-slate-800 rounded-full focus:outline-none placeholder:text-slate-400 shadow-sm"
                />
                {messageText.trim() ? (
                  <button 
                    type="submit"
                    className="w-10 h-10 bg-[#075E54] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    <Send size={20} className="ml-0.5" />
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={startRecording}
                    disabled={isUploading}
                    className="w-10 h-10 bg-[#075E54] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
                    title="Record voice message"
                  >
                    <Mic size={20} />
                  </button>
                )}
              </form>
            </>
          )}
        </footer>
      )}
    </div>
  );
};
