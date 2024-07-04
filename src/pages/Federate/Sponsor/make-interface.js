import React, { useState, useEffect } from 'react';
import { Alert, Button, Form, IconBase, Input, Select, message, Modal, Icons } from 'quanta-design';
import Page from '@/components/Page';
import BaseData from '@/pages/Federate/Sponsor/components/base_data';
import ItemTitle from '@/components/ItemTitle';
import { ReactComponent as plusSquareIcon } from '@/icons/plus_square.svg';
import { Empty, Space } from 'antd';
import { ReactComponent as minusSquareIcon } from '@/icons/minus_square.svg';
import { LUA_TYPE } from '@/pages/Manage/Inner/Interface/config';
import { ReactComponent as EmptyIcon } from '@/icons/empty-image.svg';
import { getRestfulInfo, generateRestful } from '@/services/sponsor';
import router from 'umi/router';
import luaparse from 'luaparse';
import { Prompt } from 'react-router';
import { connect } from 'dva';
import styles from './index.less';
import WithLoading from '@/components/WithLoading';

const { CloseIcon } = Icons;
let isSave = false;
function MakeInterface(props) {
  const {
    location: { query = {} },
    dispatch,
  } = props;
  const { taskId, isEdit } = query;
  const [item, setItem] = useState({});
  const [currentSelect, setCurrentSelect] = useState([]);
  const [form] = Form.useForm();
  const parseResult = luaparse
    .parse(item.chief_model)
    .body.filter(li => li.type === 'FunctionDeclaration');
  const args = parseResult.map((ul, index) => ({
    index,
    funName: ul.identifier.name,
    inputParams: ul.parameters.map(params => params.name),
  }));
  const formItemLayout = {
    labelCol: { style: { width: 76, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: {},
  };

  const initData = async () => {
    const data = await getRestfulInfo(taskId, dispatch);
    setItem(data);
  };

  useEffect(() => {
    initData();
    return () => {
      isSave = false;
    };
  }, []);

  useEffect(() => {
    if (args.length > 0) {
      if (isEdit) {
        form.setFieldsValue({
          func_name: item.params?.func_name || '',
          inputs: item.params?.args || [{}],
          outputs: item.params?.rets || [{}],
        });
        setCurrentSelect(item.params?.args || [{}]);
      } else {
        const inputs = (args[0]?.inputParams || []).map(li => ({ name: li }));
        form.setFieldsValue({
          func_name: args[0].funName,
          inputs,
        });
        setCurrentSelect(inputs);
      }
    }
  }, [item]);

  const handleSave = async () => {
    isSave = true;
    const data = await form.validateFields();
    await generateRestful({ task_id: taskId, ...data }, dispatch);
    message.success('保存成功');
  };

  const closeModalSave = async path => {
    await handleSave();
    router.replace({
      pathname: path.pathname,
      query: { taskId },
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
            query: { taskId },
          });
        }
        Modal.destroyAll();
      },
    });
  };

  const handlePrompt = path => {
    if (!isSave) {
      showModalSave(path);
      return false;
    }
    return true;
  };

  const changeFun = (value, values) => {
    const { key } = values;
    if (isEdit && value === item.params?.func_name) {
      form.setFieldsValue({
        func_name: item.params?.func_name || '',
        inputs: item.params?.args || [{}],
        outputs: item.params?.rets || [{}],
      });
      setCurrentSelect(item.params?.args || [{}]);
    } else {
      const inputs = (args[key]?.inputParams || []).map(li => ({ name: li }));
      form.setFieldsValue({
        func_name: value,
        inputs,
        outputs: [{}],
      });
      setCurrentSelect(inputs);
    }
  };

  const confirmSubmit = async () => {
    isSave = true;
    const data = await form.validateFields();
    await generateRestful({ task_id: taskId, ...data }, dispatch);
    if (isEdit) {
      message.success('接口更新成功!');
    } else {
      message.success('接口生成成功!');
    }

    router.replace(`/federate/sponsor/doc-detail?taskId=${taskId}`);
  };

  const cancel = () => router.goBack();

  const alert = (
    <Alert
      type="info"
      showIcon
      message="温馨提示：隐私计算任务重新部署后当前接口会失效，需要重新生成接口。"
    />
  );

  const empty = (
    <Empty
      className={styles.emptyBox}
      description={<div style={{ color: '#888' }}>无参数</div>}
      image={<IconBase width="72" viewBox="0 0 72 72" height="72" icon={EmptyIcon} fill="#000" />}
    />
  );

  return (
    <>
      <Prompt message={handlePrompt} />
      <Page alert={alert} showBackIcon title={isEdit ? '更新文档' : '生成接口'}>
        <BaseData info={item} />
        <div className={styles.detailPage}>
          <ItemTitle title="参数信息" />
          <Form form={form} initialValues={{ func_name: '', inputs: [{}], outputs: [{}] }}>
            <Form.Item name="func_name" label="调用方法" {...formItemLayout}>
              <Select style={{ width: 200 }} placehoder="请选择" onChange={changeFun}>
                {(args || []).map((ol, index) => (
                  // eslint-disable-next-line
                  <Select.Option key={index} value={ol.funName}>
                    {ol.funName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <div className={styles.parameters}>
              <div className={styles.boldTxt}>输入参数</div>
              <div className={styles.paramTable}>
                <Form.List name="inputs">
                  {fields => (
                    <>
                      <Form.Item>
                        <div className={styles.priceContainer}>
                          <div className={styles.outputItem}>名称</div>
                          <div className={styles.outputItem}>类型</div>
                          <div className={styles.outputItem}>示例值</div>
                          <div className={styles.outputItem}>描述</div>
                        </div>
                        {currentSelect.length > 0
                          ? (fields || []).map(({ key, name, fieldKey }) => (
                              <Space key={key} className={styles.spaceContainer} align="baseline">
                                <Form.Item
                                  name={[name, 'name']}
                                  fieldKey={[fieldKey, 'name']}
                                  style={{ width: 176 }}
                                >
                                  <div>{currentSelect[key].name}</div>
                                </Form.Item>
                                <Form.Item
                                  name={[name, 'type']}
                                  fieldKey={[fieldKey, 'type']}
                                  rules={[{ required: true, message: '请选择类型' }]}
                                >
                                  <Select placeholder="请选择类型" style={{ width: 176 }}>
                                    {LUA_TYPE.map(ol => (
                                      <Select.Option key={ol}>{ol}</Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                                <Form.Item
                                  name={[name, 'example']}
                                  fieldKey={[fieldKey, 'example']}
                                >
                                  <Input className={styles.inputItem} placeholder="请输入示例值" />
                                </Form.Item>
                                <Form.Item
                                  name={[name, 'desc']}
                                  fieldKey={[fieldKey, 'desc']}
                                  rules={[{ max: 30, message: '输入超过30个字符' }]}
                                >
                                  <Input className={styles.inputItem} placeholder="请输入描述" />
                                </Form.Item>
                              </Space>
                            ))
                          : empty}
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </div>
            </div>
            <div className={styles.parameters}>
              <div className={styles.boldTxt}>输出参数</div>
              <div className={styles.paramTable}>
                <Form.List name="outputs">
                  {(fields, { add, remove }) => (
                    <>
                      <Form.Item {...formItemLayout}>
                        <div className={styles.priceContainer}>
                          <div style={{ marginRight: 8 }}>
                            <IconBase icon={plusSquareIcon} onClick={() => add()} />
                          </div>
                          <div className={styles.outputItem}>名称</div>
                          <div className={styles.outputItem}>类型</div>
                          <div className={styles.outputItem}>示例值</div>
                          <div className={styles.outputItem}>描述</div>
                        </div>
                        {fields.length > 0
                          ? fields.map(({ key, name, fieldKey, ...restField }) => (
                              <Space key={key} className={styles.spaceContainer} align="baseline">
                                <div className={styles.plusItem}>
                                  <IconBase
                                    icon={minusSquareIcon}
                                    onClick={() => {
                                      remove(name);
                                    }}
                                  />
                                </div>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'name']}
                                  fieldKey={[fieldKey, 'name']}
                                  rules={[
                                    { required: true, message: '请输入名称' },
                                    { max: 30, message: '输入超过30个字符' },
                                  ]}
                                >
                                  <Input className={styles.input} placeholder="请输入名称" />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'type']}
                                  fieldKey={[fieldKey, 'type']}
                                  rules={[{ required: true, message: '请选择类型' }]}
                                >
                                  <Select style={{ width: 168 }} placeholder="请选择类型">
                                    {LUA_TYPE.map(ol => (
                                      <Select.Option key={ol}>{ol}</Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'example']}
                                  fieldKey={[fieldKey, 'example']}
                                >
                                  <Input className={styles.input} placeholder="请输入示例值" />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'desc']}
                                  fieldKey={[fieldKey, 'desc']}
                                  rules={[{ max: 30, message: '输入超过30个字符' }]}
                                >
                                  <Input className={styles.input} placeholder="请输入描述" />
                                </Form.Item>
                              </Space>
                            ))
                          : empty}
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </div>
            </div>
            <div className={styles.btnContainer}>
              <Button type="primary" onClick={confirmSubmit}>
                确定
              </Button>
              <Button onClick={cancel} className={styles.cancelBtn}>
                取消
              </Button>
            </div>
          </Form>
        </div>
      </Page>
    </>
  );
}

export default connect(({ global }) => ({
  loading: global.loading,
}))(WithLoading(MakeInterface));
