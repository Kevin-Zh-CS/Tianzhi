import React, { useState } from 'react';
import { IconBase } from 'quanta-design';
import Page from '@/components/Page';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import Step from '@/components/Step';
import OuterLeftDetail from '@/pages/Manage/Outer/component/OuterLeftDetail';
import RequestRecordModal from '@/pages/Manage/Outer/component/RequestRecordModal';

const stepData = [
  {
    title: '发起数据请求',
    content: '数据需求方携带数据访问凭证通过本地节点发起请求。',
  },
  {
    title: '验证访问凭证',
    content: '数据提供方通过区块链进行该凭证的合法性验证。',
  },
  {
    title: '发送实际数据',
    content: '验证通过后，数据提供方向数据需求方发送实际的数据。',
  },
];

const stepCurrent = 1;

function RequestModal(props) {
  const { id, type, data_id } = props.location.query;
  const [showAlert, setShowAlert] = useState(true);
  const [recordVisible, setRecordVisible] = useState(false);

  const alert = <Step stepData={stepData} current={stepCurrent} />;

  return (
    <div>
      <Page
        title="请求数据"
        extra={
          <div
            className="alert-trigger-wrap"
            onClick={() => {
              setShowAlert(!showAlert);
            }}
          >
            请求数据使用说明
            <IconBase className={showAlert ? 'up' : 'down'} icon={ArrowsDown} fill="#888888" />
          </div>
        }
        alert={showAlert ? alert : null}
        showBackIcon
        noContentLayout
      />
      <OuterLeftDetail needTransfer order_id={id} id={id} type={Number(type)} isAlert noAuth />
      <RequestRecordModal
        data_id={data_id}
        order_id={id}
        visible={recordVisible}
        onCancel={() => setRecordVisible(false)}
      />
    </div>
  );
}

export default RequestModal;
