const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Base App Icon SVG (512x512 matching user logo)
const appIconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Outer Blue Container Gradient -->
    <linearGradient id="bg_grad" x1="60" y1="30" x2="450" y2="480" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#1E6BFF" />
      <stop offset="50%" stopColor="#0B5CFF" />
      <stop offset="100%" stopColor="#0047E0" />
    </linearGradient>

    <!-- Card Shadow -->
    <filter id="card_shadow" x="50" y="50" width="412" height="412" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#002B8C" floodOpacity="0.4" />
      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#001850" floodOpacity="0.2" />
    </filter>

    <!-- Play Icon Blue Gradient -->
    <linearGradient id="play_grad" x1="180" y1="140" x2="330" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#00C6FF" />
      <stop offset="45%" stopColor="#0B5CFF" />
      <stop offset="100%" stopColor="#0042D1" />
    </linearGradient>

    <!-- Clapper Arm Gradient -->
    <linearGradient id="clapper_grad" x1="200" y1="120" x2="330" y2="170" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#38BDF8" />
      <stop offset="100%" stopColor="#0284C7" />
    </linearGradient>

    <!-- Speed Streaks Orange Gradient -->
    <linearGradient id="speed_grad" x1="140" y1="200" x2="250" y2="280" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#FFB703" />
      <stop offset="60%" stopColor="#FB8500" />
      <stop offset="100%" stopColor="#E63946" />
    </linearGradient>

    <!-- Subtle Inner Play Glow -->
    <linearGradient id="play_highlight" x1="210" y1="180" x2="280" y2="250" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
      <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.8" />
    </linearGradient>
  </defs>

  <!-- Outer Rounded Blue Container -->
  <rect x="16" y="16" width="480" height="480" rx="100" fill="url(#bg_grad)" />

  <!-- Inner White Card Squircle -->
  <g filter="url(#card_shadow)">
    <rect x="96" y="96" width="320" height="320" rx="72" fill="#FFFFFF" />
  </g>

  <!-- ICON ELEMENTS INSIDE CARD -->
  <!-- Speed Lines (Left of Play Button) -->
  <g>
    <!-- Speed Bar 1 -->
    <rect x="168" y="202" width="48" height="12" rx="6" fill="url(#speed_grad)" />
    <!-- Speed Bar 2 (Longest) -->
    <rect x="156" y="226" width="62" height="13" rx="6.5" fill="url(#speed_grad)" />
    <!-- Speed Bar 3 -->
    <rect x="168" y="250" width="48" height="12" rx="6" fill="url(#speed_grad)" />
  </g>

  <!-- Clapperboard Top Bar (Angled Slate) -->
  <g transform="rotate(-15 220 160)">
    <rect x="210" y="142" width="94" height="22" rx="7" fill="url(#clapper_grad)" />
    <!-- White diagonal slashes on clapper -->
    <path d="M232 142 L224 164 H235 L243 142 Z" fill="#FFFFFF" />
    <path d="M256 142 L248 164 H259 L267 142 Z" fill="#FFFFFF" />
    <path d="M280 142 L272 164 H283 L291 142 Z" fill="#FFFFFF" />
    <circle cx="218" cy="153" r="4.5" fill="#FFFFFF" />
  </g>

  <!-- Play Button Triangle Body -->
  <path d="M228 178 C228 170 236.8 165 243.6 169.3 L312 212.5 C318.5 216.6 318.5 226.4 312 230.5 L243.6 273.7 C236.8 278 228 273 228 265 Z" fill="url(#play_grad)" />

  <!-- Inner White Play Cutout (Hole) -->
  <path d="M246 198 C246 195.2 249.2 193.5 251.6 195 L282.8 214.5 C285.2 216 285.2 219.5 282.8 221 L251.6 240.5 C249.2 242 246 240.3 246 237.5 Z" fill="#FFFFFF" />

  <!-- TEXT WORDMARK "ClipViral" -->
  <!-- "Clip" in Blue -->
  <text x="172" y="348" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="44" font-weight="900" fill="#0B5CFF" letter-spacing="-1.5">Clip</text>

  <!-- "Viral" in Orange -->
  <text x="254" y="348" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="44" font-weight="900" fill="#FF7A00" letter-spacing="-1.5">Viral</text>
