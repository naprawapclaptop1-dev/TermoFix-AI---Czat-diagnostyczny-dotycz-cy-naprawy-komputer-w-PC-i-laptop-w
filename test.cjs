const { execSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const os = require("os");

function compileBatToExe(batContent, is64Bit = true) {
  const tmpId = crypto.randomBytes(8).toString('hex');
  const cFile = path.join(os.tmpdir(), `launcher_${tmpId}.c`);
  const exeFile = path.join(os.tmpdir(), `launcher_${tmpId}.exe`);
  
  const escapedBat = batContent.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '');
  
  const cSource = `
#include <stdlib.h>
#include <stdio.h>
#include <windows.h>
int main() {
    char tempPath[MAX_PATH];
    GetTempPathA(MAX_PATH, tempPath);
    strcat(tempPath, "tf_${tmpId}.cmd");
    FILE *f = fopen(tempPath, "w");
    if (f) {
        fprintf(f, "%s", "${escapedBat}");
        fclose(f);
        system(tempPath);
        remove(tempPath);
    }
    return 0;
}
`;
  fs.writeFileSync(cFile, cSource);
  const compiler = is64Bit ? 'x86_64-w64-mingw32-gcc' : 'i686-w64-mingw32-gcc';
  
  try {
    execSync(`${compiler} "${cFile}" -o "${exeFile}"`);
    return fs.readFileSync(exeFile);
  } finally {
    if (fs.existsSync(cFile)) fs.unlinkSync(cFile);
    if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile);
  }
}

try {
  const buf = compileBatToExe("@echo off\necho Hello World\npause", true);
  console.log("Success! Buffer size: ", buf.length);
} catch(e) {
  console.error("Failed:", e);
}
