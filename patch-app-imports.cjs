const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const iconsImport = `import {
  Wand2, Key, Archive, Smartphone, Search, Cpu, Flame, Wrench, Terminal, HardDrive, Database, Notebook, ShieldCheck, ShieldAlert, Printer, Clock, Gauge, Download, Cloud, KeyRound, ShoppingBag, Scan, RefreshCw, Tv, Radio, Layers, Server, Globe, Disc, Monitor, Usb, Power, Unlock, PlayCircle, PenTool
} from 'lucide-react';\n`;

content = content.replace(/import React, { useState } from 'react';/, `import React, { useState } from 'react';\n${iconsImport}`);
fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log("App.tsx imports patched");
