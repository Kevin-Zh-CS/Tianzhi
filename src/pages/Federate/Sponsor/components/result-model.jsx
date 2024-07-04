import React, { useState } from 'react';
import { Modal, Alert, Tabs } from 'quanta-design';
import '@/pages/Federate/Sponsor/components/index.less';
import CodeEditor from '@/components/CodeEditor';
import { getUsedTime } from '@/pages/Federate/config';

function ResultModal(props) {
  const { visible, onCancel, invokeResult, invokeLog, result = {} } = props;
  const [key, setKey] = useState('1');

  const handleChange = k => {
    setKey(k);
  };

  return (
    <Modal
      maskClosable={false}
      width={720}
      style={{ top: 100 }}
      keyboard={false}
      destroyOnClose
      title="输出结果详情"
      visible={visible}
      onCancel={onCancel}
      wrapClassName="dark-modal"
      footer={null}
    >
      {invokeResult !== '输入参数后，点击“运行模型”计算运行结果' &&
      invokeResult !== '模型运行中...' ? (
        <>
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
        </>
      ) : null}
      <Tabs onChange={handleChange} activeKey={key}>
        <Tabs.TabPane tab="运行结果" key="1"></Tabs.TabPane>
        <Tabs.TabPane tab="运行日志" key="2"></Tabs.TabPane>
      </Tabs>
      <CodeEditor
        theme="base16-dark"
        mode="json"
        value={key === '1' ? invokeResult : invokeLog}
        placeholder=""
        readOnly
      />
    </Modal>
  );
}

export default ResultModal;
