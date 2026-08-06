const fs = require('fs');
const file = 'src/components/DesktopLauncher.tsx';
let code = fs.readFileSync(file, 'utf8');

const telemetryGen = `              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">OBCIĄŻENIE CPU</span>
                <p className="text-xl font-black text-cyan-400 mt-1">{telemetry.cpuUtil}%</p>
                <p className="text-[10px] text-slate-500 mt-1">Temp: {telemetry.cpuTemp}°C</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">OBCIĄŻENIE GPU</span>
                <p className="text-xl font-black text-emerald-400 mt-1">{telemetry.gpuUtil}%</p>
                <p className="text-[10px] text-slate-500 mt-1">Temp: {telemetry.gpuTemp}°C</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">ZANIMALIZACJA RAM</span>
                <p className="text-xl font-black text-purple-400 mt-1">{telemetry.ramUtil}%</p>
                <p className="text-[10px] text-slate-500 mt-1">{specsSnapshot?.ram?.totalCapacityGB || '16'} GB RAM DDR4/DDR5</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">WENTYLATOR CPU</span>
                <p className="text-xl font-black text-amber-400 mt-1">{telemetry.fanRpm} RPM</p>
                <p className="text-[10px] text-slate-500 mt-1">VRM: {telemetry.vrmTemp}°C</p>
              </div>
            </div>`;

code = code.replace(/<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">[\s\S]*?<\/div>\n            <\/div>/, telemetryGen);

fs.writeFileSync(file, code);
