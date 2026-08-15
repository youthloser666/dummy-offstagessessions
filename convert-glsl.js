const fs = require('fs');
const path = require('path');
const glslDir = path.join('components', 'react-fluid-distortion', 'glsl');

fs.readdirSync(glslDir).forEach(f => {
  if (f.endsWith('.frag') || f.endsWith('.glsl')) {
    const content = fs.readFileSync(path.join(glslDir, f), 'utf-8');
    const newContent = "export default `" + content.replace(/`/g, '\\`') + "`;";
    fs.writeFileSync(path.join(glslDir, f.replace('.frag', '.ts').replace('.glsl', '.ts')), newContent);
    fs.unlinkSync(path.join(glslDir, f));
  }
});
