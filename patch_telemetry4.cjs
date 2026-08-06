const fs = require('fs');
const file = 'src/components/MyPcLiveTelemetryBanner.tsx';
let code = fs.readFileSync(file, 'utf8');

const telemetryStats = `
          <div className="flex-1 min-w-[200px] flex items-center justify-around bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CPU</div>
                <div className="font-mono text-indigo-400 font-black">{telemetry.cpuLoad.toFixed(0)}%</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">GPU</div>
                <div className="font-mono text-emerald-400 font-black">{telemetry.gpuLoad.toFixed(0)}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">RAM</div>
                <div className="font-mono text-purple-400 font-black">{telemetry.ramLoad.toFixed(0)}%</div>
              </div>
            </div>
          </div>
`;

code = code.replace(/<div className="flex-1 min-w-\[200px\] flex items-center justify-around bg-slate-950 p-2\.5 rounded-lg border border-slate-800">[\s\S]*?<\/div>\n          <\/div>/, telemetryStats);

fs.writeFileSync(file, code);
