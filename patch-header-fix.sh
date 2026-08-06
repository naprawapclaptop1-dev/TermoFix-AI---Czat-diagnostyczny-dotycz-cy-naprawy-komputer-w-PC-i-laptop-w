sed -i 's/import {/import {\n  Lock,/g' src/components/Header.tsx
sed -i 's/Lock,/Lock,\n  Unlock,/g' src/components/Header.tsx
