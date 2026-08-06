const fs = require('fs');
const file = 'src/components/DesktopLauncher.tsx';
let code = fs.readFileSync(file, 'utf8');

// Remove the top persistent telemetry overlay banner entirely
code = code.replace(/<div className="relative z-20 bg-slate-900\/90 border-b border-indigo-500\/30 px-4 py-2\.5 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, '');

// Also try to replace it with a more robust regex if the above fails
if (code.includes('Top Persistent Live Telemetry Overlay Banner')) {
  let startIndex = code.indexOf('{/* Top Persistent Live Telemetry Overlay Banner */}');
  let endIndex = code.indexOf('{/* Live Gauges Summary Pills */}');
  if (startIndex !== -1 && endIndex !== -1) {
    // Just remove everything up to the grid
    let gridIndex = code.indexOf('<div className="flex-1 grid');
    if (gridIndex !== -1) {
       code = code.substring(0, startIndex) + code.substring(gridIndex);
    }
  }
}

// Remove Temps from the modal details as well
code = code.replace(/<span className="text-slate-500 text-\[10px\]">Temp: \{telemetry\.cpuTemp\}°C<\/span>/g, '');
code = code.replace(/<span className="text-slate-500 text-\[10px\]">Temp: \{telemetry\.gpuTemp\}°C<\/span>/g, '');
code = code.replace(/<span className="text-slate-500 text-\[10px\]">VRM: \{telemetry\.vrmTemp\}°C<\/span>/g, '');

fs.writeFileSync(file, code);
