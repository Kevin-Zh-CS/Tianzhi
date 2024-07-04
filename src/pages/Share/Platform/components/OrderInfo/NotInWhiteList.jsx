import React, { useState } from 'react';
import { connect } from 'dva';
import { Select, Input, Form, Row, Col, Alert } from 'quanta-design';
import { validatorPrices } from '@/pages/Manage/Inner/config';
import ItemTitle from '@/components/ItemTitle';
import styles from './index.less';
import Info from './info';

function NotInWhiteList(props) {
  const { form } = props;
  const { TextArea } = Input;
  const [visible, setVisible] = useState(false);
  const [timeVisible, setTimeVisible] = useState(false);

  return (
    <div className={styles.orderInfo}>
      <div className={styles.note}>
        <Alert
          type="info"
          showIcon
          message="温馨提示：您所在的机构未处于该数据的授权名单中，需要向数据所属机构提交申请，审核通过后才能使用。"
        />
      </div>
      <Info />
      <div>
        <div className={`${styles.applyInfo} container-card`}>
          <ItemTitle title="申请信息" />
          <Form colon={false} hideRequiredMark form={form}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <Form.Item
                    label="有效时间"
                    name="duration"
                    rules={[{ required: true, message: '请选择有效时间' }]}
                  >
                    <Select
                      placeholder="请选择"
                      style={{ width: 160 }}
                      onChange={e => {
                        setVisible(false);
                        if (e === '-1') {
                          setVisible(true);
                        }
                      }}
                    >
                      <Select.Option key={30}>30天</Select.Option>
                      <Select.Option key={60}>60天</Select.Option>
                      <Select.Option key={90}>90天</Select.Option>
                      <Select.Option key={0}>不限</Select.Option>
                      <Select.Option key={-1}>自定义</Select.Option>
                    </Select>
                  </Form.Item>
                  {visible && (
                    <Form.Item
                      name="defineDuration"
                      className={styles.other}
                      rules={[
                        { required: true, message: '有效时间不能为空' },
                        { validator: validatorPrices },
                        // { pattern: '^[0-9]*[1-9][0-9]*$', message: '请输入大于0的整数' },
                      ]}
                    >
                      <Input
                        style={{ marginLeft: 8, width: 160 }}
                        placeholder="请输入有效时间"
                        suffix="天"
                      />
                    </Form.Item>
                  )}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <Form.Item
                    label="有效次数"
                    name="time"
                    rules={[{ required: true, message: '请选择有效次数' }]}
                  >
                    <Select
                      placeholder="请选择"
                      style={{ width: 160 }}
                      onChange={e => {
                        setTimeVisible(false);
                        if (e === '-1') {
                          setTimeVisible(true);
                        }
                      }}
                    >
                      <Select.Option key={100}>100次</Select.Option>
                      <Select.Option key={1000}>1000次</Select.Option>
                      <Select.Option key={10000}>10000次</Select.Option>
                      <Select.Option key={0}>不限</Select.Option>
                      <Select.Option key={-1}>自定义</Select.Option>
                    </Select>
                  </Form.Item>
                  {timeVisible && (
                    <Form.Item
                      name="defineTime"
                      className={styles.other}
                      rules={[
                        { required: true, message: '有效次数不能为空' },
                        { validator: validatorPrices },
                      ]}
                    >
                      <Input
                        style={{ marginLeft: 8, width: 160 }}
                        placeholder="请输入有效次数"
                        suffix="次"
                      />
                    </Form.Item>
                  )}
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="申请理由"
                  name="applyReason"
                  rules={[
                    { required: true, message: '申请理由不能为空' },
                    { max: 100, message: '申请理由不可超过100个字符，请重新输入' },
                  ]}
                >
                  <TextArea rows={4} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default connect(({ datasharing }) => ({
  dataDetail: datasharing.dataDetail,
}))(NotInWhiteList);
