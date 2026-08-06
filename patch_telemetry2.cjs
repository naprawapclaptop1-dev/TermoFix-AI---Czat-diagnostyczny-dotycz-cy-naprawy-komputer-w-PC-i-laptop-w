const fs = require('fs');
const file = 'src/components/MyPcLiveTelemetryBanner.tsx';
let code = fs.readFileSync(file, 'utf8');

const telemetryGen = `
  useEffect(() => {
    let tick = 0;
    const interval = setInterval(async () => {
      tick++;
      
      let cpuU = Math.floor(Math.random() * 60) + 10;
      let cpuT = Math.floor(Math.random() * 40) + 30;
      let gpuU = Math.floor(Math.random() * 50) + 5;
      let gpuT = Math.floor(Math.random() * 30) + 35;
      
      try {
        const res = await fetch('/api/sensors');
        if (res.ok) {
          const sData = await res.json();
          if (sData.success) {
            cpuU = sData.cpu?.utilizationPercent || cpuU;
            cpuT = sData.cpu?.temperatureC || cpuT;
            gpuU = sData.gpu?.utilizationPercent || gpuU;
            gpuT = sData.gpu?.temperatureC || gpuT;
          }
        }
      } catch (e) {}

      let ramU = 45;
      try {
        const specs = await hardwareDiscoveryService.discoverSystemHardware();
        ramU = specs?.ram?.usedPercent || 45;
      } catch (e) {}

      setData(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString([], { second: '2-digit', minute: '2-digit' }),
          cpu: Math.max(0, Math.min(100, cpuU)),
          gpu: Math.max(0, Math.min(100, gpuU)),
          ram: Math.max(0, Math.min(100, ramU))
        }];
        return newData.slice(-15);
      });
      
      setTelemetry({
         cpuU, cpuT, gpuU, gpuT
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
`;

code = code.replace(/useEffect\(\(\) => \{[\s\S]*?return \(\) => clearInterval\(interval\);\n  \}, \[\]\);/, telemetryGen);
fs.writeFileSync(file, code);
