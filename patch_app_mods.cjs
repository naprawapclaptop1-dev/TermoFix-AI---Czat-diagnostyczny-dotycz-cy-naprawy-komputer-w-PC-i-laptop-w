const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/import \{ ExeBuilderModal \} from '\.\/components\/ExeBuilderModal';/, "import { ExeBuilderModal } from './components/ExeBuilderModal';\nimport { ModsGpuScannerModal } from './components/ModsGpuScannerModal';");
code = code.replace(/const \[isExeBuilderModalOpen, setIsExeBuilderModalOpen\] = useState\(false\);/, "const [isExeBuilderModalOpen, setIsExeBuilderModalOpen] = useState(false);\n  const [isModsOpen, setIsModsOpen] = useState(false);");

const modalTag = `      <ModsGpuScannerModal
        isOpen={isModsOpen}
        onClose={() => setIsModsOpen(false)}
        onSendToChat={handleSendMessage}
      />
      <ExeBuilderModal`;
      
code = code.replace(/<ExeBuilderModal/, modalTag);

const newApp = `    { id: 'gpu-diag', name: 'Diagnostyka GPU', icon: <Monitor className="w-8 h-8 text-white" />, color: 'from-red-500 to-orange-600', onClick: () => setIsGpuDiagnosticsOpen(true) },
    { id: 'mats-mods', name: 'NVIDIA MATS/MODS', icon: <Layers className="w-8 h-8 text-white" />, color: 'from-emerald-600 to-teal-700', onClick: () => setIsModsOpen(true) },`;

code = code.replace(/\{\s+id:\s+'gpu-diag'[\s\S]*?setIsGpuDiagnosticsOpen\(true\)\s+\},/, newApp);

fs.writeFileSync(file, code);
