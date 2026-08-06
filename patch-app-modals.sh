# Find the line number of the last </App> or closing tag of the main div
# Actually, it ends with:
#    </div>
#  );
#}
# Let's just insert before the last </div>.
awk '/^    <\/div>/ { 
  print "      <DuplicateFileFinderModal isOpen={isDuplicateFinderOpen} onClose={() => setIsDuplicateFinderOpen(false)} onSendToChat={handleSendToChat} />" 
  print "      <SpellCheckerModal isOpen={isSpellCheckerOpen} onClose={() => setIsSpellCheckerOpen(false)} onSendToChat={handleSendToChat} />" 
  print "      <MobileSmsAppModal isOpen={isMobileSmsAppOpen} onClose={() => setIsMobileSmsAppOpen(false)} onSendToChat={handleSendToChat} />" 
} 1' src/App.tsx > src/App.tsx.tmp && mv src/App.tsx.tmp src/App.tsx
