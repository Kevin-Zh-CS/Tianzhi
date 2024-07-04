import React from 'react';
import ReactECharts from 'echarts-for-react';

const CorrelationAnalysisCharts = props => {
  const { list } = props;
  if (list) {
    const keys = Object.keys(list);
    // prettier-ignore
    const  x = keys;
    // prettier-ignore
    const y = keys;

    const dataList = keys.map((item, index) => {
      const arr = Object.values(list[item]);
      const itemData = arr.map((li, i) => [index, i, li]);
      return itemData;
    });
    const data = dataList.flat();

    const option = {
      color: '#5470c6',
      tooltip: {},
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
      },
      visualMap: {
        min: -1,
        max: 1,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        // orient: 'vertical',
        // right: 0,
        // top: 'center',
        inRange: {
          color: ['#E6F1FB', '#0076d9'],
        },
      },
      series: [
        {
          type: 'heatmap',
          coordinateSystem: 'cartesian2d',
          data,
          // label: {
          //   show: true,
          // },
          itemStyle: {
            color: '#aaa',
            borderColor: '#fff',
          },
        },
      ],
    };

    return (
      <div className="canvasContainerChart">
        <ReactECharts option={option} style={{ width: 600, height: 480 }} />
      </div>
    );
  }
  return null;
};

export default CorrelationAnalysisCharts;
