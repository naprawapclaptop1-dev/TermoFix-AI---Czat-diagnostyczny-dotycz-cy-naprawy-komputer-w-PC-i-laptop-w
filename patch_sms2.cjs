const fs = require('fs');
const file = 'src/components/MobileSmsAppModal.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const a = document\.createElement\('a'\);\n        a\.href = link;\n        a\.target = '_blank';\n        a\.click\(\);/g, "window.location.href = link;");

fs.writeFileSync(file, code);
