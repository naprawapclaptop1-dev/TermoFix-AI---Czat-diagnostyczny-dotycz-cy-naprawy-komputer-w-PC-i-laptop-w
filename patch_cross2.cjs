const fs = require('fs');
const file = 'src/components/CrossPlatformInstallerModal.tsx';
let code = fs.readFileSync(file, 'utf8');

const newBtn = `                  <a
                    href="/api/download-console"
                    download="TermoFix_Console_App.sh"
                    className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Pobierz Aplikację Konsolową (.sh)</span>
                  </a>
                  <button
                    onClick={handleDownloadLinuxScript}
`;

code = code.replace(/<button\n\s+onClick=\{handleDownloadLinuxScript\}/, newBtn);
fs.writeFileSync(file, code);
