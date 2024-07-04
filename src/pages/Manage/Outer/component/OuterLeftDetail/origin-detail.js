import React from 'react';
import styles from '@/pages/Manage/Outer/component/OuterLeftDetail/index.less';
import { Descriptions } from 'quanta-design';
import './index.less';
import ParamTable from '@/pages/Manage/component/ParamTable';

export default function OriginDetail(props) {
  const { info = {} } = props;
  const methods = info.args ? JSON.parse(info.args) : [];
  return (
    <Descriptions className={styles.outerLeft}>
      <Descriptions.Item label="参数信息" className={styles.originHeader}>
        <div className={styles.parameters} style={{ marginTop: -18 }}>
          <div className={styles.paramTable}>
            <ParamTable list={methods?.fields || []} />
          </div>
        </div>
      </Descriptions.Item>
    </Descriptions>
  );
}
