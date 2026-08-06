const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

const isoLogic = `app.get("/api/download-windows-iso", (req, res) => {
  const edition = req.query.edition;
  
  if (edition === 'mini_pe_bga' || edition === 'win11_pro' || edition === 'win10_lts_repair') {
    // Generate a dummy ISO file
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="TermoFix_' + edition + '.iso"');
    // We're just sending a small dummy text payload acting as ISO for demo purposes
    res.send("DUMMY ISO IMAGE CONTENT FOR " + edition + ". (In a real app, this would stream the actual compiled .ISO file, usually multiple GBs in size. Generated via cloud builder.)");
  } else {
    res.redirect('https://www.microsoft.com/software-download/windows11');
  }
});`;

code = code.replace(/app\.get\("\/api\/download-windows-iso", \(req, res\) => \{[\s\S]*?\}\);/, isoLogic);

fs.writeFileSync(file, code);
