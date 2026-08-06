const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/import \{ ExeBuilderModal \} from '\.\/components\/ExeBuilderModal';/, "import { ExeBuilderModal } from './components/ExeBuilderModal';\nimport { AutoUniversalBiosInstallerModal } from './components/AutoUniversalBiosInstallerModal';");
code = code.replace(/const \[isExeBuilderModalOpen, setIsExeBuilderModalOpen\] = useState\(false\);/, "const [isExeBuilderModalOpen, setIsExeBuilderModalOpen] = useState(false);\n  const [isAutoBiosOpen, setIsAutoBiosOpen] = useState(false);");

const modalTag = `      <AutoUniversalBiosInstallerModal
        isOpen={isAutoBiosOpen}
        onClose={() => setIsAutoBiosOpen(false)}
        onSendToChat={handleSendMessage}
      />
      <ExeBuilderModal`;
      
code = code.replace(/<ExeBuilderModal/, modalTag);

fs.writeFileSync(file, code);
