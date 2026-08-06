const fs = require('fs');
const file = 'src/components/LiveHardwareDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const importHook = `import { Cpu, Zap, HardDrive, Activity, Usb, Database, Layers } from 'lucide-react';`;
code = code.replace(/import \{ Cpu, Zap, HardDrive, Activity, Usb, Database \} from 'lucide-react';/, importHook);

const graphArea = `              <Area type="monotone" dataKey="cpu" name="CPU (%)" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
              <Area type="monotone" dataKey="gpu" name="GPU (%)" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              <Area type="monotone" dataKey="ram" name="RAM (%)" stroke="#c084fc" fill="#c084fc" fillOpacity={0.2} />
              <Area type="monotone" dataKey="vram" name="VRAM (%)" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />`;
              
code = code.replace(/<Area type="monotone" dataKey="cpu"[\s\S]*?fillOpacity=\{0\.2\} \/>/, graphArea);

const middleColumn = `<div className="w-full md:w-64 flex flex-col justify-between gap-2 overflow-y-auto pr-1">
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Cpu className="w-4 h-4 text-sky-400" /> CPU</div>
          <div className="font-mono font-bold text-sky-400 text-sm">{data.length > 0 ? data[data.length - 1].cpu.toFixed(0) : 0}%</div>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Zap className="w-4 h-4 text-emerald-400" /> GPU</div>
          <div className="font-mono font-bold text-emerald-400 text-sm">{data.length > 0 ? data[data.length - 1].gpu.toFixed(0) : 0}%</div>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Activity className="w-4 h-4 text-rose-400" /> GPU CLK</div>
          <div className="font-mono font-bold text-rose-400 text-sm">{data.length > 0 ? data[data.length - 1].gpuClockMhz.toFixed(0) : 0} MHz</div>
        </div>
        <div className="flex gap-2">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between flex-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs"><HardDrive className="w-4 h-4 text-purple-400" /> RAM</div>
            <div className="font-mono font-bold text-purple-400 text-sm">{data.length > 0 ? data[data.length - 1].ram.toFixed(0) : 0}%</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between flex-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs"><Layers className="w-4 h-4 text-amber-500" /> VRAM</div>
            <div className="font-mono font-bold text-amber-500 text-sm">{data.length > 0 ? data[data.length - 1].vram.toFixed(0) : 0}%</div>
            </div>
        </div>
      </div>`;
      
code = code.replace(/<div className="w-full md:w-64 flex flex-col justify-between gap-2">[\s\S]*?<\/div>\s*<\/div>\s*<div className="w-full md:w-64 bg-slate-950/, middleColumn + '\n      <div className="w-full md:w-64 bg-slate-950');

fs.writeFileSync(file, code);
