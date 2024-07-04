import React, { useEffect } from 'react';
import { Input, Select, DatePicker, Row, Col, Form } from 'quanta-design';
import { connect } from 'dva';
import ButtonGroup from '@/components/ButtonGroup';
import { DATA_TYPE, MODEL_STATUS_TYPE, ORDER_STATE_TYPE, ORG_NAME } from '@/utils/enums';
import moment from 'moment';

// 订单筛选
function ShareFilter(props) {
  const { isProvider, dispatch, isAuth = false, form, keyData } = props;
  const { RangePicker } = DatePicker;
  const onSearch = async () => {
    const data = await form.getFieldsValue();
    const { time } = data;
    const params = {
      ...data,
      beginTime:
        time !== undefined ? moment(moment(time[0]).format('YYYY-MM-DD')).valueOf() / 1000 : null,
      endTime:
        time !== undefined
          ? moment(
              moment(time[1])
                .add(1, 'days')
                .format('YYYY-MM-DD'),
            ).valueOf() / 1000
          : null,
    };
    delete params.time;
    if (keyData === 'obtainAuth') {
      dispatch({
        type: 'datasharing/authOrderByApplicant',
        payload: { ...params },
      });
    }
    if (keyData === 'obtainCredit') {
      dispatch({
        type: 'datasharing/creditOrderByApplicant',
        payload: { ...params },
      });
    }

    if (keyData === 'provideAuth') {
      dispatch({
        type: 'datasharing/authOrderBySupplier',
        payload: { ...params },
      });
    }

    if (keyData === 'provideCredit') {
      dispatch({
        type: 'datasharing/creditOrderBySupplier',
        payload: { ...params },
      });
    }
  };
  const onReset = () => {
    form.resetFields();
    onSearch();
  };
  useEffect(() => {
    if (keyData === 'obtainAuth') {
      dispatch({ type: 'datasharing/authOrderByApplicant' });
    }
    if (keyData === 'obtainCredit') {
      dispatch({ type: 'datasharing/creditOrderByApplicant' });
    }
    if (keyData === 'provideAuth') {
      dispatch({ type: 'datasharing/authOrderBySupplier' });
    }
    if (keyData === 'provideCredit') {
      dispatch({ type: 'datasharing/creditOrderBySupplier' });
    }
  }, [keyData]);
  const formItemLayout = {
    labelCol: { style: { width: 56, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: { style: { width: 200, textAlign: 'left', marginLeft: 12 } },
  };
  const dateFormItemLayout = {
    labelCol: { style: { width: 56, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: { style: { width: 320, textAlign: 'left', marginLeft: 12 } },
  };
  const buttonFormItemLayout = {
    labelCol: { style: { width: 26, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: { style: { width: 320, textAlign: 'left', marginLeft: 8 } },
  };
  return (
    <Form form={form} requiredMark={false} colon={false}>
      <Row gutter={24} style={{ height: 53 }}>
        <Col>
          <Form.Item label="数据标题" name="dataName" {...formItemLayout}>
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item label="数据类型" name="dataType" {...formItemLayout}>
            <Select placeholder="请选择">
              {DATA_TYPE.map(item => (
                <Select.Option key={item.key} value={item.key}>
                  {item.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col>
          <Form.Item
            label={isProvider ? '下单机构' : '所属机构'}
            name="orgName"
            {...formItemLayout}
          >
            <Select id="orgName" placeholder="请选择">
              {ORG_NAME.map(item => (
                <Select.Option key={item.key} value={item.key}>
                  {item.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24} style={{ height: 32 }}>
        <Col>
          <Form.Item label="订单状态" name="odStatus" {...formItemLayout}>
            <Select placeholder="请选择">
              {isAuth ? (
                <>
                  {MODEL_STATUS_TYPE.map(item => (
                    <Select.Option key={item.key} value={item.key}>
                      {item.value}
                    </Select.Option>
                  ))}
                </>
              ) : (
                <>
                  {ORDER_STATE_TYPE.map(item => (
                    <Select.Option key={item.key} value={item.key}>
                      {item.value}
                    </Select.Option>
                  ))}
                </>
              )}
            </Select>
          </Form.Item>
        </Col>
        <Col>
          <Form.Item label="下单时间" name="time" {...dateFormItemLayout}>
            <RangePicker width={320} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item name="time" {...buttonFormItemLayout}>
            <ButtonGroup left="重置" right="查询" onClickL={onReset} onClickR={onSearch} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

export default connect()(ShareFilter);
