import React, { useState, useEffect } from 'react';
import NewPage from '@/components/NewPage';
import { Spin, Tooltip } from 'quanta-design';
import styles from './index.less';
import ProjectInfo from '@/pages/Qfl/sponsor/project/componments/ProjectInfo';
import ItemTitle from '@/components/ItemTitle';
import ProjectStep from '../../componments/ProjectStep';
import ProjectCanvas from './componments/ProjectCanvas';
import { getProjectInfo } from '@/services/qfl';
// import useAuth from '@/pages/Manage/Inner/component/useAuth';

export default function QflSponsorDetail(props) {
  const { location } = props;
  const {
    query: { projectId },
  } = location;
  const [current, setCurrent] = useState(1);
  const [info, setInfo] = useState({});
  const [height, setHeight] = useState(300);
  const [prepareTotal, setPrepareTotal] = useState(0);
  const [resolveTotal, setResolveTotal] = useState(0);
  const [specialTotal, setSpecialTotal] = useState(0);
  const [safeTotal, setSafeTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [queueVisible, setQueueVisible] = useState(false);
  // const auth = useAuth({ ns_id: projectId });
  const auth = [
    'qfl_restart_task',
    'add-members',
    'qfl_delete_task',
    'qfl_stop_task',
    'qfl_create_task',
    'qfl_add_participant',
    'qfl_remove_participant',
    'qfl_remove_data',
    'qfl_add_data',
    'qfl_modify_project',
    'qfl_modify_project',
    'add-members',
  ];

  const initData = async () => {
    const data = await getProjectInfo({ project_id: projectId });
    setInfo(data);
  };

  useEffect(() => {
    initData();
  }, []);

  const stepData = [
    {
      title: `数据准备（${prepareTotal}）`,
      content: '各方数据协同加密预处理',
      key: 'data_1',
    },
    {
      title: `数据预处理（${resolveTotal}）`,
      content: '为联邦学习准备各方数据',
      key: 'data_2',
    },
    {
      title: `特征工程（${specialTotal}）`,
      content: '协同各方数据提取模型特征',
      key: 'data_3',
    },
    {
      title: `安全建模（${safeTotal}）`,
      content: '多方数据迭代完成模型训练',
      key: 'data_4',
    },
  ];

  const setParentHeight = value => {
    setHeight(value);
  };

  const handleCancel = () => {
    setQueueVisible(false);
  };
  const handleVisible = () => {
    setQueueVisible(true);
  };

  return (
    <div style={{ minWidth: 1200 }} className={styles.pageProject}>
      <NewPage title="项目详情" noContentLayout>
        <Spin spinning={loading}>
          <ProjectInfo {...info} auth={auth} loadData={initData} />
          <div
            className={`${styles.canvasPage} container-card`}
            style={{ marginTop: 12, minWidth: 1200, paddingBottom: 24, height: '100%' }}
          >
            <ItemTitle
              title="项目看板"
              extra={
                <Tooltip overlayInnerStyle={{ width: 80 }} title="任务队列">
                  <span className={styles.queue} onClick={handleVisible}>
                    <i className="iconfont iconliebiaoshitu" />
                  </span>
                </Tooltip>
              }
            />
            <div className={styles.canvasProject} style={{ height }}>
              <div>
                <ProjectStep current={current} stepData={stepData} />
                <ProjectCanvas
                  auth={auth}
                  queueVisible={queueVisible}
                  setCancel={handleCancel}
                  setLoading={setLoading}
                  projectId={projectId}
                  setHeight={setParentHeight}
                  setPrepareTotal={setPrepareTotal}
                  setResolveTotal={setResolveTotal}
                  setSpecialTotal={setSpecialTotal}
                  setSafeTotal={setSafeTotal}
                  setCurrent={setCurrent}
                  isPartner={0}
                  {...info}
                />
              </div>
            </div>
          </div>
        </Spin>
      </NewPage>
    </div>
  );
}
