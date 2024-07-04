import React from 'react';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/chart/pie';
import { CHART_COLOR } from '@/utils/enums';

// import styles from './index.less';

export const DoughnutColor = ['#007FE6', '#B4B4B4'];

class DoughnutChart extends React.Component {
  constructor() {
    super();
    this.state = {};
    // this.echarts_react = React.createRef()
  }

  getOption = () => {
    const {
      data = [],
      unit = '',
      right = '-50%',
      top = '0',
      showLegend = true,
      showTitle = false,
      showDataLabel = true,
      color = CHART_COLOR.hex,
      decimal,
      radius = ['80%', '100%'],
    } = this.props;
    let total = data.reduce((acc, curr) => acc + Number(curr.value), 0);
    let usage = 0;
    if (data.filter(item => item.name === '已使用').length > 0 && total !== 0) {
      usage = ((data.filter(item => item.name === '已使用')[0].value * 100) / total).toFixed(2);
    }

    if (decimal) total = total.toFixed(2);
    return {
      color,
      title: {
        show: showTitle,
        text: '数据发布量趋势',
        textStyle: {
          fontSize: 14,
          color: '#292929',
          fontFamily: 'PingFangSC-Regular',
        },
        left: '28',
      },
      legend: {
        show: showLegend === true,
        orient: 'vertical',
        top: 'middle',
        itemWidth: 6,
        itemHeight: 6,
      },
      tooltip: {
        show: true,
        formatter: params => `${params.data.name}：${params.value}${unit}`,
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius,
          avoidLabelOverlap: false,
          right,
          top,
          // top:'50%',
          emphasis: {
            label: {
              show: false,
              fontSize: '10',
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: data.map((d, i) => ({
            ...d,
            label:
              i === 0 && showDataLabel
                ? {
                    show: true,
                    position: 'center',
                    formatter: `{title|使用率}\n{value|${usage}%}`,
                    rich: {
                      title: {
                        color: '#888888',
                        fontSize: 14,
                        fontFamily: 'PingFangSC-RegularIN Alternate Bold',
                        // fontWeight: 'bold',
                      },
                      value: {
                        color: '#007FE6',
                        fontSize: 18,
                        height: 30,
                        // padding: [6, 0, 0, 0],
                      },
                    },
                  }
                : { show: false },
          })),
          animation: false,
        },
      ],
    };
  };

  // handleMouseOver = params => {
  //   const {current} = this.echarts_react
  //   if (!current) return
  //   console.log(params, current.getEchartsInstance().getOption())
  //   const option = {series: [{data: [{label: {}}]}]}
  //   // option.series[0].data[params.dataIndex].label = {}
  // }

  render() {
    const { height = 100 } = this.props;
    return (
      <div>
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
