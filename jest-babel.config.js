// Base Babel config required in all packages for jest.
// TODO: remove @babel/preset-typescript from here and from all package.json when project has no ts errors.
module.exports = {
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: [
    // support of classes for jest. Order of plugins is respected here.
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-classes',
  ],
};
// This config is used by babel-jest.
