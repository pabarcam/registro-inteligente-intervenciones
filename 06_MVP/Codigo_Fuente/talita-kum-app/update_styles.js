const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));

files.forEach(file => {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace stark black borders
  content = content.replace(/border: 2px solid var\(--negro\);/g, 'border: 1px solid rgba(0,0,0,0.06);');
  content = content.replace(/border: 2px solid #111;/g, 'border: 1px solid rgba(0,0,0,0.06);');
  content = content.replace(/border: 1px solid #111;/g, 'border: 1px solid rgba(0,0,0,0.06);');
  
  // Nav border
  content = content.replace(/border-bottom: 2px solid var\(--negro\);/g, 'border-bottom: 1px solid rgba(0,0,0,0.06); box-shadow: 0 4px 16px rgba(0,0,0,0.03);');
  
  // Section titles
  content = content.replace(/border-bottom: 2px solid var\(--negro\);/g, 'border-bottom: 1px solid rgba(0,0,0,0.06);');

  // Card shadows
  content = content.replace(/box-shadow: 4px 4px 0 var\(--negro\);/g, 'box-shadow: 0 10px 24px rgba(0,0,0,0.06);');
  content = content.replace(/box-shadow: 0 16px 35px rgba\(0,0,0,\.08\);/g, 'box-shadow: 0 16px 40px rgba(0,0,0,0.06);');

  // Outline buttons
  content = content.replace(/\.btn-outline { background: var\(--blanco\); color: var\(--negro\); border-color: var\(--negro\); }/g, '.btn-outline { background: transparent; color: #555; border: 1px solid rgba(0,0,0,0.15); }');
  content = content.replace(/\.btn-outline:hover { background: var\(--negro\); color: var\(--blanco\); }/g, '.btn-outline:hover { background: rgba(0,0,0,0.03); color: var(--negro); border-color: rgba(0,0,0,0.3); }');

  // Outline buttons (dark)
  content = content.replace(/\.btn-outline-dark/g, 'btn-outline'); // Will use the general btn-outline if bootstrap or custom

  fs.writeFileSync(filePath, content);
});

console.log('Styles updated in all views.');
