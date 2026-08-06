const fs = require('fs');
const file = 'src/components/AutoUniversalBiosInstallerModal.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/addLog\\\(\\\`Wykryto płytę: \\\$\\{manufacturer\\} \\\$\\{model\\} v\\\$\\{version\\}\\\`\\\);/g, "addLog(`Wykryto płytę: ${manufacturer} ${model} v${version}`);");
code = code.replace(/addLog\\\(\\\`Obecny BIOS: 1002\\\`\\\);/g, "addLog(`Obecny BIOS: 1002`);");
code = code.replace(/onSendToChat\\\(\\\`Zaktualizowano BIOS płyty/g, "onSendToChat(`Zaktualizowano BIOS płyty");

code = code.replace(/addLog\(\\\`Wykryto płytę:/g, "addLog(`Wykryto płytę:");
code = code.replace(/\\\`\)/g, "`)");
code = code.replace(/\\\$/g, "$");


fs.writeFileSync(file, code);
