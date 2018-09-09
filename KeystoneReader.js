import _ from 'lodash';
import { Readable } from 'stream';
import async from 'async';

export class KeystoneReader extends Readable {
  constructor(keystone, key) {
    super();
    this.keystone = keystone;
    this.key = key;
    this.list = keystone.lists[key];

    this.isReading = false;
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
    const { path, options = {},
      options: { default: def, required = false }} = field;
    const defVal = _.isFunction(def) ? '' : def;
    let Path = path;
    if (!_.isUndefined(defVal)) Path = Path.concat(`=${defVal}`);
    if (!required) Path = `[${Path}]`;
    return `${Path}`;
  }

  writeField = (field, key, cb) => {
    // console.log(_.omit(field, ['list', 'keystone']));
    const { options: { note, }, type
    } = field;
    this.writeLine(`\
@prop {${_.upperFirst(type)}Field} ${this.getPath(field)}\
${note ? ` - ${note}` : ''}\
`, cb);
  }

  writeFields = (next) => {
    async.series([
      this.openComment,
      (cs) => this.writeMemberData('Fields', cs),
      (cs) => async.eachOfSeries(this.list.fields, this.writeField, cs),
      this.closeComment,
      (cs) => this.writeDummyConst('Fields', 'const', cs)
    ], next);
  }


  startReading() {
    const key = this.key;
    const ks = this.keystone;
    const ls = this.list;
    async.series([
      (cs) => { this.push(`/** @list ${key} */\n`); cs(); },
      (cs) => this.writeDummyConst(key, 'class', cs),
      (cs) => this.writeFields(cs)
    ], (err) => {
      if (err) this.emit('error', err);
      else this.push(null);
    });
  }
}
