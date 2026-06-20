const fs = require('fs');
const path = require('path');

// 1. Update index.css
const cssPath = path.join('frontend', 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(':root {', `:root {
    --text-glow-emerald: 0 0 8px rgba(16,185,129,0.5);
    --icon-glow-subtle: 0 0 15px rgba(0,242,254,0.1);
    --icon-glow: 0 0 15px rgba(0,242,254,0.2);
    --icon-glow-strong: 0 0 15px rgba(0,242,254,0.3);
    --button-glow: 0 0 20px rgba(0,242,254,0.3);
    --badge-glow-emerald: 0 0 10px rgba(16,185,129,0.2);
    --badge-glow-rose: 0 0 10px rgba(244,63,94,0.2);
    --badge-glow-amber: 0 0 10px rgba(245,158,11,0.2);
    --bar-glow-amber: 0 0 10px rgba(192,132,252,0.8);
    --button-glow-amber: 0 0 15px rgba(192,132,252,0.4);
    --modal-shadow: 0 20px 50px rgba(0,0,0,0.5);
    --glass-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
    --glass-shadow-hover: 0 8px 40px rgba(16, 185, 129, 0.1);
    --skeleton-bg: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
    --scrollbar-track: transparent;
    --scrollbar-thumb: rgba(255, 255, 255, 0.1);
    --scrollbar-thumb-hover: rgba(255, 255, 255, 0.2);
`);

css = css.replace(':root.light {', `:root.light {
    --text-glow-emerald: none;
    --icon-glow-subtle: 0 4px 15px rgba(148, 163, 184, 0.2);
    --icon-glow: 0 6px 20px rgba(148, 163, 184, 0.25);
    --icon-glow-strong: 0 8px 25px rgba(148, 163, 184, 0.3);
    --button-glow: 0 8px 25px rgba(16, 185, 129, 0.35);
    --badge-glow-emerald: 0 2px 8px rgba(16, 185, 129, 0.15);
    --badge-glow-rose: 0 2px 8px rgba(244, 63, 94, 0.15);
    --badge-glow-amber: 0 2px 8px rgba(245, 158, 11, 0.15);
    --bar-glow-amber: none;
    --button-glow-amber: 0 8px 20px rgba(245, 158, 11, 0.3);
    --modal-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    --glass-shadow: 0 10px 40px rgba(148, 163, 184, 0.15);
    --glass-shadow-hover: 0 15px 50px rgba(16, 185, 129, 0.15);
    --skeleton-bg: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%);
    --scrollbar-track: rgba(0,0,0,0.02);
    --scrollbar-thumb: rgba(0, 0, 0, 0.15);
    --scrollbar-thumb-hover: rgba(0, 0, 0, 0.25);
`);

// Fix glass panels in CSS
css = css.replace(/box-shadow: 0 4px 30px rgba\(0, 0, 0, 0\.3\);/g, 'box-shadow: var(--glass-shadow);');
css = css.replace(/box-shadow: 0 8px 40px rgba\(16, 185, 129, 0\.1\);/g, 'box-shadow: var(--glass-shadow-hover);');
css = css.replace(/background: linear-gradient\(90deg, rgba\(255,255,255,0\.03\) 25%, rgba\(255,255,255,0\.08\) 50%, rgba\(255,255,255,0\.03\) 75%\);/g, 'background: var(--skeleton-bg);');
css = css.replace(/background: transparent;/g, 'background: var(--scrollbar-track);');
css = css.replace(/background: rgba\(255, 255, 255, 0\.1\);/g, 'background: var(--scrollbar-thumb);');
css = css.replace(/background: rgba\(255, 255, 255, 0\.2\);/g, 'background: var(--scrollbar-thumb-hover);');

fs.writeFileSync(cssPath, css);

// 2. Replace hardcoded classes in all JSX
const dir = path.join('frontend', 'src');
function walk(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/drop-shadow-\[0_0_8px_rgba\(16,185,129,0\.5\)\]/g, 'drop-shadow-[var(--text-glow-emerald)]');
      content = content.replace(/shadow-\[0_0_15px_rgba\(0,242,254,0\.1\)\]/g, 'shadow-[var(--icon-glow-subtle)]');
      content = content.replace(/shadow-\[0_0_15px_rgba\(0,242,254,0\.2\)\]/g, 'shadow-[var(--icon-glow)]');
      content = content.replace(/shadow-\[0_0_15px_rgba\(0,242,254,0\.3\)\]/g, 'shadow-[var(--icon-glow-strong)]');
      content = content.replace(/shadow-\[0_0_20px_rgba\(0,242,254,0\.3\)\]/g, 'shadow-[var(--button-glow)]');
      
      content = content.replace(/shadow-\[0_0_10px_rgba\(16,185,129,0\.[12]\)\]/g, 'shadow-[var(--badge-glow-emerald)]');
      content = content.replace(/shadow-\[0_0_8px_rgba\(16,185,129,0\.8\)\]/g, 'shadow-[var(--badge-glow-emerald)]');
      content = content.replace(/shadow-\[0_0_8px_\#10B981\]/g, 'shadow-[var(--badge-glow-emerald)]');
      
      content = content.replace(/shadow-\[0_0_10px_rgba\(244,63,94,0\.[28]\)\]/g, 'shadow-[var(--badge-glow-rose)]');
      content = content.replace(/shadow-\[0_0_8px_rgba\(244,63,94,0\.8\)\]/g, 'shadow-[var(--badge-glow-rose)]');
      
      content = content.replace(/shadow-\[0_0_10px_rgba\(245,158,11,0\.1\)\]/g, 'shadow-[var(--badge-glow-amber)]');
      content = content.replace(/shadow-\[0_0_10px_rgba\(192,132,252,0\.8\)\]/g, 'shadow-[var(--bar-glow-amber)]');
      content = content.replace(/shadow-\[0_0_15px_rgba\(192,132,252,0\.4\)\]/g, 'shadow-[var(--button-glow-amber)]');
      
      content = content.replace(/shadow-\[0_20px_50px_rgba\(0,0,0,0\.5\)\]/g, 'shadow-[var(--modal-shadow)]');
      content = content.replace(/shadow-\[0_0_20px_rgba\(16,185,129,0\.3\)\]/g, 'shadow-[var(--button-glow)]');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}
walk(dir);
console.log('UI Overhaul Completed');
