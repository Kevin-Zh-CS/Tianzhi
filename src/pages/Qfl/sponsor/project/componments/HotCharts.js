import React from 'react';
import ReactECharts from 'echarts-for-react';

const HotCharts = props => {
  const { list } = props;
  if (list) {
    const { confusion_matrix = {} } = list;
    // prettier-ignore
    const  x = ['0', '1'];
    // prettier-ignore
    const y = ['0', '1'];

    const data = [
      [0, 0, confusion_matrix.tn],
      [1, 0, confusion_matrix.fn],
      [0, 1, confusion_matrix.fp],
      [1, 1, confusion_matrix.tp],
    ];

    const option = {
      title: {
        text: 'Confusion Matrix',
      },
      color: '#5470c6',
      // tooltip: {
      //   position: 'top',
      // },
      xAxis: {
        type: 'category',
        data: x,
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: 'category',
        data: y,
        // splitArea: {
        //   show: true,
        // },
      },
      visualMap: {
        min: 0,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        inRange: {
          color: ['#7EA2E6', '#0076d9'],
        },
      },
      series: [
        {
          type: 'heatmap',
          coordinateSystem: 'cartesian2d',
          data,
          label: {
            show: true,
          },
          itemStyle: {
            color: '#aaa',
            borderColor: '#fff',
          },
        },
      ],
    };

    return <ReactECharts option={option} className="canvasContainer" />;
  }
  return null;
};

export default HotCharts;
