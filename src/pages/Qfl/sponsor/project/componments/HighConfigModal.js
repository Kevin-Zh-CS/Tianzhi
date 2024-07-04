import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Select, Modal, Radio } from 'quanta-design';
import '../index.less';
import { stepFourEnums } from '@/pages/Qfl/config';

const { Item } = Form;
const { Option } = Select;
const HighConfigModal = props => {
  const { visible, onCancel, onOk, selectList, type, isEdit, initData, approach } = props;
  const [batchMethod, setBatchMethod] = useState(0);
  const [penaltyList, setPenaltyList] = useState([]);
  const [initMethodList, setInitMethodList] = useState([]);
  const [multiClassList, setMultiClassList] = useState([]);
  const [encryptMethodList, setEncryptMethodList] = useState([]);
  const [encryptKeyLenList, setEncryptKeyLenList] = useState([]);
  const [method, setMethod] = useState('random_uniform');
  const [encryptMethods, setEncryptMethod] = useState('Paillier');
  // init_method multi_class encrypt_key_length
  // console.log(setSelectList);
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { style: { width: 150, textAlign: 'right' } },
    wrapperCol: { span: 14 },
  };

  const getList = key => selectList.filter(item => item.param_name === key);

  const loadData = async () => {
    const penalty = getList('penalty');
    const initMethod = getList('init_method');
    const multiClass = getList('multi_class');
    const encryptMethod = getList('encrypt_method');
    const encryptKeyLen = getList('encrypt_key_length');
    // console.log(penalty);
    setPenaltyList(penalty[0].options);
    setInitMethodList(initMethod[0].options);
    if (multiClass && multiClass.length) {
      setMultiClassList(multiClass[0].options);
    }
    setEncryptMethodList(encryptMethod[0].options);
    setEncryptKeyLenList(encryptKeyLen[0].options);
  };

  useEffect(() => {
    if (selectList && selectList.length) {
      loadData();
    }
  }, [selectList]);

  useEffect(() => {
    if (visible) {
      if (isEdit) {
        const {
          job_config: { advanced = {} },
        } = initData;
        form.setFieldsValue({
          ...advanced,
          encrypt_method: advanced.encrypt_method || 'Paillier',
        });
      } else {
        form.setFieldsValue({
          penalty: 'L2', // 正则化方法
          alpha: 1, // 正则系数
          batch_size: 20, // 批大小
          init_method: 'random_uniform', // 初始化方法
          init_const: 0.5, // 初始化系数
          fit_intercept: true, // 是否含偏置项
          multi_class: 'ovr', // 多分类方法,
          decay_sqrt: true, // 学习率衰减方法
          decay: 1, // 学习率衰减系数
          encrypt_method: 'Paillier', // 加密方法
          encrypt_key_length: 1024, // 密钥长度
        });
      }
    }
  }, [isEdit, visible]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const params = {
      ...values,
    };
    params.batch_size = Number(values.batch_size);
    onOk(params);
  };

  return (
    <Modal
      title="设置高级配置"
      className="drawerStep"
      width={984}
      visible={visible}
      footerStyle={{ border: 0 }}
      zIndex={1000}
      onCancel={onCancel}
      footer={
        <div className="drawerFooter">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" className="confirm" onClick={handleOk}>
            确认
          </Button>
        </div>
      }
    >
      <div>
        <div className="subModalTitle">高级配置不修改时，将使用系统默认值。</div>
        <div>
          <Form colon={false} hideRequiredMark form={form}>
            <Item label="正则化方法" name="penalty" {...formItemLayout}>
              <Select placeholder="请选择正则化方法">
                {penaltyList.map(item => (
                  <Option key={item} value={item}>
                    {stepFourEnums[item]}
                  </Option>
                ))}
              </Select>
            </Item>
            <Item
              name="alpha"
              extra="建议填写 0.01-2 之间的数值"
              label="正则系数"
              rules={[
                {
                  required: true,
                  message: '请输入正则系数',
                },
                {
                  validator: (rule, v, callback) => {
                    if (v && (v <= 0 || v >= 100)) {
                      callback('请输入大于0且小于100的数');
                    }
                    callback();
                  },
                },
              ]}
              {...formItemLayout}
            >
              <Input placeholder="请输入正则系数" />
            </Item>
            <Item label="批处理方法" {...formItemLayout}>
              <Select
                placeholder="请选择批处理方法"
                defaultValue={batchMethod}
                onChange={val => setBatchMethod(val)}
              >
                <Option key={0} value={0}>
                  全部
                </Option>
                <Option key={1} value={1}>
                  部分
                </Option>
              </Select>
            </Item>

            {batchMethod ? (
              <Item
                name="batch_size"
                label="批大小"
                extra="建议填写 10-100 之间的数值"
                rules={[
                  { required: true, message: '请输入批大小' },
                  {
                    validator: (rule, v, callback) => {
                      if (v && (v <= 0 || v >= 1000)) {
                        callback('请输入大于0且小于1000的整数');
                      } else if (v && !Number.isInteger(Number(v))) {
                        callback('请输入大于0且小于1000的整数');
                      }
                      callback();
                    },
                  },
                ]}
                {...formItemLayout}
              >
                <Input placeholder="请输入批大小" />
              </Item>
            ) : null}

            <Item name="init_method" label="初始化方法" {...formItemLayout}>
              <Select placeholder="请选择初始化方法" onChange={val => setMethod(val)}>
                {initMethodList.map(item => (
                  <Option key={item}>{stepFourEnums[item]}</Option>
                ))}
              </Select>
            </Item>
            {method === 'const' ? (
              <Item
                name="init_const"
                label="初始化系数"
                extra="建议填写0-1之间的数值"
                rules={[
                  { required: true, message: '请输入初始化系数' },
                  {
                    validator: (rule, v, callback) => {
                      if (v && (v <= 0 || v >= 100)) {
                        callback('请输入大于0且小于100的数');
                      }
                      callback();
                    },
                  },
                ]}
                {...formItemLayout}
              >
                <Input placeholder="请输入初始化系数" />
              </Item>
            ) : null}
            <Item label="是否含偏置项" name="fit_intercept" {...formItemLayout}>
              <Radio.Group>
                <Radio value>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </Item>
            {approach === 'linear-regression' && approach === 'logistic-regression' ? null : (
              <Item
                label="多分类方法"
                name="multi_class"
                rules={[{ required: true, message: '请选择多分类方法' }]}
                {...formItemLayout}
              >
                <Select placeholder="请选择多分类方法">
                  {multiClassList.map(item => (
                    <Option key={item}>{stepFourEnums[item]}</Option>
                  ))}
                </Select>
              </Item>
            )}
            <Item label="学习率衰减方法" name="decay_sqrt" {...formItemLayout}>
              <Select placeholder="请选择学习率衰减方法">
                {/* eslint-disable-next-line */}
                <Option value={true}>sqrt</Option>
                <Option value={false}>normal</Option>
              </Select>
            </Item>
            <Item
              name="decay"
              label="学习率衰减系数"
              extra="建议填写0-1之间的数值"
              rules={[
                { required: true, message: '请输入学习率衰减系数' },
                {
                  validator: (rule, v, callback) => {
                    if (v && (v <= 0 || v > 1)) {
                      callback('请输入大于0且小于等于1的数');
                    }
                    callback();
                  },
                },
              ]}
              {...formItemLayout}
            >
              <Input placeholder="请输入学习率衰减系数" />
            </Item>

            {type === 0 ? null : (
              <>
                <Item
                  name="encrypt_method"
                  label="加密方法"
                  rules={[{ required: true, message: `请选择加密方法` }]}
                  {...formItemLayout}
                >
                  <Select placeholder="请选择加密方法" onChange={val => setEncryptMethod(val)}>
                    {encryptMethodList.map(item => (
                      <Option key={item}>{stepFourEnums[item]}</Option>
                    ))}
                  </Select>
                </Item>
                {encryptMethods === 'Paillier' ? (
                  <Item
                    name="encrypt_key_length"
                    label="密钥长度"
                    rules={[{ required: true, message: `请选择密钥长度` }]}
                    {...formItemLayout}
                  >
                    <Select placeholder="请选择密钥长度">
                      {encryptKeyLenList.map(item => (
                        <Option key={item}>{item}</Option>
                      ))}
                    </Select>
                  </Item>
                ) : null}
              </>
            )}
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default HighConfigModal;
