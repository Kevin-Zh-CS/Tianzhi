import React from 'react';
import { DatePicker, Input } from 'quanta-design';
import ButtonGroup from '@/components/ButtonGroup';
import styles from './index.less';

function FilterCard() {
  return (
    <div className={`${styles.fiterWrap} container-card`}>
      <div>
        <span style={{ marginRight: 12 }}>任务名称</span>
        <Input style={{ width: 200 }} placeholder="请输入" />
      </div>
      <div>
        <span style={{ marginRight: 12 }}>发起方</span>
        <Input style={{ width: 200 }} placeholder="请输入" />
      </div>
      <div>
        <span style={{ marginRight: 12 }}>邀请时间</span>
        <DatePicker.RangePicker style={{ width: 320 }} />
      </div>
      <ButtonGroup left="重置" right="查询" />
    </div>
  );
}

export default FilterCard;
