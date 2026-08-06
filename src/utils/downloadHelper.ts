export function downloadFileFromApi(url: string, fallbackFilename?: string) {
  try {
    // Open directly in a new tab to bypass iframe sandbox download restrictions
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      // Fallback if popup blocker prevented new tab
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (error) {
    console.error('Błąd pobierania pliku:', error);
    window.location.href = url;
  }
}

