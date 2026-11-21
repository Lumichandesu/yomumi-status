import { writeFile, readFile, rename } from 'node:fs/promises';
import { validVisitor } from '../public/visitor-model.mjs';

// The browser has read-only repository access. The publishing job accepts only
// the small whitelisted observation after validating the independent job output.
const input = process.env.GUEST_OBSERVATION;
if (input) {
  if (input.length > 512) throw new Error('Invalid visitor observation');
  const next = JSON.parse(input);
  if (!validVisitor(next,'github_hosted') || !next.checkedAt) throw new Error('Invalid visitor observation');
  const target = new URL('../public/visitor.json',import.meta.url);
  const previous = JSON.parse(await readFile(target, 'utf8'));
  if (!previous.checkedAt || Date.parse(next.checkedAt)>Date.parse(previous.checkedAt)) {
    const staged=new URL('../public/visitor.json.tmp',import.meta.url);
    await writeFile(staged,JSON.stringify(next)+'\n');
    await rename(staged,target);
  }
}
