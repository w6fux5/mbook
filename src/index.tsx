import * as esBuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugin/unpkg-path-plugin';
import { fetchPlugin } from './plugin/fetch-plugin';

import ReactDom from 'react-dom';
import { useState, useEffect, useRef } from 'react';

// Components
import CodeEditor from './components/code-editor';

const App = () => {
  const ref = useRef<any>();
  const iframeRef = useRef<any>();

  const [input, setInput] = useState('');

  const startService = async () => {
    ref.current = await esBuild.startService({
      worker: true,
      wasmURL: './esbuild.wasm',
      // wasmURL: 'http://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
    });
  };

  const onClick = async () => {
    if (!ref.current) return;

    iframeRef.current.srcdoc = html;

    const result = await ref.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
    });

    iframeRef.current.contentWindow.postMessage(
      result.outputFiles[0].text,
      '*'
    );
  };

  useEffect(() => {
    startService();
  }, []);

  const html = `
  <html>
    <head></head>
    <body>
      <div id="root"></div>
      <script>
        window.addEventListener('message', e => {
          try {
            eval(e.data)
          }catch (error) {
            const root = document.querySelector('#root');
            root.innerHTML = '<div style="color: red";><h4>Runtime Error</h4>' + error.message + '</div>'
            console.error(error);
          }
        }, false)
      </script>
    </body>
  </html>
`;

  return (
    <div>
      <CodeEditor
        initialValue="const a = 1;"
        onChange={value => setInput(value)}
      />
      {/* <textarea
        rows={10}
        cols={50}
        value={input}
        onChange={e => setInput(e.target.value)}
      ></textarea> */}
      <div>
        <button onClick={onClick}>submit</button>
      </div>

      {/* <pre>{code}</pre> */}
      {/* <iframe title="sanBox" sandbox="" src="/test.html" /> */}
      <iframe
        title="code preview"
        ref={iframeRef}
        sandbox="allow-scripts"
        srcDoc={html}
      />
    </div>
  );
};

ReactDom.render(<App />, document.querySelector('#root'));
