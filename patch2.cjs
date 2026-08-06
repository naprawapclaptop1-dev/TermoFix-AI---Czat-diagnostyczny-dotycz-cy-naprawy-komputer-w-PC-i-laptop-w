const fs = require('fs');
const file = 'src/components/SystemScanKeysUpdaterRepairModal.tsx';
let code = fs.readFileSync(file, 'utf8');

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
          details: \`Taktowanie: \${specs.cpu.clockSpeedGhz} GHz | Architektura: \${specs.cpu.architecture}\`,
          status: 'OPTIMAL',
        },
        {
          id: 'gpu-live',
          category: 'GPU',
          name: \`\${specs.gpu.vendorAndModel}\`,
          details: \`VRAM: System Default | TGP: N/A\`,
          status: 'OPTIMAL',
        },
        {
          id: 'ram-live',
          category: 'RAM',
          name: \`Pamięć \${specs.ram.totalGbFormatted}\`,
          details: \`Typ: \${specs.ram.memoryType} | Wolne: \${specs.ram.freeGbFormatted}\`,
          status: 'OPTIMAL',
        },
        {
          id: 'mb-live',
          category: 'MOTHERBOARD',
          name: \`Płyta Główna \${specs.motherboard?.model || 'Generic'}\`,
          details: \`BIOS: \${specs.bios?.version || 'N/A'}\`,
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
  
code = code.replace(/const handleStartLiveScan = async \(\) => \{[\s\S]*?\}, 250\);\n  \};/, liveScanReplace);
fs.writeFileSync(file, code);
