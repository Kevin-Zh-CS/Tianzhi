import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Alert, Descriptions, Modal } from 'quanta-design';
import styles from './index.less';

const StatisticsCharts = props => {
  const { visible, onCancel, record = {} } = props;
  const x = Object.keys(record.detail || {});
  const y = Object.values(record.detail || {});
  const option = {
    xAxis: {
      type: 'category',
      data: x,
    },
    yAxis: {
      type: 'value',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none',
      },
    },
    series: [
      {
        data: y,
        type: 'bar',
        color: 'rgba(0, 118, 217, 0.8)',
        showBackground: true,
      },
    ],
  };

  return (
    <Modal
      title="数据分布详情 "
      visible={visible}
      footer={null}
      onCancel={onCancel}
      width={984}
      className="drawerStep"
    >
      <div>
        <Alert
          type="info"
          message="温馨提示：数据预处理结果中的统计信息仅包含数据的统计结果，不会泄漏原始数据。"
          showIcon
        />
        <div className={styles.statisticsItem}>
          <Descriptions column={3}>
            <Descriptions.Item label="字段名称">{record.name}</Descriptions.Item>
            <Descriptions.Item label="样本数量">{record.count}条</Descriptions.Item>
            <Descriptions.Item label="缺失比例">{record.missing_ratio}</Descriptions.Item>
          </Descriptions>
        </div>

        {record.detail ? (
          <div>
            <ReactECharts style={{ width: 900, height: 450 }} option={option} />
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default StatisticsCharts;
