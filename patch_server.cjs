const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

const newEndpoints = `
app.get("/api/download-apk", (req, res) => {
  res.setHeader("Content-Disposition", "attachment; filename=TermoFix_Serwis.apk");
  res.setHeader("Content-Type", "application/vnd.android.package-archive");
  res.send("PK\\x03\\x04... DUMMY APK CONTENT FOR DEMONSTRATION ... APK MUST BE SIGNED.");
});

app.get("/api/download-console", (req, res) => {
  res.setHeader("Content-Disposition", "attachment; filename=TermoFix_Console_App.sh");
  res.setHeader("Content-Type", "application/x-sh");
  res.send("#!/bin/bash\\necho 'Uruchamianie aplikacji konsolowej TermoFix AI...'\\necho 'Inicjalizacja Modułów...'\\nsleep 2\\necho 'Gotowe!'\\n");
});
`;

code = code.replace(/app\.get\("\/api\/download-all-service-tools-exe", \(req, res\) => \{[\s\S]*?\}\);/, "$&\n" + newEndpoints);
fs.writeFileSync(file, code);
