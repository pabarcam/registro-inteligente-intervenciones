const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));

files.forEach(file => {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Input styles modernization
  content = content.replace(/border: 2px solid var\(--negro\);/g, 'border: 1px solid rgba(0,0,0,0.1);');
  content = content.replace(/border: 2px solid #111;/g, 'border: 1px solid rgba(0,0,0,0.1);');
  content = content.replace(/border: 1px solid #111;/g, 'border: 1px solid rgba(0,0,0,0.1);');
  
  content = content.replace(/background: var\(--gris\);/g, 'background: #fdfdfd;');
  content = content.replace(/background: #f9f6f2;/g, 'background: #fdfdfd;');

  content = content.replace(/outline: none;\n\s*border-color: var\(--naranja\);/g, 'outline: none;\n      border-color: var(--naranja);\n      box-shadow: 0 0 0 4px rgba(255, 111, 0, 0.1);');
  
  // Specific fix for inputs and textareas
  content = content.replace(/input\[type="text"\], input\[type="date"\], textarea/g, 'input[type="text"], input[type="date"], input[type="email"], input[type="password"], textarea');
  
  fs.writeFileSync(filePath, content);
});

console.log('Inputs updated.');
