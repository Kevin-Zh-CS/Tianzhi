import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Button } from 'quanta-design';
import TaskQueue from '../TaskQueue';
import TaskCreate from '../TaskCreate';
import styles from './index.less';
import title from '@/assets/riskControl/taskConfig/title.png';
import LoopDetailModal from '@/pages/Federate/Application/RiskControl/components/LoopDetailModal';
import SingleDetailModal from '@/pages/Federate/Application/RiskControl/components/SingleDetailModal';

const TaskConfig = props => {
  const {
    dispatch,
    taskQueue,
    queryTask,
    resultVisible,
    loopVisible,
    singleVisible,
    animation,
  } = props;

  const [isNew, setIsNew] = useState(false); // 新建任务
  const [visible, setVisible] = useState(false); // 优化闪屏
  // 轮训相关逻辑
  const [skipVisible, setSkipVisible] = useState(false);
  const [flag, setFlag] = useState(false); // 是否在resultVisible为true时从表单跳转到任务队列
  const timerRef = useRef(null);
  const timerRef2 = useRef(null);

  const _loadData = () => {
    dispatch({
      type: 'riskControl/taskQueue',
      payload: {
        page: 1,
        size: 5,
        isUpdate: true,
      },
      callback: res => {
        setIsNew(!res?.list[0]);
        setVisible(true);
        // 如果有正在查询的任务，保存该任务，开启动画
        if (res?.list[0]?.task_status === 0) {
          dispatch({
            type: 'riskControl/saveQueryTask',
            payload: res.list[0],
          });
          dispatch({
            type: 'riskControl/saveAnimation',
            payload: true,
          });
        }
      },
    });
  };

  const loadData = async (_page, size, isUpdate, cb) => {
    const action = {
      type: 'riskControl/taskQueue',
      payload: {
        page: _page,
        size,
        isUpdate,
      },
    };
    if (cb) action.callback = res => cb(res);
    dispatch(action);
  };

  const handleLoopQuery = time => {
    // time默认值2S。有动画则2S轮训，没有动画则10S轮训
    clearTimeout(timerRef.current);
    timerRef.current = null;
    // console.log(time, queryTask)
    timerRef.current = setTimeout(async function loopQuery() {
      try {
        if (queryTask.task_status === 0) {
          // 如果上轮有正在执行的任务，不更新队列(仅获取该任务的数据，前十条足够)
          loadData(1, 10, false, res => {
            const _queryTask = res.list.find(item => item.task_id === queryTask.task_id);
            if (_queryTask.task_status === 2) {
              // 特殊处理
              _queryTask.noLoop = true;
              // 如果该任务执行结束，停止轮训，展示跳过动效按钮，等待用户点击跳过动效或动画结束，再开启轮训。
              dispatch({
                type: 'riskControl/saveQueryTask',
                payload: _queryTask,
              });
              clearTimeout(timerRef.current);
              timerRef.current = null;
              setSkipVisible(true);
            } else {
              timerRef.current = setTimeout(loopQuery, 2000);
            }
          });
        } else {
          // 如果上轮没有正在执行的任务，再查一遍
          loadData(1, 1, false, res => {
            if (
              res.list[0].task_id + res.list[0].job_id + res.list[0].task_status !==
              taskQueue[0].task_id + taskQueue[0].job_id + taskQueue[0].task_status
            ) {
              // 如果队列数据发生了变化，更新队列和查询信息
              loadData(1, taskQueue.length, true, _res => {
                dispatch({ type: 'riskControl/info' });
                if (_res?.list[0]?.task_status === 0) {
                  // 如果有正在查询的任务，保存该任务，开启动画
                  dispatch({
                    type: 'riskControl/saveQueryTask',
                    payload: _res.list[0],
                  });
                  dispatch({
                    type: 'riskControl/saveAnimation',
                    payload: true,
                  });
                } else {
                  // 如果没有正在查询的任务，重新开始轮训
                  dispatch({
                    type: 'riskControl/saveQueryTask',
                    payload: { ...queryTask, noLoop: false },
                  });
                }
              });
            } else {
              timerRef.current = setTimeout(loopQuery, 5000);
            }
          });
        }
      } catch (e) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, time);
  };

  useEffect(() => {
    _loadData();
    return () => {
      // 退出页面，重置所有动画相关状态
      clearTimeout(timerRef.current);
      timerRef.current = null;
      clearTimeout(timerRef2.current);
      timerRef2.current = null;
      dispatch({
        type: 'riskControl/saveResultVisible',
        payload: false,
      });
      dispatch({
        type: 'riskControl/saveAnimation',
        payload: false,
      });
      dispatch({
        type: 'riskControl/saveSkipAnimation',
        payload: false,
      });
      dispatch({
        type: 'riskControl/saveQueryTask',
        payload: {},
      });
    };
  }, []);

  useEffect(() => {
    // 轮训
    if (!queryTask.noLoop && !isNew) handleLoopQuery(queryTask.task_status === 0 ? 2000 : 5000);
  }, [taskQueue, queryTask, isNew, 1]);

  useEffect(() => {
    if (resultVisible && !isNew) {
      // 动画结束，重置状态，五秒后开启轮训
      dispatch({
        type: 'riskControl/saveTaskQueueLazyLoad',
        payload: [queryTask].concat(taskQueue.slice(1, taskQueue.length)),
      });
      setSkipVisible(false);
      dispatch({
        type: 'riskControl/saveAnimation',
        payload: false,
      });
      timerRef2.current = setTimeout(
        () => {
          dispatch({
            type: 'riskControl/saveResultVisible',
            payload: false,
          });
          handleLoopQuery(0);
          // 重置flag
          if (flag) setFlag(false);
        },
        flag ? 1000 : 5000,
      );
    }
  }, [resultVisible, flag, isNew]);

  useEffect(() => {
    if (isNew) {
      // 进入表单页
      if (!animation) {
        // 无动画情况下
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      clearTimeout(timerRef2.current);
      timerRef2.current = null;
    }
  }, [isNew, animation]);

  const handleToggleModal = payload => {
    dispatch({
      type: 'riskControl/saveModalInfo',
      payload,
    });
    // 关闭弹窗清空数据
    dispatch({
      type: 'riskControl/resetData',
    });
  };

  return (
    <div className={styles.taskConfig}>
      <img alt="" src={title} className={styles.title} />
      <div className={styles.description}>
        <div>———— 业务说明 ————</div>
        <div>
          隐私计算算法保护您的数据安全，不会暴露您和其他机构的明文数据，您可以查询联盟内短期内频繁开户或同一用户注册多个企业的风险信息。
        </div>
      </div>
      {visible &&
        (taskQueue.length && !isNew ? (
          <>
            <div className={styles.btnAdd}>
              <Button
                type="primary"
                onClick={() => setIsNew(true)}
                icon={<i className="iconfont icontongyongxing_zengjia_morenx" />}
              >
                新建任务
              </Button>
            </div>
            <TaskQueue skipVisible={skipVisible} />
          </>
        ) : (
          <TaskCreate setFlag={setFlag} setIsNew={setIsNew} loadData={_loadData} />
        ))}
      {loopVisible && <LoopDetailModal handleToggleModal={handleToggleModal} />}
      {singleVisible && <SingleDetailModal handleToggleModal={handleToggleModal} />}
    </div>
  );
};

export default connect(({ riskControl }) => ({
  taskQueue: riskControl.taskQueue,
  loopVisible: riskControl.modalInfo.loopVisible,
  singleVisible: riskControl.modalInfo.singleVisible,
  queryTask: riskControl.queryTask,
  animation: riskControl.animation,
  resultVisible: riskControl.resultVisible,
}))(TaskConfig);
