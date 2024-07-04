import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { connect } from 'dva';
import { router } from 'umi';
import {
  IconBase,
  Alert,
  Button,
  Icons,
  Divider,
  Modal,
  Dropdown,
  Menu,
  message,
  Tooltip,
} from 'quanta-design';
import Page from '@/components/Page';
import ItemTitle from '@/components/ItemTitle';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import { ReactComponent as SettingIcon } from '@/icons/setting.svg';
import { ReactComponent as ConnectIcon } from '@/icons/connect.svg';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import { ReactComponent as EyeCheckIcon } from '@/icons/eye_check.svg';
import { ReactComponent as LocalDataIcon } from '@/assets/type/local_data.svg';
import lua from '@/assets/type/lua.png';
import { dataTypeIcon, formatTime } from '@/utils/helper';
import {
  DATA_MODEL_STATE,
  DATA_JOIN_TYPE,
  TASK_STATE,
  DATA_STATE_LIST_TAG,
  PERMISSION,
} from '@/utils/enums';
import TaskInfo from './TaskInfo';
import TaskListItem from './components/TaskListItem';
import ManageModal from '../../components/ManageModal';
import styles from './index.less';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import WithLoading from '@/components/WithLoading';

import {
  deployTask,
  partnerDataList,
  partnerList,
  subModelBatchApply,
  partnerDelete,
  partnerDataDelete,
} from '@/services/sponsor';
import { DATA_STATUS, applyTip, deployTip } from '@/pages/Federate/config';

const { PlusIcon } = Icons;

