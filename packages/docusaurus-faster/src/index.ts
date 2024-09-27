/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rspack from '@rspack/core';
import * as lightningcss from 'lightningcss';
import browserslist from 'browserslist';
import type {RuleSetRule} from 'webpack';
import type {JsMinifyOptions} from '@swc/core';

export function getRspack(): typeof Rspack {
  return Rspack;
}

export function getSwcJsLoaderFactory({
  isServer,
}: {
  isServer: boolean;
}): RuleSetRule {
  return {
    loader: require.resolve('swc-loader'),
    options: {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
        target: 'es2017',
      },
      module: {
        type: isServer ? 'commonjs' : 'es6',
      },
    },
  };
}

// Note: these options are similar to what we use in core
// They should rather be kept in sync for now to avoid any unexpected behavior
// The goal of faster minifier is not to fine-tune options but only to be faster
// See core minification.ts
export function getSwcJsMinimizerOptions(): JsMinifyOptions {
  return {
    ecma: 2020,
    compress: {
      ecma: 5,
    },
    module: true,
    mangle: true,
    safari10: true,
    format: {
      ecma: 5,
      comments: false,
      ascii_only: true,
    },
  };
}

export function getBrowserslistQueries(): string[] {
  // Not sure why browserslist has no direct method to retrieve queries
  const configFile = browserslist.findConfigFile(process.cwd());
  const queries = browserslist.loadConfig({path: configFile}) ?? [
    ...browserslist.defaults,
  ];
  return queries;
}

// LightningCSS doesn't expose any type for css-minimizer-webpack-plugin setup
// So we derive it ourselves
// see https://lightningcss.dev/docs.html#with-webpack
type LightningCssMinimizerOptions = Omit<
  lightningcss.TransformOptions<never>,
  'filename' | 'code'
>;

export function getLightningCssMinimizerOptions(): LightningCssMinimizerOptions {
  const queries = browserslist(getBrowserslistQueries());
  return {targets: lightningcss.browserslistToTargets(queries)};
}
