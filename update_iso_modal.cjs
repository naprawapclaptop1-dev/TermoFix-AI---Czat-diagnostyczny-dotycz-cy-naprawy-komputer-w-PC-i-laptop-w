const fs = require('fs');
const file = 'src/components/WindowsIsoBuilderModal.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/href=\{\`\/api\/download-windows-iso\?edition=\$\{selectedEdition\}\`\}/, 'href={`/api/download-windows-iso?edition=${selectedEdition}`} target="_blank"');

fs.writeFileSync(file, code);
