import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import {
  Alert,
  Icons,
  Descriptions,
  Button,
  Select,
  Input,
  Table,
  Spin,
  message,
  Dropdown,
  Menu,
  IconBase,
  Tooltip,
  Modal,
  Pagination,
} from 'quanta-design';
import { Collapse, Drawer } from 'antd';
import {
  DATA_JOIN_TYPE,
  TASK_STATE,
  DATA_MODEL_STATE,
  MODEL_STATE_TAG_DARK,
  PERMISSION,
} from '@/utils/enums';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import { ReactComponent as ApplyIcon } from '@/icons/apply.svg';
import { ReactComponent as LuaIcon } from '@/icons/lua.svg';
import EditorPad from '@/components/EditorPad';
import styles from './index.less';
import { Prompt } from 'react-router';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import { getLists } from '@/services/importer';
import {
  taskDeploy,
  modelView,
  subModelUpdate,
  modelUpdate,
  subModelApply,
  subModelBatchApply,
  taskTerminate,
} from '@/services/sponsor';
import {
  DATA_STATUS,
  getUsedTime,
  MAIN_STATE_TAG,
  MAIN_TASK_STATUS,
  applyTip,
  deployTip,
} from '@/pages/Federate/config';
import DataDesc from '@/pages/Federate/Sponsor/components/DataDesc';
import { getOrderType } from '@/pages/Share/Platform/config';
import { CaretRightOutlined } from '@ant-design/icons';
import CodeEditor from '@/components/CodeEditor';
import ResultModal from '@/pages/Federate/Sponsor/components/result-model';

