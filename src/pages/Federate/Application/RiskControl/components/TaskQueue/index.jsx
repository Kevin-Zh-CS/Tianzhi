import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Button } from 'quanta-design';
import moment from 'moment';
import { debounce } from 'lodash';
import risk2 from '@/assets/riskControl/taskQueue/risk2.png';
import certificated from '@/assets/riskControl/taskQueue/certificated.png';
import styles from './index.less';

const TaskQueue = props => {
  const { dispatch, taskQueue, skipVisible } = props;
  const PERIOD_TYPE = ['日', '个月', '年'];

  const [page, setPage] = useState(1);
  const queueRef = useRef(null);

  useEffect(() => {
    // 懒加载
    const handleQueueScroll = () => {
      if (!queueRef.current) return;
      if (
        queueRef.current.clientHeight + queueRef.current.scrollTop >=
        queueRef.current.scrollHeight - 5
      ) {
        // 当页没满就请求当页
        const _page = taskQueue.length < page * 5 ? page : page + 1;
        dispatch({
          type: 'riskControl/taskQueueLazyLoad',
          payload: {
            page: _page,
            size: 5,
          },
          callback: res => {
            if (res.list.length === 5) {
              setPage(_page);
            }
          },
        });
      }
    };
    const debounceQueue = debounce(handleQueueScroll, 800);
    queueRef.current.addEventListener('scroll', debounceQueue);
    return () => queueRef.current.removeEventListener('scroll', debounceQueue);
  }, [page]);

  const onSkip = () => {
    // 动画结束，展示查询结果
    dispatch({
      type: 'riskControl/saveSkipAnimation',
      payload: true,
    });
    dispatch({
      type: 'riskControl/saveResultVisible',
      payload: true,
    });
  };

  const handleClickRule = item => {
    const payload = {
      taskId: item.task_id,
      jobId: item.job_id,
    };
    if (item.execute_type === 0) {
      payload.singleVisible = true;
    } else {
      payload.loopVisible = true;
      payload.tab = 'taskDetail';
    }
    dispatch({
      type: 'riskControl/saveModalInfo',
      payload,
    });
  };

  const handleClickResult = item => {
    const payload = {
      taskId: item.task_id,
      jobId: item.job_id,
    };
    if (item.execute_type === 0) {
      payload.singleVisible = true;
    } else {
      payload.loopVisible = true;
      payload.tab = 'resultDetail';
    }
    dispatch({
      type: 'riskControl/saveModalInfo',
      payload,
    });
  };

  return (
    <div className={styles.taskQueue}>
      <div className={styles.title}>———— 任务队列 ————</div>
      <div className={styles.scroll} ref={queueRef}>
        <div className={styles.queue}>
          {taskQueue.map(item => (
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                {item.task_type === 1 ? (
                  <>
                    <i className="iconfont iconxian1" />
                    <span>一人多企</span>
                  </>
                ) : (
                  <>
                    <i className="iconfont iconxian" />
                    <span>短期内频繁开户</span>
                  </>
                )}
              </div>
              <div className={styles.rule} onClick={() => handleClickRule(item)}>
                <div className={styles.ruleItem}>
                  <span>{item.execute_type ? '执行周期：' : '时间范围：'}</span>
                  <span>{`${item[!item.execute_type ? 'period_time' : 'cycle_time']}${
                    PERIOD_TYPE[item.period_type]
                  }`}</span>
                </div>
                <div className={styles.ruleItem}>
                  <span>预警阈值：</span>
                  <span>{`>=${item.threshold}`}</span>
                </div>
              </div>
              {item.task_status === 0 && (
                <div className={`${styles.result} ${styles.resultLoading}`}>
                  <p>正在查询，请耐心等待…</p>
                  {skipVisible && (
                    <Button type="primary" onClick={onSkip}>
                      跳过动效
                    </Button>
                  )}
                </div>
              )}
              {item.task_status === 1 && (
                <div className={`${styles.result} ${styles.resultWait}`}>
                  <img alt="" src={risk2} />
                  <span>等待执行</span>
                </div>
              )}
              {(item.task_status === 2 || item.task_status === 3) &&
                (item.job_id ? (
                  <div className={`${styles.result} ${styles.resultDone}`}>
                    <img alt="" src={certificated} />
                    <div className={styles.riskNum}>
                      <span>
                        风险数量：
                        <span className={styles.num}>
                          {String(item.risk_num).replace(/\B(?=(?:\d{3})+\b)/g, ',')}
                        </span>{' '}
                        条
                      </span>
                    </div>
                    <div className={styles.bottom}>
                      <span>{moment(item.query_time).format('YYYY-MM-DD HH:mm:ss')}</span>
                      <Button type="text" onClick={() => handleClickResult(item)}>
                        查看详情
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={`${styles.result} ${styles.resultWait}`}>
                    <img alt="" src={risk2} />
                    <span>暂无结果</span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default connect(({ riskControl }) => ({
  taskQueue: riskControl.taskQueue,
}))(TaskQueue);
