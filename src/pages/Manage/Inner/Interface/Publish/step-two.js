import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Select, Input, IconBase } from 'quanta-design';
import CodeEditor from '@/components/CodeEditor';
import { LUA_TYPE } from '../config';
import styles from './index.less';
import { CaretRightOutlined } from '@ant-design/icons';
import { Space, Collapse, Empty } from 'antd';
import { ReactComponent as EmptyIcon } from '@/icons/empty-image.svg';
import { ReactComponent as plusSquareIcon } from '@/icons/plus_square.svg';
import { ReactComponent as minusSquareIcon } from '@/icons/minus_square.svg';

const { Panel } = Collapse;

function StepTwo(props) {
  const {
    info,
    form,
    responseValue,
    handleBefore,
    onPublish,
    stepCurrent,
    onResponse,
    setResponseValue,
    handleFormChange,
  } = props;
  const [codeValue, requestCodeValue] = useState('');
  const [headerLast, setHeaderLast] = useState(0);
  const [headerLast1, setHeaderLast1] = useState(0);
  const [headerLast2, setHeaderLast2] = useState(0);
  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: {},
  };
  useEffect(() => {
    if (stepCurrent === 2 && info.args) {
      const methods = JSON.parse(info.args);

      const params = {
        body: methods.body,
        headers: methods.headers,
        queries: {
          desc: methods.queries?.desc,
          query_strings: methods.queries?.queries,
        },
        rets: { req_response: methods.rets?.restReturns },
      };

      form.setFieldsValue(params);
      setHeaderLast(methods.headers?.headers ? methods.headers.headers.length : 0);
      setHeaderLast1(methods.queries?.queries ? methods.queries.queries.length : 0);
      setHeaderLast2(methods.rets?.restReturns ? methods.rets.restReturns : 0);
      setResponseValue(info.example);
    }
  }, [stepCurrent]);
  return (
    <div className={styles.stepTwo}>
      <Row>
        <Col style={{ width: 105, textAlign: 'left', marginLeft: 12 }}>
          <span style={{ marginRight: 10 }}>输入参数</span>
        </Col>
        <Col span={16}>
          <Form colon={false} hideRequiredMark form={form} handleFormChange={handleFormChange}>
            <Collapse
              defaultActiveKey={['0', '1', '2']}
              className={styles.funcItemWrap}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            >
              {/* 1. 请求参数（Headers）部分 */}
              <Panel key="0" header="请求参数（Headers）">
                <div>
                  <div>
                    <div style={{ marginBottom: 8 }} className={styles.boldTxt}>
                      使用说明
                    </div>
                    <Form.Item
                      name={['headers', 'desc']}
                      rules={[{ max: 100, message: '输入超过100个字符' }]}
                    >
                      <Input.TextArea rows={4} placeholder="请输入100字以内的使用说明" />
                    </Form.Item>
                  </div>
                  <div className={styles.parameters}>
                    <div style={{ marginBottom: 8 }} className={styles.boldTxt}>
                      参数详情
                    </div>
                    <div className={styles.paramTable}>
                      <Form.List name={['headers', 'headers']}>
                        {(fields, { add, remove }) => (
                          <>
                            <Form.Item {...formItemLayout} key={fields.key}>
                              <div className={styles.priceContainer} style={{ width: 816 }}>
                                <div style={{ marginRight: 11.33, marginLeft: 11.33 }}>
                                  <IconBase
                                    icon={plusSquareIcon}
                                    onClick={() => {
                                      add();
                                      setHeaderLast(1);
                                    }}
                                  />
                                </div>
                                <div className={styles.outputItem}>名称</div>
                                <div className={styles.outputItem}>类型</div>
                                <div className={styles.outputItem}>示例值</div>
                                <div className={styles.outputItem}>描述</div>
                              </div>
                              {headerLast !== 0 ? (
                                fields.map(({ key, name, fieldKey, ...restField }) => (
                                  <Space
                                    key={key}
                                    className={styles.spaceContainer}
                                    align="baseline"
                                  >
                                    <div
                                      className={styles.plusItem}
                                      style={{ marginLeft: 11.33, marginRight: 6 }}
                                    >
                                      <IconBase
                                        icon={minusSquareIcon}
                                        onClick={() => {
                                          if (fields.length === 1) setHeaderLast(name);
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
                                      <Select style={{ width: 182 }} placeholder="请选择类型">
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
                              ) : (
                                <div>
                                  <Empty
                                    style={{ paddingTop: 35 }}
                                    description={
                                      <div style={{ color: '#888' }}>暂无参数，点击"+"添加～</div>
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
                                </div>
                              )}
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </div>
                  </div>
                </div>
              </Panel>
              <div className={styles.myspace}></div>

              {/* 2. 请求参数（Query）部分 */}
              <Panel key="1" header="请求参数（Query）">
                <div>
                  <div>
                    <div style={{ marginBottom: 8 }} className={styles.boldTxt}>
                      使用说明
                    </div>
                    <Form.Item
                      name={['queries', 'desc']}
                      rules={[{ max: 100, message: '输入超过100个字符' }]}
                    >
                      <Input.TextArea rows={4} placeholder="请输入100字以内的使用说明" />
                    </Form.Item>
                  </div>
                  <div className={styles.parameters}>
                    <div style={{ marginBottom: 8 }} className={styles.boldTxt}>
                      参数详情
                    </div>
                    <div className={styles.paramTable}>
                      <Form.List name={['queries', 'query_strings']}>
                        {(fields, { add, remove }) => (
                          <>
                            <Form.Item {...formItemLayout}>
                              <div className={styles.priceContainer} style={{ width: 816 }}>
                                <div style={{ marginRight: 11.33, marginLeft: 11.33 }}>
                                  <IconBase
                                    icon={plusSquareIcon}
                                    onClick={() => {
                                      setHeaderLast1(1);
                                      add();
                                    }}
                                  />
                                </div>
                                <div className={styles.outputItem}>名称</div>
                                <div className={styles.outputItem}>类型</div>
                                <div className={styles.outputItem}>示例值</div>
                                <div className={styles.outputItem}>描述</div>
                              </div>
                              {headerLast1 !== 0 ? (
                                fields.map(({ key, name, fieldKey, ...restField }) => (
                                  <Space
                                    key={key}
                                    className={styles.spaceContainer}
                                    align="baseline"
                                  >
                                    <div
                                      className={styles.plusItem}
                                      style={{ marginLeft: 11.33, marginRight: 6 }}
                                    >
                                      <IconBase
                                        icon={minusSquareIcon}
                                        onClick={() => {
                                          if (fields.length === 1) setHeaderLast1(name);
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
                                      <Select style={{ width: 182 }} placeholder="请选择类型">
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
                              ) : (
                                <div>
                                  <Empty
                                    style={{ paddingTop: 35 }}
                                    description={
                                      <div style={{ color: '#888' }}>暂无参数，点击"+"添加～</div>
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
                                </div>
                              )}
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </div>
                  </div>
                </div>
              </Panel>
              <div className={styles.myspace}></div>

              {/* 3. 请求参数（Body）部分 */}
              <Panel key="2" header="请求参数（Body）">
                <div>
                  <div>
                    <div style={{ marginBottom: 8 }} className={styles.boldTxt}>
                      使用说明
                    </div>
                    <Form.Item
                      name={['body', 'desc']}
                      rules={[{ max: 100, message: '输入超过100个字符' }]}
                    >
                      <Input.TextArea rows={4} placeholder="请输入100字以内的使用说明" />
                    </Form.Item>
                  </div>

                  <div>
                    <div style={{ marginBottom: 8 }} className={styles.boldTxt}>
                      参数详情
                    </div>
                    <Form.Item name={['body', 'body']}>
                      <CodeEditor
                        mode="json"
                        value={codeValue}
                        placeholder="请输入参数信息"
                        onChange={v => requestCodeValue(v)}
                      />
                    </Form.Item>
                  </div>
                </div>
              </Panel>
            </Collapse>
          </Form>
        </Col>
      </Row>

      {/* 4. 输出参数 */}
      <Row>
        <Col style={{ width: 105, textAlign: 'left', marginLeft: 12, marginTop: 25 }}>
          <span style={{ marginRight: 10 }} className={styles.boldTxt}>
            输出参数
          </span>
        </Col>

        <Form colon={false} hideRequiredMark form={form}>
          <Col>
            <div className={styles.parameters}>
              <div className={styles.paramTable} style={{ marginTop: 20 }}>
                <Form.List name={['rets', 'req_response']}>
                  {(fields, { add, remove }) => (
                    <>
                      <Form.Item {...formItemLayout}>
                        <div className={styles.priceContainer} style={{ width: 816 }}>
                          <div style={{ marginRight: 11.33, marginLeft: 11.33 }}>
                            <IconBase
                              icon={plusSquareIcon}
                              onClick={() => {
                                setHeaderLast2(1);
                                add();
                              }}
                            />
                          </div>
                          <div className={styles.outputItem}>名称</div>
                          <div className={styles.outputItem}>类型</div>
                          <div className={styles.outputItem}>示例值</div>
                          <div className={styles.outputItem}>描述</div>
                        </div>
                        {headerLast2 !== 0 ? (
                          fields.map(({ key, name, fieldKey, ...restField }) => (
                            <Space key={key} className={styles.spaceContainer} align="baseline">
                              <div
                                className={styles.plusItem}
                                style={{ marginLeft: 11.33, marginRight: 6 }}
                              >
                                <IconBase
                                  icon={minusSquareIcon}
                                  onClick={() => {
                                    if (fields.length === 1) setHeaderLast2(name);
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
                                <Select style={{ width: 182 }} placeholder="请选择类型">
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
                        ) : (
                          <div>
                            <Empty
                              style={{ paddingTop: 35 }}
                              description={
                                <div style={{ color: '#888' }}>暂无参数，点击"+"添加～</div>
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
                          </div>
                        )}
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </div>
            </div>
          </Col>
        </Form>
      </Row>

      {/* 5。 请求示例 */}
      <Row>
        <Col style={{ width: 105, textAlign: 'left', marginLeft: 12, marginTop: 21 }}>
          <span style={{ marginRight: 10 }} className={styles.boldTxt}>
            请求示例
          </span>
        </Col>

        <Col style={{ width: 816 }}>
          <div className={styles.parameters}>
            <div className={styles.paramTable} style={{ marginTop: 20 }}>
              <Button type="primary" size="small" style={{ marginBottom: 8 }} onClick={onResponse}>
                生成请求示例
              </Button>

              <div>
                <CodeEditor
                  mode="json"
                  value={responseValue}
                  placeholder="请输入正确的请求示例，可以点击“生成请求示例”自动生成示例"
                  onChange={v => setResponseValue(v)}
                />
              </div>
            </div>
          </div>

          <div style={{ marginLeft: 0, paddingTop: 32, paddingBottom: 32 }}>
            <Button type="primary" onClick={onPublish}>
              发布
            </Button>
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
