import _ from 'lodash';
import { Readable } from 'stream';
import async from 'async';
import fs from 'fs-extra';
import path from 'path';
import config from '../config';
import { pipe, concat } from 'mississippi';

class TypeReader extends Readable {
  constructor(Types) {
    super();
    this.Types = Types;
    this.isReading = false;
  }
  _read() { if (!this.isReading) { this.isReading = true; this.startReading(); }}

  openComment = (cb) => { this.push('/**\n'); cb(); }
  closeComment = (cb) => { this.push(' */\n\n'); cb(); }
  writeLine = (line, cb) => { this.push(` * ${line}\n`); cb(); }
  writeLineBreak = (cb) => { this.push(' *\n'); cb(); }

  writeTypes = (next) => {
    async.eachOfSeries(this.Types, (Type, key, cEO) => {
      async.series([
        this.openComment,
        (cs) => this.writeLine(`@typedef ${key}Field`, cs),
        (cs) => this.writeLine(`@desc A Keystone.js \
{@link https://keystonejs.com/api/field/${_.toLower(key)}|${key}} Field.`, cs),
        this.closeComment
      ], cEO);
    }, next);
  }

  startReading() {
    async.series([
      this.writeTypes,
    ], (err) => { if (err) this.emit('error', err); else this.push(null); });
  }
}

export const createTypeDefs = (keystone, done) => {
  const outfile = path.resolve(config.outdir, 'Types.js');
  const read = new TypeReader(_.omit(keystone.Field.Types, ['AzureFile']));



  const writeFile = concat((types) =>
    fs.ensureFile(outfile).then(() => fs.outputFile(outfile, types)));

  pipe(read, writeFile, (err) => {
    read.destroy();
    done(err);
  });
};
