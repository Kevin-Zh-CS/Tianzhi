import React, { useState } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import NewPage from '@/components/NewPage';
import Step1 from './componments/Step1';
import Step2 from './componments/Step2';

function AddData(props) {
  const {
    query: { projectId, dataId },
  } = props.location;
  const [step, setStep] = useState(1);
  const [value, setValue] = useState({});

  const onStep2 = params => {
    setValue(params);
    setStep(2);
  };

  return (
    <>
      <NewPage title="添加数据" showBackIcon>
        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <Step1
            onOk={onStep2}
            projectId={projectId}
            dataId={dataId}
            onCancel={() => router.goBack()}
            {...props}
          />
        </div>
        {step === 2 ? (
          <Step2
            onOk={() => router.push(`/qfl/partner`)}
            onCancel={() => setStep(1)}
            value={value}
            dataId={dataId}
            projectId={projectId}
            {...props}
          />
        ) : null}
      </NewPage>
    </>
  );
}

export default connect()(AddData);
