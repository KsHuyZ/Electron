import puppeteer from 'puppeteer';
import electron from 'electron';

async function createPreview(htmlString, outputPath) {
  const browser = await puppeteer.launch({
    executablePath: electron.toString(),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(htmlString);
  await page.pdf({ path: outputPath, format: 'A4' });

  await browser.close();
}

export default createPreview;
