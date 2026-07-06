const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace('.theme-lavender {', '.theme-lavender {\n  --text-primary: #581c87;\n  --text-secondary: #9333ea;\n  --text-muted: #c084fc;');
css = css.replace('.theme-minty {', '.theme-minty {\n  --text-primary: #064e3b;\n  --text-secondary: #059669;\n  --text-muted: #34d399;');
css = css.replace('.theme-ocean {', '.theme-ocean {\n  --text-primary: #0c4a6e;\n  --text-secondary: #0284c7;\n  --text-muted: #38bdf8;');
css = css.replace('.theme-sunset {', '.theme-sunset {\n  --text-primary: #7c2d12;\n  --text-secondary: #ea580c;\n  --text-muted: #fb923c;');
css = css.replace('.theme-cherry {', '.theme-cherry {\n  --text-primary: #881337;\n  --text-secondary: #e11d48;\n  --text-muted: #fb7185;');

fs.writeFileSync('src/index.css', css);
