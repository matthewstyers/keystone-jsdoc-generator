import async from 'async';
import fs from 'fs-extra';
import path from 'path';
import { pipe } from 'mississippi';
import { createTypeDefs, KeystoneReader } from './lib';

export default function generate(keystone, done) {
  const outdir = path.resolve(this.config.outdir, 'lists');
  const createRead = (list) => new KeystoneReader(keystone, list);
  const writeFiles = (cb) => async.eachOf(keystone.lists, (list, key, cEO) => {
    const outfile = path.resolve(outdir, `${key}.js`);
    fs.ensureFileSync(outfile);
    const outstream = fs.createWriteStream(outfile);
    const read = createRead(key);
    pipe(read, outstream, (err) => {
      if (err) console.error(err);
      read.destroy();
      cEO(err);
    });
  }, cb);

  async.series([
    (cs) => fs.emptyDir(outdir, cs),
    writeFiles,
    (cs) => createTypeDefs(keystone, cs)
  ], done);
}
