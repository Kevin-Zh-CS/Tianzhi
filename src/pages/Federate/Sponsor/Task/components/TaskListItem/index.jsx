import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { router, withRouter } from 'umi';
import classNames from 'classnames';
import Prompt from 'umi/prompt';
import { Button, IconBase, Select, Icons, message, Tooltip, Modal } from 'quanta-design';
import {
  DATA_JOIN_TYPE,
  DATA_MODEL_STATE,
  DATA_STATE_TAG,
  MODEL_STATE_TAG,
  PERMISSION,
} from '@/utils/enums';
import { ReactComponent as ConnectIcon } from '@/icons/connect.svg';
import { ReactComponent as LocalDataIcon } from '@/assets/type/local_data.svg';
import { ReactComponent as WaitDataIcon } from '@/assets/type/wait_data.svg';
import { ReactComponent as LuaIcon } from '@/icons/lua.svg';
import sponsor from '@/assets/federate/sponsor.png';
import participant from '@/assets/federate/participant.png';
import { ReactComponent as ApplyIcon } from '@/icons/apply.svg';
import AddDataModal from '../AddDataModal';
import DataDetailModal from '../DataDetailModal';
import styles from './index.less';
import { partnerAdd, subModelApply, searchTaskOrg } from '@/services/sponsor';
import { getImporterDataInfo } from '@/services/importer';

const { CloseIcon, CheckIcon } = Icons;

const DataCard = props => {
  const {
    taskId,
    activeId = '',
    defaultId = '',
    did,
    data_id: dataId = '',
    data_name: name = '',
    data_status: status = 0,
    initiator_data_type: dataType = 0,
    refuse_invite_reason: reason = '',
    dispatch,
    onCancelActive,
    isSponsor,
  } = props;
  const [visible, setVisible] = useState(false);
  const [dataDetail, setDataDetail] = useState({});
  const handleShowDetail = async () => {
    const TYPE = ['', 'sponsorDataDetail', 'sponsorDataDetail', 'partnerDataDetail'];
    dispatch({
      type: `sponsor/${TYPE[dataType]}`,
      payload: {
        taskId,
        dataId,
      },
      callback: async res => {
        if (dataType === DATA_JOIN_TYPE.LOCAL_APPKEY) {
          dispatch({
            type: 'datasharing/dataDetail',
            payload: { dataId: did },
            callback: data => {
              setDataDetail({ ...res, ...data });
              setVisible(true);
              onCancelActive();
            },
          });
        } else if (dataType === DATA_JOIN_TYPE.LOCAL_IMPORT) {
          const data = await getImporterDataInfo({
            dataId: res.import_data_id,
            namespace: res.namespace_id,
          });
          setDataDetail({ ...res, ...data });
          setVisible(true);
          onCancelActive();
        } else {
          setDataDetail(res);
          setVisible(true);
          onCancelActive();
        }
      },
    });
  };

  return (
    <>
      <div className={styles.connectWrap}>
        <div
          className={
            defaultId === activeId
              ? classNames(styles.cardWrap, styles.activeWrap)
              : styles.cardWrap
          }
          onClick={handleShowDetail}
        >
          <IconBase icon={status < DATA_MODEL_STATE.DATA_SETTED ? WaitDataIcon : LocalDataIcon} />
          <Tooltip title={status === DATA_MODEL_STATE.DATA_REJECT ? `拒绝理由：${reason}` : null}>
            <div className={styles.titleWrap}>
              <div className={styles.title}>{name}</div>
              {DATA_STATE_TAG[status % DATA_STATE_TAG.length]}
            </div>
          </Tooltip>
        </div>
      </div>
      <DataDetailModal
        visible={visible}
        isSponsor={isSponsor}
        status={status}
        dataTypes={dataType}
        onCancel={() => setVisible(false)}
        {...dataDetail}
      />
    </>
  );
};
/*
 * key: 当前 Model 是第几个，用于计算连线高度
 * chiefY: 主模型距视口的高度
 * name: 子模型名称
 * status: 子模型状态
 */
