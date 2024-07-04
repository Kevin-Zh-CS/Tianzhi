import React, { useState } from 'react';
import { ReactComponent as DoubleArrowDown } from '@/icons/double_arrow_down.svg';
import { ReactComponent as DoubleArrowUp } from '@/icons/double_arrow_up.svg';
import arrowDown from '@/icons/arrow_down.png';
import { IconBase, Tag } from 'quanta-design';
import ItemTitle from '@/components/ItemTitle';
import styles from './index.less';

function ArrowDown() {
  return (
    <div>
      <div align="center">
        <img src={arrowDown} alt=" " width={20} height={16} />
      </div>
    </div>
  );
}

function ShareSteps() {
  const [visible, setVisible] = useState(false);
  return (
    <div className={`${styles.shareSteps} container-card`}>
      <div className={styles.title} onClick={() => setVisible(!visible)}>
        <ItemTitle title="数据共享过程说明" className="hover-style" />
        <IconBase style={{ marginLeft: 8 }} icon={visible ? DoubleArrowUp : DoubleArrowDown} />
      </div>
      {visible && (
        <div style={{ marginTop: 12 }}>
          <div className={styles.steps}>
            <span className={styles.stepTitle}>数据需求方</span>
            <span className={styles.stepDesc}>对数据发起申请请求</span>
            <span>
              <Tag bordered color="processing" style={{ marginRight: 8 }}>
                上链
              </Tag>
              <Tag bordered color="processing">
                智能合约
              </Tag>
            </span>
          </div>
          <ArrowDown />
          <div className={styles.steps}>
            <span className={styles.stepTitle}>数据提供方</span>
            <span className={styles.stepDesc}>链上发送数据访问凭证给需求方</span>
            <Tag bordered color="processing">
              上链
            </Tag>
          </div>
          <ArrowDown />

          <div className={styles.steps}>
            <span className={styles.stepTitle}>数据需求方</span>
            <span className={styles.stepDesc}>
              使用数据访问凭证通过BitXMesh节点发起实际数据请求
            </span>
            <Tag bordered color="warning">
              链下请求
            </Tag>
          </div>
          <ArrowDown />

          <div className={styles.steps}>
            <span className={styles.stepTitle}>数据提供方</span>
            <span className={styles.stepDesc}>接收到数据请求，向链上发起数据凭证真实性检查</span>
            <Tag bordered color="processing">
              链上查验
            </Tag>
          </div>
          <ArrowDown />
          <div className={styles.steps}>
            <span className={styles.stepTitle}>数据提供方</span>
            <span className={styles.stepDesc}>向数据需求方BitXMesh节点发送实际数据</span>
            <Tag bordered color="warning">
              链下传输
            </Tag>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShareSteps;
