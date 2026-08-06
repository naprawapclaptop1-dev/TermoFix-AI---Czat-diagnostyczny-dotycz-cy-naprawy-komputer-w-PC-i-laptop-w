const fs = require('fs');
const file = 'src/components/AutoUniversalBiosInstallerModal.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/addLog\\\(\\\`Obecny BIOS: 1002`\);/g, "addLog(`Obecny BIOS: 1002`);");
fs.writeFileSync(file, code);
