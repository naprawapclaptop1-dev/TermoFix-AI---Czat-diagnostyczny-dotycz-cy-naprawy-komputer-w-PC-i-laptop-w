awk '
/setCurrentSector\(`Sektor:/ {
  print "          if (scanType === \"ciagle\") {"
  print "            setCurrentSector(`AI Neural Node: 0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase()} | Rekonstrukcja wektora danych...`);"
  print "          } else {"
  print "            setCurrentSector(`Sektor: 0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase()}`);"
  print "          }"
  next
}
{ print }
' src/components/DataRecoveryModal.tsx > src/components/DataRecoveryModal.tsx.tmp && mv src/components/DataRecoveryModal.tsx.tmp src/components/DataRecoveryModal.tsx
