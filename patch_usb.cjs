const fs = require('fs');
const file = 'src/components/UsbFlashBurnerWizardModal.tsx';
let code = fs.readFileSync(file, 'utf8');

const replacement = `  const [isoType, setIsoType] = useState('windows11');
  const [usbDrives, setUsbDrives] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/disks')
        .then(res => res.json())
        .then(data => {
           setUsbDrives(data.filter((d: any) => d.isUsb));
        })
        .catch(err => console.error(err));
    }
  }, [isOpen]);
`;

code = code.replace(/  const \[isoType, setIsoType\] = useState\('windows11'\);/, replacement);

const selectReplacement = `<select className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2.5 mb-4">
                {usbDrives.length > 0 ? usbDrives.map((d, i) => (
                   <option key={i}>{d.driveLetter} ({d.name}) - {d.sizeGb} GB</option>
                )) : (
                   <option>Wyszukiwanie dysków USB...</option>
                )}
              </select>`;

code = code.replace(/<select className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2\.5 mb-4">[\s\S]*?<\/select>/, selectReplacement);

fs.writeFileSync(file, code);
