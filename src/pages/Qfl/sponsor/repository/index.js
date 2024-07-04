import React, { useState, useEffect, useRef } from 'react';
import { Button, Icons, Spin } from 'quanta-design';
import NewCheckRepository from '@/components/NewCheckRepository';
import TaskCard from '../../componments/TaskCard';
import CreateProjectModal from '../../componments/CreateProjectModal';
import styles from './index.less';
import { getProjectList } from '@/services/qfl';

const { PlusIcon } = Icons;

const stepData = [
  {
    title: '新建项目',
    content: '为不同类型实务创建项目，通过加密机制进行联合建模',
  },
  {
    title: '添加机构、数据',
    content: '添加参与计算的机构、添加机构相应的数据',
  },
  {
    title: '联邦学习',
    content: '将多方数据进行联邦学习',
  },
];
function QflSponsor() {
  const [newTaskVisible, setNewTaskVisible] = useState(false);
  const [showList, setShowList] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  const getTaskList = async () => {
    setLoading(true);
    try {
      const res = await getProjectList({ page: 1, size: 1000, is_asc: false });
      setShowList(res.project_list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTaskList();
  }, []);

  const BtnAndModal = () => {
    const [visible, setVisible] = useState(false);
    return (
      <div>
        <Button
          style={{ marginTop: 31 }}
          type="primary"
          icon={<PlusIcon fill="#fff" />}
          onClick={() => {
            setVisible(true);
          }}
        >
          新建项目
        </Button>
        <CreateProjectModal
          isNew
          getTaskList={getTaskList}
          visible={visible}
          onCancel={() => {
            setVisible(false);
          }}
        />
      </div>
    );
  };

  const componentLoaded = (
    <Spin spinning={loading}>
      <div className={styles.repositoryWrap}>
        <div className={styles.wrap}>
          <Button
            type="primary"
            icon={<PlusIcon fill="#fff" />}
            onClick={() => setNewTaskVisible(true)}
          >
            新建项目
          </Button>
        </div>
        {showList.map(item => (
          <TaskCard key={item.task_id} {...item} loadData={getTaskList} />
        ))}
        <div ref={ref} />
      </div>
      <CreateProjectModal
        isNew
        getTaskList={getTaskList}
        visible={newTaskVisible}
        onCancel={() => setNewTaskVisible(false)}
      />
    </Spin>
  );

  return (
    <NewCheckRepository
      stepData={stepData}
      stepCurrent={1}
      loading={loading}
      btn={<BtnAndModal />}
      title="我发起的"
      extraTitle="发起项目说明"
      message="发起项目的功能定义：发起联邦学习项目后可邀请其他机构用户共同参与联邦学习模型训练，多机构在满足用户隐私保护、数据安全和政府法规的要求下，进行数据使用和安全建模。"
      hint="你还没有发起联邦学习项目，快去创建吧～"
      list={showList}
      component={componentLoaded}
    />
  );
}

export default QflSponsor;
