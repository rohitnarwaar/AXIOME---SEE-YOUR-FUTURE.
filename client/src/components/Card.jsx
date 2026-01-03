import React from "react";

export default function Card({ children, className = "" }) {
    return (
        <div
            className={`glass-panel rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] ${className}`}
        >
            {children}
        </div>
    );
}
