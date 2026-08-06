sed -i "s/value=\"glebokie\"/value=\"ciagle\"/g" src/components/DataRecoveryModal.tsx
sed -i "s/scanType === 'glebokie'/scanType === 'ciagle'/g" src/components/DataRecoveryModal.tsx
sed -i "s/Głębokie skanowanie AI/Ciągła Analiza AI (Live Neural Scan)/g" src/components/DataRecoveryModal.tsx
sed -i "s/Odzyskiwanie po formacie (sygnatury plików)/Nieskończone skanowanie i rekonstrukcja danych przez sieć neuronową/g" src/components/DataRecoveryModal.tsx

awk '
/if \(prev >= 100\)/ {
  print "          if (prev >= 100 && scanType !== \"ciagle\") {"
  next
}
/const increment = scanType === .szybkie./ {
  print "          const increment = scanType === \"szybkie\" ? Math.random() * 5 + 1 : (scanType === \"ciagle\" ? (Math.random() * 2) * (prev > 95 ? -5 : 1) : Math.random() * 2 + 0.5);"
  print "          let nextProgress = prev + increment;"
  print "          if (scanType === \"ciagle\") {"
  print "             if (nextProgress > 99) nextProgress = Math.random() * 50 + 20; // reset to simulate continuous neural loop"
  print "          }"
  next
}
/return Math.min\(prev \+ increment, 100\);/ {
  print "          return scanType === \"ciagle\" ? nextProgress : Math.min(nextProgress, 100);"
  next
}
/progress === 100 && foundFiles.length > 0/ {
  print "              {(progress === 100 || scanType === \"ciagle\") && foundFiles.length > 0 && ("
  next
}
{ print }
' src/components/DataRecoveryModal.tsx > src/components/DataRecoveryModal.tsx.tmp && mv src/components/DataRecoveryModal.tsx.tmp src/components/DataRecoveryModal.tsx
