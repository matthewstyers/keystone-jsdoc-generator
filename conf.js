module.exports = {
  babel: {
    ignore: [/node_modules/],
    presets: ['@babel/react', ['@babel/env', {
      useBuiltIns: 'entry',
      targets: { node: '6.10' },
      modules: process.env.NODE_ENV === 'production' ? false : 'commonjs',
      loose: true
    }]],
    env: {
      development: {
        plugins: [
          '@babel/plugin-proposal-object-rest-spread',
          ['@babel/plugin-proposal-class-properties', { loose: true }],
          '@babel/plugin-transform-runtime',
          '@babel/plugin-proposal-export-default-from',
          '@babel/plugin-proposal-logical-assignment-operators',
          ['@babel/plugin-proposal-optional-chaining', { loose: false }],
          ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
          ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: false }],
          '@babel/plugin-proposal-do-expressions',
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          '@babel/plugin-proposal-function-sent',
          '@babel/plugin-proposal-export-namespace-from',
          '@babel/plugin-proposal-numeric-separator',
          '@babel/plugin-proposal-throw-expressions',
          '@babel/plugin-syntax-dynamic-import',
          '@babel/plugin-syntax-import-meta',
          '@babel/plugin-proposal-json-strings',
          ['module-resolver', {
            root: [__dirname],
            alias: {},
            extensions: ['.js', '.jsx', '.es', '.es6']
          }]
        ]
      },
      production: {
        presets: [['@babel/env', {
          useBuiltIns: 'entry',
          targets: { node: '6.10' },
          modules: 'commonjs',
          loose: true
        }]],
        plugins: [
          '@babel/plugin-proposal-object-rest-spread',
          ['@babel/plugin-proposal-class-properties', { loose: true }],
          '@babel/plugin-transform-runtime',
          '@babel/plugin-proposal-export-default-from',
          '@babel/plugin-proposal-logical-assignment-operators',
          ['@babel/plugin-proposal-optional-chaining', { loose: false }],
          ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
          ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: false }],
          '@babel/plugin-proposal-do-expressions',
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          '@babel/plugin-proposal-function-sent',
          '@babel/plugin-proposal-export-namespace-from',
          '@babel/plugin-proposal-numeric-separator',
          '@babel/plugin-proposal-throw-expressions',
          '@babel/plugin-syntax-dynamic-import',
          '@babel/plugin-proposal-json-strings',
          ['module-resolver', {
            root: [__dirname],
            alias: {},
            extensions: ['.js', '.jsx', '.es', '.es6']
          }]
        ]
      }
    }
  }
};
