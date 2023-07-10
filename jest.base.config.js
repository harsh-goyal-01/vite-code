// using ts-jest for transformation as it will typecheck ts files unlike babel-jest(with @babel/preset-typescript) which simply transforms without any typecheck.
// TODO: enable ts-jest for transformation of ts files after all ts fixes
module.exports = {
  transform: {
    '.(j|t)s(x?)$': '../../internals/jest/babel-transformer.js',
    // ".ts(x?)$": "ts-jest"
  },
  testMatch: ['<rootDir>/**/(*.)spec.(js|ts)?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testPathIgnorePatterns: ['./lib', './node_modules/', './public', './internals', './build'],
  setupFilesAfterEnv: ['../../internals/jest/setupAfterEnv.js'],
};
