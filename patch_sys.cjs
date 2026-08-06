const fs = require('fs');
const file = 'src/components/SystemScanKeysUpdaterRepairModal.tsx';
let code = fs.readFileSync(file, 'utf8');

const imports = `import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, Search, Zap, 
  Terminal, ShieldAlert, Cpu, HardDrive, Key, X, Activity, Server, FileDigit, Usb
} from 'lucide-react';`;

code = code.replace(/import React[\s\S]*?} from 'lucide-react';/, imports);

const states = `  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<string>('C:');

  useEffect(() => {
    fetch('/api/disks').then(res => res.json()).then(data => {
      setDrives(data);
      if(data.length > 0) setSelectedDrive(data[0].driveLetter);
    }).catch(() => {});
  }, []);`;

code = code.replace(/const \[logs, setLogs\] = useState<LogEntry\[\]>\(\[\]\);/, states);

const renderDriveSelect = `
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
             <div className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
               <HardDrive className="w-4 h-4 text-slate-400" />
               Dysk docelowy skanowania (USB / HDD)
             </div>
             <select 
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                value={selectedDrive}
                onChange={e => setSelectedDrive(e.target.value)}
             >
                {drives.map((d, i) => (
                  <option key={i} value={d.driveLetter}>{d.driveLetter} - {d.name} ({d.sizeGb}GB) {d.isUsb ? '[USB]' : ''}</option>
                ))}
             </select>
          </div>
`;

code = code.replace(/<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">/, renderDriveSelect);

fs.writeFileSync(file, code);
