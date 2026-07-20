import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (err) => { console.log("JSDOM CONSOLE ERROR:", err); });
virtualConsole.on("log", (log) => { console.log("JSDOM CONSOLE LOG:", log); });
virtualConsole.on("jsdomError", (err) => { console.log("JSDOM ERROR:", err); });

const htmlPath = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const jsFileMatch = html.match(/<script type="module" crossorigin src="\/assets\/(index-[^"]+\.js)"><\/script>/);
if (jsFileMatch) {
  const jsFile = jsFileMatch[1];
  const jsContent = fs.readFileSync(path.join(__dirname, 'dist', 'assets', jsFile), 'utf8');
  
  // Use split/join to avoid regex replace issues with $&
  html = html.split(jsFileMatch[0]).join(`<script defer>${jsContent}</script>`);
}

const dom = new JSDOM(html, {
  url: "http://localhost/",
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
});

dom.window.addEventListener('error', (event) => {
  console.log("DOM Window Error:", event.error);
});
dom.window.addEventListener('unhandledrejection', (event) => {
  console.log("DOM Promise Rejection:", event.reason);
});

setTimeout(() => {
  console.log("App mounted? Body HTML:", dom.window.document.body.innerHTML.substring(0, 500));
  process.exit(0);
}, 3000);
