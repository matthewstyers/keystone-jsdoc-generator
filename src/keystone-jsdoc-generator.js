import '@babel/polyfill';
import _ from 'lodash';
import generate from './generate';
import config from './config';

class KeystoneJSDocGenerator {
  constructor(_conf) {
    this.config = _.defaultsDeep(_conf, config);
    this.generate = generate.bind(this);
  }
}

module.exports = KeystoneJSDocGenerator;
