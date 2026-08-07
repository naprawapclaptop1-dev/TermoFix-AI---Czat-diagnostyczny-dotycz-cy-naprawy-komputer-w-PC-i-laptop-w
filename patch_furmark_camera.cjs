const fs = require('fs');
const file = 'src/components/FurMark3DGpuTestModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFOV = `          const fov = 400;`;
const newFOV = `          // Dynamic camera zoom (fov oscillation)
          const fov = testMode.includes('furmark') ? 400 + Math.sin(time * 0.0005) * 120 : 400;`;

if (content.includes(targetFOV)) {
    content = content.replace(targetFOV, newFOV);
    console.log('Patched FOV');
}

fs.writeFileSync(file, content, 'utf8');
