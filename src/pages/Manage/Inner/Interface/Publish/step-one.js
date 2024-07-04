import React, { useState, useEffect } from 'react';
import { Button, Form, Select, Input, Radio, IconBase, Tooltip, Alert } from 'quanta-design';
import { ReactComponent as questionCircleIcon } from '@/assets/question_circle.svg';
import styles from './index.less';
import { DATA_THEME } from '@/pages/Manage/Inner/File/config';
import { Space } from 'antd';
import { interfaceTest } from '@/services/interface';
import AuthorizationListModal from '@/pages/Manage/Inner/component/AuthorizationListModal';
import successNoteIcon from '@/icons/success_note.png';
import failNoteIcon from '@/icons/fail_note.png';
import { ReactComponent as plusSquareIcon } from '@/icons/plus_square.svg';
import { ReactComponent as minusSquareIcon } from '@/icons/minus_square.svg';
import { validatorInput, validatorPrice } from '@/pages/Manage/Inner/config';

function StepOne(props) {
  const { info, form, handleNext, namespace, from, handleFormChange } = props;
  const [initPrice, setInitPrice] = useState(1);
  const [authVisible, setAuthVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loadings, setLoadings] = useState(false);
  const [orgList, setOrgList] = useState(info.white_lists || []);
  const [result, setResult] = useState(2);
  const [status, setStatus] = useState('validating');
  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: {},
  };
  const onChangePrice = e => {
    setInitPrice(e.target.value);
  };

  const handleChooseData = data => {
    setOrgList(data);
    setAuthVisible(false);
    form.setFieldsValue({ white_list: data.map(item => item.org_id) });
  };

  const enterLoading = async () => {
    setLoadings(true);
    interfaceTest(namespace, inputValue)
      .then(() => {
        setLoadings(false);
        setResult(1);
        setStatus('success');
      })
      .catch(() => {
        setLoadings(false);
        setResult(0);
        setStatus('error');
      });
  };

  useEffect(() => {
    const params = {
      name: info.name,
      url: info.url,
      id: info.id,
      req_method: info.req_method || 0,
      desc: info.desc,
      topics: info.topics,
      is_private: info.is_private || 0,
      pub_type: info.pub_type || 1,
      packages:
        info.packages && info.packages.length > 0
          ? info.packages.map(item => ({ ...item, credit: item.credit / 100 }))
          : [{}],
      white_list: (info.white_lists || []).map(item => item.org_id),
    };
    setInputValue(info.url);
    form.setFieldsValue(params);
    setOrgList(info.white_lists || []);
    setInitPrice(info.pub_type || 1);
    if (from === 2) setResult(3);
  }, [info]);

  const handleChooseDataCancel = () => {
    setAuthVisible(false);
  };

  const TooltipBox = (
    <div className="ant-popover ant-popover-placement-right" style={{ left: 80, zIndex: 1 }}>
      <div className="ant-popover-content">
        <div className="ant-popover-arrow">
          <span className="ant-popover-arrow-content"></span>
        </div>
        <div className="ant-popover-inner">
          <div className="ant-popover-inner-content" style={{ padding: 5, width: 230 }}>
            {result === 1 ? (
              <div>
                <img
                  style={{ width: 20, height: 20, marginRight: 6 }}
                  src={successNoteIcon}
                  alt=""
                />
                <span>接口校验成功，可以进行发布</span>
              </div>
            ) : (
              <div>
                <img style={{ width: 20, height: 20, marginRight: 6 }} src={failNoteIcon} alt="" />
                <span>接口检验失败，请检查后重试</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Form
      colon={false}
      hideRequiredMark
      form={form}
      onFieldsChange={handleFormChange}
      initialValues={{
        req_method: 0,
        pub_type: 1,
        is_private: 0,
      }}
      className={styles.stepOnePage}
    >
      <Form.Item
        name="name"
        label="接口名称"
        rules={[
          { required: true, message: '请输入接口名称' },
          { max: 30, message: '接口名称不可超过30个字符，请重新输入' },
        ]}
        {...formItemLayout}
      >
        <Input style={{ width: 360 }} placeholder="请输入" />
      </Form.Item>
      <div style={{ display: 'flex' }}>
        <Form.Item
          name="url"
          label="接口地址"
          rules={[
            {
              validator: (rule, val, callback) => {
                if (!val) {
                  setStatus('error');
                  callback('请输入接口地址');
                  return;
                }
                callback();
              },
            },
          ]}
          validateStatus={status}
          {...formItemLayout}
        >
          <Input
            style={{ width: 360 }}
            value={inputValue}
            placeholder="请输入"
            onChange={e => {
              setStatus('validating');
              const _inputValue = e.target.value.replace(/\s/g, '');
              setInputValue(_inputValue);
              form.setFieldsValue({
                url: _inputValue,
              });
              setResult(2);
            }}
          />
        </Form.Item>
        <div style={{ position: 'relative' }}>
          <Button
            loading={loadings}
            onClick={enterLoading}
            style={{ marginLeft: 8 }}
            disabled={!inputValue}
          >
            校验
          </Button>
          {result === 1 || result === 0 ? TooltipBox : null}
        </div>
      </div>

      <Form.Item
        name="req_method"
        label={
          <div style={{ display: 'flex' }}>
            <span style={{ marginRight: 10 }}>请求方式</span>
            <Tooltip
              arrowPointAtCenter
              placement="topLeft"
              title="可选择：即默认请求方式为Get，也可选择Post，为必选项。"
            >
              <IconBase icon={questionCircleIcon} fontSize={20} fill="#888888" />
            </Tooltip>
          </div>
        }
        rules={[{ required: true, message: '请选择请求方式' }]}
        {...formItemLayout}
      >
        <Radio.Group>
          <Radio value={0}>GET</Radio>
          <Radio value={1}>POST</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="desc"
        label="数据描述"
        rules={[
          { required: true, message: '请输入数据描述' },
          { max: 100, message: '数据描述不可超过100个字符，请重新输入' },
        ]}
        {...formItemLayout}
      >
        <Input.TextArea rows={4} placeholder="请输入100字以内的数据描述" style={{ width: 360 }} />
      </Form.Item>
      <Form.Item
        name="topics"
        label="数据主题"
        rules={[{ required: true, message: '请选择数据主题' }]}
        {...formItemLayout}
      >
        <Select style={{ width: 360 }} placeholder="请选择" mode="multiple">
          {DATA_THEME.map(item => (
            <Select.Option key={item.key} value={item.key}>
              {item.value}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="is_private"
        label={
          <div style={{ display: 'flex' }}>
            <span style={{ marginRight: 10 }}>使用限制</span>
            <Tooltip
              arrowPointAtCenter
              placement="topLeft"
              title="不限：即数据使用不受限制，适用于隐私等级不高的数据；
                        仅限MPC隐私计算：即数据仅支持用于MPC隐私计算，适
                        用于隐私等级较高的数据。"
            >
              <IconBase icon={questionCircleIcon} fontSize={20} fill="#888888" />
            </Tooltip>
          </div>
        }
        {...formItemLayout}
      >
        <Radio.Group>
          <Radio value={0}>不限</Radio>
          <Radio value={1}>仅限MPC隐私计算</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name="pub_type"
        label={
          <div style={{ display: 'flex' }}>
            <span style={{ marginRight: 10 }}>共享类型</span>
            <Tooltip
              arrowPointAtCenter
              placement="topLeft"
              title={
                <div>
                  <div>
                    授权共享： 即通过授权的方式进行数据获取，授权
                    名单内的机构可以直接获取数据，无需审核；其余
                    需要进行申请，审核通过后才可以获取数据。
                  </div>
                  <div>积分共享： 即通过积分购买的形式进行数据获取。</div>
                  <div>公开共享：即可以直接获取数据。</div>
                </div>
              }
            >
              <IconBase icon={questionCircleIcon} fontSize={20} fill="#888888" />
            </Tooltip>
          </div>
        }
        {...formItemLayout}
      >
        <Radio.Group onChange={onChangePrice}>
          <Radio value={1}>授权共享</Radio>
          <Radio value={2}>积分共享</Radio>
          <Radio value={3}>公开共享</Radio>
        </Radio.Group>
      </Form.Item>
      {/* eslint-disable-next-line */}
      {initPrice === 2 ? (
        <Form.List name="packages" initialValue={[{}]}>
          {(fields, { add, remove }) => (
            <>
              <Form.Item
                label={
                  <div style={{ display: 'flex' }}>
                    <span style={{ marginRight: 10 }}>套餐设置</span>
                    <Tooltip
                      arrowPointAtCenter
                      placement="topLeft"
                      title="套餐设置：用户购买某一套餐后，可在指定有效时间和有效次数内使用数据。"
                    >
                      <IconBase icon={questionCircleIcon} fontSize={20} fill="#888888" />
                    </Tooltip>
                  </div>
                }
                {...formItemLayout}
              >
                <div style={{ width: 620 }}>
                  <Alert
                    type="info"
                    message={
                      <>
                        <div>套餐设置规则</div>
                        <div>
                          <div>1.有效时间设置为0，即永久有效；有效次数设置为0，即无限次数；</div>
                          <div>2.同一数据积分发布时，至少有1组套餐，至多有10组套餐。</div>
                        </div>
                      </>
                    }
                    showIcon
                  />
                </div>
                <div className="price-container">
                  <div className="plusItem">
                    <Tooltip
                      arrowPointAtCenter
                      placement="topLeft"
                      title={fields.length === 10 ? '至多设置10组套餐！' : ''}
                    >
                      <IconBase
                        icon={plusSquareIcon}
                        onClick={() => {
                          if (fields.length === 10) return;
                          add();
                        }}
                        fill={fields.length === 10 ? '#b7b7b7' : '#888'}
                      />
                    </Tooltip>
                  </div>
                  <div className="priceItem">有效时间</div>
                  <div className="priceItem">有效次数</div>
                  <div>积分价格</div>
                </div>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space key={key} className="space-container" align="baseline">
                    <div className="plusItem">
                      <Tooltip
                        arrowPointAtCenter
                        placement="topLeft"
                        title={fields.length === 1 ? '请至少设置1组套餐！' : ''}
                      >
                        <IconBase
                          icon={minusSquareIcon}
                          onClick={() => {
                            if (fields.length === 1) return;
                            remove(name);
                          }}
                          fill={fields.length === 1 ? '#b7b7b7' : '#888'}
                        />
                      </Tooltip>
                    </div>
                    <Form.Item
                      {...restField}
                      name={[name, 'duration']}
                      fieldKey={[fieldKey, 'duration']}
                      rules={[
                        { required: true, message: '请输入有效时间' },
                        { validator: validatorPrice },
                      ]}
                    >
                      <Input style={{ width: 186 }} placeholder="请输入有效时间" suffix="天" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      fieldKey={[fieldKey, 'quantity']}
                      rules={[
                        { required: true, message: '请输入有效次数' },
                        { validator: validatorPrice },
                      ]}
                    >
                      <Input style={{ width: 186 }} placeholder="请输入有效次数" suffix="次" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'credit']}
                      fieldKey={[fieldKey, 'credit']}
                      rules={[
                        { required: true, message: '请输入积分' },
                        { validator: validatorInput },
                      ]}
                    >
                      <Input style={{ width: 186 }} placeholder="请输入积分" suffix="Bx" />
                    </Form.Item>
                  </Space>
                ))}
              </Form.Item>
            </>
          )}
        </Form.List>
      ) : initPrice === 1 ? (
        <Form.Item
          name="white_list"
          label={
            <div style={{ display: 'flex' }}>
              <span style={{ marginRight: 10 }}>授权名单</span>
              <Tooltip
                arrowPointAtCenter
                placement="topLeft"
                title="授权名单中勾选的机构在数据共享平台中可以直接
                      获取数据、无需审核，授权有效期为永久有效。"
              >
                <IconBase icon={questionCircleIcon} fontSize={20} fill="#888888" />
              </Tooltip>
            </div>
          }
          {...formItemLayout}
        >
          <Button
            type="primary"
            size="small"
            style={{ marginTop: 5 }}
            onClick={() => setAuthVisible(true)}
          >
            选择授权名单
          </Button>
          <div className={styles.companyWrap}>
            {(orgList || []).map(item => (
              <div key={item.id || item.org_id} className={styles.company}>
                {item.org_name || item.name}
              </div>
            ))}
          </div>
        </Form.Item>
      ) : null}

      <div style={{ marginLeft: 117, paddingTop: 12 }}>
        {result !== 1 && result !== 3 ? (
          <Tooltip placement="top" title="请先完成接口地址校验">
            <Button type="primary" disabled>
              下一步
            </Button>
          </Tooltip>
        ) : (
          <Button type="primary" onClick={handleNext}>
            下一步
          </Button>
        )}
      </div>
      <AuthorizationListModal
        checkedList={orgList}
        visible={authVisible}
        onOk={handleChooseData}
        onCancel={handleChooseDataCancel}
      />
    </Form>
  );
}

export default StepOne;
