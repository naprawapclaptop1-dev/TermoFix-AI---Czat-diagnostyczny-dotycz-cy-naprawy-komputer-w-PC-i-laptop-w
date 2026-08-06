const fs = require('fs');
const file = 'src/components/UsbFlashBurnerWizardModal.tsx';
let code = fs.readFileSync(file, 'utf8');

const newOption = `                <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-800 border border-slate-700 has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-900/20">
                  <div className="flex items-center gap-2">
                    <input type="radio" name="isoType" value="bios" checked={isoType === 'bios'} onChange={() => setIsoType('bios')} className="accent-blue-500" />
                    <div>
                      <div className="font-bold text-slate-200">BIOS / UEFI Update USB</div>
                      <div className="text-slate-500">Uniwersalny DOS/Flashback dla ASUS, MSI, Gigabyte, AsRock, Dell, HP, Lenovo</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </label>`;

code = code.replace(/(<label[\s\S]*?value="strelec"[\s\S]*?<\/label>)/, "$1\n" + newOption);

fs.writeFileSync(file, code);
