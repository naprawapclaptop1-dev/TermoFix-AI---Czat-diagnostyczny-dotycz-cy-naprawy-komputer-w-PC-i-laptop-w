const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/res\.setHeader\('Content-Type', 'application\/octet-stream'\);\s*res\.setHeader\('Content-Disposition', 'attachment; filename="TermoFix\.exe\.cmd"'\);\s*res\.send\(([^)]+)\);/g, (match, scriptVar) => {
  return `res.setHeader('Content-Type', 'application/x-msdownload');
  try {
    const exeBuffer = compileBatToExe(${scriptVar}, true);
    res.setHeader('Content-Disposition', 'attachment; filename="TermoFix.exe"');
    res.send(exeBuffer);
  } catch (e) {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="TermoFix.cmd"');
    res.send(Buffer.from(${scriptVar}, 'utf-8'));
  }`;
});

fs.writeFileSync('server.ts', code);
