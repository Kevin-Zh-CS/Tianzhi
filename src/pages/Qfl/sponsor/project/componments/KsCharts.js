import React from 'react';
import ReactECharts from 'echarts-for-react';

const KsCharts = props => {
  const { list } = props;
  if (list) {
    const { ks_curve = [] } = list;
    const x = ks_curve.map(item => item.index);
    const y1 = ks_curve.map(item => item.tpr);
    const y2 = ks_curve.map(item => item.fpr);
    const option = {
      title: {
        text: 'K-S',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['tpr', 'fpr'],
      },
      xAxis: {
        type: 'category',
        data: x,
      },
      yAxis: {
        name: 'fpr/tpr',
        nameLocation: 'end',
        type: 'value',
      },
      series: [
        {
          name: 'tpr',
          type: 'line',
          step: 'start',
          data: y1,
          itemStyle: {
            color: '#0076d9',
          },
        },
        {
          name: 'fpr',
          type: 'line',
          step: 'start',
          data: y2,
          itemStyle: {
            color: '#08cb94',
          },
          tooltip: {
            backgroundColor: '#08cb94',
          },
        },
      ],
    };

    return <ReactECharts option={option} className="canvasContainer" />;
  }
  return null;
};

export default KsCharts;