const ModelCard = props => {
  const {
    taskId = '',
    activeId = '',
    defaultId = '',
    data_id: dataId = '',
    sub_model: modelCode = '',
    sub_model_name: name = '',
    data_status: status = 0,
    approval_refuse_reason: reason = '',
    initiator_data_type: dataType = 0,
    is_related_chief_model,
    dispatch,
    auth,
    onMouseEnter,
    onMouseLeave,
  } = props;
  const subModel = useRef(null);
  const [isActive, setActive] = useState(false);

  const loadSubModel = async () => {
    await subModelApply({ taskId, dataId });
    dispatch({
      type: 'sponsor/taskDetail',
      payload: taskId,
    });
    message.success('子模型提交审核成功！');
  };
  const handleApplySubModel = async () => {
    if (modelCode.length) {
      if (is_related_chief_model) {
        Modal.info({
          title: '确认将主模型发给参与方审核吗？',
          content: '当前任务所添加的数据需审核主模型，提交后，主模型将发送给数据提供方审核。',
          style: { top: 240 },
          onOk: async () => {
            await loadSubModel();
            Modal.destroyAll();
          },
          onCancel: () => {
            Modal.destroyAll();
          },
        });
      } else {
        await loadSubModel();
      }
    } else {
      message.error('请勿提交空模型！');
    }
  };

  return (
    <div ref={subModel} className={`${styles.connectWrap} ${styles.modelWrap}`}>
      <IconBase
        icon={ConnectIcon}
        fill={defaultId === activeId ? '#0076D9' : 'rgba(0, 118, 217, 0.4)'}
      />
      {/* eslint-disable-next-line */}
      <div
        className={
          defaultId === activeId ? classNames(styles.cardWrap, styles.activeWrap) : styles.cardWrap
        }
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseOver={onMouseEnter}
      >
        <IconBase icon={LuaIcon} />
        <Tooltip title={status === DATA_MODEL_STATE.MODEL_REJECT ? `拒绝理由：${reason}` : null}>
          <div className={styles.titleWrap}>
            <span
              className={styles.title}
              onClick={() =>
                router.push(
                  `/federate/sponsor/editor?dataType=${dataType}&taskId=${taskId}&dataId=${dataId}`,
                )
              }
            >
              {name}
            </span>
            {MODEL_STATE_TAG[status % MODEL_STATE_TAG.length]}
          </div>
        </Tooltip>
        {auth.includes(PERMISSION.edit) &&
          defaultId === activeId &&
          (status === DATA_MODEL_STATE.WAIT_SPONSOR_SETTING ||
            status === DATA_MODEL_STATE.DATA_SETTED) && (
            <span
              className={`${styles.apply} hover-style`}
              onMouseEnter={e => {
                e.preventDefault();
                e.stopPropagation();
                setActive(true);
              }}
              onMouseLeave={e => {
                e.preventDefault();
                e.stopPropagation();
                setActive(false);
                onMouseLeave();
              }}
              onClick={handleApplySubModel}
            >
              <Tooltip title="提交审核">
                <IconBase
                  icon={ApplyIcon}
                  className={styles.applyIcon}
                  fill={defaultId === activeId && isActive ? '#292929' : '#888'}
                />
              </Tooltip>
            </span>
          )}
      </div>
    </div>
  );
};

