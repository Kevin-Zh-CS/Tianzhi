import React, { useState, useEffect } from 'react';
import ItemTitle from '@/components/ItemTitle';
import { Byte2GB } from '@/utils/helper';
import DoughnutChartDisplay from '../DoughnutChartDisplay';
import LoadingIcon from '../LoadingIcon';
import { DoughnutColor } from '../DoughnutChart';
import styles from './index.less';

function NodeInfo(props) {
  const { disk } = props;
  const [doughnut, setDoughnut] = useState({});
  useEffect(() => {
    setDoughnut({
      unit: 'GB',
      chartType: 'doughnut',
      data: [
        { name: '已使用', value: Byte2GB(disk.total - disk.free) },
        { name: '未使用', value: Byte2GB(disk.free) },
      ],
    });
  }, [disk]);

  return (
    <div className={styles.nodeInfoWrap}>
      <ItemTitle title="磁盘使用情况" extra={doughnut.loading && <LoadingIcon />} />
      <DoughnutChartDisplay color={DoughnutColor} height={135} right="0%" top="0%" {...doughnut} />
    </div>
  );
}

export default NodeInfo;
