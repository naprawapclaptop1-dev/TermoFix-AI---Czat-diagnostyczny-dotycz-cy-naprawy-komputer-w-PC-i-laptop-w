const fs = require('fs');
const file = 'src/components/AutoUniversalBiosInstallerModal.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/addLog\\\(\\\`Wykryto płytę: \\\$\\{manufacturer\\} \\\$\\{model\\} v\\\$\\{version\\}\\\`\\\);/g, "addLog(`Wykryto płytę: ${manufacturer} ${model} v${version}`);");
code = code.replace(/addLog\\\(\\\`Obecny BIOS: 1002\\\`\\\);/g, "addLog(`Obecny BIOS: 1002`);");
code = code.replace(/onSendToChat\\\(\\\`Zaktualizowano BIOS/g, "onSendToChat(`Zaktualizowano BIOS");

fs.writeFileSync(file, code);
