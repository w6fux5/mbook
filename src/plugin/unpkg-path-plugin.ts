import * as esbuild from 'esbuild-wasm';

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      // 完全符合index.js => handle root entry file of 'index.js'
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return { path: 'index.js', namespace: 'a' };
      });

      // handle module 裡面的相對路徑
      // 符合 ./ 或是 ../
      build.onResolve({ filter: /^\.+\// }, async (args: any) => {
        return {
          path: new URL(args.path, `https://unpkg.com${args.resolveDir}/`).href,
          namespace: 'a',
        };
      });

      // handle main file of module
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          path: `https://unpkg.com/${args.path}`,
          namespace: 'a',
        };
      });
    },
  };
};
