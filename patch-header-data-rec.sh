sed -i '54i \  onOpenDataRecovery?: () => void;' src/components/Header.tsx
sed -i '101i \  onOpenDataRecovery,' src/components/Header.tsx

awk '/\/\* Batch Archive Extractor Button \*\// { 
  print "          {/* Data Recovery Button */}"
  print "          {onOpenDataRecovery && ("
  print "            <button"
  print "              onClick={onOpenDataRecovery}"
  print "              className=\"flex items-center space-x-1 bg-amber-900/40 hover:bg-amber-800/50 text-amber-300 text-xs px-2.5 py-1.5 rounded-lg border border-amber-500/30 transition font-medium shrink-0\""
  print "              title=\"Odzyskiwanie Danych (Usunięte / Format)\""
  print "            >"
  print "              <Database className=\"w-3.5 h-3.5 text-amber-400\" />"
  print "              <span className=\"hidden lg:inline\">Odzyskiwanie Danych</span>"
  print "            </button>"
  print "          )}"
} 1' src/components/Header.tsx > src/components/Header.tsx.tmp && mv src/components/Header.tsx.tmp src/components/Header.tsx
