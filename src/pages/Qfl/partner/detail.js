import React, { useState, useEffect } from 'react';
import { router } from 'umi';
import { Modal, Spin } from 'quanta-design';
import NewPage from '@/components/NewPage';
import OrderStatus from '@/components/OrderStatus';
import ButtonGroup from '@/components/ButtonGroup';
import { PROJECT_STATUS } from '@/utils/enums';
import QflDataFormat from './componments/QflDataFormat';
import RejectModal from './componments/RejectModal';
import UploadChainLoading from '@/pages/Federate/Partner/components/UploadChainLoading';
import ProjectInfo from '@/pages/Qfl/sponsor/project/componments/ProjectInfo';
import { getParticipantInfo, handleParticipantInvite } from '@/services/qfl-partner';
// import useAuth from '@/pages/Manage/Inner/component/useAuth';

function QflPartnerDetail(props) {
  const { location } = props;
  const { projectId, dataId } = location.query;
  const [rejectVisible, setRejectVisible] = useState(false);
  const [chainVisible, setChainVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskInfo, setTaskInfo] = useState({});
  // const auth = useAuth({ ns_id: projectId });
  // console.log(auth);

  const getInfo = async () => {
    setLoading(true);
    try {
      const data = await getParticipantInfo({ project_id: projectId, data_id: dataId });
      const { projectBriefInfoVO = {} } = data;
      const info = {
        project_id: projectId,
        name: projectBriefInfoVO.project_name,
        desc: projectBriefInfoVO.project_desc,
        type: projectBriefInfoVO.project_type,
        initiator_name: projectBriefInfoVO.initiator_org_name,
        initiator_id: projectBriefInfoVO.initiator_user_id,
        created_time: projectBriefInfoVO.invite_time,
        participate_status: projectBriefInfoVO.participate_status,
        data_id: projectBriefInfoVO.initiator_data_id,
        data_name: projectBriefInfoVO.data_name,
        format_desc: data.format_desc,
        require_format: data.require_format || [],
        refuse_reason: data.refuse_reason,
      };
      setTaskInfo(info);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInfo();
  }, []);

  const handleConfirm = async params => {
    const { isAgree, refuseReason } = params;
    const param = {
      project_id: projectId,
      data_id: dataId,
      is_agree: isAgree,
      refuse_reason: refuseReason,
    };
    await handleParticipantInvite(param);
    getInfo();
  };

  const goBack = () => {
    router.push(`/qfl/partner`);
  };

  return (
    <>
      <NewPage title="参与详情" showBackIcon noContentLayout backFunction={goBack}>
        <Spin spinning={loading}>
          <div style={{ marginBottom: 12 }}>
            {taskInfo.participate_status === PROJECT_STATUS.WAIT_ACCEPT_INVITE && (
              <OrderStatus
                status={0}
                title="待接受"
                desc="需对任务发起方的邀请进行确认，接受邀请后并添加数据，发起方才能使用该数据。"
              />
            )}
            {taskInfo.participate_status === PROJECT_STATUS.WAIT_PARTICIPANT_CONFIGURE && (
              <OrderStatus
                status={3}
                title="待添加"
                desc="已接受邀请，但暂未添加数据，需添加数据后发起方才能使用该数据。"
              />
            )}
            {taskInfo.participate_status === PROJECT_STATUS.PARTICIPANT_REJECT && (
              <OrderStatus
                status={1}
                title="已拒绝"
                desc={
                  <>
                    您已拒绝任务发起方的邀请。
                    <br />
                    拒绝理由：{taskInfo.refuse_reason}
                  </>
                }
              />
            )}
            {(taskInfo.participate_status === PROJECT_STATUS.PARTICIPANT_CONFIGURE_FINISHED ||
              taskInfo.participate_status === PROJECT_STATUS.READY) && (
              <OrderStatus
                status={2}
                title="已添加"
                desc="已接受邀请并添加数据，发起方能使用该数据。"
              />
            )}
            {taskInfo.participate_status === PROJECT_STATUS.DELETED && (
              <OrderStatus
                status={4}
                title="已失效"
                desc="项目发起方的已将数所需据移除，邀请已失效。"
              />
            )}
          </div>
          <ProjectInfo {...taskInfo} isDetail isPartner />
          <QflDataFormat className="container-card" style={{ marginTop: 12 }} {...taskInfo} />
          {taskInfo.participate_status === PROJECT_STATUS.WAIT_ACCEPT_INVITE && (
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
                    setChainVisible(true);
                    handleConfirm({ isAgree: 1 });
                    Modal.destroyAll();
                  },
                })
              }
              style={{ marginTop: 12, textAlign: 'center' }}
            />
          )}
        </Spin>
      </NewPage>
      <RejectModal
        visible={rejectVisible}
        onOk={handleConfirm}
        onCancel={() => setRejectVisible(false)}
      />
      <UploadChainLoading
        visible={chainVisible}
        onOk={() => {
          setChainVisible(false);
          router.push(`/qfl/partner/addData?dataId=${dataId}&projectId=${taskInfo.project_id}`);
        }}
      />
    </>
  );
}

export default QflPartnerDetail;
