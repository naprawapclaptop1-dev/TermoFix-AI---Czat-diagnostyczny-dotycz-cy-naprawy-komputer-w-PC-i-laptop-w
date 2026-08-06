const fs = require('fs');
const file = 'src/components/AutoUniversalBiosInstallerModal.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/\\`\\\$\\{flashProgress\\}%\\`/g, '`${flashProgress}%`');
fs.writeFileSync(file, code);
