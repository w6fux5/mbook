import * as esbuild from 'esbuild-wasm';
import axios from 'axios';

import localForage, { getItem } from 'localforage';

const fileCatch = localForage.createInstance({
  name: 'fileCatch',
});

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResole', args);

        if (args.path === 'index.js') {
          return { path: args.path, namespace: 'a' };
        }

        if (args.path.includes('./') || args.path.includes('../')) {
          return {
            path: new URL(args.path, `https://unpkg.com${args.resolveDir}/`)
              .href,
            namespace: 'a',
          };
        }

        return {
          path: `https://unpkg.com/${args.path}`,
          namespace: 'a',
        };
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args);

        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: `
            import React, {useState} from 'react@17.0.2';
            import ReactDom from 'react-dom';
            `,
          };
        }

        const cachedResult = await fileCatch.getItem<esbuild.OnLoadResult>(args.path);

        if(cachedResult) return cachedResult

        const { data, request } = await axios.get(args.path);

 

        const result: esbuild.OnLoadResult =  {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        };

        await fileCatch.setItem(args.path, result)

        return result
      });
    },
  };
};
