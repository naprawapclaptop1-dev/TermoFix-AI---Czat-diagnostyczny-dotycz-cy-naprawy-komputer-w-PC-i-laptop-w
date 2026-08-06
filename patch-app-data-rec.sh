sed -i "42i import { DataRecoveryModal } from './components/DataRecoveryModal';" src/App.tsx
sed -i "124i \ \ const [isDataRecoveryOpen, setIsDataRecoveryOpen] = useState(false);" src/App.tsx

awk '/<BatchArchiveExtractorModal/ { 
  print "      <DataRecoveryModal isOpen={isDataRecoveryOpen} onClose={() => setIsDataRecoveryOpen(false)} onSendToChat={handleSendMessage} />" 
} 1' src/App.tsx > src/App.tsx.tmp && mv src/App.tsx.tmp src/App.tsx
