const fs = require('fs');
const file = 'src/components/FurMark3DGpuTestModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetText = `        ctx.fillStyle = highlightColor;
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(titleStr, 20, 35);`;

const newText = `        ctx.fillStyle = highlightColor;
        ctx.font = 'bold 16px sans-serif';
        
        // Add text glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = highlightColor;
        ctx.fillText(titleStr, 20, 35);
        ctx.shadowBlur = 0; // reset
        `;

if (content.includes(targetText)) {
    content = content.replace(targetText, newText);
    console.log('Patched title glow');
}

fs.writeFileSync(file, content, 'utf8');
