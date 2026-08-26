// Drive the contact form the way a visitor does and photograph what it says.
// A screenshot of a form at rest proves nothing about the half of it that only
// exists after someone gets it wrong.
//   node formcheck.mjs [width]
import fs from 'node:fs';
import { withPage } from './cdp.mjs';

const width = Number(process.argv[2]) || 1440;

await withPage('../site/contact-us/index.html', { width, height: 1000 }, async (page) => {
  await page.evaluate(`document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))`);

  // 1. at rest, scrolled to the form
  await page.evaluate(`document.querySelector('.contact-form').scrollIntoView({block:'start'})`);
  await new Promise((r) => setTimeout(r, 500));
  fs.writeFileSync('./fc-rest.png', await page.screenshot());

  // 2. submit it empty — three required fields should refuse
  const empty = await page.evaluate(`(() => {
    const f = document.querySelector('.contact-form');
    f.requestSubmit();
    const bad = [...f.querySelectorAll('.fld.bad')].map((fl) => ({
      id: fl.querySelector('input,textarea').id,
      invalid: fl.querySelector('input,textarea').getAttribute('aria-invalid'),
      says: fl.querySelector('.fld-err').textContent,
    }));
    return JSON.stringify({
      bad, note: f.querySelector('.form-note').textContent,
      focused: document.activeElement.id,
    });
  })()`);
  console.log('EMPTY SUBMIT', JSON.parse(empty));
  await new Promise((r) => setTimeout(r, 400));
  fs.writeFileSync('./fc-errors.png', await page.screenshot());

  // 3. a malformed email, validated on blur rather than per keystroke
  const typed = await page.evaluate(`(() => {
    const e = document.getElementById('cf-email');
    e.value = 'someone@';
    e.dispatchEvent(new Event('input', {bubbles:true}));
    const during = document.querySelector('[for="cf-email"]').parentElement
      .querySelector('.fld-err').textContent;
    e.dispatchEvent(new FocusEvent('blur'));
    const after = document.querySelector('[for="cf-email"]').parentElement
      .querySelector('.fld-err').textContent;
    return JSON.stringify({ during, after });
  })()`);
  console.log('EMAIL', JSON.parse(typed));

  // 4. fill it properly — every error should clear and the notice take over
  const good = await page.evaluate(`(() => {
    const f = document.querySelector('.contact-form');
    const set = (id, v) => { const el = document.getElementById(id); el.value = v;
      el.dispatchEvent(new Event('input', {bubbles:true})); };
    set('cf-name', 'Dana Reyes');
    set('cf-email', 'dana@example.com');
    set('cf-message', 'Slab-up casita in Gilbert, about 700 sq ft, hoping to start in spring.');
    f.requestSubmit();
    return JSON.stringify({
      stillBad: f.querySelectorAll('.fld.bad').length,
      note: f.querySelector('.form-note').textContent,
      exit: f.querySelector('.form-note a') ? f.querySelector('.form-note a').getAttribute('href') : null,
    });
  })()`);
  console.log('VALID SUBMIT', JSON.parse(good));
  await new Promise((r) => setTimeout(r, 400));
  fs.writeFileSync('./fc-sent.png', await page.screenshot());

  // 5. the two plates have to end level — that was the visible complaint
  const box = await page.evaluate(`(() => {
    const f = document.querySelector('.contact-form').getBoundingClientRect();
    const a = document.querySelector('.help-card').getBoundingClientRect();
    return JSON.stringify({ form: Math.round(f.height), aside: Math.round(a.height),
      footGap: Math.round(Math.abs(f.bottom - a.bottom)) });
  })()`);
  console.log('PLATES', JSON.parse(box));
});
