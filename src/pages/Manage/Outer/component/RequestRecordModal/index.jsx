import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { Modal, Form, Row, Col, Select, DatePicker, Button, Table } from 'quanta-design';
// import router from 'umi/router';
import moment from 'moment';
import { getRecordList } from '@/services/outer-data';
import { requestRecordTypeEnum } from '@/pages/Manage/Outer/config';
import { formatTime } from '@/utils/helper';
import styles from './index.less';
import { getKeyFromList } from '@/pages/Manage/Inner/config';

const { RangePicker } = DatePicker;

function RequestRecordModal(props) {
  const { visible, onCancel, data_id, order_id } = props;
  const [form] = Form.useForm();
  const [currentPage, setCurrent] = useState(1);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(false);

  const columns = [
    {
      title: '操作人',
      dataIndex: 'operator_name',
    },
    {
      title: '操作类型',
      dataIndex: 'op_type',
      render: text => getKeyFromList(requestRecordTypeEnum, text),
    },
    {
      title: '转存目标资源库',
      dataIndex: 'ns_name',
    },
    {
      title: '请求时间',
      dataIndex: 'request_time',
      render: text => <div>{formatTime(text)}</div>,
      sorter: true,
      sortOrder: order,
    },
  ];

  const handleCancel = () => {
    form.resetFields();
    if (onCancel) onCancel();
  };

  const loadData = async (page = 1, size = 10, is_asc = false) => {
    // const params = { page, size };
    const params = { order_id, data_id, page, size };
    const filterList = await form.getFieldValue();
    const dateFormat = 'YYYY-MM-DD';
    const filter = {
      op_type: filterList.op_type,
      is_asc,
      begin_time: filterList.time
        ? moment(moment(filterList.time[0]).format(dateFormat)).valueOf() / 1000
        : undefined,
      end_time: filterList.time
        ? moment(
            moment(filterList.time[1])
              .add(1, 'days')
              .format(dateFormat),
          ).valueOf() / 1000
        : undefined,
    };
    setLoading(true);
    const data = await getRecordList({ ...filter, ...params });
    setLoading(false);
    setList(data.list);
    setTotal(data.total);
    setCurrent(page);
  };

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const handleDataChange = ({ current, pageSize }, filters, sorter) => {
    loadData(current, pageSize, !(sorter.order === 'descend' || !sorter.order));
    setOrder(sorter.order);
  };

  const reset = () => {
    form.resetFields();
    loadData();
    setOrder(false);
  };

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      className={classnames(styles.requestRecordModal, 'modal-has-top-border')}
      title="数据请求记录"
      visible={visible}
      onCancel={handleCancel}
      style={{ margin: '0 auto' }}
      footer={null}
      width={984}
    >
      <Form form={form} requiredMark={false} colon={false}>
        <Row gutter={24} justify="space-between">
          <Col flex="1 1 200px">
            <Form.Item name="op_type" label="操作类型">
              <Select placeholder="请选择">
                {requestRecordTypeEnum.map(item => (
                  <Select.Option key={item.key} value={item.key}>
                    {item.value}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col flex="1 1 320px">
            <Form.Item name="time" label="发布时间">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col>
            <Button onClick={reset}>重置</Button>
            <Button
              type="primary"
              onClick={() => {
                loadData();
              }}
              style={{ marginLeft: 12 }}
            >
              查询
            </Button>
          </Col>
        </Row>
      </Form>
      <Table
        columns={columns}
        dataSource={list}
        showSorterTooltip={false}
        onChange={handleDataChange}
        pagination={{ total, current: currentPage, pageSize: 10, simple: true }}
        loading={{
          spinning: loading,
        }}
      />
    </Modal>
  );
}

export default RequestRecordModal;
