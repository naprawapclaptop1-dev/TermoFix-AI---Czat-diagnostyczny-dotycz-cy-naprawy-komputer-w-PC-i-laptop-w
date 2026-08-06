const fs = require('fs');
const file = 'src/components/DesktopLauncher.tsx';
let code = fs.readFileSync(file, 'utf8');

// Remove Top Persistent Live Telemetry Overlay Banner
code = code.replace(/<div className="relative z-20 bg-slate-900\/90 border-b border-indigo-500\/30 px-4 py-2\.5 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, '');

fs.writeFileSync(file, code);
