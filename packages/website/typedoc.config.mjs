import { readFileSync } from 'node:fs';

const options = JSON.parse(readFileSync(new URL('./typedoc.json', import.meta.url), 'utf8'));

// Link to the deployed commit on Actions; local builds target the default branch.
// disableGit keeps TypeDoc from spawning Git during documentation generation.
export default { ...options, gitRevision: process.env.GITHUB_SHA || 'main' };
