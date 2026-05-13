import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, CheckCircle2 } from 'lucide-react';

const OTPBox = ({ otp, visible, isSuccess }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed top-10 right-10 z-50 pointer-events-none"
        >
          <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-2xl shadow-2xl shadow-emerald-500/20 max-w-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              {isSuccess ? (
                <CheckCircle2 className="text-emerald-400 w-6 h-6" />
              ) : (
                <MessageCircle className="text-emerald-400 w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                {isSuccess ? "Verified" : "Security Code"}
              </p>
              <p className="text-slate-200 text-sm leading-relaxed">
                {isSuccess ? (
                  "Login successful! Redirecting..."
                ) : (
                  <>Your DockStack verification code is: <span className="font-mono font-bold text-white text-lg tracking-wider bg-white/5 px-2 py-0.5 rounded ml-1">{otp}</span></>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OTPBox;
