import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const statuses = [
  { id: 1, name: "My Status", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200", isMe: true, time: "Tap to add status update" },
  { id: 2, name: "Riya", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200", time: "10 minutes ago" },
  { id: 3, name: "Karan", img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200", time: "45 minutes ago" },
  { id: 4, name: "Sneha", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200", time: "Today, 1:20 PM" },
];

export const StoriesCarousel = () => {
  return (
    <div className="bg-white p-4">
      <h3 className="text-sm font-bold text-[#075E54] mb-4 uppercase tracking-widest px-2">Recent Updates</h3>
      <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
        {statuses.map((status, i) => (
          <motion.div
            key={status.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
          >
            <div className="relative">
              <div className={`
                w-16 h-16 rounded-full p-[2.5px] transition-all duration-300 group-hover:scale-105
                ${status.isMe ? "border-2 border-dashed border-slate-300" : "border-2 border-[#25D366]"}
              `}>
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-slate-100 flex items-center justify-center">
                  <img src={status.img} className="w-full h-full object-cover" alt={status.name} />
                </div>
              </div>
              {status.isMe && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center border-2 border-white text-white shadow-sm">
                  <Plus size={12} strokeWidth={4} />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold text-slate-900 truncate w-20">{status.name}</p>
              <p className="text-[9px] text-slate-400 truncate w-20">{status.time.split(" ")[0]}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