function Task(props) {
  const { dispatch, location, taskInfo, taskDetailList, modelList } = props;
  const { task_status: taskState = 0 } = taskInfo;
  const { taskId } = location.query;
  const [showAlert, setShowAlert] = useState(true);
  const [tmpTaskList, setTmpTaskList] = useState([]);
  const [manageOrgVisible, setManageOrgVisible] = useState(false);
  const [manageDataVisible, setManageDataVisible] = useState(false);
  const chiefModel = useRef(null);
  const taskListWrap = useRef(null);
  const [wrapHeight, setHeight] = useState(0);
  const [modalDataSource, setModalDataSource] = useState([]);
  const [svgList, setSvgList] = useState([]);
  const [totalHeight, setTotalHeight] = useState(480);
  const [svgHeight, setSvgHeight] = useState(150);
  const [activeLine, setActiveLine] = useState('');

  const related_chief_list = modelList.filter(item => item.is_related_chief_model);
  const waiting_chief_list = related_chief_list.filter(
    item =>
      item.data_status === DATA_STATUS.wait_participant_configure ||
      item.data_status === DATA_STATUS.participant_configure_finish,
  );
  const waiting_sub_list = modelList.filter(
    item =>
      item.data_status === DATA_STATUS.wait_participant_configure ||
      item.data_status === DATA_STATUS.participant_configure_finish,
  );

  const fail_sub_list = modelList.filter(
    item =>
      item.data_status === DATA_STATUS.refuse_approval ||
      item.data_status === DATA_STATUS.wait_approval,
  );

  const auth = useAuth({ ns_id: taskId });

  const getTaskInfo = () => {
    dispatch({
      type: 'sponsor/taskInfo',
      payload: taskId,
    });
  };
  const getTaskDetail = () => {
    dispatch({
      type: 'sponsor/taskDetail',
      payload: taskId,
    });
  };
  const getDataList = () => {
    dispatch({
      type: 'sponsor/partnerDataList',
      payload: taskId,
    });
  };
  useEffect(() => {
    getTaskInfo();
    getDataList();
    getTaskDetail();
  }, []);

  useEffect(() => {
    if (taskDetailList && taskDetailList.length === 0) {
      getTaskDetail();
    }
  }, [taskDetailList]);

  const handleDeployTask = async () => {
    await deployTask(taskId);
    await getTaskInfo();
    message.success('部署模型成功！');
  };

  const handleApplyTask = async () => {
    if (waiting_chief_list.length) {
      Modal.info({
        title: '确认将主模型发给参与方审核吗？',
        content: '当前任务所添加的数据需审核主模型，提交后，主模型将发送给数据提供方审核。',
        style: { top: 240 },
        onOk: async () => {
          await subModelBatchApply(taskId);
          await getTaskDetail();
          getDataList();
          message.success('模型提交审核成功！');
          Modal.destroyAll();
        },
        onCancel: () => {
          Modal.destroyAll();
        },
      });
    } else {
      await subModelBatchApply(taskId);
      await getTaskDetail();
      getDataList();
      message.success('模型提交审核成功！');
    }
  };

  const handlePreHeight = index => {
    let s = 0;
    // eslint-disable-next-line
    for (let i = 0; i < index; i++) {
      s +=
        taskDetailList[i]?.task_data_list?.length * 56 +
        (taskDetailList[i]?.task_data_list?.length ? 56 : 68);
    }
    return s;
  };

  const handleInitDataList = () => {
    const list = taskDetailList.map((item, index) => {
      const { task_data_list } = item;
      const childrenList = task_data_list.map((li, i) => {
        const height = handlePreHeight(index) + i * 56 + 32;
        return { ...li, height };
      });
      return {
        ...item,
        task_data_list: childrenList,
      };
    });
    const total = handlePreHeight(taskDetailList.length);
    setTotalHeight(total > 560 ? total : 480);
    setSvgHeight(total > 150 ? total - 56 : 150);
    setSvgList(list);
  };

  useEffect(() => {
    handleInitDataList();
  }, [taskDetailList]);

  useEffect(() => {
    const wrap = taskListWrap.current;
    const wrapDom = wrap.getBoundingClientRect();
    setHeight(wrapDom.height);
  }, [tmpTaskList, taskDetailList]);

  const handleShowOrg = async () => {
    const res = await partnerList(taskId);
    setModalDataSource(res);
    setManageOrgVisible(true);
  };
  const handleShowData = async () => {
    const data = await partnerDataList(taskId);
    setModalDataSource(data);
    setManageDataVisible(true);
  };

  const addMember = () => setTmpTaskList([{ init: true }]);

  return (
    <Page
      title="任务管理"
      extra={
        <div className="alert-trigger-wrap" onClick={() => setShowAlert(!showAlert)}>
          任务管理说明
          <IconBase className={showAlert ? 'up' : 'down'} icon={ArrowsDown} fill="#888888" />
        </div>
      }
      alert={
        showAlert ? (
          <>
            <Alert
              type="info"
              message="发起任务的功能定义：任何用户都可以发起隐私计算任务。数据提供方和数据需求方之间通过加密机制进行参数交换，在满足安全保密的情况下构建虚拟计算模型，使不同机构的异构数据不需出库，数据自身并不移动，将计算结果通过安全聚合的方式在各机构之间进行共享和传递，从而实现数据的点对点安全交换以及“可用不可见”式共享。"
              showIcon
            />
          </>
        ) : null
      }
      noContentLayout
    >
      <TaskInfo {...taskInfo} auth={auth} />
      <div className="container-card" style={{ marginTop: 12 }}>
        <ItemTitle title="任务参与详情" />
        <div className={styles.wrap} style={{ height: wrapHeight + 120 }}>
          <div className={styles.card}>
            <div className={styles.title}>
              参与方（{taskDetailList.length}）
              {auth.includes(PERMISSION.edit) && (
                <IconBase onClick={handleShowOrg} className="hover-style" icon={SettingIcon} />
              )}
            </div>
            {auth.includes(PERMISSION.edit) && (
              <div className={styles.body}>
                <Button onClick={addMember} icon={<PlusIcon />} style={{ height: 40 }}>
                  添加参与方
                </Button>
              </div>
            )}
          </div>
          <div className={styles.card} style={{ marginLeft: 20 }}>
            <div className={styles.title}>
              数据（{modelList.length}）
              {auth.includes(PERMISSION.edit) && (
                <IconBase onClick={handleShowData} className="hover-style" icon={SettingIcon} />
              )}
            </div>
          </div>
          <IconBase icon={ConnectIcon} style={{ marginTop: 14 }} />
          <div className={styles.card} style={{ marginRight: 20 }}>
            <div className={styles.title}>子模型（{modelList.length}）</div>
          </div>
          <div className={styles.card}>
            <div className={styles.title}>主模型</div>
            <div className={styles.body}>
              <Alert
                style={{ margin: '0 -16px' }}
                type="warning"
                message="主模型是描述隐私计算任务要执行的计算逻辑。"
                showIcon
              />
              <div className={styles.chiefModelContainer} style={{ height: svgHeight }}>
                <div ref={chiefModel} className={styles.chiefModel}>
                  <img alt="" src={lua} width={40} height={40} />
                  <span className={styles.modelTitle}>chiefModel</span>
                  <Divider />
                  <div className={styles.modelFooter}>
                    <div
                      onClick={() =>
                        router.push(
                          `/federate/sponsor/editor?taskId=${location.query.taskId}&dataId=${''}`,
                        )
                      }
                      className={`${styles.modelFooterOpt} hover-style`}
                    >
                      <IconBase icon={EyeCheckIcon} className={styles.icon} fill="currentColor" />
                      查看
                    </div>
                    <Divider type="vertical" style={{ height: 22, marginTop: 5 }} />
                    <Dropdown
                      overlay={
                        auth.includes(PERMISSION.edit) || auth.includes(PERMISSION.usage) ? (
                          <Menu>
                            {// eslint-disable-next-line no-nested-ternary
                            !auth.includes(PERMISSION.edit) ? null : taskState ===
                                TASK_STATE.PROCESS && waiting_sub_list.length ? (
                              <Menu.Item onClick={handleApplyTask}>提交审核</Menu.Item>
                            ) : (
                              <Menu.Item disabled>
                                <Tooltip
                                  overlayStyle={{ minWidth: 200 }}
                                  title={applyTip(waiting_sub_list, taskState)}
                                >
                                  提交审核
                                </Tooltip>
                              </Menu.Item>
                            )}
                            {// eslint-disable-next-line no-nested-ternary
                            !auth.includes(PERMISSION.edit) ? null : taskState ===
                              TASK_STATE.PASS ? (
                              <Menu.Item onClick={handleDeployTask}>部署模型</Menu.Item>
                            ) : (
                              <Menu.Item disabled>
                                <Tooltip
                                  title={deployTip(
                                    waiting_sub_list,
                                    fail_sub_list,
                                    modelList,
                                    taskState,
                                  )}
                                >
                                  部署模型
                                </Tooltip>
                              </Menu.Item>
                            )}
                            {// eslint-disable-next-line no-nested-ternary
                            !auth.includes(PERMISSION.usage) ? null : taskState ===
                                TASK_STATE.DEPLOYED || taskState === TASK_STATE.READY ? (
                              <Menu.Item
                                onClick={() =>
                                  router.push(
                                    `/federate/sponsor/editor?taskId=${
                                      location.query.taskId
                                    }&dataId=${''}`,
                                  )
                                }
                              >
                                调用
                              </Menu.Item>
                            ) : (
                              <Menu.Item disabled>
                                <Tooltip title="模型未部署，不能调用">调用</Tooltip>
                              </Menu.Item>
                            )}
                          </Menu>
                        ) : (
                          ''
                        )
                      }
                    >
                      <div className={`${styles.modelFooterOpt} hover-style`}>
                        <IconBase className={styles.icon} icon={MoreIcon} fill="currentColor" />
                        更多
                      </div>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div ref={taskListWrap} className={styles.taskListWrap}>
            <div className={styles.svgWrap}>
              <svg width="40" height={totalHeight} fill="none" xmlns="http://www.w3.org/2000/svg">
                {svgList.map(item =>
                  item.task_data_list.map(li => (
                    <>
                      {li.data_status >= DATA_MODEL_STATE.DATA_SETTED ? (
                        <path
                          strokeWidth="2"
                          d={`M0 ${li.height} h17 v${svgHeight / 2 - li.height + 4} h20`}
                          stroke="#B7B7B7"
                        />
                      ) : null}
                    </>
                  )),
                )}

                {svgList.map(item =>
                  item.task_data_list.map(li => (
                    <>
                      {li.data_status >= DATA_MODEL_STATE.DATA_SETTED &&
                      activeLine === li.data_id ? (
                        <path
                          strokeWidth="2"
                          d={`M0 ${li.height} h17 v${svgHeight / 2 - li.height + 4} h20`}
                          stroke="#0076D9"
                        />
                      ) : null}
                    </>
                  )),
                )}
              </svg>
            </div>
            {taskDetailList
              ? taskDetailList
                  .concat(tmpTaskList)
                  .map((item, index) => (
                    <TaskListItem
                      setActiveLine={setActiveLine}
                      auth={auth}
                      key={item.org_id}
                      setTmpTaskList={setTmpTaskList}
                      index={index}
                      {...item}
                    />
                  ))
              : null}
          </div>
        </div>
      </div>
      <ManageModal
        title="管理参与方"
        visible={manageOrgVisible}
        onCancel={() => setManageOrgVisible(false)}
        columns={[
          {
            title: '参与方角色',
            dataIndex: 'isSponsor',
            key: 'isSponsor',
            render: (val, record, index) => (index ? '参与方' : '发起方'),
          },
          {
            title: '参与方名称',
            dataIndex: 'org_name',
            key: 'org_name',
            render: text => (
              <Tooltip title={text}>
                <div className={styles.txt}>{text}</div>
              </Tooltip>
            ),
          },
          {
            title: '是否添加数据',
            dataIndex: 'data_amount',
            key: 'data_amount',
            render: val => (val ? '是' : '否'),
          },
          {
            title: '数据个数',
            dataIndex: 'data_amount',
            key: 'data_amount',
          },
          {
            title: '添加时间',
            dataIndex: 'added_time',
            key: 'added_time',
            sorter: true,
            render: val => formatTime(val),
          },
          {
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            render: (_, record, index) => (
              <>
                {index && record.data_amount ? <a className="disabled-style">移除</a> : null}
                {index && !record.data_amount ? (
                  <a
                    onClick={() =>
                      Modal.info({
                        title: (
                          <span>
                            确认移除参与方-
                            <span className={styles.modalTitle}>{record.org_name}</span>吗？
                          </span>
                        ),
                        content: '移除后，该参与方添加的数据也将会被移除。',
                        okButtonProps: { danger: true },
                        okText: ' 移除 ',
                        onOk: async () => {
                          await partnerDelete({
                            taskId,
                            orgId: record.org_id,
                          });

                          await handleShowOrg();
                          getTaskInfo();
                          getTaskDetail();
                          message.success('参与方移除成功！');
                        },
                      })
                    }
                  >
                    移除
                  </a>
                ) : null}
              </>
            ),
          },
        ]}
        dataSource={modalDataSource}
      />
      <ManageModal
        title="管理数据"
        visible={manageDataVisible}
        onCancel={() => setManageDataVisible(false)}
        columns={[
          {
            title: '数据名称',
            dataIndex: 'data_name',
            key: 'data_name',
            render: (text, record) => (
              <div className={styles.dataName}>
                {record.initiator_data_type === DATA_JOIN_TYPE.LOCAL_APPKEY ? (
                  record.data_type === 3 ? (
                    <i
                      className={classNames(
                        'iconfont',
                        dataTypeIcon[record.data_type][record.data_format],
                      )}
                    />
                  ) : (
                    <img
                      alt=""
                      src={dataTypeIcon[record.data_type][record.data_format]}
                      width={20}
                      height={20}
                      style={{ marginRight: 8 }}
                    />
                  )
                ) : (
                  <IconBase icon={LocalDataIcon} style={{ marginRight: 8 }} />
                )}
                <Tooltip title={text}>
                  <div className={styles.txt}>{text}</div>
                </Tooltip>
              </div>
            ),
          },
          {
            title: '所属参与方',
            dataIndex: 'org_name',
            key: 'org_name',
            render: text => (
              <Tooltip title={text}>
                <div className={styles.txt}>{text}</div>
              </Tooltip>
            ),
          },
          {
            title: '参与状态',
            dataIndex: 'data_status',
            key: 'data_status',
            render: val => DATA_STATE_LIST_TAG[val % DATA_STATE_LIST_TAG.length],
          },
          {
            title: '添加时间',
            dataIndex: 'added_time',
            key: 'added_time',
            sorter: true,
            render: val => formatTime(val),
          },
          {
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
              <a
                onClick={() =>
                  Modal.info({
                    title: (
                      <span>
                        确认移除数据-<span className={styles.modalTitle}>{record.data_name}</span>
                        吗？
                      </span>
                    ),
                    content: '移除后，该数据关联的子模型也将会被移除。',
                    okButtonProps: { danger: true },
                    okText: ' 移除 ',
                    onOk: async () => {
                      await partnerDataDelete({
                        taskId,
                        dataId: record.data_id,
                      });
                      await handleShowData();
                      getTaskInfo();
                      getTaskDetail();
                      message.success('数据移除成功！');
                    },
                  })
                }
              >
                移除
              </a>
            ),
          },
        ]}
        dataSource={modalDataSource}
      />
    </Page>
  );
}

export default connect(({ sponsor, loading }) => ({
  taskInfo: sponsor.taskInfo,
  taskDetailList: sponsor.taskDetail,
  modelList: sponsor.modelList,
  loading: loading.effects['sponsor/taskInfo'],
}))(WithLoading(Task));
