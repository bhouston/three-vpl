import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkPullRequest } from './check-pr.mjs';

test('PR policy requires main and an issue reference', () => {
  assert.doesNotThrow(() => checkPullRequest({ base: { ref: 'main' }, body: 'Closes #1' }));
  assert.throws(() => checkPullRequest({ base: { ref: 'dev' }, body: 'Closes #1' }));
  assert.throws(() => checkPullRequest({ base: { ref: 'main' }, body: '' }));
});
