import React from 'react';
import { Descriptions } from 'quanta-design';
import styles from './index.less';
import ParamTable from '@/pages/Manage/component/ParamTable';

export default function OriginDetail(props) {
  const { info = {} } = props;
  const fields = info.args ? JSON.parse(info.args) : {};
  return (
    <Descriptions style={{ marginLeft: -12 }}>
      <Descriptions.Item>
        <div className={styles.myline}></div>
      </Descriptions.Item>
      <Descriptions.Item label="参数信息" style={{ paddingTop: 12 }}>
        <div className={styles.parameters} style={{ marginTop: -18 }}>
          <div className={styles.paramTable}>
            <ParamTable list={fields?.fields || []} />
          </div>
        </div>
      </Descriptions.Item>
    </Descriptions>
  );
}
