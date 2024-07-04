import React, { useState } from 'react';
import { router } from 'umi';
import { Form, Modal, Icons } from 'quanta-design';
import ItemTitle from '@/components/ItemTitle';
import Step from '@/pages/Manage/component/StepSimple';
import NewPage from '@/components/NewPage';
import { Prompt } from 'react-router';
import styles from './index.less';
import StepOne from './step-one';
import StepTwo from './step-two';

const { CloseIcon } = Icons;

const stepData = [
  {
    title: '导入模型',
  },
  {
    title: '模型配置',
  },
  {
    title: '保存模型',
  },
];

let isSave = true;

function UploadModel(props) {
  const { title, pageSource, location } = props;
  const [step, setStep] = useState(1);
  const [datas, setDatas] = useState({});
  const [form] = Form.useForm();

  const handleStep = async data => {
    await setDatas(data);
    setStep(data.step);
  };

  const handleBefore = () => {
    setStep(1);
    form.setFieldsValue({
      ...datas,
    });
  };

  const closeModalSave = () => {
    isSave = true;
    router.goBack();
  };

  const showModalSave = () => {
    Modal.info({
      title: '是否确认离开当前正在编辑的页面吗？',
      content: '离开后，当前正在编辑的内容将丢失。',
      style: { top: 240 },
      closable: true,
      closeIcon: <CloseIcon fill="#888" />,
      onOk: () => closeModalSave(),
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  const handlePrompt = () => {
    if (!isSave) {
      showModalSave();
      return false;
    }
    return true;
  };

  const formChange = () => {
    if (isSave) isSave = false;
  };

  const handleSave = () => {
    isSave = true;
  };

  return (
    <>
      <Prompt message={handlePrompt} />
      <NewPage title={title} onBack={() => router.goBack()} noContentLayout>
        <div className={styles.uploadWrap}>
          <ItemTitle title="模型详情" />
          <Step stepData={stepData} current={step} />
        </div>
        <div className={styles.contentWrap}>
          {step === 1 ? (
            <StepOne
              form={form}
              {...datas}
              onNext={handleStep}
              handleFormChange={formChange}
              pageSource={pageSource}
            />
          ) : (
            <>
              <StepTwo
                {...datas}
                onSave={handleSave}
                handleFormChange={formChange}
                onBefore={handleBefore}
                pageSource={pageSource}
                location={location}
              />
            </>
          )}
        </div>
      </NewPage>
    </>
  );
}

export default UploadModel;
