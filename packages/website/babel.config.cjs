module.exports = {
  presets: [require.resolve('@docusaurus/core/lib/babel/preset')],
  // Workspace sources live outside the site directory. Explicit targets keep
  // Babel from lowering their subclasses to ES5 calls against native Three.js classes.
  targets: { chrome: '113', edge: '113', firefox: '141', safari: '26' },
};
