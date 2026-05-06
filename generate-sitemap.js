const fs = require('fs');
const path = require('path');

// Change this to your actual domain
const BASE_URL = 'https://files.triggy.xyz/'; 

const IGNORE_FILES = ['.git', '.github', 'node_modules', 'generate-sitemap.js', 'package.json', 'sitemap.html', '.gitignore'];
const IGNORE_FOLDERS = ['unlisted', '.github', '.git'];

function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const relativePath = path.relative('.', filePath);

        if (IGNORE_FILES.includes(file) || IGNORE_FOLDERS.includes(file)) return;

        if (fs.statSync(filePath).isDirectory()) {
            getFiles(filePath, fileList);
        } else {
            fileList.push(relativePath.replace(/\\/g, '/'));
        }
    });
    return fileList;
}

const allFiles = getFiles('.');
const listItems = allFiles.map(file => {
    return `<li><a href="${BASE_URL}${file}">${file}</a></li>`;
}).join('\n      ');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Index</title>
    <style>
        body { font-family: sans-serif; padding: 2rem; line-height: 1.6; }
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 0.5rem; }
        a { color: #0366d6; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Shared Files</h1>
    <ul>
      ${listItems}
    </ul>
</body>
</html>`;

fs.writeFileSync('index.html', html);
console.log('Sitemap generated successfully in index.html');