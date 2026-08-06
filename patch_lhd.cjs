const fs = require('fs');
const file = 'src/components/LiveHardwareDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const importHook = `import { useHardwareTelemetry } from '../hooks/useHardwareTelemetry';\nimport { hardwareDiscoveryService }`;
code = code.replace(/import \{ hardwareDiscoveryService \}/, importHook);

const hookUsage = `export const LiveHardwareDashboard: React.FC = () => {
  const [disks, setDisks] = useState<any[]>([]);
  const data = useHardwareTelemetry(200, 40); // 200ms updates, 40 points history

  useEffect(() => {
    fetch('/api/disks').then(res => res.json()).then(data => setDisks(data)).catch(() => {});
  }, []);`;

code = code.replace(/export const LiveHardwareDashboard: React\.FC = \(\) => \{[\s\S]*?\}, \[\]\);/, hookUsage);

fs.writeFileSync(file, code);
