import React, { useEffect, useState } from 'react';
import { Tabs, Spin } from 'quanta-design';
import { STEP_STATUS } from '@/pages/Qfl/config';
import { getQflLogs, getQflLogSize } from '@/services/qfl-sponsor';
import classnames from 'classnames';
import CodeEditor from '@/components/CodeEditor';
import styles from './index.less';

function Logs(props) {
  const { jobId, projectId, isPartner, status, isCurrent } = props;
  const [current, setCurrent] = useState('train');
  const [dataList, setDataList] = useState([]);
  const [dataCode, setDataCode] = useState('暂无数据');
  const [logType, setLogType] = useState('error');
  const [totalList, setTotalList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取日志总数量
  const handleTotal = async () => {
    const data = await getQflLogSize({ project_id: projectId, job_id: jobId });
    setTotalList(data);
  };

  const handleLogs = async (page = 1, type = 'error', isScroll) => {
    setCurrent(page);
    setLoading(true);
    try {
      const param = {
        page,
        size: 1000,
        log_type: type,
        project_id: projectId,
        job_id: jobId,
        caller_type: isPartner ? 1 : 0,
      };
      const data = await getQflLogs(param);
      setDataList(isScroll ? [...dataList, ...data] : data);
      setDataCode(isScroll ? [...dataList, ...data].join('\n') : data.join('\n'));
    } finally {
      setLoading(false);
    }
  };
  // getQflLogs

  const getTotal = key => {
    const item = totalList.filter(li => li.log_type === key);
    return item[0]?.amount || 0;
  };

  const handleScroll = async (editor, datas) => {
    const { top, height } = datas;
    const typeTotal = getTotal(logType);
    const line = editor.lineAtHeight(height);
    if (height - top === 500 && typeTotal > line && line / 1000 + 1 > current) {
      await handleLogs(line / 1000 + 1, logType, 'scroll');
    }
  };

  const handleChangeTabLog = async key => {
    await setLogType(key);
    handleLogs(1, key);
  };

  useEffect(() => {
    if (status === STEP_STATUS.fail || isPartner || isCurrent) {
      handleTotal();
      handleLogs();
    }
  }, [status, isPartner, isCurrent]);

  return (
    <Spin spinning={loading}>
      <div className={styles.stepOneTabs}>
        <Tabs type="card" onChange={handleChangeTabLog}>
          <Tabs.TabPane
            tab={
              <div>
                <span>error</span>
                <span className={classnames(styles.tagBox, styles.errorTag)}>
                  {getTotal('error')}
                </span>
              </div>
            }
            key="error"
          >
            <CodeEditor
              width={300}
              height={500}
              mode="txt"
              value={dataCode}
              readOnly
              placeholder="暂无数据"
              onScroll={handleScroll}
            />
          </Tabs.TabPane>
          {status !== STEP_STATUS.fail ? (
            <>
              <Tabs.TabPane
                tab={
                  <div>
                    <span>warning</span>
                    <span className={classnames(styles.tagBox, styles.warningTag)}>
                      {getTotal('warning')}
                    </span>
                  </div>
                }
                key="warning"
              >
                <CodeEditor
                  width={300}
                  height={500}
                  mode="txt"
                  value={dataCode}
                  readOnly
                  placeholder="暂无数据"
                  onScroll={handleScroll}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <div>
                    <span>info</span>
                    <span className={classnames(styles.tagBox, styles.infoTag)}>
                      {getTotal('info')}
                    </span>
                  </div>
                }
                key="info"
              >
                <CodeEditor
                  width={300}
                  height={500}
                  mode="txt"
                  value={dataCode}
                  readOnly
                  placeholder="暂无数据"
                  onScroll={handleScroll}
                />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <div>
                    <span>debug</span>
                    <span className={classnames(styles.tagBox, styles.debugTag)}>
                      {getTotal('debug')}
                    </span>
                  </div>
                }
                key="debug"
              >
                <CodeEditor
                  width={300}
                  height={500}
                  mode="txt"
                  value={dataCode}
                  readOnly
                  placeholder="暂无数据"
                  onScroll={handleScroll}
                />
              </Tabs.TabPane>
            </>
          ) : null}
        </Tabs>
      </div>
    </Spin>
  );
}

export default Logs;
