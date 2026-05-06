const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://files.triggy.xyz/'; 
const IGNORE_FILES = ['generate-sitemap.js', 'package.json', 'index.html', 'README.md', 'favicon.ico'];
const IGNORE_FOLDERS = ['unlisted', 'node_modules'];

// Helper to assign Material Icons based on file extension
function getFileIcon(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    const iconMap = {
        // Images
        '.png': 'image', '.jpg': 'image', '.jpeg': 'image', '.gif': 'image', '.svg': 'image', '.webp': 'image',
        // Documents
        '.pdf': 'picture_as_pdf', '.docx': 'description', '.doc': 'description', '.txt': 'article', '.csv': 'table_chart',
        // Audio
        '.mp3': 'audio_file', '.wav': 'audio_file', '.ogg': 'audio_file', '.m4a': 'audio_file',
        // Video
        '.mp4': 'video_file', '.mov': 'video_file', '.avi': 'video_file', '.mkv': 'video_file',
        // Archives
        '.zip': 'folder_zip', '.rar': 'folder_zip', '.7z': 'folder_zip'
    };

    return iconMap[ext] || 'insert_drive_file'; // Default icon
}

function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const relativePath = path.relative('.', filePath);

        if (file.startsWith('.') || IGNORE_FILES.includes(file) || IGNORE_FOLDERS.includes(file)) return;

        if (fs.statSync(filePath).isDirectory()) {
            getFiles(filePath, fileList);
        } else {
            fileList.push(relativePath.replace(/\\/g, '/'));
        }
    });
    return fileList;
}

const allFiles = getFiles('.');

const structure = {};
allFiles.forEach(file => {
    const parts = file.split('/');
    if (parts.length > 1) {
        const folder = parts[0];
        const fileName = parts.slice(1).join('/');
        if (!structure[folder]) structure[folder] = [];
        structure[folder].push({ 
            name: fileName, 
            url: BASE_URL + file,
            icon: getFileIcon(fileName)
        });
    } else {
        const rootKey = "Files";
        if (!structure[rootKey]) structure[rootKey] = [];
        structure[rootKey].push({ 
            name: file, 
            url: BASE_URL + file,
            icon: getFileIcon(file)
        });
    }
});

let htmlContent = '';
for (const [folder, files] of Object.entries(structure)) {
    htmlContent += `
    <details>
        <summary><span class="material-symbols-outlined folder-icon">folder</span>${folder}</summary>
        <ul>
            ${files.map(f => `
                <li>
                    <span class="material-symbols-outlined file-icon">${f.icon}</span>
                    <a href="${f.url}" target="_blank">${f.name}</a>
                </li>`).join('')}
        </ul>
    </details>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Sharing</title>
    <link rel="icon" type="image/svg+xml" href="${BASE_URL}.icons/files-favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Michroma&family=Inter:wght@400;500&display=swap" rel="stylesheet">
    <!-- Material Symbols Outlined -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
    <style>
        body { font-family: 'Inter', sans-serif; margin: 0; background-color: #f8f9fa; color: #333; }
        .top-bar { 
            background-color: #EA4125; 
            color: white; 
            padding: 1.2rem 2rem; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .top-bar h1 { 
            font-family: 'Michroma', sans-serif; 
            margin: 0; 
            font-size: 1.4rem; 
            letter-spacing: 1px;
        }
        .container { max-width: 900px; margin: 2.5rem auto; padding: 0 1rem; }
        details { 
            background: white; 
            margin-bottom: 0.8rem; 
            border-radius: 10px; 
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            border: 1px solid #eee;
        }
        summary { 
            padding: 1.2rem; 
            font-weight: 600; 
            cursor: pointer; 
            display: flex;
            align-items: center;
            list-style: none;
        }
        summary::-webkit-details-marker { display: none; }
        .folder-icon { color: #EA4125; margin-right: 12px; font-variation-settings: 'FILL' 1; }
        
        details[open] summary { border-bottom: 1px solid #f5f5f5; background: #fafafa; }
        ul { list-style: none; padding: 0.8rem 1.2rem 1.2rem 1.2rem; margin: 0; }
        li { 
            display: flex; 
            align-items: center; 
            padding: 0.6rem 0.8rem;
            transition: background 0.2s;
            border-radius: 6px;
        }
        li:hover { background-color: #fff5f4; }
        .file-icon { 
            color: #EA4125; 
            margin-right: 12px; 
            font-size: 20px;
        }
        a { color: #444; text-decoration: none; font-size: 0.95rem; flex-grow: 1; }
        a:hover { color: #EA4125; text-decoration: underline; }
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