</svg>
`;

// 2. Pure Icon SVG for Favicon & Maskable (clean logo on transparent background)
const faviconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fav_blue" x1="160" y1="120" x2="360" y2="320" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#00C6FF" />
      <stop offset="45%" stopColor="#0B5CFF" />
      <stop offset="100%" stopColor="#003ECC" />
    </linearGradient>
    <linearGradient id="fav_clapper" x1="200" y1="100" x2="340" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#38BDF8" />
      <stop offset="100%" stopColor="#0284C7" />
    </linearGradient>
    <linearGradient id="fav_speed" x1="120" y1="180" x2="240" y2="280" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#FFC107" />
      <stop offset="60%" stopColor="#FF7A00" />
      <stop offset="100%" stopColor="#FF3D00" />
    </linearGradient>
    <filter id="fav_shadow" x="0" y="0" width="512" height="512" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0B5CFF" floodOpacity="0.3" />
    </filter>
  </defs>

  <g filter="url(#fav_shadow)">
    <!-- Speed Lines -->
    <rect x="110" y="196" width="70" height="18" rx="9" fill="url(#fav_speed)" />
    <rect x="90" y="232" width="94" height="20" rx="10" fill="url(#fav_speed)" />
    <rect x="110" y="270" width="70" height="18" rx="9" fill="url(#fav_speed)" />

    <!-- Clapper Arm -->
    <g transform="rotate(-15 190 140)">
      <rect x="180" y="105" width="150" height="36" rx="10" fill="url(#fav_clapper)" />
      <path d="M216 105 L202 141 H220 L234 105 Z" fill="#FFFFFF" />
      <path d="M256 105 L242 141 H260 L274 105 Z" fill="#FFFFFF" />
      <path d="M296 105 L282 141 H300 L314 105 Z" fill="#FFFFFF" />
      <circle cx="192" cy="123" r="7" fill="#FFFFFF" />
    </g>

    <!-- Play Body -->
    <path d="M200 160 C200 146 215.5 137.5 227.5 145 L350 220 C362 227.5 362 244.5 350 252 L227.5 327 C215.5 334.5 200 326 200 312 Z" fill="url(#fav_blue)" />

    <!-- Play Hole -->
    <path d="M232 195 C232 190 237.5 187 242 189.5 L298 224 C302.5 226.5 302.5 233 298 235.5 L242 270 C237.5 272.5 232 269.5 232 264.5 Z" fill="#FFFFFF" />
  </g>
</svg>
`;

async function generateAllAssets() {
  console.log("Generating PWA Icon Assets from ClipViral logo...");

  // Write SVGs
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), appIconSvg);
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

  const svgBuffer = Buffer.from(appIconSvg);

  // Generate PNG sizes
  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-maskable-512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-152x152.png', size: 152 },
    { name: 'apple-touch-icon-180x180.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 }
  ];

  for (const item of sizes) {
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(path.join(publicDir, item.name));
    console.log(`Generated: ${item.name} (${item.size}x${item.size})`);
  }

  // Generate PWA manifest.webmanifest / manifest.json
  const manifest = {
    name: "ClipViral - AI Script & Video Studio",
    short_name: "ClipViral",
    description: "Viết nhanh. Quay chất. Dễ viral. Nền tảng AI tạo kịch bản, vẽ ảnh điện ảnh và dựng video ngắn chuyên nghiệp.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0F172A",
    theme_color: "#0B5CFF",
    categories: ["productivity", "utilities", "entertainment", "video", "multimedia"],
    lang: "vi",
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ],
    shortcuts: [
      {
        name: "Tạo Kịch Bản AI",
        short_name: "Tạo Kịch Bản",
        description: "Viết kịch bản video TikTok, Reels, Shorts với AI",
        url: "/?tab=create",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }]
      },
      {
        name: "Tạo Ảnh AI",
        short_name: "Tạo Ảnh",
        description: "Tạo hình ảnh phân cảnh nghệ thuật",
        url: "/?tab=image",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }]
      },
      {
        name: "Làm Phim Video AI",
        short_name: "Làm Phim",
        description: "Dựng video với Omni Flash & Veo 3.1",
        url: "/?tab=video",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }]
      },
      {
        name: "Máy Nhắc Chữ",
        short_name: "Nhắc Chữ",
        description: "Mở máy nhắc chữ Teleprompter",
        url: "/?tab=prompter",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }]
      }
    ]
  };

  fs.writeFileSync(
    path.join(publicDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  fs.writeFileSync(
    path.join(publicDir, 'manifest.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );

  console.log("manifest.json and manifest.webmanifest created successfully!");
}

generateAllAssets().catch(err => {
  console.error("Error generating assets:", err);
  process.exit(1);
});
