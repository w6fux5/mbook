import React, { useRef } from 'react';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';

import MonacoEditor, { EditorDidMount } from '@monaco-editor/react';

import './code-editor.css';

interface CodeEditorProps {
  initialValue: string;
  onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, onChange }) => {
  const monacoRef = useRef<any>();

  const onEditorDidMount: EditorDidMount = (getValue, monacoEditor) => {
    monacoRef.current = monacoEditor;
    monacoEditor.onDidChangeModelContent(() => {
      onChange(getValue());
    });

    monacoEditor.getModel()?.updateOptions({ tabSize: 2 });
  };

  const onFormatClick = () => {
    // get current value from editorDidMount
    const unFormatted = monacoRef.current.getModel().getValue();

    // format the value
    const options = {
      parser: 'babel',
      plugins: [parser],
      semi: true,
      singleQuote: true,
    };
    const formatted = prettier.format(unFormatted, options).replace(/\n$/, '');
    console.log(formatted);

    // set the format value back to editor
    monacoRef.current.setValue(formatted);
  };

  return (
    <div className="editor-wrapper">
      <button
        className="button button-format is-primary is-small"
        onClick={onFormatClick}
      >
        Format
      </button>
      <MonacoEditor
        editorDidMount={onEditorDidMount}
        value={initialValue}
        language="javascript"
        theme="dark"
        height="500px"
        options={{
          wordWrap: 'on',
          minimap: { enabled: false },
          showUnused: false,
          folding: false,
          lineNumbersMinChars: 3,
          fontSize: 16,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
