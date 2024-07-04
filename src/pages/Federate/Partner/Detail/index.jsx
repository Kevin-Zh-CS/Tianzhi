import React, { useState, useEffect } from 'react';
import { router } from 'umi';
import { Modal, Table } from 'quanta-design';
import Page from '@/components/Page';
import ItemTitle from '@/components/ItemTitle';
import OrderStatus from '@/components/OrderStatus';
import ButtonGroup from '@/components/ButtonGroup';
import { formatTime } from '@/utils/helper';
import { DATA_JOIN_TYPE, DATA_MODEL_STATE, MODEL_STATE_TAG } from '@/utils/enums';
import TaskInfo from './TaskInfo';
import ManageModal from '../../components/ManageModal';
import DataFormat from '../components/DataFormat';
import DataInvitationDesc from '../components/DataInvitationDesc';
import DataShareDesc from '../components/DataShareDesc';
import RejectModal from '../components/RejectModal';
import UploadChainLoading from '../components/UploadChainLoading';
import { dataInfo, taskInfo, taskConfirm, approvalRecord } from '@/services/partner';
import { dataDetail } from '@/services/datasharing';
import { dataRowList, getImporterDataInfo } from '@/services/importer';
import styles from '@/pages/Federate/Partner/components/index.less';

function Detail(props) {
  const { location } = props;
  const { type, dataId, taskId } = location.query;
  const [rejectVisible, setRejectVisible] = useState(false);
  const [chainVisible, setChainVisible] = useState(false);
  const [recordVisible, setRecordVisible] = useState(false);
  const [mapRule, setMapRule] = useState([]);
  const [dataDetails, setDataDetails] = useState({});
  const [info, setInfo] = useState({});
  const [taskInfos, setTaskInfos] = useState({});
  const [approvalList, setApprovalList] = useState([]);

  const getInfo = async () => {
    const res = await dataInfo({ dataId });
    setInfo(res);
    if (type === '1') {
      const data = await dataDetail({ dataId: res.did });
      setDataDetails({ ...res, ...data });
    } else {
      const { field_mapping_rule: mapRules, ns_id: namespace, import_data_id: id } = res;
      if (id) {
        setMapRule(
          Object.keys(mapRules).map(obj => {
            const item = { target: obj, origin: mapRules[obj] };
            return item;
          }),
        );
        const infos = await getImporterDataInfo({ namespace, dataId: id });
        const detail = {
          ...infos,
          data_name: infos.name,
          list: infos.args,
        };
        const list = await dataRowList({
          namespace,
          dataId: id,
          fields: [],
          page: 1,
          size: 100,
        });
        const tmp = Object.keys(list.records[0]);
        detail.columns = tmp.map(obj => {
          const item = {
            title: obj,
            dataIndex: obj,
            key: obj,
            render: txt => <div className={styles.column}>{txt}</div>,
          };
          return item;
        });
        setDataDetails({ ...detail, list: list.records });
      }
    }
    const data = await taskInfo({ dataId });
    setTaskInfos(data);
  };
  useEffect(() => {
    if (dataId && taskId) {
      getInfo();
    }
  }, []);

  const handleConfirm = async params => {
    const { isAgree, refuseReason } = params;
    await taskConfirm({ dataId, isAgree, refuseReason });
    if (isAgree) {
      setChainVisible(true);
    }
    getInfo();
  };
  const handleApprovalRecord = async () => {
    const res = await approvalRecord({ dataId });
    await setApprovalList(res);
    setRecordVisible(true);
  };

  const goBack = () => {
    router.push(`/federate/partner?type=${type || 2}`);
  };

  return (
    <>
      <Page title="参与详情" showBackIcon noContentLayout backFunction={goBack}>
        <>
          {info.data_status === DATA_MODEL_STATE.DATA_WAIT_ACCEPT && (
            <OrderStatus
              status={0}
              title="待接受"
              desc="需参与方对任务邀请进行确认，接受邀请后并添加数据，发起方才能使用该数据。"
            />
          )}
          {info.data_status === DATA_MODEL_STATE.DATA_PASS && (
            <OrderStatus
              status={3}
              title="待添加"
              desc="已接受邀请，但暂未添加数据，需添加数据后发起方才能使用该数据。"
            />
          )}
          {info.data_status === DATA_MODEL_STATE.MODEL_WAIT_APPROVE && (
            <OrderStatus
              status={0}
              title="待审核"
              desc="需对任务发起方的编写的子模型进行审核，审核通过后发起方才可以使用。"
            />
          )}
          {info.data_status === DATA_MODEL_STATE.MODEL_REJECT && (
            <OrderStatus
              status={1}
              title="审核驳回"
              desc={
                <>
                  任务发起方的编写的子模型已审核驳回，发起方不可以通过该子模型使用相应数据。
                  <br />
                  拒绝理由：{info.refuse_approval_reason}
                </>
              }
            />
          )}
          {info.data_status === DATA_MODEL_STATE.DATA_REJECT && (
            <OrderStatus
              status={1}
              title="已拒绝"
              desc={
                <>
                  您已拒绝任务发起方的邀请。
                  <br />
                  拒绝理由：{info.refuse_invite_reason}
                </>
              }
            />
          )}
          {info.data_status === DATA_MODEL_STATE.MODEL_PASS && (
            <OrderStatus
              status={2}
              title="审核通过"
              desc="任务发起方的编写的子模型已审核通过，发起方可以通过该子模型使用相应数据。"
            />
          )}
          {info.data_status === DATA_MODEL_STATE.DATA_SETTED && (
            <OrderStatus
              status={2}
              title="已添加"
              desc="已接受邀请并添加数据，发起方能使用该数据。"
            />
          )}
          {info.data_status === DATA_MODEL_STATE.DATA_DELETED && type === '2' && (
            <OrderStatus
              status={4}
              title="已失效"
              desc="任务发起方已将数据邀请移除，邀请已失效。"
            />
          )}
          {info.data_status === DATA_MODEL_STATE.DATA_DELETED && type === '1' && (
            <OrderStatus status={4} title="已失效" desc="任务发起方已移除数据，子模型已失效。" />
          )}
        </>
        <TaskInfo style={{ marginTop: 12 }} {...taskInfos} />
        {info.data_type === DATA_JOIN_TYPE.LOCAL_IMPORT && (
          <DataFormat
            className="container-card"
            style={{ marginTop: 12 }}
            taskId={taskId}
            dataId={dataId}
            info={info}
          />
        )}
        {info.data_type === DATA_JOIN_TYPE.LOCAL_IMPORT &&
          info.data_status !== DATA_MODEL_STATE.DATA_WAIT_ACCEPT &&
          info.data_status !== DATA_MODEL_STATE.DATA_REJECT &&
          info.data_status !== DATA_MODEL_STATE.DATA_PASS &&
          info.import_data_id !== '' && (
            <div className="container-card" style={{ marginTop: 12 }}>
              <DataInvitationDesc
                dataInfo={dataDetails}
                info={info}
                isDetail
                extra={
                  info.data_status >= DATA_MODEL_STATE.MODEL_WAIT_APPROVE &&
                  info.data_status <= DATA_MODEL_STATE.MODEL_PASS ? (
                    <ButtonGroup
                      // left="查看审核记录"
                      left={null} // 审核记录功能还没做，先隐藏
                      onClickL={handleApprovalRecord}
                      right={
                        info.data_status === DATA_MODEL_STATE.MODEL_WAIT_APPROVE
                          ? '立即审核'
                          : '查看模型'
                      }
                      onClickR={() =>
                        router.push(
                          `/federate/partner/editor?type=${type}&taskId=${taskId}&dataId=${dataId}`,
                        )
                      }
                    />
                  ) : null
                }
              />
              <ItemTitle style={{ marginTop: 32 }}>字段映射</ItemTitle>
              <div style={{ display: 'flex' }}>
                <span style={{ width: 100 }}>关联字段</span>
                <Table
                  style={{ width: '100%' }}
                  columns={[
                    {
                      title: '目标字段名称',
                      dataIndex: 'target',
                      key: 'target',
                    },
                    {
                      title: '源字段名称',
                      dataIndex: 'origin',
                      key: 'origin',
                    },
                  ]}
                  dataSource={mapRule}
                  pagination={false}
                />
              </div>
            </div>
          )}
        {info.data_status === DATA_MODEL_STATE.DATA_WAIT_ACCEPT && (
          <ButtonGroup
            left="拒绝邀请"
            right="接受邀请"
            onClickL={() => setRejectVisible(true)}
            onClickR={() =>
              Modal.info({
                title: '确认接受当前任务邀请吗？',
                content: '接受邀请后，将使用您的私钥签名进行验证。',
                okText: '确认接受',
                cancelText: '取消',
                onOk: () => {
                  handleConfirm({ isAgree: true });
                },
              })
            }
            style={{ marginTop: 12, textAlign: 'center' }}
          />
        )}
        {info.data_type === DATA_JOIN_TYPE.LOCAL_APPKEY && (
          <DataShareDesc
            className="container-card"
            style={{ marginTop: 12 }}
            dataId={dataId}
            info={dataDetails}
            extra={
              <ButtonGroup
                // left="查看审核记录"
                left={null} // 审核记录功能还没做，先隐藏
                onClickL={handleApprovalRecord}
                right={
                  info.data_status === DATA_MODEL_STATE.MODEL_WAIT_APPROVE ? '立即审核' : '查看模型'
                }
                onClickR={() =>
                  router.push(
                    `/federate/partner/editor?type=${type}&taskId=${taskId}&dataId=${dataId}`,
                  )
                }
              />
            }
          />
        )}
      </Page>
      <RejectModal
        visible={rejectVisible}
        onOk={handleConfirm}
        onCancel={() => setRejectVisible(false)}
      />
      <UploadChainLoading
        visible={chainVisible}
        onOk={() => {
          setChainVisible(false);
          router.push(`/federate/partner/addData?dataId=${dataId}&type=${type}`);
        }}
      />
      <ManageModal
        title="审核记录"
        visible={recordVisible}
        onCancel={() => setRecordVisible(false)}
        columns={[
          {
            title: '子模型名称',
            dataIndex: 'sub_model_name',
            key: 'sub_model_name',
            render: text => (
              <>
                <img
                  alt=""
                  src={null} // 该字段未做，后面要修改
                  width={20}
                  height={20}
                  style={{ marginRight: 8 }}
                />
                {text}
              </>
            ),
          },
          {
            title: '关联数据名称',
            dataIndex: 'data_name',
            key: 'data_name',
          },
          {
            title: '审核状态',
            dataIndex: 'data_status',
            key: 'data_status',
            render: val => MODEL_STATE_TAG[val],
          },
          {
            title: '备注',
            dataIndex: 'reason',
            key: 'reason',
          },
          {
            title: '审核时间',
            dataIndex: 'approval_time',
            key: 'approval_time',
            sorter: true,
            render: val => formatTime(val),
          },
        ]}
        dataSource={approvalList}
      />
    </>
  );
}

export default Detail;
