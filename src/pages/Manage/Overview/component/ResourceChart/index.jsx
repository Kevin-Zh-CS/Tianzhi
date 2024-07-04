import React from 'react';
import { Row, Col, Tabs } from 'quanta-design';
import BarChart from '../BarChart';
import DoughnutChartDisplay from '../DoughnutChartDisplay';
import styles from './index.less';

const { TabPane } = Tabs;

const DoughnutColor = ['#007FE6', '#E72C24', '#F29E0D', '#13C13E'];
const doughnut = {
  unit: '个',
  chartType: 'doughnut',
  data: [
    { name: '文件', value: 234 },
    { name: '接口', value: 232 },
    { name: '模型', value: 123 },
    { name: '数据源', value: 180 },
  ],
};

class ResourceChart extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    // const { isInner } = this.props;
    return (
      <div className={styles.resourceChartWrap}>
        <Tabs
          defaultActiveKey="1"
          tabBarExtraContent={
            <div className={styles.tabBarExtraContent}>
              <span className={styles.selected}>本周</span>
              <span>本月</span>
              <span>全年</span>
            </div>
          }
          tabBarStyle={{
            padding: '0 26px 0 20px',
            height: 50,
          }}
        >
          <TabPane tab="数据发布量" key="1">
            <Row gutter={[12]}>
              <Col span={15}>
                {/* <div className={styles.chartTitle}>数据发布量趋势</div> */}
                <BarChart style={{ marginTop: 5 }} />
              </Col>
              <Col span={9}>
                <div className={styles.nodeInfoWrap}>
                  <DoughnutChartDisplay
                    showPercent
                    showDataLabel={false}
                    showTitle
                    color={DoughnutColor}
                    height={280}
                    radius={['50%', '65%']}
                    right="-20%"
                    top="0%"
                    {...doughnut}
                  />
                </div>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="数据获取量" key="2">
            内容2
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default ResourceChart;
