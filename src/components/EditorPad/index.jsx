import React, { useState, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { debounce } from 'lodash';
import luaparse from 'luaparse';
import styles from './index.less';

function EditorPad({ modelCode = '', setModelCode = null, setLuaScript = null, readOnly = false }) {
  const [visible, setVisible] = useState(true);

  const rerenderEditor = () => {
    setVisible(false);
    setVisible(true);
  };

  useEffect(() => {
    window.addEventListener('resize', rerenderEditor);
    return () => window.removeEventListener('resize', rerenderEditor);
  }, []);

  const parseCode = lua => {
    setModelCode(lua);
    try {
      const parseResult = luaparse
        .parse(lua)
        .body.filter(item => item.type === 'FunctionDeclaration');
      const luaScript = parseResult.map((item, index) => {
        const obj = {
          index,
          funName: item.identifier.name,
          inputParams: item.parameters.map(params => params.name),
        };
        return obj;
      });
      setLuaScript(luaScript);
    } catch {
      setLuaScript([]);
    }
  };

  useEffect(() => {
    parseCode(modelCode);
  }, [modelCode]);

  const editorDidMount = editor => {
    editor.focus();
  };

  const debounceParse = debounce(lua => parseCode(lua), 500);
  const onChange = newValue => {
    debounceParse(newValue);
  };

  const options = {
    selectOnLineNumbers: true,
    fontSize: 14,
    readOnly,
  };

  return (
    <div className={styles.monacoEditor}>
      {visible && (
        <MonacoEditor
          width="100%"
          height="600"
          language="lua"
          theme="vs-dark"
          value={modelCode}
          options={options}
          onChange={onChange}
          editorDidMount={editorDidMount}
        />
      )}
    </div>
  );
}

export default EditorPad;
