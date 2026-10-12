import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const guard = await readFile(new URL('../public/browser-compat.js', import.meta.url), 'utf8');
const notice = await readFile(new URL('../public/unsupported/index.html', import.meta.url), 'utf8');
const page = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');

function browser(missing) {
  const redirects = [];
  const window = { fetch() {}, Promise() {}, URL() {}, AbortController() {}, Intl: { DateTimeFormat() {}, NumberFormat() {} }, location: { replace(target) { redirects.push(target); } } };
  if (missing !== 'noModule') delete window[missing];
  if (missing === 'NumberFormat') delete window.Intl.NumberFormat;
  const document = { createElement(type) {
    if (type === 'script') return missing === 'noModule' ? {} : { noModule: false };
    const element = { replaceChildren() {}, append() {} };
    delete element[missing];
    return element;
  } };
  runInNewContext(guard, { window, document }, { timeout: 100 });
  return redirects;
}

test('classic guard leaves a module-capable modern browser on the status page', () => {
  assert.deepEqual(browser('nothing'), []);
  // The guard must parse before modern syntax. These constructs are deliberately absent.
  assert.doesNotMatch(guard, /\b(?:const|let|async|await|class|import|export)\b|=>|\?\.|\?\?/u);
  assert.doesNotMatch(guard, /fetch\(|Promise\(|URL\(|AbortController\(/u);
});

test('missing required browser capabilities lead to the plain notice without a network request', () => {
  for (const feature of ['fetch', 'Promise', 'URL', 'AbortController', 'noModule', 'replaceChildren', 'append', 'Intl', 'NumberFormat']) {
    assert.deepEqual(browser(feature), ['./unsupported/']);
  }
  for (const origin of ['https://status.yomumi.moe/', 'https://status.yomumi.moe/index.html',
    'https://lumichandesu.github.io/yomumi-status-fallback/']) {
    assert.equal(new URL('./unsupported/', origin).pathname,
      origin.includes('github.io') ? '/yomumi-status-fallback/unsupported/' : '/unsupported/');
  }
});

test('no-JS notice stays readable and the status page never fabricates a successful observation', () => {
  assert.match(notice, /กรุณาอัปเดตเบราว์เซอร์/u);
  assert.match(notice, /Please update your browser/u);
  assert.match(notice, /cannot verify whether Yomumi services are available/u);
  assert.doesNotMatch(notice, /<(?:script|nav|iframe|img|audio|video|form|link)\b/iu);
  assert.match(page, /<noscript>[\s\S]*JavaScript is off or unsupported[\s\S]*Status remains unknown/u);
  assert.match(page, /lang="th">กรุณาเปิด JavaScript/u);
});
