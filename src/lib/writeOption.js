import _ from 'lodash';
import async from 'async';
import flat from 'flat';


export function writeOption(value, key, done) {
  let delimiter;
  const formatArrayLike = (arr) =>{
    delimiter = _.includes(value, ',') ? ', ' : ' ';
    const toJoin = _.isArray(arr) ? arr : _.split(arr, delimiter);
    _.join(toJoin, ', ');
  };

  let val = _.isString(value) || _.isBoolean(value) || _.isFinite(value)
    ? value : undefined;

  const write = (__val, __key, type, cb) => this.writeLine(
    `@prop {${_.upperFirst(type)}} ${__key}${_.isUndefined(__val) ? '' : ' - ' + __val}`, cb);

  switch(key) {
    case 'defaultColumns': case 'searchFields':
      val =  formatArrayLike(value); break;
    default: break;
  }

  if (!_.isUndefined(val)) write(val, key, typeof value, done);
  else if (_.isArray(value) && _.isString(value[0])) {
    write(formatArrayLike(value), key, 'array', done);
  } else {
    async.series([
      (cs) => write(undefined, key, typeof value, cs),
      (cs) => {
        if (_.isEmpty(value)) cs();
        else {
          const obj = flat(_.isArray(value)
            ? _.reduce(value,
              (memo, _val, index) => ({ ...memo, [`${key}[${index}]`]: _val }),
              {})
            : { [key]: value },
          { safe: true });

          async.eachOfSeries(obj, (_val, _key, cEO) =>
            write(formatArrayLike(_val), _key, typeof _val, cEO), cs);
        }
      }
    ], done);
  }
}
