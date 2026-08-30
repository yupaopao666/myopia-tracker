import fs from 'node:fs';
import assert from 'node:assert/strict';

const app = fs.readFileSync(new URL('./app.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

assert.match(app, /let saveMode\s*=\s*["']individual["']/);
assert.match(app, /function calculateAndShowAverage\s*\(/);
assert.match(app, /saveMode\s*=\s*["']average["']/);
assert.match(app, /function resolveMeasurementTimes\s*\(/);
assert.match(app, /type:\s*["']average["']/);
assert.match(app, /type:\s*["']individual["']/);
assert.match(app, /borderColor:\s*["']#4f9bb5["']/i);
assert.match(app, /borderColor:\s*["']#8a55cc["']/i);

assert.ok(!html.includes('tesseract.min.js'), 'OCR dependency should be removed');
assert.ok(html.includes('id="calculateButton"'));
assert.ok(html.includes('id="saveRecordButton"'));
assert.ok(html.includes('trend-chart-container'));

assert.match(css, /--lavender:/);
assert.match(css, /--blue:/);
assert.match(css, /\.tab\[data-tab="trends"\]/);
assert.match(css, /\.average-box\s*\{/);
assert.match(css, /max-width:\s*760px/);
assert.match(css, /#jsonInput[\s\S]*width:\s*100%/);

console.log('behavior-test: ok');
