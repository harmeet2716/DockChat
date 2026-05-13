import { motion, AnimatePresence } from "framer-motion";
import { Users, ShieldCheck, X, RefreshCw } from "lucide-react";

export const ContactSyncModal = ({ isOpen, onClose, onSync }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
            >
              <X size={20} />
            </button>

            <div className="p-8 pt-10 text-center">
              {/* Icon Container */}
              <div className="mb-6 relative inline-block">
                <div className="w-20 h-20 bg-[#f0f9f4] rounded-full flex items-center justify-center">
                  <RefreshCw size={40} className="text-[#25D366] animate-spin-slow" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-50">
                  <Users size={16} className="text-[#075E54]" />
                </div>
              </div>

              {/* Header */}
              <h2 className="text-2xl font-bold text-[#075E54] mb-3">Stay Connected</h2>
              
              {/* Content */}
              <p className="text-slate-600 text-sm leading-relaxed mb-8 px-4">
                DockChat works best when you can find your friends. Would you like to sync your contacts now?
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={onSync}
                  className="w-full py-4 bg-[#25D366] text-white font-bold rounded-2xl shadow-lg shadow-[#25D366]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Sync All Contacts
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-white text-[#075E54] font-bold rounded-2xl border-2 border-[#075E54]/10 hover:bg-[#f0f9f4] hover:border-[#075E54]/20 transition-all"
                >
                  Choose Manually
                </button>
              </div>

              {/* Privacy Note */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-[#25D366]" />
                  Your data is end-to-end encrypted
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                  We never store your contacts on our Vercel or Render servers without your permission.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
