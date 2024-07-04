import React from 'react';
import { Button, Form, Row, Col, Select, Input } from 'quanta-design';
import styles from './index.less';

function Step2(props) {
  const { fields, dbFields, publishDatasource, setStepCurrent } = props;
  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: {},
  };

  return (
    <div className={styles.contentWrap}>
      <Form colon={false} hideRequiredMark>
        <Form.Item name="dataParameters" label="数据参数" {...formItemLayout}>
          <div className={styles.funcItemWrap}>
            <div className={styles.paramTable}>
              <Row align="middle" className={styles.tableThead}>
                <Col span={6} style={{ paddingLeft: 12 }}>
                  名称
                </Col>
                <Col span={6}>类型</Col>
                <Col span={6}>示例值</Col>
                <Col span={6}>描述</Col>
              </Row>
              {fields.map((res, index) => (
                <Row align="middle" className={styles.tableTr}>
                  <Col span={6} style={{ paddingLeft: 12 }}>
                    {res.name}
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="请选择"
                      defaultValue={res.type.length !== 0 ? res.type : 'string'}
                      onChange={e => {
                        dbFields[index].type = e;
                      }}
                    >
                      <Select.Option value="string">String</Select.Option>
                      <Select.Option value="int">Int</Select.Option>
                      <Select.Option value="float">Float</Select.Option>
                    </Select>
                  </Col>
                  <Col
                    span={6}
                    onChange={e => {
                      dbFields[index].example = e.target.value;
                    }}
                  >
                    <Input placeholder="请输入" defaultValue={dbFields[index].example} />
                  </Col>
                  <Col
                    span={6}
                    onChange={e => {
                      dbFields[index].desc = e.target.value;
                    }}
                  >
                    <Input placeholder="请输入" defaultValue={dbFields[index].desc} />
                  </Col>
                </Row>
              ))}
            </div>
          </div>
        </Form.Item>
        <div style={{ marginLeft: 117, paddingTop: 12 }}>
          <Button type="primary" onClick={publishDatasource}>
            发布
          </Button>
          <Button style={{ marginLeft: 12 }} onClick={() => setStepCurrent(1)}>
            上一步
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default Step2;
