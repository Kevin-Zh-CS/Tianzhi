import React, { useEffect } from 'react';
import { Button, Form, Row, Col, Select, Input, IconBase, Tooltip, Empty } from 'quanta-design';
import CodeEditor from '@/components/CodeEditor';
import { ReactComponent as plusSquareIcon } from '@/icons/plus_square.svg';
import { ReactComponent as minusSquareIcon } from '@/icons/minus_square.svg';
import luaparse from 'luaparse';
import { LUA_TYPE } from '../config';

import styles from './index.less';
import { CaretRightOutlined } from '@ant-design/icons';
import { Space, Collapse } from 'antd';
import { ReactComponent as EmptyIcon } from '@/icons/empty-image.svg';

const { Panel } = Collapse;

function StepTwo(props) {
  const { info, form, handleBefore, onPublish, stepCurrent, handleFormChange } = props;
  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: {},
  };
  let parseResult = [];
  try {
    parseResult = luaparse
      .parse(info.model)
      .body.filter(item => item.type === 'FunctionDeclaration');
  } catch (e) {
    console.log(e);
  }

  const luaScript = parseResult.map((item, index) => {
    const obj = {
      index,
      name: item.identifier.name,
      funName: item.identifier.name,
      inputParams: item.parameters.map(params => ({ name: params.name })),
    };
    return obj;
  });

  useEffect(() => {
    if (stepCurrent === 2 && info.args) {
      const data = JSON.parse(info.args);
      const methods = data.map(item => ({ ...item, example: item.reqExample }));
      form.setFieldsValue({ methods });
    }
  }, [stepCurrent]);
  return (
    <div className={styles.stepTwo}>
      <Row>
        <Col style={{ width: 105, textAlign: 'left', marginLeft: 12 }}>
          <span style={{ marginRight: 10 }}>参数信息</span>
        </Col>
        <Col style={{ width: 774 }}>
          {luaScript.length > 0 ? (
            <Form
              onFieldsChange={handleFormChange}
              colon={false}
              initialValues={{ methods: luaScript }}
              hideRequiredMark
              form={form}
            >
              <Collapse
                defaultActiveKey={
                  luaScript.length > 0 ? luaScript.map((item, index) => index.toString()) : ['0']
                }
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              >
                {luaScript.map((item, index) => (
                  <Panel key={index.toString()} className={styles.luaPanel} header={item.funName}>
                    <div className={styles.funcItemWrap}>
                      <div>
                        <div className={styles.boldTxt}>使用说明</div>
                        <Form.Item
                          style={{ height: 0, marginBottom: 8 }}
                          name={['methods', index, 'name']}
                        >
                          <Input style={{ height: 0, width: 0, border: 0 }} />
                        </Form.Item>
                        <Form.Item
                          name={['methods', index, 'desc']}
                          rules={[{ max: 100, message: '输入超过100个字符' }]}
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="请输入100字以内的使用说明"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </div>
                      <div className={styles.parameters}>
                        <div className={styles.boldTxt}>输入参数</div>
                        <div className={styles.paramTable}>
                          <Form.List
                            name={['methods', index, 'inputs']}
                            initialValue={item.inputParams}
                          >
                            {fields => (
                              <>
                                <Form.Item {...formItemLayout}>
                                  <div className={styles.priceContainer} style={{ width: '100%' }}>
                                    <div className={styles.outputItem}>名称</div>
                                    <div className={styles.outputItem}>类型</div>
                                    <div className={styles.outputItem}>示例值</div>
                                    <div className={styles.outputItem}>描述</div>
                                  </div>
                                  {item.inputParams.length > 0 ? (
                                    fields.map(({ key, name, fieldKey }) => (
                                      <Space
                                        key={key}
                                        className={styles.spaceContainer}
                                        align="baseline"
                                      >
                                        <Form.Item
                                          name={[name, 'name']}
                                          fieldKey={[fieldKey, 'name']}
                                          style={{ width: 176 }}
                                          rules={[
                                            { required: true, message: '请输入名称' },
                                            { max: 30, message: '输入超过30个字符' },
                                          ]}
                                        >
                                          <div>{item.inputParams[key].name}</div>
                                        </Form.Item>
                                        <Form.Item
                                          name={[name, 'type']}
                                          fieldKey={[fieldKey, 'type']}
                                          rules={[{ required: true, message: '请选择类型' }]}
                                        >
                                          <Select placeholder="请选择类型" style={{ width: 172 }}>
                                            {LUA_TYPE.map(ol => (
                                              <Select.Option key={ol}>{ol}</Select.Option>
                                            ))}
                                          </Select>
                                        </Form.Item>
                                        <Form.Item
                                          name={[name, 'example']}
                                          fieldKey={[fieldKey, 'example']}
                                        >
                                          <Input
                                            className={styles.inputItem}
                                            placeholder="请输入示例值"
                                          />
                                        </Form.Item>
                                        <Form.Item
                                          name={[name, 'desc']}
                                          fieldKey={[fieldKey, 'desc']}
                                          rules={[{ max: 30, message: '输入超过30个字符' }]}
                                        >
                                          <Input
                                            className={styles.inputItem}
                                            placeholder="请输入描述"
                                          />
                                        </Form.Item>
                                      </Space>
                                    ))
                                  ) : (
                                    <Empty
                                      style={{ paddingTop: 75, paddingBottom: 75 }}
                                      description={
                                        <div style={{ color: '#888' }}>
                                          暂无参数信息，快去模型中完善吧～
                                        </div>
                                      }
                                      image={
                                        <IconBase
                                          width="72"
                                          viewBox="0 0 72 72"
                                          height="72"
                                          icon={EmptyIcon}
                                          fill="#000"
                                        />
                                      }
                                    />
                                  )}
                                </Form.Item>
                              </>
                            )}
                          </Form.List>
                        </div>
                      </div>
                      <div className={styles.parameters}>
                        <div className={styles.boldTxt}>输出参数</div>
                        <div className={styles.paramTable}>
                          <Form.List name={['methods', index, 'outputs']} initialValue={[{}]}>
                            {(fields, { add, remove }) => (
                              <>
                                <Form.Item {...formItemLayout}>
                                  <div className={styles.priceContainer} style={{ width: '100%' }}>
                                    <div style={{ marginRight: 8 }}>
                                      <IconBase icon={plusSquareIcon} onClick={() => add()} />
                                    </div>
                                    <div className={styles.outputItem}>名称</div>
                                    <div className={styles.outputItem}>类型</div>
                                    <div className={styles.outputItem}>示例值</div>
                                    <div className={styles.outputItem}>描述</div>
                                  </div>
                                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                                    <Space
                                      key={key}
                                      className={styles.spaceContainer}
                                      align="baseline"
                                    >
                                      <div className={styles.plusItem}>
                                        {fields.length === 1 ? (
                                          <Tooltip
                                            arrowPointAtCenter
                                            placement="topLeft"
                                            title="请至少设置一个输出参数！"
                                          >
                                            <IconBase
                                              icon={minusSquareIcon}
                                              onClick={() => {
                                                if (fields.length === 1) return;
                                                remove(name);
                                              }}
                                              fill="#b7b7b7"
                                            />
                                          </Tooltip>
                                        ) : (
                                          <IconBase
                                            icon={minusSquareIcon}
                                            onClick={() => {
                                              remove(name);
                                            }}
                                          />
                                        )}
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
                                        <Select style={{ width: 166 }} placeholder="请选择类型">
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
                                        <Input
                                          className={styles.input}
                                          placeholder="请输入示例值"
                                        />
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
                                  ))}
                                </Form.Item>
                              </>
                            )}
                          </Form.List>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginBottom: 8 }} className={styles.boldTxt}>
                      请求示例
                    </div>
                    <Form.Item name={['methods', index, 'example']} {...formItemLayout}>
                      <CodeEditor mode="txt" placeholder="请输入正确的请求示例" />
                    </Form.Item>
                  </Panel>
                ))}
              </Collapse>
            </Form>
          ) : (
            <Empty
              style={{ paddingTop: 75, paddingBottom: 75 }}
              description={<div style={{ color: '#888' }}>无参数</div>}
              image={
                <IconBase width="72" viewBox="0 0 72 72" height="72" icon={EmptyIcon} fill="#000" />
              }
            />
          )}
          <div style={{ paddingTop: 12 }}>
            {luaScript.length > 0 ? (
              <Button type="primary" onClick={onPublish}>
                发布
              </Button>
            ) : null}
            <Button style={{ marginLeft: 12 }} onClick={handleBefore}>
              上一步
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default StepTwo;
