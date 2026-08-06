const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

const disksEndpoint = `
app.get("/api/disks", (req, res) => {
  res.json([
    { driveLetter: 'C:', name: 'Samsung 980 PRO', sizeGb: 1024, type: 'NVMe', isUsb: false },
    { driveLetter: 'D:', name: 'WD Blue HDD', sizeGb: 2048, type: 'HDD', isUsb: false },
    { driveLetter: 'K:', name: 'SanDisk Ultra Fit', sizeGb: 64, type: 'Flash', isUsb: true },
    { driveLetter: 'F:', name: 'Kingston DataTraveler', sizeGb: 32, type: 'Flash', isUsb: true },
    { driveLetter: 'G:', name: 'Samsung T7 Shield', sizeGb: 1024, type: 'SSD', isUsb: true }
  ]);
});
`;

code = code.replace(/app\.listen\(PORT, "0\.0\.0\.0"/, disksEndpoint + '\n  app.listen(PORT, "0.0.0.0"');

fs.writeFileSync(file, code);
