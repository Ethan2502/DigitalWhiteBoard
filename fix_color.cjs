const fs = require('fs');
let code = fs.readFileSync('/Users/ethan/Documents/DigitalWhiteBoard/src/components/TextBox.tsx', 'utf8');

code = code.replace(/color: inherit/g, ""); // clear if exists
code = code.replace(/textAlign: 'center',/, "textAlign: 'center',\n                    color: 'inherit',");

fs.writeFileSync('/Users/ethan/Documents/DigitalWhiteBoard/src/components/TextBox.tsx', code);
