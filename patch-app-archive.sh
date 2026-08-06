sed -i "41i import { BatchArchiveExtractorModal } from './components/BatchArchiveExtractorModal';" src/App.tsx
sed -i "124i \ \ const [isBatchArchiveOpen, setIsBatchArchiveOpen] = useState(false);" src/App.tsx

awk '/<DuplicateFileFinderModal/ { 
  print "      <BatchArchiveExtractorModal isOpen={isBatchArchiveOpen} onClose={() => setIsBatchArchiveOpen(false)} onSendToChat={handleSendMessage} />" 
} 1' src/App.tsx > src/App.tsx.tmp && mv src/App.tsx.tmp src/App.tsx
