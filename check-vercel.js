import { JSDOM, VirtualConsole } from 'jsdom';

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (err) => { console.log("JSDOM CONSOLE ERROR:", err); });
virtualConsole.on("log", (log) => { console.log("JSDOM CONSOLE LOG:", log); });
virtualConsole.on("jsdomError", (err) => { console.log("JSDOM ERROR:", err); });

async function check() {
  let html = await fetch("https://robermetrics.vercel.app/").then(r => r.text());
  
  const jsMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
  if (jsMatch) {
    const jsUrl = "https://robermetrics.vercel.app" + jsMatch[1];
    const jsContent = await fetch(jsUrl).then(r => r.text());
    
    // Remove original script
    html = html.replace(jsMatch[0], '');
    
    // Inject at the very end of body so #root exists
    html = html.replace('</body>', `<script>${jsContent}</script></body>`);
  }

  const dom = new JSDOM(html, {
    url: "https://robermetrics.vercel.app/",
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
}
check();
