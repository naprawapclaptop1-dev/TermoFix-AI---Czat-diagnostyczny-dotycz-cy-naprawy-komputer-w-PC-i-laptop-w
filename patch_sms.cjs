const fs = require('fs');
const file = 'src/components/MobileSmsAppModal.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldHandleSendEnd = `
    // Success Path: Construct external link & open
    let link = '';
    if (sendMethod === 'sms') {
      link = \`sms:\${cleanNum}?body=\${encodeURIComponent(message)}\`;
    } else if (sendMethod === 'whatsapp') {
      link = \`https://wa.me/\${cleanNum}?text=\${encodeURIComponent(message)}\`;
    } else if (sendMethod === 'googlechat') {
      link = \`https://chat.google.com/\`;
    } else if (sendMethod === 'indeed') {
      link = \`https://www.indeed.com/m/\`;
    }

    setTimeout(() => {
      setGatewayLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? {
                ...log,
                status: 'DELIVERED',
                statusCode: 200,
                latencyMs: 78
              }
            : log
        )
      );

      setIsSending(false);
      setSentSuccess(true);
      try {
        window.open(link, '_blank');
      } catch (e) {
        console.log('Window open executed or blocked');
      }
      
      if (onSendToChat) {
        onSendToChat(\`SYSTEM BRAMKI WIADOMOŚCI: Rozpoczęto wysyłanie na numer \${targetPhone} przez protokół \${sendMethod.toUpperCase()}.\n\nTreść: "\${message}"\`);
      }
    }, 600);
  };`;

const newHandleSendEnd = `
    // Success Path: Construct external link & open
    let link = '';
    if (sendMethod === 'sms') {
      link = \`sms:\${cleanNum}?body=\${encodeURIComponent(message)}\`;
    } else if (sendMethod === 'whatsapp') {
      link = \`https://wa.me/\${cleanNum}?text=\${encodeURIComponent(message)}\`;
    } else if (sendMethod === 'googlechat') {
      link = \`https://chat.google.com/\`;
    } else if (sendMethod === 'indeed') {
      link = \`https://www.indeed.com/m/\`;
    }

    setTimeout(() => {
      setGatewayLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? {
                ...log,
                status: 'DELIVERED',
                statusCode: 200,
                latencyMs: 78
              }
            : log
        )
      );

      setIsSending(false);
      setSentSuccess(true);
      try {
        const a = document.createElement('a');
        a.href = link;
        a.target = '_blank';
        a.click();
      } catch (e) {
        console.log('Window open executed or blocked');
      }
      
      if (onSendToChat) {
        onSendToChat(\`SYSTEM BRAMKI WIADOMOŚCI: Pomyślnie wysłano na numer \${targetPhone} przez protokół \${sendMethod.toUpperCase()}.\n\nTreść: "\${message}"\`);
      }
    }, 600);
  };`;

code = code.replace(/    \/\/ Success Path: Construct external link & open[\s\S]*?    \}, 600\);\n  \};/, newHandleSendEnd);

fs.writeFileSync(file, code);
