import React from 'react'; // useState
import {
  Divider,
  Descriptions,
  // Tooltip
} from 'quanta-design';
import { formatTime } from '@/utils/helper';
// import BlockchainStamp from '@/pages/Federate/components/BlockchainStamp';
// import CopyToClipboard from 'react-copy-to-clipboard';

function TaskInfo(props) {
  const {
    name = '',
    desc = '',
    initiator_org_name: org = '',
    initiator_id: address = '',
    create_time: time = '',
    ...restProps
  } = props;

  return (
    <>
      <div className="container-card" {...restProps}>
        <div style={{ color: '#292929', fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
          {name}
        </div>
        <p style={{ color: '#888888', width: 800 }}>{desc}</p>
        <Divider />
        <Descriptions labelStyle={{ width: 90 }} column={2}>
          <Descriptions.Item label="任务发起方">
            {org}
            {/* <span style={{ color: '#888' }}>({sponsor})</span> */}
          </Descriptions.Item>
          <Descriptions.Item label="发起方地址">{address}</Descriptions.Item>
          <Descriptions.Item label="发起时间">{formatTime(time)}</Descriptions.Item>
          {/* <Descriptions.Item label="任务哈希">
            {taskHash}
            <Tooltip title="复制成功" color="#08CB94" visible={copyTooltip}>
              <CopyToClipboard
                onCopy={() => {
                  setCopyTooltip(true);
                  setTimeout(() => {
                    setCopyTooltip(false);
                  }, 1000);
                }}
                text={taskHash}
              >
                <a style={{ marginLeft: 8 }}>复制</a>
              </CopyToClipboard>
            </Tooltip>
          </Descriptions.Item> */}
        </Descriptions>
        {/* <BlockchainStamp hash={taskHash} /> */}
      </div>
    </>
  );
}

export default TaskInfo;
