import React, { useState } from 'react';
import { router } from 'umi';
import { Form } from 'quanta-design';
import Step from '@/pages/Manage/component/StepSimple';
import NewPage from '@/components/NewPage';
import styles from './index.less';
import ItemTitle from '@/components/ItemTitle';
import StepOne from './step-one';
import StepTwo from './step-two';

const stepData = [
  {
    title: '导入数据',
  },
  {
    title: '预处理数据',
  },
  {
    title: '保存数据',
  },
];

function UploadLocalData(props) {
  const { location } = props;
  const { namespace } = location.query;
  const [step, setStep] = useState(1);
  const [datas, setDatas] = useState({});
  const [form] = Form.useForm();

  const handleStep = async data => {
    await setDatas(data);
    setStep(data.step);
  };

  const handleBefore = () => {
    setStep(1);
  };

  return (
    <NewPage title="导入数据" onBack={() => router.goBack()} noContentLayout>
      <div className={styles.uploadHeader}>
        <ItemTitle title="数据详情" />
        <Step stepData={stepData} current={step} namespace={namespace} />
      </div>
      <div className={styles.uploadPage}>
        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <StepOne form={form} {...datas} onNext={handleStep} namespace={namespace} />
        </div>
        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <StepTwo {...datas} onBefore={handleBefore} namespace={namespace} />
        </div>
      </div>
    </NewPage>
  );
}

export default UploadLocalData;