function TaskListItem(props) {
  const {
    chiefY,
    init = false,
    index = 0,
    org_id: orgId = '',
    org_name: orgName = '',
    isSponsor = index === 0,
    task_data_list: dataList = [],
    setTmpTaskList,
    dispatch,
    location,
    auth,
    setActiveLine,
  } = props;
  const { taskId } = location.query;
  const [selectList, setSelectList] = useState([]);

  const [addDataVisible, setAddDataVisible] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectInitList, setSelectInitList] = useState([]);
  const [activeId, setActiveId] = useState('');

  const handleAddPartner = async () => {
    if (selectedOrg) {
      await partnerAdd({
        taskId,
        partners: [selectedOrg],
      });
      message.success('参与方添加成功！');
      dispatch({
        type: 'sponsor/taskDetail',
        payload: taskId,
      });
      setTmpTaskList([]);
    } else {
      message.error('请选择参与方');
    }
  };
  const handleCancelPartner = () => {
    setTmpTaskList([]);
  };
  const handleSearch = async (params = '') => {
    const res = await searchTaskOrg({ taskId, params });
    setSelectList(res);
    setSelectInitList(res);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearchData = val => {
    const list = selectInitList.filter(item => item.orgName.includes(val));
    setSelectList(list);
  };

  const handleActive = data => {
    setActiveLine(data);
    setActiveId(data);
  };

  return (
    <div className={styles.taskWrap}>
      <div className={styles.card} style={{ justifyContent: 'center' }}>
        <div className={styles.org}>
          <img alt="" src={isSponsor ? sponsor : participant} width={32} height={32} />
          <div style={{ marginLeft: 8 }}>
            {init ? (
              <div className={styles.inputWrap}>
                <Prompt
                  message={() => {
                    message.error('正在添加参与方');
                    return false;
                  }}
                />
                <Select
                  onChange={val => setSelectedOrg(val)}
                  onSearch={handleSearchData}
                  showSearch
                  filterOption={false}
                  showArrow={false}
                  placeholder="请选择参与方"
                  style={{ width: 200 }}
                >
                  {selectList.map(item => (
                    <Select.Option key={item.orgId} disabled={item.is_exist}>
                      {item.orgName}
                      <span style={{ color: '#b7b7b7' }}></span>
                    </Select.Option>
                  ))}
                </Select>
                <Button onClick={handleAddPartner} style={{ marginLeft: 8 }} icon={<CheckIcon />} />
                <Button
                  onClick={handleCancelPartner}
                  style={{ marginLeft: 8 }}
                  icon={<CloseIcon />}
                />
              </div>
            ) : (
              <Tooltip title={orgName}>
                <span className={styles.title}>{orgName}</span>
              </Tooltip>
            )}
            <span className={styles.subTitle}>{isSponsor ? '发起方' : '参与方'}</span>
          </div>
        </div>
      </div>
      <div className={styles.card} style={{ marginLeft: 20 }}>
        {dataList.map((item, idx) => (
          <div style={{ display: 'flex' }} key={item.data_id}>
            <div
              onMouseEnter={() => handleActive(item.data_id)}
              onMouseLeave={() => handleActive('')}
            >
              <DataCard
                {...item}
                onCancelActive={() => handleActive('')}
                activeId={activeId}
                isSponsor={isSponsor}
                taskId={taskId}
                defaultId={item.data_id}
                dispatch={dispatch}
              />
            </div>
            {item.data_status >= DATA_MODEL_STATE.DATA_SETTED && (
              <div>
                <ModelCard
                  onMouseEnter={() => handleActive(item.data_id)}
                  onMouseLeave={() => handleActive('')}
                  activeId={activeId}
                  defaultId={item.data_id}
                  auth={auth}
                  key={item.data_id}
                  taskId={taskId}
                  index={idx}
                  chiefY={chiefY}
                  dispatch={dispatch}
                  {...item}
                />
              </div>
            )}
          </div>
        ))}
        {init || !auth.includes(PERMISSION.edit) ? null : (
          <div className={styles.buttonWrap}>
            <div className={styles.button}>
              <Button size="small" onClick={() => setAddDataVisible(true)}>
                添加数据
              </Button>
            </div>
            <div className={styles.button}></div>
          </div>
        )}
      </div>
      <AddDataModal
        isSponsor={isSponsor}
        visible={addDataVisible}
        onCancel={() => setAddDataVisible(false)}
        taskId={taskId}
        orgId={orgId}
        orgName={orgName}
      />
    </div>
  );
}

export default connect()(withRouter(TaskListItem));
