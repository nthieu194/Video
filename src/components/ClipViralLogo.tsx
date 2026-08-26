import React from "react";

interface ClipViralLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  showSlogan?: boolean;
  showBadge?: boolean;
  theme?: "light" | "dark" | "auto";
  className?: string;
  iconOnly?: boolean;
}

export const ClipViralLogoIcon: React.FC<{ size?: number; className?: string; animated?: boolean }> = ({
  size = 40,
  className = "",
  animated = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className} ${animated ? "group-hover:scale-105 transition-transform duration-300" : ""}`}
    >
      <defs>
        {/* Blue 3D Body Gradient */}
        <linearGradient id="cv_blue_body" x1="20" y1="20" x2="110" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00C6FF" />
          <stop offset="45%" stopColor="#0B5CFF" />
          <stop offset="100%" stopColor="#003ACC" />
        </linearGradient>

        {/* Clapper Top Gradient */}
        <linearGradient id="cv_clapper_grad" x1="25" y1="15" x2="95" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00C6FF" />
          <stop offset="100%" stopColor="#0B5CFF" />
        </linearGradient>

        {/* Speed Orange Gradient */}
        <linearGradient id="cv_orange_speed" x1="0" y1="50" x2="50" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFC107" />
          <stop offset="60%" stopColor="#FF7A00" />
          <stop offset="100%" stopColor="#FF3D00" />
        </linearGradient>

        {/* Inner Glow & Highlights */}
        <linearGradient id="cv_play_highlight" x1="45" y1="45" x2="95" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
        </linearGradient>

        <filter id="cv_shadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0B5CFF" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Speed Trails (Orange/Yellow flame trails on the left) */}
      <g className="cv-speed-trails">
        {/* Top Speed Bar */}
        <path
          d="M6 36 H38 C42 36 44 38 44 40 C44 42 42 44 38 44 H14 C9.5 44 6 40.5 6 36 Z"
          fill="url(#cv_orange_speed)"
        />
        {/* Middle Main Speed Bar */}
        <path
          d="M2 54 H42 C46 54 48 56 48 59 C48 62 46 64 42 64 H10 C5.5 64 2 60.5 2 56 Z"
          fill="url(#cv_orange_speed)"
        />
        {/* Bottom Speed Bar */}
        <path
          d="M8 74 H44 C48 74 50 76 50 79 C50 82 48 84 44 84 H16 C11.5 84 8 80.5 8 76 Z"
          fill="url(#cv_orange_speed)"
        />
        {/* Flame Accent Spark */}
        <circle cx="18" cy="40" r="3" fill="#FFE082" />
        <circle cx="12" cy="60" r="3.5" fill="#FFE082" />
        <circle cx="22" cy="79" r="3" fill="#FFE082" />
      </g>

      {/* Main Play / Clapper Body */}
      <g filter="url(#cv_shadow)">
        {/* Large Rounded Triangle (Play Symbol) */}
        <path
          d="M38 30 C38 23.5 45.2 19.5 50.8 23 L104 53.5 C109.5 56.8 109.5 64.7 104 68 L50.8 98.5 C45.2 102 38 98 38 91.5 V30 Z"
          fill="url(#cv_blue_body)"
        />

        {/* Inner 3D Inset Play Hole */}
        <path
          d="M52 46 C52 43.5 54.8 42 57 43.2 L83 58.2 C85.2 59.5 85.2 62.5 83 63.8 L57 78.8 C54.8 80 52 78.5 52 76 V46 Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />

        {/* Top Clapper Arm Bar (Angled Film Slate) */}
        <g transform="rotate(-18 36 28)">
          <rect x="30" y="10" width="70" height="18" rx="6" fill="url(#cv_clapper_grad)" />
          {/* Clapperboard White Stripes */}
          <path d="M46 10 L40 28 H47 L53 10 Z" fill="#FFFFFF" fillOpacity="0.95" />
          <path d="M62 10 L56 28 H63 L69 10 Z" fill="#FFFFFF" fillOpacity="0.95" />
          <path d="M78 10 L72 28 H79 L85 10 Z" fill="#FFFFFF" fillOpacity="0.95" />
          <circle cx="36" cy="19" r="4" fill="#FFFFFF" />
        </g>
      </g>
    </svg>
  );
};

export const ClipViralLogo: React.FC<ClipViralLogoProps> = ({
  size = "md",
  showSlogan = true,
  showBadge = false,
  theme = "auto",
  className = "",
  iconOnly = false,
}) => {
  const sizeMap = {
    sm: { icon: 30, text: "text-lg", slogan: "text-[9px]", gap: "gap-2" },
    md: { icon: 42, text: "text-2xl", slogan: "text-[11px]", gap: "gap-2.5" },
    lg: { icon: 54, text: "text-3xl", slogan: "text-xs", gap: "gap-3" },
    xl: { icon: 68, text: "text-4xl", slogan: "text-sm", gap: "gap-3.5" },
    hero: { icon: 88, text: "text-5xl md:text-6xl", slogan: "text-base md:text-lg", gap: "gap-4" },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center ${current.gap} select-none group ${className}`}>
      {/* 3D Icon */}
      <ClipViralLogoIcon size={current.icon} animated={true} />

      {!iconOnly && (
        <div className="flex flex-col justify-center leading-none">
          {/* Wordmark: ClipViral with Flame Dot on 'i' */}
          <div className="flex items-baseline">
            <span className="font-extrabold tracking-tight font-display text-[#0B5CFF] drop-shadow-xs" style={{ fontSize: "1.2em" }}>
              Clip
            </span>
            <span className="relative font-extrabold tracking-tight font-display bg-gradient-to-r from-[#FF7A00] via-[#FF5500] to-[#E63946] bg-clip-text text-transparent" style={{ fontSize: "1.2em" }}>
              V
              <span className="relative inline-block">
                {/* Custom 'i' with Flame Dot */}
                <span className="relative">ı</span>
                <span
                  className="absolute -top-[0.42em] left-1/2 -translate-x-1/2 text-[0.65em] select-none pointer-events-none"
                  style={{
                    filter: "drop-shadow(0 1px 3px rgba(255, 122, 0, 0.6))",
                  }}
                >
                  🔥
                </span>
              </span>
              ral
            </span>

            {showBadge && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white shadow-xs">
                AI Studio
              </span>
            )}
          </div>

          {/* Slogan */}
          {showSlogan && (
            <div className={`flex items-center gap-1.5 font-bold tracking-tight mt-1 ${current.slogan}`}>
              <span className="text-[#0B5CFF]">Viết nhanh.</span>
              <span className="text-[#00A8E8]">Quay chất.</span>
              <span className="text-[#FF7A00]">Dễ viral.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ClipViralAppIconBadge: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = "",
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-2xl bg-gradient-to-br from-[#0B5CFF] via-[#0052CC] to-[#002884] p-2.5 shadow-xl shadow-blue-500/25 border border-white/20 flex items-center justify-center overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/30 via-transparent to-transparent pointer-events-none" />
      <ClipViralLogoIcon size={Math.round(size * 0.85)} />
    </div>
  );
};

export default ClipViralLogo;
