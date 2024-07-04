import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Button, Icons } from 'quanta-design';
import NewCheckRepository from '@/components/NewCheckRepository';
import newTask from '@/assets/federate/new_task.png';
import TaskCard from './components/TaskCard';
import CreateTaskModal from './components/CreateTaskModal';
import Page from '@/components/Page';
import styles from './index.less';
import WithLoading from '@/components/WithLoading';

const { PlusIcon } = Icons;

const stepData = [
  {
    title: '新建任务',
    content: '为不同类型事务创建任务，通过加密机制进行参数交换',
  },
  {
    title: '添加机构/数据',
    content: '添加参与计算的机构、添加机构相应的数据',
  },
  {
    title: '编写模型',
    content: '编写子模型和总模型',
  },
];

function Sponsor(props) {
  const { dispatch, taskList, loading } = props;
  const [newTaskVisible, setNewTaskVisible] = useState(false);
  const [modifyTaskVisible, setModifyTaskVisible] = useState(false);
  const [modifyTask, setModifyTask] = useState({});
  const [showList, setShowList] = useState({ task_list: [] });
  const ref = useRef();

  const getTaskList = (pageSize = 100) => {
    dispatch({
      type: 'sponsor/taskList',
      payload: {
        size: pageSize,
      },
      callback: res => {
        setShowList(res);
      },
    });
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
          新建任务
        </Button>
        <CreateTaskModal
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

  const handleModify = item => {
    setModifyTask(item.task_info);
    setModifyTaskVisible(true);
  };

  const componentLoaded = (
    <>
      <div className={styles.repositoryWrap}>
        <div className={styles.wrap}>
          <img alt="" src={newTask} width={115} height={100} />
          <Button
            type="primary"
            icon={<PlusIcon fill="#fff" />}
            onClick={() => setNewTaskVisible(true)}
          >
            新建任务
          </Button>
        </div>
        {showList.task_list.map(item => (
          <TaskCard
            role={showList.role}
            key={item.task_id}
            {...item}
            loadData={getTaskList}
            onModify={() => handleModify(item)}
          />
        ))}
        <div ref={ref} />
      </div>
      <CreateTaskModal
        isNew
        getTaskList={getTaskList}
        visible={newTaskVisible}
        onCancel={() => setNewTaskVisible(false)}
      />
      <CreateTaskModal
        taskId={modifyTask.task_id}
        taskName={modifyTask.name}
        taskDesc={modifyTask.desc}
        taskType={modifyTask.visibility}
        getTaskList={getTaskList}
        visible={modifyTaskVisible}
        onCancel={() => setModifyTaskVisible(false)}
      />
    </>
  );

  return loading ? (
    <Page title="我发起的" noContentLayout></Page>
  ) : (
    <NewCheckRepository
      stepData={stepData}
      stepCurrent={1}
      btn={<BtnAndModal />}
      title="我发起的"
      extraTitle="发起任务说明"
      message="发起任务的功能定义：任何用户都可以发起隐私计算任务。数据提供方和数据需求方之间通过加密机制进行参数交换，在满足安全保密的情况下构建虚拟计算模型，使不同机构的异构数据不需出库，数据自身并不移动，将计算结果通过安全聚合的方式在各机构之间进行共享和传递，从而实现数据的点对点安全交换以及“可用不可见”式共享。"
      hint="你还没有发起隐私计算任务，快去创建吧～"
      list={taskList}
      component={componentLoaded}
    />
  );
}

export default connect(({ sponsor, loading }) => ({
  taskList: sponsor.taskList,
  taskTotal: sponsor.taskTotal,
  loading: loading.effects['sponsor/taskList'],
}))(WithLoading(Sponsor, { skeletonTemplate: 4 }));
