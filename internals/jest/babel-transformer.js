/* eslint-disable  @typescript-eslint/no-var-requires */
const { createTransformer } = require('babel-jest');
const babelConfig = require('../../jest-babel.config.js');

module.exports = createTransformer(babelConfig);

// This needs to be done because babel-jest picks up wrong babel config
// reference: https://github.com/facebook/jest/issues/7359
