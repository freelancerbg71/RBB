const fs = require('fs');
const path = require('path');
const dirs = ['src/content', 'src/pages', 'src/layouts', 'src/components', 'src/config', 'src/styles'];
const exts = new Set(['.md', '.mdx', '.astro', '.ts', '.tsx', '.js', '.cjs', '.mjs', '.css', '.json', '.yml', '.yaml']);

function fix(dir) {
    const abs = path.join(process.cwd(), dir);
    if (!fs.existsSync(abs)) return;
    const stack = [abs];
    while (stack.length) {
        const cur = stack.pop();
        const entries = fs.readdirSync(cur, { withFileTypes: true });
        for (const e of entries) {
            if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.astro' || e.name === '.git') continue;
            const full = path.join(cur, e.name);
            if (e.isDirectory()) stack.push(full);
            else if (e.isFile() && exts.has(path.extname(full).toLowerCase())) {
                let text = fs.readFileSync(full, 'utf8');
                let original = text;

                text = text.replace(/[\u2018\u2019]/g, "'");
                text = text.replace(/[\u201C\u201D]/g, '"');
                text = text.replace(/[\u2013\u2014]/g, '-');
                text = text.replace(/\u2026/g, '...');

                // Remove known emojis that broke the guard
                text = text.replace(/⚠️/g, '!');
                text = text.replace(/💡/g, 'i');
                text = text.replace(/📓/g, '>');

                if (text !== original) {
                    fs.writeFileSync(full, text, 'utf8');
                    console.log('Fixed', full);
                }
            }
        }
    }
}

dirs.forEach(fix);
