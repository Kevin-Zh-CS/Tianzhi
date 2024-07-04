import React from 'react';
import ReactECharts from 'echarts-for-react';

const RocCharts = props => {
  const { list } = props;
  if (list) {
    const { roc_curve = [] } = list;
    const y = roc_curve.map(item => [item.fpr, item.tpr]);
    const option = {
      title: {
        text: 'ROC',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['tpr'],
      },
      color: '#5470c6',
      xAxis: {
        name: 'fpr',
        nameLocation: 'end',
        type: 'category',
        boundaryGap: false,
        min: 0,
        max: val => val.max + 0.1,
      },
      yAxis: {
        name: 'tpr',
        nameLocation: 'end',
        type: 'value',
      },
      series: [
        {
          name: 'tpr',
          data: y,
          type: 'line',
          areaStyle: {
            color: '#7EA2E6',
          },
        },
      ],
    };

    return <ReactECharts option={option} className="canvasContainer" />;
  }

  return null;
};

export default RocCharts;
