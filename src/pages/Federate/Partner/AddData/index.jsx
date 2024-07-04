import React, { useState } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import { Alert } from 'quanta-design';
import Page from '@/components/Page';
import Step1 from './Step1';
import Step2 from './Step2';
// import { Prompt } from 'react-router';

function AddData(props) {
  const {
    query: { type = '', dataId },
  } = props.location;
  const [step, setStep] = useState(1);
  const [value, setValue] = useState({});

  const onStep2 = params => {
    setValue(params);
    setStep(2);
  };

  return (
    <>
      {/* <Prompt message={handlePrompt} /> */}
      <Page
        title="添加数据"
        alert={
          step === 2 ? (
            <Alert
              type="info"
              showIcon
              message="温馨提示：需要将源字段名称和目标字段名称一一对应。"
            />
          ) : null
        }
        showBackIcon
      >
        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <Step1 onOk={onStep2} onCancel={() => router.goBack()} {...props} />
        </div>
        {step === 2 ? (
          <Step2
            onOk={({ taskDataId, taskId }) =>
              router.push(
                `/federate/partner/detail?dataId=${taskDataId}&taskId=${taskId}&type=${type || 2}`,
              )
            }
            onCancel={() => setStep(1)}
            value={value}
            id={dataId}
            {...props}
          />
        ) : null}
      </Page>
    </>
  );
}

export default connect(({ partner }) => ({
  dataInfo: partner.dataInfo,
}))(AddData);
