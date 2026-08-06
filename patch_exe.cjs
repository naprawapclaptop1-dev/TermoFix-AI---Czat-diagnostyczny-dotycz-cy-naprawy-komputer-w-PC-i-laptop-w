const fs = require('fs');
const file = 'src/components/ExeBuilderModal.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetButtons = `
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setTargetOS('windows')}
                  className={\`p-4 rounded-xl flex items-center justify-center gap-2 border transition \${
                    targetOS === 'windows' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }\`}
                >
                  Windows (.EXE)
                </button>
                <button
                  onClick={() => setTargetOS('linux')}
                  className={\`p-4 rounded-xl flex items-center justify-center gap-2 border transition \${
                    targetOS === 'linux' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }\`}
                >
                  Linux Console
                </button>
                <button
                  onClick={() => setTargetOS('macos')}
                  className={\`p-4 rounded-xl flex items-center justify-center gap-2 border transition \${
                    targetOS === 'macos' ? 'bg-slate-300/20 border-slate-300 text-slate-200' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }\`}
                >
                  macOS (.APP)
                </button>
                <button
                  onClick={() => setTargetOS('android')}
                  className={\`p-4 rounded-xl flex items-center justify-center gap-2 border transition \${
                    targetOS === 'android' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }\`}
                >
                  Android (.APK)
                </button>
              </div>`;

code = code.replace(/<div className="grid grid-cols-2 gap-3">[\s\S]*?<\/div>/, targetButtons);
fs.writeFileSync(file, code);
