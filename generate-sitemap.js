const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://files.triggy.xyz/'; 
const IGNORE_FILES = ['generate-sitemap.js', 'package.json', 'index.html', 'README.md'];
const IGNORE_FOLDERS = ['unlisted', 'node_modules'];

function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const relativePath = path.relative('.', filePath);

        // Allow .icons but ignore other hidden files/folders
        if (file.startsWith('.') && file !== '.icons') return;
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

// Logic to group files by folder for the UI
const structure = {};
allFiles.forEach(file => {
    const parts = file.split('/');
    if (parts.length > 1) {
        const folder = parts[0];
        const fileName = parts.slice(1).join('/');
        if (!structure[folder]) structure[folder] = [];
        structure[folder].push({ name: fileName, url: BASE_URL + file });
    } else {
        if (!structure["Root"]) structure["Root"] = [];
        structure["Root"].push({ name: file, url: BASE_URL + file });
    }
});

let htmlContent = '';
for (const [folder, files] of Object.entries(structure)) {
    htmlContent += `
    <details>
        <summary>${folder}</summary>
        <ul>
            ${files.map(f => `<li><a href="${f.url}" target="_blank">${f.name}</a></li>`).join('')}
        </ul>
    </details>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Sharing</title>
    <!-- Favicon Link -->
    <link rel="icon" type="image/svg+xml" href="${BASE_URL}.icons/files-favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Michroma&family=Inter:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; margin: 0; background-color: #f8f9fa; color: #333; }
        .top-bar { 
            background-color: #EA4125; 
            color: white; 
            padding: 1rem 2rem; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .top-bar h1 { 
            font-family: 'Michroma', sans-serif; 
            margin: 0; 
            font-size: 1.5rem; 
            letter-spacing: 1px;
        }
        .container { max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
        details { 
            background: white; 
            margin-bottom: 1rem; 
            border-radius: 8px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        summary { 
            padding: 1rem; 
            font-weight: 500; 
            cursor: pointer; 
            background: #fff;
            list-style: none;
            display: flex;
            align-items: center;
        }
        summary::-webkit-details-marker { display: none; }
        summary::before {
            content: '📁';
            margin-right: 12px;
        }
        details[open] summary { border-bottom: 1px solid #eee; background: #fafafa; }
        ul { list-style: none; padding: 0.5rem 1rem 1rem 3.5rem; margin: 0; }
        li { padding: 0.4rem 0; border-bottom: 1px solid #f1f1f1; }
        li:last-child { border-bottom: none; }
        a { color: #EA4125; text-decoration: none; font-size: 0.95rem; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="top-bar">
        <h1>File Sharing</h1>
    </div>
    <div class="container">
        ${htmlContent}
    </div>
</body>
</html>`;

fs.writeFileSync('index.html', html);