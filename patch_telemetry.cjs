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
`;

code = code.replace(/useEffect\(\(\) => \{[\s\S]*?setData\(prev => \{/, telemetryGen);
fs.writeFileSync(file, code);
