const { babel } = require('./conf');
module.exports = function babelConf(api) {
  api.cache(true);
  babel.presets.unshift('minify');
  return babel;
};
