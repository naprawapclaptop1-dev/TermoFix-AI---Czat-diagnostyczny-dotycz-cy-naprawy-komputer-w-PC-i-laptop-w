const fs = require('fs');
const file = 'src/components/WindowsRepairModal.tsx';
let code = fs.readFileSync(file, 'utf8');

const importStatement = `import { X, Terminal, Copy, Check, ShieldAlert, Cpu, AlertTriangle, Play, RefreshCw, Folder, Download, KeyRound, Lock, Zap, CheckCircle2 } from 'lucide-react';\nimport { systemAutoRepairManager } from '../services/systemAutoRepairManager';`;
code = code.replace(/import \{ X, Terminal, Copy, Check, ShieldAlert, Cpu, AlertTriangle, Play, RefreshCw, Folder, Download, KeyRound, Lock, Zap, CheckCircle2 \} from 'lucide-react';/, importStatement);

const propsInterface = `interface WindowsRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (prompt: string) => void;
  detectedError?: string;
}`;
code = code.replace(/interface WindowsRepairModalProps \{[\s\S]*?\}/, propsInterface);

const modalComponentStart = `export const WindowsRepairModal: React.FC<WindowsRepairModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  detectedError
}) => {`;
code = code.replace(/export const WindowsRepairModal: React\.FC<WindowsRepairModalProps> = \(\{\n  isOpen,\n  onClose,\n  onSendToChat\n\}\) => \{/, modalComponentStart);

const repairTasksLogic = `
  const [activeRunningToolId, setActiveRunningToolId] = useState<string | null>(null);
  
  const suggestedRepairs = detectedError ? systemAutoRepairManager.getSuggestedRepairsForError(detectedError) : systemAutoRepairManager.getAllRepairs();
  
  const handleRunAutoRepair = (taskId: string, title: string, scriptContent: string) => {
    setActiveRunningToolId(taskId);
    setIsRunning(true);
    setTerminalLogs([\`[+] Wykonywanie procedury: \${title}\`, \`[+] Uruchamianie skryptu naprawczego...\`]);
    
    // Simulate execution of auto repair script
    const lines = scriptContent.split('\\n').filter(l => l.trim() !== '');
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setTerminalLogs(prev => [...prev, \`C:\\> \${lines[i]}\`]);
        i++;
      } else {
        clearInterval(interval);
        setTerminalLogs(prev => [...prev, '[✓] Procedura Auto-Naprawy zakończona pomyślnie.']);
        setIsRunning(false);
      }
    }, 600);
  };
`;

code = code.replace(/const \[activeRunningToolId, setActiveRunningToolId\] = useState<string \| null>\(null\);/, repairTasksLogic);

const autoRepairUI = `
          {/* Auto Repair Module */}
          <div className="space-y-4">
            <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" />
              Automatyczne Moduły Naprawcze (One-Click)
            </h3>
            
            {suggestedRepairs.length === 0 && detectedError && (
               <div className="text-slate-400 text-xs italic">Brak dedykowanych automatycznych napraw dla błędu: {detectedError}</div>
            )}
            
            {suggestedRepairs.map((task) => (
              <div key={task.id} className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {task.title}
                  </h4>
                  <button
                    onClick={() => {
                      if (window.confirm(\`Czy na pewno chcesz uruchomić automatyczną naprawę: \${task.title}?\`)) {
                        handleRunAutoRepair(task.id, task.title, task.scriptContent);
                      }
                    }}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-4 py-2 rounded-lg transition shadow-md shadow-emerald-900/50 flex items-center gap-1"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    Wykonaj Naprawę (One-Click)
                  </button>
                </div>
                <p className="text-xs text-slate-400">{task.description}</p>
                <div className="bg-black/60 p-2 rounded border border-emerald-900/30 text-[10px] font-mono text-slate-500 overflow-x-auto">
                   <pre>{task.scriptContent}</pre>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-slate-800 my-4"></div>
          
          {/* Tools Grid */}`;

code = code.replace(/\{\/\* Tools Grid \*\/\}/, autoRepairUI);

// Fix terminal Live Output name
code = code.replace(/Terminal Live Output: \{REPAIR_TOOLS\.find\(\(t\) => t\.id === activeRunningToolId\)\?\.name\}/, `Terminal Live Output: {REPAIR_TOOLS.find((t) => t.id === activeRunningToolId)?.name || suggestedRepairs.find(t => t.id === activeRunningToolId)?.title}`);

fs.writeFileSync(file, code);
