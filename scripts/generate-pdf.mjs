import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import http from 'http';
import path from 'path';

const PORT = 3200 + Math.floor(Math.random() * 800);
const URL = `http://localhost:${PORT}/resume`;
const OUTPUT_PATH = 'public/resume.pdf';
const nextCli = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');

// Helper to wait for server
const waitForServer = (url, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for server at ${url}`));
      }
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          resolve();
        }
      }).on('error', () => {
        // Ignore errors, just keep trying
      });
    }, 500);
  });
};

async function generatePdf() {
  console.log(`[1/5] Starting Next.js server on port ${PORT}...`);
  // Note: assumes `npm run build` was already run.
  const serverProcess = spawn(process.execPath, [nextCli, 'start', '-p', String(PORT)], {
    stdio: 'ignore',
    windowsHide: true,
  });

  try {
    console.log(`[2/5] Waiting for server to be ready at ${URL}...`);
    await waitForServer(URL);
    console.log(`      Server is ready.`);

    console.log(`[3/5] Launching headless browser...`);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    console.log(`[4/5] Navigating to ${URL} and waiting for fonts to load...`);
    await page.goto(URL, { waitUntil: 'networkidle2' });
    
    // Wait for fonts to be ready
    await page.evaluateHandle('document.fonts.ready');

    console.log(`[5/5] Generating PDF to ${OUTPUT_PATH}...`);
    await page.pdf({
      path: OUTPUT_PATH,
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
    });

    console.log(`✅ Success! PDF generated at ${OUTPUT_PATH}`);
    await browser.close();
  } catch (err) {
    console.error('❌ Error generating PDF:', err);
    process.exitCode = 1;
  } finally {
    console.log('Cleaning up server process...');
    serverProcess.kill();
  }
}

generatePdf();
