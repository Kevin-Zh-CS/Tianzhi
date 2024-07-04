import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { formatTime } from '@/utils/helper';
import { Modal, Form, Row, Col, Select, DatePicker, Button, Table, Tooltip } from 'quanta-design';
import router from 'umi/router';
import moment from 'moment';
import styles from './index.less';

const { RangePicker } = DatePicker;

function PublishRecordModal(props) {
  const { visible, onCancel, databaseRecords, dispatch, namespace, dbHash, loading } = props;
  const [currentPage, setCurrentPage] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [order, setOrder] = useState(false);
  const [form] = Form.useForm();

  const loadData = async (page = 1, size = 10, isAsc = false) => {
    const data = await form.getFieldsValue();
    const { type, time } = data;
    setCurrentPage(page);
    setPSize(size);
    dispatch({
      type: 'database/databaseRecords',
      payload: {
        namespace,
        dbHash,
        type,
        page,
        size,
        isAsc,
        beginTime:
          typeof time !== 'undefined'
            ? moment(moment(time[0]).format('YYYY-MM-DD')).valueOf() / 1000
            : '',
        endTime:
          typeof time !== 'undefined'
            ? moment(moment(time[1]).format('YYYY-MM-DD')).valueOf() / 1000
            : '',
      },
    });
  };
  const handleRefresh = async (e = {}, _, sorter = {}) => {
    const { current = 1, pageSize = 10 } = e;
    await loadData(current, pageSize, sorter.order !== 'ascend');
    setOrder(sorter.order);
  };
  const reset = () => {
    form.resetFields();
    setOrder(false);
    loadData();
  };
  useEffect(() => {
    loadData();
  }, []);

  const handleCancel = () => {
    form.resetFields();
    onCancel();
    setOrder(false);
  };

  const goToDetail = record => {
    router.push(
      `/manage/inner/repository/origin/detail/published?namespace=${namespace}&id=${record.did}`,
    );
  };

  const handleData = () => {
    loadData();
  };

  const columns = [
    {
      title: '操作人',
      dataIndex: 'publisher',
    },
    {
      title: '数据类型',
      dataIndex: 'd_type',
      render: res => (res === 3 ? '数据源' : '模型'),
    },
    {
      title: '数据名称',
      dataIndex: 'name',
    },
    {
      title: '发布时间',
      dataIndex: 'publish_time',
      sorter: true,
      sortOrder: order,
      render: res => formatTime(res),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) => (
        <Tooltip placement="top" title={record.role !== 0 ? '无当前数据源查看权限！' : ''}>
          <span
            className={classnames('operate', record.role !== 0 ? 'disabled-style' : '')}
            onClick={() => {
              if (record.role !== 0) return;
              goToDetail(record);
            }}
          >
            详情
          </span>
        </Tooltip>
      ),
    },
  ];
  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      className={classnames(styles.publishRecordModal, 'modal-has-top-border')}
      title="已发布记录"
      visible={visible}
      onCancel={handleCancel}
      style={{ margin: '0 auto' }}
      footer={null}
      width={984}
    >
      <Form name="modal-ref" requiredMark={false} colon={false} form={form}>
        <Row gutter={24} justify="space-between">
          <Col flex="1 1 200px">
            <Form.Item name="type" label="数据类型">
              <Select placeholder="请选择">
                <Select.Option value={3}>数据源</Select.Option>
                <Select.Option value={2}>模型</Select.Option>
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
            <Button type="primary" style={{ marginLeft: 12 }} onClick={handleData}>
              查询
            </Button>
          </Col>
        </Row>
      </Form>
      <Table
        columns={columns}
        dataSource={databaseRecords.list}
        showSorterTooltip={false}
        rowKey="did"
        onChange={handleRefresh}
        pagination={{
          current: currentPage,
          total: databaseRecords.total,
          pageSize: pSize,
        }}
        emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
        loading={{
          spinning: loading,
        }}
      />
    </Modal>
  );
}

export default connect(({ database, loading }) => ({
  databaseRecords: database.databaseRecords,
  loading: loading.effects['database/databaseRecords'],
}))(PublishRecordModal);
