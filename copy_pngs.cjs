const fs = require('fs');
const path = require('path');

const sourceDir = 'C:\\Users\\freel\\.gemini\\antigravity\\brain\\4652c5b9-868d-4712-bc6b-fc441d42661e';
const targetDir = 'g:\\RBB\\public\\img\\blog';

const files = fs.readdirSync(sourceDir);

files.forEach(file => {
    if (file.endsWith('.png') && file.startsWith('thumb_')) {
        const match = file.match(/^(thumb_[a-z_]+)_\d+\.png$/);
        if (match) {
            let baseName = match[1].replace(/_/g, '-');
            const destPath = path.join(targetDir, `${baseName}.png`);
            fs.copyFileSync(path.join(sourceDir, file), destPath);
            console.log(`Copied ${file} to ${baseName}.png`);
        }
    }
});
