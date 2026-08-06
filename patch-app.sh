sed -i "38i import { DuplicateFileFinderModal } from './components/DuplicateFileFinderModal';" src/App.tsx
sed -i "39i import { SpellCheckerModal } from './components/SpellCheckerModal';" src/App.tsx
sed -i "40i import { MobileSmsAppModal } from './components/MobileSmsAppModal';" src/App.tsx
sed -i "121i \ \ const [isDuplicateFinderOpen, setIsDuplicateFinderOpen] = useState(false);" src/App.tsx
sed -i "122i \ \ const [isSpellCheckerOpen, setIsSpellCheckerOpen] = useState(false);" src/App.tsx
sed -i "123i \ \ const [isMobileSmsAppOpen, setIsMobileSmsAppOpen] = useState(false);" src/App.tsx
