/* this file is the entry point for development only. */
require('@babel-polyfill');
if (process.env.NODE_ENV !== 'production') {
  require('@babel/register')(require('./conf').babel);
}

module.exports = require('./src/keystone-jsdoc-generator');
