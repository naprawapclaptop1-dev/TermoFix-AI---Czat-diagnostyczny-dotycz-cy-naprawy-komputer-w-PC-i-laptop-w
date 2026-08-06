const fs = require('fs');
const file = 'src/components/CrossPlatformInstallerModal.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/<a\n\s+href="https:\/\/drive\.google\.com\/file\/d\/13fQ4_IP-LZI1t0YDLEZgGCra-Wbw7m37\/view\?usp=drive_link"/, '<a\n                    href="/api/download-apk"');
code = code.replace(/<span>Pobierz Pakiet APK \(Dysk Google\)<\/span>/, '<span>Pobierz Pakiet Instalacyjny (.APK)</span>');

fs.writeFileSync(file, code);
