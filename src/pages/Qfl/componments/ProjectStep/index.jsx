import React from 'react';
import { Icons } from 'quanta-design';
import classnames from 'classnames';
import styles from './index.less';
import prepareBg from '@/assets/qfl/data-detail-prepare-bg.png';
import resolveBg from '@/assets/qfl/data-detail-resolve-bg.png';
import safeModeBg from '@/assets/qfl/safe-modal-bg.png';
import specialBg from '@/assets/qfl/special-data-bg.png';

const { CheckIcon, RightIcon } = Icons;

function ProjectStep(props) {
  const { stepData, current } = props;
  const getBg = index => {
    if (index + 1 <= current) {
      if (index === 0) return prepareBg;
      if (index === 1) return resolveBg;
      if (index === 2) return specialBg;
      if (index === 3) return safeModeBg;
    }

    return '';
  };
  return (
    <div className={styles.stepWrap}>
      {stepData.map((data, index) => (
        <div
          key={data.key}
          className={classnames(styles.stepPartWrap, index + 1 > current ? '' : styles.borderTop)}
          style={{ backgroundImage: `url('${getBg(index)}')` }}
        >
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
              <span style={{ color: index + 1 === current ? '#121212' : '#888888' }}>
                {data.title}
              </span>
            </div>
            <div className={styles.stepContent}>{data.content}</div>
          </div>
          {index + 1 === stepData.length ? null : (
            <div className={styles.rightIcon}>
              <RightIcon fontSize={20} style={{ marginTop: 15 }} fill="#888888" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProjectStep;
