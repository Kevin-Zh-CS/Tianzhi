import React from 'react';
import { Row, Icons } from 'quanta-design';
import classnames from 'classnames';
import styles from './index.less';

const { CheckIcon, RightIcon } = Icons;

class Step extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { stepData, current, style } = this.props;
    return (
      <div className={styles.stepWrap} style={style}>
        <Row>
          {stepData.map((data, index) => (
            <div>
              <div className={classnames(styles.stepPartWrap)}>
                <div className={styles.stepTitleWrap}>
                  <div className={styles.stepTitle}>
                    {index + 1 < current ? (
                      <div style={{ marginRight: 12 }}>
                        <CheckIcon fontSize={24} fill="#0076D9" className={styles.stepTitleIcon} />
                      </div>
                    ) : null}
                    {index + 1 === current ? (
                      <div
                        className={styles.stepNumberIcon}
                        style={{ color: '#fff', background: '#0076D9' }}
                      >
                        {index + 1}
                      </div>
                    ) : null}
                    {index + 1 > current ? (
                      <div
                        className={styles.stepNumberIcon}
                        style={{ color: '#B7B7B7', border: '1px solid #B7B7B7' }}
                      >
                        {index + 1}
                      </div>
                    ) : null}
                    <span
                      style={{
                        color: index + 1 === current ? '#121212' : '#888888',
                        fontWeight: index + 1 === current ? 600 : 400,
                      }}
                    >
                      {data.title}
                    </span>
                    {index + 1 === stepData.length ? null : (
                      <RightIcon fontSize={20} fill="#888888" style={{ margin: '0 40px' }} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Row>
      </div>
    );
  }
}

export default Step;
