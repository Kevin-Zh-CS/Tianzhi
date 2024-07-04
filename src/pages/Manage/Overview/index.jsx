import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Tag, Spin } from 'quanta-design';
import { connect } from 'dva';
import Header from './component/Header';
import NodeInfo from './component/NodeInfo';
import ServerInfo from './component/ServerInfo';
import ItemTitle from '@/components/ItemTitle';
import { getCpu, getDisk, getMemory } from '@/services/bmNode';
import { getPeers } from '@/services/cluster';
import { info } from '@/services/organization';
// import ResourceInfo from './component/ResourceInfo';
// import ResourceChart from './component/ResourceChart';
// import OrgInfo from './component/OrgInfo';
import styles from './index.less';

const NODE_STATE_TAG = [<Tag color="error">离线</Tag>, <Tag color="success">在线</Tag>];

function Overview(props) {
  const [org, setOrg] = useState({});
  const [cpu, setCpu] = useState({});
  const [disk, setDisk] = useState({});
  const [memory, setMemory] = useState({});
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { _loading, dispatch } = props;

  useEffect(() => {
    setLoading(true);
    (async () => {
      const ORG = await info();
      const CPU = await getCpu();
      const DISK = await getDisk();
      const MEM = await getMemory();
      const PEERS = await getPeers(dispatch);
      setOrg(ORG || {});
      setCpu(CPU || {});
      setDisk(DISK || {});
      setMemory(MEM || {});
      setList(PEERS || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className={styles.overviewPage}>
      <Spin spinning={loading} style={{ marginTop: '12px' }}>
        <Header org={org} list={list} />
        <div className={styles.computerWrap}>
          <Row gutter={[12]}>
            <Col span={12}>
              <NodeInfo disk={disk} />
            </Col>
            <Col span={12}>
              <ServerInfo cpu={cpu} memory={memory} />
            </Col>
          </Row>
        </div>
        {/* <ResourceInfo isInner />
        <ResourceInfo />
        <ResourceChart />
        <div className={styles.orgWrap}>
          <Row gutter={[12, 12]}>
            <Col span={12}>
              <OrgInfo title="本机构最新发布数据" />
            </Col>
            <Col span={12}>
              <OrgInfo title="本机构最新获取数据" />
            </Col>
          </Row>
        </div> */}
        <div className={`${styles.computerWrap} container-card`}>
          <ItemTitle title="共享节点详情" />
          <Table
            rowKey="chain_code"
            columns={[
              { title: '节点名称', dataIndex: 'org_name', width: '30%' },
              { title: '节点状态', dataIndex: 'node_status', render: val => NODE_STATE_TAG[val] },
              { title: '节点ID', dataIndex: 'node_id' },
            ]}
            dataSource={list}
            emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
            loading={{
              spinning: !loading && _loading,
            }}
          />
        </div>
      </Spin>
    </div>
  );
}

export default connect(({ global }) => ({
  _loading: global.loading,
}))(Overview);
