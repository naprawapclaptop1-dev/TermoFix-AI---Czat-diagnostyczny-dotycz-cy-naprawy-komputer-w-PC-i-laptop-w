const fs = require('fs');
let code = fs.readFileSync('src/components/GoogleDriveBrowserModal.tsx', 'utf8');

const replacement = `        setDownloadingFileId(null);
        setCompletedDownloads(prev => ({ ...prev, [file.id]: true }));
        setSyncStatusMap(prev => ({ ...prev, [file.id]: 'SYNCED' }));

        if (file.category === 'EXE') {
           // Pobierz prawdziwy plik EXE z serwera, aby nie blokował go Windows SmartScreen
           if (file.id === 'gd-exe-termofix-agent') {
              window.location.href = '/api/download-ai-agent-exe';
           } else {
              window.location.href = '/api/download-exe';
           }
           return;
        }

        // Trigger browser save simulation/file Blob download`;

code = code.replace(/setDownloadingFileId\(null\);\n\s*setCompletedDownloads\(prev => \(\{ \.\.\.prev, \[file\.id\]: true \}\)\);\n\s*setSyncStatusMap\(prev => \(\{ \.\.\.prev, \[file\.id\]: 'SYNCED' \}\)\);\n\n\s*if \(file\.category === 'EXE'\) \{\n\s*\/\/ Pobierz prawdziwy plik EXE z serwera, aby nie blokował go Windows SmartScreen\n\s*window\.location\.href = '\/api\/download-exe';\n\s*return;\n\s*\}\n\n\s*\/\/ Trigger browser save simulation\/file Blob download/g, replacement);

fs.writeFileSync('src/components/GoogleDriveBrowserModal.tsx', code);
