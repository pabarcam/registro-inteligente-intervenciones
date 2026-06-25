const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));

files.forEach(file => {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace Google Fonts link
  content = content.replace(
    /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter:[^"]+" rel="stylesheet">/g,
    '<link href="https://fonts.googleapis.com/css2?family=Merriweather+Sans:wght@300;400;500;600;700&family=Merriweather:wght@400;700;900&display=swap" rel="stylesheet">'
  );

  // Replace font-family in body
  content = content.replace(
    /font-family:\s*'Inter',\s*sans-serif;/g,
    "font-family: 'Merriweather Sans', sans-serif;"
  );

  // Inject headings font rule if not present
  if (!content.includes("font-family: 'Merriweather', serif;")) {
    content = content.replace(
      /body\s*{\s*font-family:\s*'Merriweather Sans',\s*sans-serif;/g,
      "h1, h2, h3, h4, .nav-brand { font-family: 'Merriweather', serif; }\n\n    body {\n      font-family: 'Merriweather Sans', sans-serif;"
    );
  }

  fs.writeFileSync(filePath, content);
});

console.log('Fonts updated successfully.');
