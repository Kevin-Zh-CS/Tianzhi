import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, message, Icons } from 'quanta-design';
import router from 'umi/router';
import Page from '@/components/Page';
import { Prompt } from 'react-router';
import ItemTitle from '@/components/ItemTitle';
import classnames from 'classnames';
import CodeEditor from '@/components/CodeEditor';
import Step from '@/pages/Manage/component/StepSimple';
import StepOne from './step-one';
import StepTwo from './step-two';
import { connect } from 'dva';
import styles from './index.less';
import { modeInfo, updateDataModel, publishModel } from '@/services/resource-model';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import WithLoading from '@/components/WithLoading';
import { PERMISSION } from '@/utils/enums';
// import {updateFile} from "@/services/resource";

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
  const { location } = props;
  const [form] = Form.useForm();
  const { id, namespace, role, ...last } = location.query;
  const [info, setInfo] = useState({});
  const [showFloat, setShowFloat] = useState(false);
  const [stepCurrent, setStepCurrent] = useState(1);
  const [stepOneData, setStepOneData] = useState({});

  const auth = useAuth({ ns_id: namespace, resource_id: id });

  const getInfo = async () => {
    const data = await modeInfo(namespace, id);
    setInfo(data);
  };
  useEffect(() => {
    getInfo();
  }, []);

  const handleUpdate = async data => {
    await updateDataModel(namespace, { ...stepOneData, ...data });
    message.success('编辑内容保存成功！');
  };

  const handleSave = async () => {
    const values = form.getFieldsValue();
    isSave = true;
    const params = { ...values, id };
    if (values.packages) {
      params.packages = values.packages.map(item => ({ ...item, credit: item.credit * 100 }));
    }
    await handleUpdate(params);
    // message.success('保存成功');
  };

  const closeModalSave = async path => {
    await handleSave();
    // router.replace(`${path.pathname}?namespace=${namespace}&id=${id}`);
    router.replace({
      pathname: path.pathname,
      query: { namespace, id, role, last },
    });
  };

  const showModalSave = path => {
    Modal.info({
      title: '确认离开当前正在编辑的页面吗？',
      content: '若不保存，当前正在编辑的内容将丢失。',
      okText: '保存',
      cancelText: '不保存',
      style: { top: 240 },
      closable: true,
      closeIcon: <CloseIcon fill="#888" />,
      onOk: () => closeModalSave(path),
      onCancel: e => {
        if (!e.triggerCancel) {
          isSave = true;
          router.replace({
            pathname: path.pathname,
            query: { namespace, id, role },
          });
        }
        Modal.destroyAll();
      },
    });
  };

  const handlePrompt = path => {
    if (!isSave && !path.pathname.startsWith('/manage/inner/repository/model/publish/success')) {
      showModalSave(path);
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    const data = await form.validateFields();
    const params = { ...data };
    if (data.packages) {
      params.packages = data.packages.map(item => ({ ...item, credit: item.credit * 100 }));
    }
    await updateDataModel(namespace, { ...params, id });
    message.success('编辑内容保存成功！');
    setStepOneData(data);
    setStepCurrent(2);
  };

  const handlePublish = async () => {
    // creditModel
    try {
      const data = await form.validateFields();
      await publishModel(namespace, { ...data, id, pub_type: stepOneData.pub_type });
      message.success('数据发布成功！');
      router.push(
        `/manage/inner/repository/model/publish/success?namespace=${namespace}&id=${id}&role=${role}`,
      );
    } catch (e) {
      message.error('请填写完整的参数信息！');
    }
  };

  const onBefore = async () => {
    await getInfo();
    setStepCurrent(1);
  };

  const editModel = () => {
    router.push(
      `/manage/inner/repository/model/editor?id=${info.id}&namespace=${namespace}&type=create&role=${role}`,
    );
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
            message="温馨提示：数据发布时仅发布数据元信息（如数据名称、数据描述等）至区块链，并可为某些机构设置默认的数据访问权限；原始数据不发布。"
            showIcon
            // closable
          />
        }
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
              {auth.includes(PERMISSION.edit) && (
                <Button type="primary" size="small" onClick={editModel}>
                  编辑模型
                </Button>
              )}
            </div>
            <div className={styles.codeWrap}>
              <CodeEditor value={info.model} placeholder="rul代码" readOnly />
            </div>
          </div>
        </div>
        <div className={styles.stepWrap}>
          {auth.includes(PERMISSION.query) && (
            <ItemTitle
              title="数据元信息"
              extra={
                <Button
                  onClick={() => {
                    setShowFloat(true);
                  }}
                >
                  查看原始数据
                </Button>
              }
            />
          )}
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
              handleNext={handleNext}
            />
          </div>
        ) : (
          <div className={styles.contentWrap}>
            <StepTwo
              handleFormChange={formChange}
              stepCurrent={stepCurrent}
              info={info}
              form={form}
              handleBefore={onBefore}
              onPublish={handlePublish}
            />
          </div>
        )}
      </Page>
    </div>
  );
}

export default connect(({ global }) => ({
  loading: global.loading,
}))(WithLoading(Publish));
