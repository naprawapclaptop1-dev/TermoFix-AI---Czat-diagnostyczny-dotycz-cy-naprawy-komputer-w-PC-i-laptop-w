sed -i '55i \  onOpenBitLockerBreaker?: () => void;' src/components/Header.tsx
sed -i '103i \  onOpenBitLockerBreaker,' src/components/Header.tsx
sed -i '4i \  Key,' src/components/Header.tsx

awk '/\/\* Data Recovery Button \*\// { 
  print "          {/* BitLocker Breaker Button */}"
  print "          {onOpenBitLockerBreaker && ("
  print "            <button"
  print "              onClick={onOpenBitLockerBreaker}"
  print "              className=\"flex items-center space-x-1 bg-red-900/40 hover:bg-red-800/50 text-red-300 text-xs px-2.5 py-1.5 rounded-lg border border-red-500/30 transition font-medium shrink-0\""
  print "              title=\"Złamanie Hasła BitLocker / Odzyskiwanie z USB\""
  print "            >"
  print "              <Key className=\"w-3.5 h-3.5 text-red-400\" />"
  print "              <span className=\"hidden lg:inline\">BitLocker Cracker</span>"
  print "            </button>"
  print "          )}"
} 1' src/components/Header.tsx > src/components/Header.tsx.tmp && mv src/components/Header.tsx.tmp src/components/Header.tsx
