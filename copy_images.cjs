const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = 'C:\\Users\\freel\\.gemini\\antigravity\\brain\\4652c5b9-868d-4712-bc6b-fc441d42661e';
const targetDir = 'g:\\RBB\\public\\img\\blog';
const inlineTargetDir = 'g:\\RBB\\public\\images\\blog';

if (!fs.existsSync(inlineTargetDir)) {
    fs.mkdirSync(inlineTargetDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir);

files.forEach(file => {
    if (file.endsWith('.png')) {
        const sourcePath = path.join(sourceDir, file);

        if (file.startsWith('thumb_')) {
            const match = file.match(/^(thumb_[a-z_]+)_\d+\.png$/);
            if (match) {
                let baseName = match[1].replace(/_/g, '-');
                const webpPath = path.join(targetDir, `${baseName}.webp`);
                // using npx sharp-cli to convert
                try {
                    execSync(`npx sharp -i "${sourcePath}" -o "${webpPath}"`);
                    console.log(`Converted ${file} to ${baseName}.webp`);
                } catch (e) {
                    console.error(`Failed on ${file}`, e.message);
                }
            }
        } else if (file.startsWith('inline_')) {
            const match = file.match(/^(inline_[a-z_]+)_\d+\.png$/);
            if (match) {
                let baseName = match[1];
                const destPath = path.join(inlineTargetDir, `${baseName}.png`);
                fs.copyFileSync(sourcePath, destPath);
                console.log(`Copied ${file} to ${baseName}.png`);
            }
        }
    }
});
