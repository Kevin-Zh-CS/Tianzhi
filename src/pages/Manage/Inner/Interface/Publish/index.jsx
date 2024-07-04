import React, { useState, useEffect } from 'react';
import { Alert, Form, Modal, message, Icons } from 'quanta-design';
import router from 'umi/router';
import Page from '@/components/Page';
import { Prompt } from 'react-router';
import ItemTitle from '@/components/ItemTitle';
import classnames from 'classnames';
import Step from '@/pages/Manage/component/StepSimple';
import AuthorizationListModal from '@/pages/Manage/Inner/component/AuthorizationListModal';
import { connect } from 'dva';
import styles from './index.less';
import {
  handleInterfaceDeploy,
  updateInterface,
  interfaceInfo,
  updateAuthInterface,
  interfaceGenerate,
} from '@/services/interface';
import FileShow from '@/pages/Manage/Inner/component/FileShow';
import { fileTypeMap, getFileType } from '@/pages/Manage/Inner/File/config';
import StepOne from './step-one';
import StepTwo from './step-two';
import WithLoading from '@/components/WithLoading';

const stepData = [
  {
    title: '数据基本信息',
  },
  {
    title: '设置参数信息',
  },
  {
    title: '发布',
  },
];

const { CloseIcon } = Icons;
let isSave = true;
function Publish(props) {
  const { location, dispatch } = props;
  const [form] = Form.useForm();
  const { id, namespace } = location.query;
  const [info, setInfo] = useState({});
  const [showFloat, setShowFloat] = useState(false);
  const [stepCurrent, setStepCurrent] = useState(1);
  const [stepOneData, setStepOneData] = useState({});
  const [authVisible, setAuthVisible] = useState(false);
  const [addId, setAddId] = useState(undefined);
  const [responseValue, setResponseValue] = useState('');
  const [from, setFrom] = useState(null);

  const getInfo = async () => {
    if (id) {
      const data = await interfaceInfo(namespace, id, dispatch);
      setInfo(data);
      setAddId(id);
    }
  };

  const handleResponse = async () => {
    const data = await interfaceGenerate(namespace, info.id || id, dispatch);
    setResponseValue(data.example);
  };

  useEffect(() => {
    getInfo();
    return () => {
      isSave = true;
    };
  }, []);

  const handleUpdate = async data => {
    await updateInterface(namespace, { ...stepOneData, ...data }, dispatch);
  };

  const handleSave = async () => {
    const values = form.getFieldsValue();
    isSave = true;
    const params = { ...values };
    if (values.packages) {
      params.packages = values.packages.map(item => ({ ...item, credit: item.credit * 100 }));
    }
    if (id || stepCurrent === 2) {
      await handleUpdate({
        ...params,
        id: addId,
        restful_params: stepCurrent === 2 ? { ...params, example: responseValue } : {},
      });
    } else {
      const newData = await handleInterfaceDeploy(namespace, params, dispatch);
      setAddId(newData.id);
    }
    message.success('编辑内容保存成功');
  };

  const closeInterfaceSave = async path => {
    await handleSave();
    router.replace({
      pathname: path.pathname,
      query: { namespace, id },
    });
  };

  const showInterfaceSave = path => {
    Modal.info({
      title: '确认离开当前正在编辑的页面吗？',
      content: '若不保存，当前正在编辑的内容将丢失。',
      okText: '保存',
      cancelText: '不保存',
      zIndex: 1000,
      style: { top: 240 },
      closable: true,
      closeIcon: <CloseIcon fill="#888" />,
      onOk: () => closeInterfaceSave(path),
      onCancel: e => {
        if (!e.triggerCancel) {
          isSave = true;
          router.replace({
            pathname: path.pathname,
            query: { namespace, id },
          });
        }
        Modal.destroyAll();
      },
    });
  };

  const handlePrompt = path => {
    if (
      !isSave &&
      !path.pathname.startsWith('/manage/inner/repository/interface/publish/success')
    ) {
      showInterfaceSave(path);
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    const data = await form.validateFields();
    const params = { ...data };
    if (data.pub_type === 2) {
      params.packages = (data.packages || []).map(item => ({ ...item, credit: item.credit * 100 }));
    }
    if (addId) {
      await updateInterface(namespace, { ...params, id: addId }, dispatch);
    } else {
      const newData = await handleInterfaceDeploy(namespace, params, dispatch);
      setAddId(newData.id);
    }
    setStepOneData(data);
    setStepCurrent(2);
  };

  const handlePublish = async () => {
    try {
      const data = await form.validateFields();
      await updateAuthInterface(
        namespace,
        {
          restful_params: { ...data, example: responseValue },
          id: addId,
          pub_type: stepOneData.pub_type,
        },
        dispatch,
      );
      message.success('数据发布成功！');
      router.replace(
        `/manage/inner/repository/interface/publish/success?namespace=${namespace}&id=${addId}`,
      );
    } catch (e) {
      message.error('请填写完整的参数信息！');
    }
  };

  // const goBack = () => {
  //   router.push(`/manage/inner/repository/interface?namespace=${namespace}`);
  // };

  const onBefore = async () => {
    setFrom(2);
    setStepCurrent(1);
    const data = await interfaceInfo(namespace, addId, dispatch);
    setInfo(data);
  };

  const formChange = () => {
    if (isSave) isSave = false;
  };

  return (
    <div>
      <Prompt message={handlePrompt} />
      <Page
        title="发布数据"
        alert={
          <Alert
            type="info"
            message={
              <span>
                温馨提示：数据发布时仅发布数据元信息（如数据标题、数据描述等）至区块链，并可为某些机构设置默认的数据访问权限；原始数据不发布。
              </span>
            }
            showIcon
          />
        }
        // backFunction={goBack}
        showBackIcon
        noContentLayout
      >
        <div style={{ position: 'relative' }}>
          <div className={classnames(styles.floatModal, showFloat ? '' : styles.hidden)}>
            <div
              className={styles.btn}
              onClick={() => {
                setShowFloat(false);
              }}
            >
              <div className={styles.horizontal} />
            </div>
            <div className={styles.title}>
              <span>原始数据</span>
            </div>
            <div className={styles.nameWrap}>
              <span>{info.name}</span>
            </div>
            <div className={styles.fileWrap}>
              <FileShow type={getFileType(fileTypeMap[info.format || 0])} data={info} />
            </div>
          </div>
        </div>

        <div className={styles.stepWrap}>
          <ItemTitle title="数据元信息" />
          <Step
            stepData={stepData}
            current={stepCurrent}
            style={{
              padding: '18px 32px',
              margin: '0 -20px',
              boxShadow: '0px 1px 3px rgba(31, 31, 31, 0.1)',
            }}
          />
        </div>
        {stepCurrent === 1 ? (
          <div className={styles.contentWrap}>
            <StepOne
              handleFormChange={formChange}
              info={info}
              form={form}
              from={from}
              handleNext={handleNext}
            />
          </div>
        ) : (
          <div className={styles.contentWrap}>
            <StepTwo
              handleFormChange={formChange}
              namespace={namespace}
              stepCurrent={stepCurrent}
              id={addId}
              info={info}
              form={form}
              handleBefore={onBefore}
              onPublish={handlePublish}
              onResponse={handleResponse}
              responseValue={responseValue}
              setResponseValue={setResponseValue}
            />
          </div>
        )}
      </Page>
      <AuthorizationListModal
        checkedList={info.white_lists}
        visible={authVisible}
        onCancel={() => setAuthVisible(false)}
      />
    </div>
  );
}

export default connect(({ global }) => ({
  loading: global.loading,
}))(WithLoading(Publish));
