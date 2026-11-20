import React from 'react';

export function LogoIcon({ className = "w-5 h-5", strokeColor = "currentColor" }: { className?: string; strokeColor?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeColor}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Heart shape */}
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      {/* Medical Cross */}
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export default function Logo({
  showText = true,
  className = "",
  size = "md"
}: {
  showText?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const boxSizes = {
    sm: "w-7 h-7 rounded-lg",
    md: "w-8 h-8 rounded-xl",
    lg: "w-10 h-10 rounded-2xl",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <div className={`${boxSizes[size]} bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20`}>
        <LogoIcon className={`${iconSizes[size]} text-white`} />
      </div>
      {showText && (
        <span className={`font-bold ${textSizes[size]} tracking-tight text-slate-900`}>
          Swasth<span className="text-emerald-600">AI</span>
        </span>
      )}
    </div>
  );
}
