const fs = require('fs');
let code = fs.readFileSync('/Users/ethan/Documents/DigitalWhiteBoard/src/index.css', 'utf8');

code = code.replace(/\.chem-unit \{/, '.chem-unit, .chem-unit * {');

fs.writeFileSync('/Users/ethan/Documents/DigitalWhiteBoard/src/index.css', code);
