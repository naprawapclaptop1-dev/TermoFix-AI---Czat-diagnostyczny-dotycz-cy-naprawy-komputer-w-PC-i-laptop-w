const fs = require('fs');
const file = 'src/components/FurMark3DGpuTestModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetLoop = `      for (let i = 0; i < segmentsU; i++) {
        const u = (i / segmentsU) * Math.PI * 2;`;

const newTargetLoop = `      // Particles for FurMark flames
      if (testMode.includes('furmark')) {
         ctx.globalCompositeOperation = 'lighter';
         for (let p = 0; p < 15; p++) {
            const pAngle = angle + (Math.random() * Math.PI * 2);
            const pRad = R + (Math.random() - 0.5) * 40;
            const px = pRad * Math.cos(pAngle);
            const py = pRad * Math.sin(pAngle);
            const pz = (Math.random() - 0.5) * 30;
            
            const pxRot = px * cosA - pz * sinA;
            const pzRot = px * sinA + pz * cosA;
            const pyRot = py * cosX - pzRot * sinX;
            const pzRot2 = py * sinX + pzRot * cosX;
            
            const scaleP = 400 / (400 + pzRot2 + 280);
            const pxx = pxRot * scaleP;
            const pyy = pyRot * scaleP;
            
            ctx.fillStyle = \`rgba(255, \${Math.floor(Math.random() * 150)}, 0, \${Math.random() * 0.4})\`;
            ctx.beginPath();
            ctx.arc(pxx, pyy, scaleP * (Math.random() * 8 + 2), 0, Math.PI * 2);
            ctx.fill();
         }
         ctx.globalCompositeOperation = 'source-over';
      }

      for (let i = 0; i < segmentsU; i++) {
        const u = (i / segmentsU) * Math.PI * 2;`;

if (content.includes(targetLoop)) {
    content = content.replace(targetLoop, newTargetLoop);
    console.log('Patched particles loop');
}

const targetHair = `             const hairLength = (Math.sin(u * 10 + time * 0.005) + Math.cos(v * 10 + time * 0.005)) * 10 + 20;
             const hairX = px + (x1 / 150) * hairLength * scale;
             const hairY = py + (y1 / 150) * hairLength * scale;
             ctx.strokeStyle = \`rgba(\${Math.min(255, redCol + 30)}, \${Math.min(255, greenCol + 40)}, \${blueCol + 20}, \${msaa === '32x' ? 0.9 : 0.65})\`;`;

const newHair = `             // Advanced Perlin-like noise for fur wave
             const noise = Math.sin(u * 15 + time * 0.003) * Math.cos(v * 15 + time * 0.002);
             const hairLength = noise * 12 + 25;
             
             // Gravity / wind effect on hair
             const windX = Math.sin(time * 0.001) * 15;
             const windY = Math.cos(time * 0.001) * 10;
             
             const hairX = px + (x1 / 150) * hairLength * scale + windX * scale;
             const hairY = py + (y1 / 150) * hairLength * scale + windY * scale;
             
             // Dynamic hair color based on length and noise
             const hairR = Math.min(255, redCol + (noise > 0 ? 40 : 10));
             const hairG = Math.min(255, greenCol + (noise > 0 ? 60 : 20));
             
             ctx.strokeStyle = \`rgba(\${hairR}, \${hairG}, \${blueCol + 20}, \${msaa === '32x' ? 0.95 : 0.7})\`;`;

if (content.includes(targetHair)) {
    content = content.replace(targetHair, newHair);
    console.log('Patched hair physics');
}

fs.writeFileSync(file, content, 'utf8');
