sed -i "43i import { BitLockerBreakerModal } from './components/BitLockerBreakerModal';" src/App.tsx
sed -i "126i \ \ const [isBitLockerOpen, setIsBitLockerOpen] = useState(false);" src/App.tsx

awk '/<DataRecoveryModal/ { 
  print "      <BitLockerBreakerModal isOpen={isBitLockerOpen} onClose={() => setIsBitLockerOpen(false)} onSendToChat={handleSendMessage} />" 
} 1' src/App.tsx > src/App.tsx.tmp && mv src/App.tsx.tmp src/App.tsx
