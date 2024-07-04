import React from 'react';
import classnames from 'classnames';
import noRepositoryImg from '@/assets/no_repository.png';
import styles from './index.less';

class NoData extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { className, style, hint, btn, hasStep } = this.props;
    return (
      <div
        className={classnames(styles.noData, className)}
        style={{
          minHeight: 400,
          height: hasStep ? 'calc(100vh - 332px)' : 'calc(100vh - 212px)',
          paddingTop: hasStep ? 60 : 120,
          ...style,
        }}
      >
        <img src={noRepositoryImg} width="200" alt="no repository" />
        <div style={{ color: '#888888', marginTop: 20 }}>{hint}</div>
        {btn}
      </div>
    );
  }
}

export default NoData;
