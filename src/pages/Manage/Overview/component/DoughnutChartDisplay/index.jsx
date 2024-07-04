import React from 'react';
import { CHART_COLOR } from '@/utils/enums';
import styles from './index.less';
import DoughnutChart from '../DoughnutChart';

class DoughnutChartDisplay extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { data = [], color = CHART_COLOR.hex, unit, showPercent = false } = this.props;
    const total = data.reduce((acc, curr) => acc + Number(curr.value), 0);
    if (total !== 0) {
      data.map(item => Object.assign(item, { percent: ((item.value * 100) / total).toFixed(2) }));
    }
    return (
      <div className={styles.doughnutChartDisplay}>
        <DoughnutChart {...this.props} showLegend={false} />
        <div className={styles.legendList}>
          {data.map((d, i) => (
            <div className={styles.legend}>
              <div style={{ backgroundColor: color[i] }} className={styles.colorSquare} />
              <div>
                {showPercent ? (
                  <div>
                    <span>{d.name}</span>
                    <span style={{ color: '#E7E7E7', margin: '0 10px' }}>|</span>
                    <span style={{ marginRight: 12 }}>{d.percent}%</span>
                    <span>
                      {d.value}
                      {unit || d.unit}
                    </span>
                  </div>
                ) : (
                  `${d.name}：${d.value}${unit || d.unit}`
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default DoughnutChartDisplay;
