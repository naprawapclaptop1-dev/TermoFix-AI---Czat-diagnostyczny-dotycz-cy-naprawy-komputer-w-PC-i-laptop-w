const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/res\.setHeader\('Content-Type', 'application\/x-msdownload'\);\n    try \{\n      const exeBuffer = compileBatToExe\(dynamicExeScript, true\);\n      res\.setHeader\('Content-Disposition', 'attachment; filename="TermoFix\.exe"'\);/g, "res.setHeader('Content-Disposition', 'attachment; filename=\"TermoFix.exe.cmd\"');");
fs.writeFileSync('server.ts', code);
