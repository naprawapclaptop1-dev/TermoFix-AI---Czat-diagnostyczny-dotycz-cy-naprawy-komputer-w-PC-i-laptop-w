const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

const newApp = `    { id: 'part-search', name: 'Wyszukiwarka Części', icon: <Search className="w-8 h-8 text-white" />, color: 'from-blue-600 to-indigo-700', onClick: () => setIsPartSearchEngineOpen(true) },
    { id: 'auto-bios', name: 'Universal BIOS Update', icon: <Cpu className="w-8 h-8 text-white" />, color: 'from-blue-500 to-cyan-600', onClick: () => setIsAutoBiosOpen(true) },`;

code = code.replace(/\{\s+id:\s+'part-search'[\s\S]*?setIsPartSearchEngineOpen\(true\)\s+\},/, newApp);

fs.writeFileSync(file, code);
