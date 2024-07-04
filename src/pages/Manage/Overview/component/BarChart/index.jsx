import React from 'react';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
// import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/chart/bar';

// import styles from './index.less';

export const DoughnutColor = ['#007FE6', '#B4B4B4'];

class DoughnutChart extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  getOption = () => ({
    title: {
      text: '数据发布量趋势',
      textStyle: {
        fontSize: 14,
        color: '#292929',
        fontFamily: 'PingFangSC-Regular',
      },
      left: '28',
    },
    color: ['#007FE6'],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // 坐标轴指示器，坐标轴触发有效
        type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLabel: {
        color: '#888888',
        padding: [10, 0, 0, 0],
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
        onZero: false,
      },
      axisLabel: {
        color: '#888888',
      },
    },
    series: [
      {
        name: '发布量',
        type: 'bar',
        barWidth: '60%',
        data: [10, 52, 200, 334, 390, 330, 220, 45, 324, 55, 63, 190],
      },
    ],
  });

  render() {
    const { height = 262, style } = this.props;
    return (
      <div style={style}>
        <ReactEchartsCore
          echarts={echarts}
          option={this.getOption()}
          // notMerge={true}
          lazyUpdate
          style={{ height, overflow: 'visible' }}
          // theme={"theme_name"}
          // onChartReady={this.onChartReadyCallback}
          // onEvents={{'mouseover': this.handleMouseOver}}
          // ref={this.echarts_react}
          // opts={}
        />
      </div>
    );
  }
}

export default DoughnutChart;
