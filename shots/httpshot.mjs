// Full-page screenshot of a URL served over HTTP, plus the console log.
//   node httpshot.mjs http://localhost:8099/404.html ./out.png [width]
//
// The standalone site's 404 addresses everything root-absolutely — it is
// served in place of whatever URL was requested, so a relative path would
// resolve against the missing one — and under file:// a leading slash means
// the drive root. Only an http target exercises it honestly.
import fs from 'node:fs';
import { withPage } from './cdp.mjs';

const [, , url, out, widthArg] = process.argv;
const width = Number(widthArg) || 1440;

await withPage(url, { width }, async (page) => {
  const fonts = await page.evaluate(
    `[...document.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.status)`,
  );
  console.log(JSON.stringify({
    title: await page.evaluate('document.title'),
    ...await page.diagnose(),
    fonts,
    consoleErrors: page.errors,
  }, null, 1));
  if (out) {
    fs.writeFileSync(out, await page.fullPageShot());
    console.log('wrote', out);
  }
});
