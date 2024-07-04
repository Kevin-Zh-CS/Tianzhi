/*
 * Created By Chris Su on 2018-08-05 17:18:39
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/lua/lua';
// import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
// import 'codemirror/theme/paraiso-light.css';
import 'codemirror/theme/base16-light.css';
import 'codemirror/theme/base16-dark.css';
import 'codemirror/addon/display/placeholder';
// import 'codemirror/addon/edit/closebrackets.js';

import './CodeEditor.less';

class CodeEditor extends React.Component {
  static propTypes = {
    value: PropTypes.string, // eslint-disable-line
    // defaultValue: PropTypes.string,
    theme: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    lineWrapping: PropTypes.string, // 是否换行还是滚动
    readOnly: PropTypes.bool, // 是否只读，如果为true，则不能设置焦点
    options: PropTypes.object,
    onScroll: PropTypes.func,
  };

  static defaultProps = {
    onChange: () => {},
    onScroll: () => {},
    theme: 'base16-light',
    placeholder: '',
    lineWrapping: 'wrap', // 默认换行
    readOnly: false,
    options: {},
  };

  constructor(props) {
    super(props);
    const defaultValue = props.value;
    this.state = {
      value: defaultValue,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.value !== state.value) {
      return {
        value: props.value,
      };
    }
    return null;
  }

  componentDidUpdate() {
    // 第一次加载时，lineNumbers会显示不出来
    this.instance.refresh();
  }

  handleChange = (editor, data, value) => {
    const { onChange } = this.props;
    this.setState({ value });
    onChange(value);
  };

  handleScroll = (editor, data) => {
    const { onScroll } = this.props;
    onScroll(editor, data);
  };

  render() {
    const { placeholder, options, lineWrapping, readOnly, mode = 'lua', theme } = this.props;
    const { value } = this.state;
    return (
      <CodeMirror
        value={value}
        editorDidMount={editor => {
          this.instance = editor;
        }}
        onScroll={this.handleScroll}
        onBeforeChange={this.handleChange}
        options={{
          mode,
          // theme: 'paraiso-light',
          theme,
          // autofocus: true,
          autoCursor: true,
          lineNumbers: true,
          matchBrackets: true,
          autoCloseBrackets: true,
          readOnly: readOnly ? 'nocursor' : readOnly,
          lineWrapping,
          placeholder,
          ...options,
        }}
      />
    );
  }
}

export default CodeEditor;
