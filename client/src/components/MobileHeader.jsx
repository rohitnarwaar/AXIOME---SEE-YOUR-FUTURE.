import { motion } from "framer-motion";

export default function MobileHeader({ onMenuClick, userName }) {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-black/5 z-50 px-6 flex items-center justify-between md:hidden">
            {/* Placeholder to keep title centered */}
            <div className="w-10 h-10" />

            <h1 className="text-[11px] tracking-[0.4em] uppercase font-bold text-black">One's Own</h1>

            <div className="w-10 h-10 bg-black/[0.03] border border-black/5 flex items-center justify-center overflow-hidden">
                 <span className="text-[10px] uppercase opacity-40 font-bold">{userName?.charAt(0) || 'U'}</span>
            </div>
        </header>
    );
}
