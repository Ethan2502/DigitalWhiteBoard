const fs = require('fs');
let code = fs.readFileSync('/Users/ethan/Documents/DigitalWhiteBoard/src/components/TextBox.tsx', 'utf8');

code = code.replace(/<math-field([\s\S]*?)ref=\{mfRef\}/, '<math-field$1ref={mfRef} smart-mode="true"');
code = code.replace(/pointerEvents: 'auto',[\s\S]*?cursor: 'text',/m, "pointerEvents: 'auto',\n                    cursor: 'text',\n                    textAlign: 'center',");

fs.writeFileSync('/Users/ethan/Documents/DigitalWhiteBoard/src/components/TextBox.tsx', code);