const { ArrowLeftIcon, MinusIcon, CloseIcon } = Icons;
let isSave = false;
const { Panel } = Collapse;
function Editor(props) {
  const {
    taskInfo = {},
    dataDetail = {},
    importDataInfo = {},
    appkeyDataDetail = {},
    modelList = [],
    location,
    dispatch = null,
  } = props;
  const { dataType = 0, dataId = '', taskId = '' } = location.query;
  const { task_status: taskState = 0 } = taskInfo;

  const {
    data_name: dataName = '',
    format_desc: formatDesc = '',
    // dataHash = '',
    // data_type: resourceType = '',
    org_name: orgName = '',
    // dataCount = '',
    is_private: isPrivate = 0,
    data_status: status = 0,
    require_format: formatMeta = [],
    approval_refuse_reason: reason = '',
  } = dataDetail;
  const { desc = '', columns = [] } = importDataInfo;
  const chiefModelName = 'chiefModel';
  const [currentModelId, setCurrentModelId] = useState(dataId || taskId);
  const [modelCode, setModelCode] = useState('');
  const [oldCode, setOldCode] = useState('');
  const [luaScript, setLuaScript] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [paramsList, setParamsList] = useState([]);
  const [argsList, setArgsList] = useState([]);
  const [invokeResult, setInvokeResult] = useState('输入参数后，点击“运行模型”计算运行结果');
  const [invokeLog, setInvokeLog] = useState('输入参数后，点击“运行模型”生成运行日志');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState({});
  const [list, setList] = useState({});
  const [pages, setPage] = useState(1);
  const [dataInfo, setDataInfo] = useState({});
  const [resultVisible, setResultVisible] = useState(false);
  // 所有参与方的子模型
  const related_chief_list = modelList.filter(item => item.is_related_chief_model);
  const applying_chief_list = related_chief_list.filter(
    item => item.data_status === DATA_STATUS.wait_approval,
  );
  const waiting_chief_list = related_chief_list.filter(
    item =>
      item.data_status === DATA_STATUS.wait_participant_configure ||
      item.data_status === DATA_STATUS.participant_configure_finish,
  );
  // 子模型待完善
  const waiting_sub_list = modelList.filter(
    item =>
      item.data_status === DATA_STATUS.wait_participant_configure ||
      item.data_status === DATA_STATUS.participant_configure_finish,
  );
  // 子模型审核通过
  const success_chief_list = related_chief_list.filter(
    item => item.data_status === DATA_STATUS.pass_approval,
  );

  const fail_sub_list = modelList.filter(
    item =>
      item.data_status === DATA_STATUS.refuse_approval ||
      item.data_status === DATA_STATUS.wait_approval,
  );

  const auth = useAuth({ ns_id: taskId });

  const getData = async (page = 1, size = 5) => {
    const data = await getLists({
      page,
      size,
      namespace: dataInfo.namespace_id,
      data_id: dataInfo.import_data_id,
    });
    setPage(page);
    setList(data);
  };

  useEffect(() => {
    if (drawerVisible && Number(dataType) === DATA_JOIN_TYPE.LOCAL_IMPORT) {
      getData();
    }
  }, [dataInfo, drawerVisible]);

  const handleChange = (current, pageSize) => {
    getData(current, pageSize);
  };

  const viewModel = async item => {
    const { initiator_data_type: type, data_id: id = '' } = item;
    if (dispatch) {
      // 子模型
      if (id) {
        const TYPE = ['', 'sponsorDataDetail', 'sponsorDataDetail', 'partnerDataDetail'];
        dispatch({
          type: `sponsor/${TYPE[type]}`,
          payload: {
            taskId,
            dataId: id,
          },
          callback: res => {
            const info = res || {};
            setModelCode(info.sub_model || '');
            setOldCode(info.sub_model || '');
            setDataInfo(info);
            if (Number(type) === DATA_JOIN_TYPE.LOCAL_APPKEY) {
              dispatch({
                type: 'datasharing/dataDetail',
                payload: { dataId: info.did },
                callback: () => setLoading(false),
              });
            } else if (Number(type) === DATA_JOIN_TYPE.LOCAL_IMPORT) {
              dispatch({
                type: 'importer/dataInfo',
                payload: {
                  dataId: info.import_data_id,
                  namespace: info.namespace_id,
                },
                callback: () => setLoading(false),
              });
            }
            setLoading(false);
          },
        });
      } else {
        // 主模型
        const res = await modelView(taskId);
        setModelCode(res || '');
        setOldCode(res || '');
        setLoading(false);
      }

      dispatch({
        type: 'sponsor/taskInfo',
        payload: taskId,
      });
    }
  };
  const getList = () => {
    if (dispatch) {
      dispatch({
        type: 'sponsor/partnerDataList',
        payload: taskId,
      });
    }
  };
  useEffect(() => {
    getList();
    viewModel({ data_id: dataId, initiator_data_type: dataType });
  }, []);

  useEffect(() => {
    if (modelList.length > 0 && dataId) {
      const index = (modelList || []).findIndex(item => item.data_id === dataId);
      setSelectedModelIndex(index);
    }
  }, [modelList]);

  useEffect(() => {
    if (luaScript.length && luaScript[selectedIndex]) {
      setParamsList(luaScript[selectedIndex].inputParams);
    } else {
      setParamsList([]);
    }
  }, [luaScript, selectedIndex]);

  const hanldeInputParmas = (e, idx) => {
    argsList[idx] = e.target.value;
    setArgsList(argsList);
  };

  const handleApplyChiefModal = async (params, isAlert) => {
    await modelUpdate(params);
    getList();
    viewModel({ data_id: dataId, initiator_data_type: dataType });
    if (!isAlert) {
      message.success('模型保存成功！');
    }
  };

  const handleChiefModal = async (params, isAlert) => {
    if (oldCode && success_chief_list.length) {
      Modal.info({
        title: '是否保存当前正在编辑的内容？',
        content: '保存后，已通过审核的模型需要重新提交审核。',
        style: { top: 240 },
        onOk: async () => {
          await handleApplyChiefModal(params);
          Modal.destroyAll();
        },
        onCancel: () => {
          Modal.destroyAll();
        },
      });
    } else {
      await handleApplyChiefModal(params, isAlert);
    }
  };

  const loadSubModel = async (params, item) => {
    await subModelUpdate(params);
    isSave = true;
    getList();
    viewModel(item);
    message.success('模型保存成功！');
  };
  const handleUpdateModel = async item => {
    if (modelCode !== oldCode) {
      const params = { taskId, modelCode };
      if (dataId) {
        params.dataId = dataId;
        if (modelList[selectedModelIndex]?.data_status === DATA_STATUS.pass_approval) {
          Modal.info({
            title: '是否保存当前正在编辑的内容？',
            content: '保存后，已通过审核的模型需要重新提交审核。',
            style: { top: 240 },
            onOk: async () => {
              await loadSubModel(params, item);
              Modal.destroyAll();
            },
            onCancel: () => {
              Modal.destroyAll();
            },
          });
        } else {
          await loadSubModel(params, item);
        }
      } else {
        await handleChiefModal(params, true);
      }
    }
  };
  const clickUpdateModel = async () => {
    if (modelCode !== oldCode) {
      const params = { taskId, modelCode };
      if (dataId) {
        params.dataId = dataId;
        await loadSubModel(params, { data_id: dataId, initiator_data_type: dataType });
      } else {
        await handleChiefModal(params);
        isSave = true;
      }
    }
  };
  const handleResetModel = () => {
    setResult({});
    setInvokeResult('输入参数后，点击“运行模型”计算运行结果');
    setInvokeLog('输入参数后，点击“运行模型”生成运行日志');
  };
  const handleChangeModel = async (item = {}, i = 0) => {
    const { initiator_data_type: type = 0, data_id: id = '' } = item;
    setSelectedModelIndex(i);
    if ((id && id === currentModelId) || (id === '' && currentModelId === taskId)) return;
    handleResetModel();
    await handleUpdateModel(item);
    setCurrentModelId(id || taskId);
    router.replace(`/federate/sponsor/editor?dataType=${type}&taskId=${taskId}&dataId=${id}`);
    viewModel(item);
  };
  const handleStopModel = async () => {
    await taskTerminate(taskId);
    handleResetModel();
    setRunning(false);
  };
  const handleRunModel = () => {
    if (dataId) {
      // TODO: 发起方只能 mock 执行子模型，暂未实现
      // dispatch({
      //   type: 'sponsor/subModelInvoke',
      //   payload: {
      //     taskId,
      //     dataId,
      //     modelCode,
      //     funName: luaScript[selectedIndex].funName,
      //     args: argsList,
      //   },
      //   callback: res => setInvokeResult(res.data),
      // });
    } else {
      setRunning(true);
      setResult({});
      setInvokeResult('模型运行中...');
      setInvokeLog('模型运行中...');
      dispatch({
        type: 'sponsor/taskInvoke',
        payload: {
          taskId,
          modelCode,
          funName: luaScript[selectedIndex]?.funName,
          args: argsList,
          isMock: true,
        },
        callback: res => {
          setRunning(false);
          if (res.code === 0) {
            const response = res.data;
            setInvokeResult(
              response.result
                ? JSON.stringify(JSON.parse(response.result), null, 2)
                : response.err_msg,
            );
            setResult(response);
            setInvokeLog(response.logs);
          } else if (res.code === 12008) {
            handleResetModel();
            message.success('计算终止成功！');
          } else {
            message.error(res.message);
          }
        },
      });
    }
  };

  const applyAllTask = async () => {
    await subModelBatchApply(taskId);
    message.success('审核提交成功！');
    getList();
  };

  const loadAllModal = async () => {
    await applyAllTask();
    message.success('模型提交审核成功！');
    getList();
    viewModel({ data_id: dataId, initiator_data_type: dataType });
  };

  const handleApplyTask = async () => {
    if (taskState === MAIN_TASK_STATUS.wait) {
      if (waiting_chief_list.length) {
        Modal.info({
          title: '确认将主模型发给参与方审核吗？',
          content: '当前任务所添加的数据需审核主模型，提交后，主模型将发送给数据提供方审核。',
          style: { top: 240 },
          onOk: async () => {
            await loadAllModal();
            Modal.destroyAll();
          },
          onCancel: () => {
            Modal.destroyAll();
          },
        });
      } else if (waiting_sub_list.length) {
        await loadAllModal();
      }
    }
  };
  const handleDeployTask = async () => {
    await taskDeploy(taskId);
    dispatch({
      type: 'sponsor/taskInfo',
      payload: taskId,
    });
    message.success('模型部署成功！');
  };

  const loadApplySub = async item => {
    await subModelApply({
      taskId,
      dataId: item.data_id,
    });
    message.success('子模型提交审核成功！');
    getList();
    viewModel(item);
  };
  const handleApplySubModel = async item => {
    if (modelCode.length) {
      if (item.data_status !== 8 && item.data_status !== 9) {
        if (item.is_related_chief_model) {
          Modal.info({
            title: '确认将主模型发给参与方审核吗？',
            content: '当前任务所添加的数据需审核主模型，提交后，主模型将发送给数据提供方审核。',
            style: { top: 240 },
            onOk: async () => {
              await loadApplySub(item);
              Modal.destroyAll();
            },
            onCancel: () => {
              Modal.destroyAll();
            },
          });
        } else {
          await loadApplySub(item);
        }
      }
    } else {
      message.error('请勿提交空模型！');
    }
  };

  const handleSave = async path => {
    isSave = true;
    const params = { taskId, modelCode };
    if (dataId) {
      params.dataId = dataId;
      await subModelUpdate(params);
    } else {
      await modelUpdate(params);
    }

    message.success('模型保存成功！');
    router.replace({
      pathname: path.pathname,
      query: { taskId },
    });
  };

  const closeModalSave = async path => {
    await handleSave(path);
  };

  const showModalSave = path => {
    Modal.info({
      title: '确认离开当前正在编辑的页面吗？',
      content: '若不保存，当前正在编辑的内容将丢失。',
      okText: '保存',
      cancelText: '不保存',
      style: { top: 240 },
      closable: true,
      closeIcon: <CloseIcon fill="#888" />,
      onOk: () => closeModalSave(path),
      onCancel: e => {
        if (!e.triggerCancel) {
          isSave = true;
          router.replace({
            pathname: path.pathname,
            query: { taskId },
          });
        }
        Modal.destroyAll();
      },
    });
  };

  const handlePrompt = path => {
    if (!isSave && !path.pathname.startsWith('/federate/sponsor/editor') && modelCode !== oldCode) {
      showModalSave(path);
      return false;
    }
    return true;
  };

  const handleSaveModel = value => {
    isSave = false;
    setModelCode(value);
  };

  const getTable = table => (
    <Table
      columns={[
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '类型',
          dataIndex: 'type',
          key: 'type',
        },
        {
          title: '示例值',
          dataIndex: 'example',
          key: 'example',
          render: text => text || '-',
        },
        {
          title: '描述',
          dataIndex: 'desc',
          key: 'desc',
          render: text => text || '-',
        },
      ]}
      dataSource={table}
      pagination={false}
      style={{ width: 415 }}
      scroll={{ x: 450 }}
      emptyTableText={<div style={{ color: 'rgba(255, 255, 255, 0.3)' }}>暂无数据</div>}
    />
  );
  const methods = appkeyDataDetail?.args ? JSON.parse(appkeyDataDetail.args) : {};
  const disabledSave =
    (dataId && modelList[selectedModelIndex]?.data_status === DATA_STATUS.wait_approval) ||
    (!dataId && applying_chief_list.length > 0);

  return (
    <div className={styles.editorWrap}>
      {loading && (
        <div className={styles.spin}>
          <Spin />
        </div>
      )}
      <Prompt message={handlePrompt} />
      <div className={styles.iconCenter}>
        <div className={styles.title}>
          <ArrowLeftIcon
            onClick={() => router.goBack()}
            fill="#FFF"
            style={{ fontSize: 24, marginRight: 8 }}
          />
          <span>{taskInfo.name}</span>
          <span style={{ marginLeft: 14 }}>{MAIN_STATE_TAG[taskInfo.task_status]}</span>
        </div>
        <div className={styles.rightIcon}>
          <Tooltip
            overlayStyle={{ minWidth: 110 }}
            title={
              taskState === MAIN_TASK_STATUS.wait && waiting_sub_list.length
                ? '一键提交审核'
                : applyTip(waiting_sub_list, taskState)
            }
          >
            <span
              className={
                taskState === MAIN_TASK_STATUS.wait && waiting_sub_list.length
                  ? styles.applyIcon
                  : styles.disableApplyIcon
              }
              onClick={handleApplyTask}
            >
              <IconBase icon={ApplyIcon} fill="currentColor" />
            </span>
          </Tooltip>
          <Tooltip
            overlayStyle={{ minWidth: 198 }}
            placement="topRight"
            title={
              taskState === MAIN_TASK_STATUS.wait_deploy
                ? ''
                : deployTip(waiting_sub_list, fail_sub_list, modelList, taskState)
            }
          >
            <Button
              className={styles.button}
              ghost
              onClick={handleDeployTask}
              disabled={taskInfo.task_status !== MAIN_TASK_STATUS.wait_deploy}
            >
              部署模型
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.left}>
          <div className={styles.title}>模型目录</div>
          <div className={styles.subTitle}>主模型</div>
          <div
            onClick={handleChangeModel}
            className={`${styles.modelName} hover-style ${
              currentModelId === taskId ? styles.active : ''
            }`}
          >
            <IconBase icon={LuaIcon} fill="currentColor" />
            <span style={{ marginLeft: 6 }}>{chiefModelName}</span>
            {!auth.includes(PERMISSION.edit) ? null : (
              <Dropdown
                overlayClassName={styles.darkDropdown}
                overlay={
                  <Menu>
                    {taskState === TASK_STATE.PROCESS && waiting_sub_list.length ? (
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
                    <Menu.Item
                      disabled={taskState !== MAIN_TASK_STATUS.wait_deploy}
                      onClick={handleDeployTask}
                    >
                      <Tooltip
                        overlayStyle={{ minWidth: 200 }}
                        title={
                          taskState === MAIN_TASK_STATUS.wait_deploy
                            ? ''
                            : deployTip(waiting_sub_list, fail_sub_list, modelList, taskState)
                        }
                      >
                        部署模型
                      </Tooltip>
                    </Menu.Item>
                  </Menu>
                }
                placement="bottomRight"
              >
                <span
                  style={{ position: 'absolute', right: 12 }}
                  onClick={e => e.stopPropagation()}
                >
                  <IconBase icon={MoreIcon} />
                </span>
              </Dropdown>
            )}
          </div>
          <div className={styles.subTitle}>子模型</div>
          {modelList.map((item, i) => (
            <div
              onClick={() => handleChangeModel(item, i)}
              className={`${styles.modelName} hover-style ${
                currentModelId === item.data_id ? styles.active : ''
              }`}
            >
              <IconBase icon={LuaIcon} fill="currentColor" />
              <span style={{ marginLeft: 6 }}>{item.sub_model_name}</span>
              <span style={{ marginLeft: 8 }}>{MODEL_STATE_TAG_DARK[item.data_status]}</span>
              {!auth.includes(PERMISSION.edit) ? null : (
                <Dropdown
                  overlayClassName={styles.darkDropdown}
                  overlay={
                    <Menu>
                      <Menu.Item
                        disabled={item.data_status >= 6}
                        onClick={() => handleApplySubModel(item)}
                      >
                        <Tooltip
                          overlayStyle={{ minWidth: 200 }}
                          title={
                            item.data_status === 8
                              ? '当前子模型审核已通过，无需再次提交'
                              : item.data_status === 9
                              ? '本地数据的模型无需提交审核'
                              : item.data_status === 6 || item.data_status === 7
                              ? '当前子模型已审核，无需再次提交'
                              : ''
                          }
                        >
                          <div>提交审核</div>
                        </Tooltip>
                      </Menu.Item>
                    </Menu>
                  }
                  placement="bottomRight"
                >
                  <span
                    style={{ position: 'absolute', right: 12 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <IconBase icon={MoreIcon} />
                  </span>
                </Dropdown>
              )}
            </div>
          ))}
        </div>
        <div className={styles.middle}>
          {status === DATA_MODEL_STATE.MODEL_REJECT && (
            <Alert
              type="error"
              showIcon
              style={{ background: 'rgba(230, 59, 67, 0.1)' }}
              message={
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>驳回理由：{reason}</span>
              }
            />
          )}
          {disabledSave && (
            <Alert
              type="warning"
              showIcon
              style={{ background: 'rgba(255, 173, 50, 0.1)' }}
              message={
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  当前模型正在审核，不可编辑
                </span>
              }
            />
          )}
          <div className={styles.detail}>
            <div>
              {dataId ? (
                <>
                  {modelList[selectedModelIndex]
                    ? modelList[selectedModelIndex].sub_model_name
                    : ''}
                  <span style={{ color: '#888' }}>（{dataName}）</span>
                </>
              ) : (
                chiefModelName
              )}
            </div>
            {auth.includes(PERMISSION.edit) && (
              <div
                onClick={clickUpdateModel}
                className={`${
                  disabledSave ? styles.disabledIconSave : styles.iconSave
                } hover-style`}
              >
                <i className="iconfont icontongyongxing_baocunx" />
                保存
              </div>
            )}
          </div>
          <EditorPad
            setModelCode={value => {
              handleSaveModel(value);
            }}
            modelCode={modelCode}
            setLuaScript={setLuaScript}
            readOnly={!auth.includes(PERMISSION.edit) || disabledSave}
          />
        </div>
        <div className={styles.right}>
          {dataId && (
            <>
              <div className={styles.title}>数据详情</div>
              <DataDesc
                dataType={Number(dataType)}
                appkeyDataDetail={appkeyDataDetail}
                dataName={dataName}
                orgName={orgName}
                isPrivate={isPrivate}
                desc={desc}
                formatDesc={formatDesc}
                detail={{ ...dataDetail, ...dataInfo }}
              />
              <Descriptions labelStyle={{ width: 90 }} style={{ marginLeft: -12 }}>
                <Descriptions.Item
                  contentStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  label="数据详情"
                >
                  <Button
                    size="small"
                    className={styles.button}
                    ghost
                    onClick={() => setDrawerVisible(true)}
                  >
                    查看更多信息
                  </Button>
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
          <div className={styles.title}>方法</div>
          <Select
            placeholder="请选择"
            style={{ width: '100%' }}
            disabled={luaScript.length === 0}
            value={luaScript.length ? luaScript[selectedIndex]?.funName : null}
            onChange={e => setSelectedIndex(e)}
            dropdownClassName={styles.modelSelect}
            notFoundContent={<div className={styles.emptyBox}>暂无方法</div>}
          >
            {luaScript.map(item => (
              <Select.Option key={item.index}>{item.funName}</Select.Option>
            ))}
          </Select>
          <div className={styles.title} style={{ marginTop: 16, marginBottom: 2 }}>
            输入
          </div>
          {paramsList.length ? (
            paramsList.map((item, index) => (
              <>
                <span className={styles.subTitle}>{item}</span>
                <Input placeholder="请输入" onChange={e => hanldeInputParmas(e, index)} />
              </>
            ))
          ) : (
            <div className={styles.emptyParams}>暂无输入</div>
          )}
          <div className={styles.textRight}>
            {/* eslint-disable-next-line no-nested-ternary */}
            {running ? (
              auth.includes(PERMISSION.usage) ? (
                <Button
                  type="primary"
                  disabled={luaScript.length === 0 || dataId}
                  onClick={handleStopModel}
                >
                  终止运行
                </Button>
              ) : null
            ) : auth.includes(PERMISSION.usage) ? (
              <Button
                type="primary"
                disabled={luaScript.length === 0 || dataId}
                onClick={handleRunModel}
              >
                运行模型
              </Button>
            ) : null}
          </div>
          <div className={styles.outputTitle}>
            <span>输出</span>
            <i
              onClick={() => {
                setResultVisible(true);
              }}
              className="iconfont iconxfangxiangxing_qiehuan_zhankai2"
            />
          </div>
          <div className={styles.subTitle}>运行结果</div>
          {invokeResult !== '输入参数后，点击“运行模型”计算运行结果' &&
          invokeResult !== '模型运行中...' ? (
            <div className={styles.outputAlert}>
              {result.err_msg ? (
                <Alert
                  type="error"
                  message={
                    <span> {`模型运行失败！(耗时：${getUsedTime(result.used_time || 0)})`} </span>
                  }
                  showIcon
                />
              ) : (
                <Alert
                  type="success"
                  message={
                    <span> {`模型运行成功！(耗时：${getUsedTime(result.used_time || 0)})`} </span>
                  }
                  showIcon
                />
              )}
            </div>
          ) : null}
          <div className={styles.output}>
            <pre style={{ color: '#b7b7b7' }}>{invokeResult}</pre>
          </div>
          <div className={styles.subTitle}>运行日志</div>
          <div className={styles.output}>
            <pre style={{ color: '#b7b7b7' }}>{invokeLog}</pre>
          </div>
        </div>
      </div>
      <Drawer
        closable={false}
        visible={drawerVisible}
        getContainer={false}
        style={{ position: 'absolute' }}
        width={480}
        mask={false}
        className={styles.drawer}
      >
        <p className={styles.drawerTitle}>数据详情</p>
        <MinusIcon
          className={`${styles.btn} hover-style`}
          onClick={() => setDrawerVisible(false)}
        />

        <DataDesc
          dataType={Number(dataType)}
          appkeyDataDetail={appkeyDataDetail}
          dataName={dataName}
          orgName={orgName}
          isPrivate={isPrivate}
          desc={desc}
          formatDesc={formatDesc}
          detail={{ ...dataDetail, ...dataInfo }}
          isDrawer
        />
        <Descriptions labelStyle={{ width: 90 }}>
          {Number(dataType) === DATA_JOIN_TYPE.LOCAL_APPKEY && (
            <>
              <Descriptions.Item label="共享类型">
                {getOrderType(appkeyDataDetail.order_type)}
              </Descriptions.Item>
              <Descriptions.Item label="数据参数"></Descriptions.Item>
              {appkeyDataDetail.data_type === 3 && (
                <Descriptions.Item>
                  {getTable(JSON.parse(appkeyDataDetail?.args || '{}').fields)}
                </Descriptions.Item>
              )}
              {appkeyDataDetail.data_type === 2 && (
                <Descriptions.Item>
                  <Collapse
                    defaultActiveKey={['0']}
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                  >
                    {(methods || []).map((item, i) => (
                      <Panel key={i.toString()} header={item.name} className={styles.luaPanel}>
                        <div className={styles.parameters}>
                          <div className={styles.intro}>使用说明</div>
                          <div className={styles.sub_intro}>{item.desc || '-'}</div>
                          <div className={styles.intro}>输入参数</div>
                          <div className={styles.paramTable}>{getTable(item?.inputs || [])}</div>
                          <div className={styles.intro}>输出参数</div>
                          <div className={styles.paramTable}>{getTable(item?.outputs || [])}</div>
                          <div className={styles.intro}>请求示例</div>
                          <div className={styles.paramTable} style={{ marginTop: 0 }}>
                            <CodeEditor
                              theme="base16-dark"
                              mode="json"
                              value={
                                (appkeyDataDetail.request_example &&
                                  appkeyDataDetail.request_example[i]) ||
                                ''
                              }
                              placeholder="这是请求示例"
                              readOnly
                            />
                          </div>
                        </div>
                      </Panel>
                    ))}
                  </Collapse>
                </Descriptions.Item>
              )}
              {appkeyDataDetail.data_type === 1 && (
                <>
                  <Descriptions.Item>
                    <Collapse
                      defaultActiveKey={['0']}
                      expandIcon={({ isActive }) => (
                        <CaretRightOutlined rotate={isActive ? 90 : 0} />
                      )}
                    >
                      <Panel key="0" header="请求参数（Headers）">
                        <div className={styles.parameters}>
                          <div className={styles.intro}>使用说明</div>
                          <div className={styles.sub_intro}>
                            {(methods.headers && methods.headers.desc) || '-'}
                          </div>
                          <div className={styles.intro}>输入参数</div>
                          <div className={styles.paramTable}>
                            {getTable(methods.headers?.headers || [])}
                          </div>
                        </div>
                      </Panel>
                      <div className={styles.myspace}></div>

                      <Panel key="1" header="请求参数（Query）">
                        <div className={styles.parameters}>
                          <div className={styles.intro}>使用说明</div>
                          <div className={styles.sub_intro}>
                            {(methods.headers && methods.headers.desc) || '-'}
                          </div>
                          <div className={styles.intro}>输入参数</div>
                          <div className={styles.paramTable}>
                            {getTable(methods.queries?.query_strings || [])}
                          </div>
                        </div>
                      </Panel>
                      <div className={styles.myspace}></div>

                      <Panel key="3" header="请求参数（Body）">
                        <div className={styles.parameters}>
                          <div className={styles.intro}>使用说明</div>
                          <div className={styles.sub_intro}>
                            {(methods.body && methods.body.desc) || '-'}
                          </div>
                          <div className={styles.paramTable}>
                            <div className={styles.codeWrap}>
                              <CodeEditor
                                theme="base16-dark"
                                value={(methods.body && methods.body.body) || '-'}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                      </Panel>
                    </Collapse>
                  </Descriptions.Item>
                  <Descriptions.Item label={<div className={styles.introTitle}>输出参数</div>} />
                  <Descriptions.Item>
                    <div className={styles.parameters} style={{ marginTop: -13 }}>
                      <div className={styles.paramTable}>
                        {getTable(methods.rets?.req_response || [])}
                      </div>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="请求示例" />
                  <Descriptions.Item>
                    <div className={styles.paramTable} style={{ marginTop: 0 }}>
                      <CodeEditor
                        theme="base16-dark"
                        mode="json"
                        value={methods.example || ''}
                        placeholder="这是请求示例"
                      />
                    </div>
                  </Descriptions.Item>
                </>
              )}
            </>
          )}
          {Number(dataType) === DATA_JOIN_TYPE.LOCAL_IMPORT && (
            <>
              <Descriptions.Item label="数据参数"></Descriptions.Item>
              <Descriptions.Item>
                <Table
                  className={styles.drawerTable}
                  columns={columns}
                  dataSource={list.records || []}
                  pagination={false}
                  style={{ width: 415 }}
                  scroll={{ x: 450 }}
                />
                <div className="overflowPagination">
                  <Pagination
                    total={list.total}
                    pageSize={5}
                    simple
                    current={pages}
                    onChange={handleChange}
                  />
                </div>
              </Descriptions.Item>
            </>
          )}
          {Number(dataType) === DATA_JOIN_TYPE.INVITED && (
            <>
              <Descriptions.Item label="数据参数"></Descriptions.Item>
              <Descriptions.Item>
                <Table
                  className={styles.drawerTable}
                  columns={[
                    {
                      title: '名称',
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: '类型',
                      dataIndex: 'type',
                      key: 'type',
                    },
                    {
                      title: '示例值',
                      dataIndex: 'example',
                      key: 'example',
                    },
                    {
                      title: '描述',
                      dataIndex: 'desc',
                      key: 'desc',
                    },
                  ]}
                  dataSource={formatMeta}
                  pagination={false}
                  emptyTableText={<div style={{ color: 'rgba(255, 255, 255, 0.3)' }}>暂无数据</div>}
                  style={{ width: 415 }}
                  scroll={{ x: 450 }}
                />
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Drawer>
      <ResultModal
        result={result}
        visible={resultVisible}
        invokeResult={invokeResult}
        invokeLog={invokeLog}
        onCancel={() => setResultVisible(false)}
      />
    </div>
  );
}

export default connect(({ sponsor, importer, datasharing }) => ({
  taskInfo: sponsor.taskInfo,
  modelList: sponsor.modelList,
  dataDetail: sponsor.dataDetail,
  importDataInfo: importer.dataInfo,
  appkeyDataDetail: datasharing.dataDetail,
}))(Editor);
