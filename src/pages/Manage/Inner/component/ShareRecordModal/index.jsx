import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { formatTime } from '@/utils/helper';
import { Modal, Form, Select, DatePicker, Table, Tooltip } from 'quanta-design';
import styles from './index.less';
import ButtonGroup from '@/components/ButtonGroup';
import moment from 'moment';

const { RangePicker } = DatePicker;

function ShareRecordModal(props) {
  const { visible, onCancel, dispatch, dataId, txRecordList, orgList, loading } = props;
  const [cur, setCurrent] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '数据需求方',
      dataIndex: 'applier_name',
    },
    {
      title: '交易哈希',
      dataIndex: 'tx_hash',
      ellipsis: {
        showTitle: false,
      },
      render: text => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '区块哈希',
      dataIndex: 'blk_hash',
      ellipsis: {
        showTitle: false,
      },
      render: text => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '数据获取时间',
      dataIndex: 'obtained_time',
      sorter: true,
      render: val => formatTime(val),
    },
  ];

  const handleRefresh = async (e = {}, _, sorter = {}) => {
    const { current = 1, pageSize = 10 } = e;
    setPSize(pageSize);
    const data = await form.getFieldsValue();
    const { applier, time } = data;
    dispatch({
      type: 'datasharing/txRecordList',
      payload: {
        isAsc: sorter.order === 'ascend',
        page: current,
        size: pageSize,
        dataId,
        orgAddress: applier,
        beginTime:
          time && typeof time ? moment(moment(time[0]).format('YYYY-MM-DD')).valueOf() / 1000 : '',
        endTime:
          typeof time !== 'undefined'
            ? moment(
                moment(time[1])
                  .add(1, 'days')
                  .format('YYYY-MM-DD'),
              ).valueOf() / 1000
            : '',
      },
    }).then(() => {
      setCurrent(current);
    });
  };

  useEffect(() => {
    if (visible) {
      handleRefresh();
      dispatch({
        type: 'datasharing/orgList',
      });
    }
  }, [visible]);

  const reset = () => {
    form.resetFields();
    handleRefresh();
  };

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      className={classnames(styles.shareRecordModal, 'modal-has-top-border')}
      title="共享记录"
      visible={visible}
      onCancel={onCancel}
      style={{ margin: '0 auto' }}
      footer={null}
      width={900}
    >
      <div className={styles.tableFilterWrap}>
        <Form form={form} name="modal-ref" requiredMark={false} colon={false} layout="inline">
          <Form.Item name="applier" label="数据需求方">
            <Select placeholder="请选择" style={{ width: 178 }}>
              {orgList?.list?.map(res => (
                <Select.Option value={res.org_id}>{res.org_name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="time" label="获取时间">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="time">
            <ButtonGroup
              left="重置"
              right="查询"
              style={{ marginLeft: 8 }}
              onClickL={reset}
              onClickR={handleRefresh}
            />
          </Form.Item>
        </Form>
      </div>
      <Table
        columns={columns}
        showSorterTooltip={false}
        dataSource={txRecordList.list}
        onChange={handleRefresh}
        rowKey="order_id"
        pagination={{
          current: cur,
          total: txRecordList.total,
          pageSize: pSize,
        }}
        loading={{
          spinning: loading,
        }}
      />
    </Modal>
  );
}
export default connect(({ datasharing, loading }) => ({
  txRecordList: datasharing.txRecordList,
  orgList: datasharing.orgList,
  loading: loading.effects['datasharing/txRecordList'],
}))(ShareRecordModal);
