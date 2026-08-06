const { execSync } = require('child_process');
console.log("===============================================================================");
console.log("   TERMOPC AI - URUCHAMIANIE STANOWISKA SERWISOWEGO (.EXE CLIENT)");
console.log("===============================================================================");
console.log("[INFO] Laczenie z serwerem i stacja diagnostyczna BGA...");
try {
  execSync('start "" "https://ais-pre-uwx5jrvr3fkn4elipwm7db-272894691836.europe-west2.run.app"');
} catch (e) {}
console.log("Gotowe! Aplikacja dziala w przegladarce.");
