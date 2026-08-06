const fs = require('fs');
const file = 'src/components/SystemScanKeysUpdaterRepairModal.tsx';
let code = fs.readFileSync(file, 'utf8');
if(!code.includes("hardwareDiscoveryService")) {
  code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { hardwareDiscoveryService } from '../services/hardwareDiscoveryService';");
}
code = code.replace("const [hardwareSpecs, setHardwareSpecs] = useState<HardwareComponentSpec[]>(specsSnapshot || MOCK_HARDWARE_SPECS);", "const [hardwareSpecs, setHardwareSpecs] = useState<HardwareComponentSpec[]>(MOCK_HARDWARE_SPECS);\n  const [specsSnapshot, setSpecsSnapshot] = useState<any>(null);");

const liveScanReplace = `const handleStartLiveScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    try {
      const specs = await hardwareDiscoveryService.discoverSystemHardware();
      setSpecsSnapshot(specs);
      
      const newSpecs: HardwareComponentSpec[] = [
        {
          id: 'cpu-live',
          category: 'CPU',
          name: \`Procesor \${specs.cpu.model} (\${specs.cpu.cores} Rdzeni)\`,
          details: \`Taktowanie: \${specs.cpu.baseClock} - \${specs.cpu.boostClock} | Gniazdo: \${specs.cpu.socket}\`,
          status: 'OPTIMAL',
        },
        {
          id: 'gpu-live',
          category: 'GPU',
          name: \`\${specs.gpu.vendorAndModel}\`,
          details: \`VRAM: \${specs.gpu.vramGb} GB | TGP: \${specs.gpu.tgpWatts}W\`,
          status: 'OPTIMAL',
        },
        {
          id: 'ram-live',
          category: 'RAM',
          name: \`Pamięć \${specs.ram.totalGbFormatted}\`,
          details: \`Przepustowość: \${specs.ram.clockSpeed}\`,
          status: 'OPTIMAL',
        },
        {
          id: 'mb-live',
          category: 'MOTHERBOARD',
          name: \`Płyta Główna \${specs.motherboard.model}\`,
          details: \`BIOS: \${specs.motherboard.biosVersion}\`,
          status: 'OPTIMAL',
        }
      ];
      setHardwareSpecs(newSpecs);
    } catch(e) {}

    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        progress = 100;
        setIsScanning(false);
        clearInterval(interval);
      }
      setScanProgress(progress);
    }, 250);
  };`;
  
code = code.replace(/const handleStartLiveScan = \(\) => \{[\s\S]*?\}, 250\);\n  \};/, liveScanReplace);
fs.writeFileSync(file, code);
