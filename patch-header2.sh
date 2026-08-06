awk '/\/\* Duplicate File Finder Button \*\// { 
  print "          {/* Batch Archive Extractor Button */}"
  print "          {onOpenBatchArchiveExtractor && ("
  print "            <button"
  print "              onClick={onOpenBatchArchiveExtractor}"
  print "              className=\"flex items-center space-x-1 bg-indigo-900/40 hover:bg-indigo-800/50 text-indigo-300 text-xs px-2.5 py-1.5 rounded-lg border border-indigo-500/30 transition font-medium shrink-0\""
  print "              title=\"Rozpakuj wiele archiwów (ZIP/RAR)\""
  print "            >"
  print "              <Archive className=\"w-3.5 h-3.5 text-indigo-400\" />"
  print "              <span className=\"hidden lg:inline\">Multi-Wypakuj</span>"
  print "            </button>"
  print "          )}"
} 1' src/components/Header.tsx > src/components/Header.tsx.tmp && mv src/components/Header.tsx.tmp src/components/Header.tsx
