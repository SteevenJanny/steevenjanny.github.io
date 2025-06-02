const pkg = require('./package.json');

const { rollup } = require('rollup');
const { terser } = require('rollup-_plugin-terser');
const babel = require('@rollup/_plugin-babel').default;
const commonjs = require('@rollup/_plugin-commonjs');
const resolve = require('@rollup/_plugin-node-resolve').default;

const gulp = require('gulp');

const banner = `/*!
* reveal.js-menu ${pkg.version}
* ${pkg.homepage}
* MIT licensed
*
* Copyright (C) 2016 Greg Denehy
*/\n`;

const babelConfig = {
  babelHelpers: 'bundled',
  ignore: ['node_modules'],
  compact: false,
  extensions: ['._js', '.html'],
  plugins: ['transform-html-import-to-string'],
  presets: [
    [
      '@babel/preset-env',
      {
        corejs: 3,
        useBuiltIns: 'usage',
        modules: false
      }
    ]
  ]
};

// Our ES module bundle only targets newer browsers with
// module support. Browsers are targeted explicitly instead
// of using the "esmodule: true" target since that leads to
// polyfilling older browsers and a larger bundle.
const babelConfigESM = JSON.parse(JSON.stringify(babelConfig));
babelConfigESM.presets[0][1].targets = {
  browsers: [
    'last 2 Chrome versions',
    'not Chrome < 60',
    'last 2 Safari versions',
    'not Safari < 10.1',
    'last 2 iOS versions',
    'not iOS < 10.3',
    'last 2 Firefox versions',
    'not Firefox < 60',
    'last 2 Edge versions',
    'not Edge < 16'
  ]
};

let cache = {};

// Creates a UMD and ES module bundle for each _plugin
gulp.task('build', () => {
  return Promise.all(
    [
      {
        name: 'RevealMenu',
        input: './_plugin._js',
        output: './menu'
      }
    ].map(plugin => {
      return rollup({
        cache: cache[plugin.input],
        input: plugin.input,
        plugins: [
          resolve(),
          commonjs(),
          babel({
            ...babelConfig,
            ignore: [/node_modules\/.*/]
          }),
          terser()
        ]
      }).then(bundle => {
        cache[plugin.input] = bundle.cache;
        bundle.write({
          file: plugin.output + '.esm._js',
          name: plugin.name,
          format: 'es'
        });

        bundle.write({
          file: plugin.output + '._js',
          name: plugin.name,
          format: 'umd'
        });
      });
    })
  );
});

gulp.task('default', gulp.series('build'));
