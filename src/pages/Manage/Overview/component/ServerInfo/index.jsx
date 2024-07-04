import React, { useState, useEffect } from 'react';
import { Row, Col } from 'quanta-design';
import ItemTitle from '@/components/ItemTitle';
import { Byte2GB } from '@/utils/helper';
import styles from './index.less';

function Server(props) {
  const { cpu, memory } = props;
  const [cpuUsed, setCpuUsed] = useState(0);
  useEffect(() => {
    if (cpu?.usedPercent?.length) {
      const used = cpu.usedPercent.reduce((acc, val) => acc + val, 0);
      setCpuUsed(parseInt((used / (cpu.usedPercent.length * 100)) * 100, 10));
    }
  }, [cpu]);
  return (
    <div className={styles.serverInfoWrap}>
      <ItemTitle title="服务器信息" />
      <div>
        <Row>
          <Col span={12}>CPU信息</Col>
          <Col span={12}>内存大小</Col>
        </Row>
        <Row style={{ marginTop: 45 }}>
          <Col span={6} style={{ color: '#888888' }}>
            CPU 负载
          </Col>
          <Col span={6}>{cpuUsed}%</Col>
          <Col span={6} style={{ color: '#888888' }}>
            总容量
          </Col>
          <Col span={6}>{Byte2GB(memory.total)}GB</Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Col span={6} style={{ color: '#888888' }}>
            CPU 核数
          </Col>
          <Col span={6}>{cpu.cores}核</Col>
          <Col span={6} style={{ color: '#888888' }}>
            剩余容量
          </Col>
          <Col span={6}>{Byte2GB(memory.total - memory.used)}GB</Col>
        </Row>
      </div>
    </div>
  );
}

export default Server;
