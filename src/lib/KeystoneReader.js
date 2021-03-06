import _ from 'lodash';
import { Readable } from 'stream';
import async from 'async';
import { writeOption } from './writeOption';

export class KeystoneReader extends Readable {
  constructor(keystone, key) {
    super();
    this.keystone = keystone;
    this.key = key;
    this.list = keystone.lists[key];

    this.isReading = false;
    this.writeOption = writeOption.bind(this);
  }

  _read() {
    if (!this.isReading) {
      this.isReading = true;
      this.startReading();
    }
  }
  openComment = (cb) => { this.push('/**\n'); cb(); }
  closeComment = (cb) => { this.push(' */\n'); cb(); }
  writeDummyConst = (val, type, cb) => {
    if (type === 'class') this.push(`class ${val} {}\n`);
    else if (type === 'const') this.push(`const ${val} = {};\n`);
    cb();
  }
  writeLine = (line, cb) => { this.push(` * ${line}\n`); cb(); }
  writeLineBreak = (cb) => { this.push(' *\n'); cb(); }

  /* adds tags to force JSDoc into submission */
  writeMemberData = (prop, cb) => async.series([
    (cs) => this.writeLine(`@member ${prop}`, cs),
    (cs) => this.writeLine(`@memberof list:${this.key}`, cs),
    (cs) => this.writeLine(`@alias list:${this.key}.${prop}`, cs),
    this.writeLineBreak
  ], cb);

  /* FIELDS */
  getPath = (field) => {
    const { path, options: { default: def, required = false }} = field;
    const defVal = _.isFunction(def) ? undefined : def;
    let Path = path;
    if (!_.isUndefined(defVal)) Path = Path.concat(`=${defVal}`);
    if (!required) Path = `[${Path}]`;
    return `${Path}`;
  }

  writeField = (field, key, cb) => {
    const { options: { note, }, type
    } = field;
    this.writeLine(`\
@prop {${_.upperFirst(type)}Field} ${this.getPath(field)}\
${note ? ` - ${note}` : ''}\
`, cb);
  }

  /* DISPLAY */
  writeDisplay = (value, key, cb) =>
    this.writeLine(`@prop {String} ${key} - ${value}`, cb)

  /* UNIVERSAL HANDLER */
  createMember = (name, data, handler, next) => {
    async.series([
      this.openComment,
      (cs) => this.writeMemberData(name, cs),
      (cs) => async.eachOfSeries(data, handler, cs),
      this.closeComment,
      (cs) => this.writeDummyConst(name, 'const', cs)
    ], next);
  }

  writeDocConfig = (conf) => (next) => {
    if (_.isEmpty(conf)) next();
    else {
      async.eachOfSeries(conf, (val, key, cb) => {
        const tag = _.startsWith(key, '@') ? key : `@${key}`;
        this.writeLine(`${tag} ${val}`, cb);
      }, next);
    }
  }

  createList = (key, docConfig = {}, next) => {
    async.series([
      this.openComment,
      (cs) => this.writeLine(`@list ${key}`, cs),
      (cs) => this.writeLine(`@name ${key}`, cs),
      this.writeDocConfig(docConfig),
      this.closeComment,
      (cs) => this.writeDummyConst(key, 'class', cs),
    ], next);
  }

  startReading() {
    const key = this.key;
    // const ks = this.keystone;
    const ls = this.list;
    const { label, plural, singular, jsDoc, jsdoc, ...rest } = ls.options;
    const docConfig = jsDoc || jsdoc;
    const options = _.pick(rest, [
      'defaultColumns', 'defaultQuery', 'defaultSort', 'hidden', 'namePath',
      'nocreate', 'nodelete', 'noedit', 'track'
    ]);
    const display = { path: ls.path, key, label, plural, singular };
    async.series([
      (cs) => this.createList(key, docConfig, cs),
      (cs) => this.createMember('Options', options, this.writeOption, cs),
      (cs) => this.createMember('Fields', ls.fields, this.writeField, cs),
      (cs) => this.createMember('Display', display, this.writeDisplay, cs)
    ], (err) => {
      if (err) this.emit('error', err);
      else this.push(null);
    });
  }
}
