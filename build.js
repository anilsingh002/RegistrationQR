const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist' && entry.name !== 'build' && entry.name !== '.vercel') {
        copyDir(srcPath, destPath);
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

['dist', 'build'].forEach(dir => {
  const targetDir = path.join(__dirname, dir);
  fs.mkdirSync(targetDir, { recursive: true });
  
  if (fs.existsSync(path.join(__dirname, 'index.html'))) {
    fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(targetDir, 'index.html'));
  }
  if (fs.existsSync(path.join(__dirname, 'styles.css'))) {
    fs.copyFileSync(path.join(__dirname, 'styles.css'), path.join(targetDir, 'styles.css'));
  }
  if (fs.existsSync(path.join(__dirname, 'js'))) {
    copyDir(path.join(__dirname, 'js'), path.join(targetDir, 'js'));
  }
});

console.log('Static site build succeeded: output generated in dist/ and build/');
