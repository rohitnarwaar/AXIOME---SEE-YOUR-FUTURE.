import { motion } from "framer-motion";
import { 
    LayoutDashboard, 
    TrendingUp, 
    Zap, 
    User,
    LogOut,
    Home
} from "lucide-react";

export default function MobileNavigation({ activeView, onTabChange }) {
    const tabs = [
        { id: "daily", label: "DAILY", icon: LayoutDashboard },
        { id: "wealth", label: "WEALTH", icon: TrendingUp },
        { id: "insights", label: "INSIGHTS", icon: Zap },
        { id: "profile", label: "PROFILE", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-black/5 z-50 px-8 flex items-center justify-between md:hidden">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeView === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex flex-col items-center gap-1.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-30'}`}
                    >
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                        <span className="text-[9px] font-bold tracking-[0.1em] uppercase">{tab.label}</span>
                        {isActive && (
                            <motion.div 
                                layoutId="activeTabMobile"
                                className="w-1 h-1 bg-black rounded-full"
                            />
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
