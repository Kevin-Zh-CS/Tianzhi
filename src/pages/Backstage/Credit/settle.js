import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import NewPage from '@/components/Page';
import styles from './index.less';

import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  Alert,
  Icons,
  Modal,
  message,
  Tooltip,
} from 'quanta-design';
import moment from 'moment';
import { createCycle, creditLiquidationList, queryLatestCycle } from '@/services/blacklist';
import {
  getTotalBalance,
  LIQUIDATION_STATUS,
  SETTLE_STATUS_TAG,
} from '@/pages/Backstage/Credit/config';
import { formatDate, formatTime } from '@/utils/helper';
import router from 'umi/router';

const { RangePicker } = DatePicker;
const { PlusIcon } = Icons;
function CreditSettle(props) {
  const { orgInfo } = props;
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [order, setOrder] = useState(false);
  const [disable, setDisable] = useState(true);
  const [lastDetail, setLastDetail] = useState({});

  const dateFormat = 'YYYY/MM/DD';
  const formItemLayout = {
    labelCol: { style: { width: 120, textAlign: 'right' } },
    wrapperCol: {},
  };

  const disabledDate = current => {
    const tooLate = current < moment(lastDetail.end_time * 1000).endOf('day');
    const tooEarly = current > moment().startOf('day');
    return tooEarly || tooLate;
  };

  const handleInit = async () => {
    const detail = await queryLatestCycle(orgInfo.org_id);
    setDisable(!detail.new_liquidation);
    setLastDetail(detail);
  };

  const loadData = async (page = 1, size = 10, is_time_desc = true) => {
    const params = { page, size, is_time_desc, org_id: orgInfo.org_id };
    setPSize(size);
    const filterList = await form.getFieldsValue();
    const filter = {
      ...filterList,
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
    if (filter.time) delete filter.time;
    const arr = Object.values(filterList).filter(item => item === 0 || item);
    if (arr.length > 0) {
      setFilterVisible(true);
    } else {
      setFilterVisible(false);
    }
    setLoading(true);
    try {
      const dataList = await creditLiquidationList({ ...params, ...filter });
      setList(dataList.list);
      setTotal(dataList.total);
      setCurrentPage(page);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = () => {
    loadData();
  };

  const reset = async () => {
    await form.resetFields();
    setOrder(false);
    loadData();
  };

  const addSettle = () => {
    if (lastDetail.end_time) {
      modalForm.setFieldsValue({
        begin_time: !lastDetail.liquid_cycle_id
          ? moment(lastDetail.end_time * 1000).startOf('day')
          : moment(lastDetail.end_time * 1000)
              .add(1, 'day')
              .startOf('day'),
      });
      setAddVisible(true);
    }
  };

  const handleRefresh = async ({ current, pageSize }, filters, sorter) => {
    await loadData(current, pageSize, sorter.order === 'descend' || !sorter.order);
    setOrder(sorter.order);
  };

  const checkDetail = record => {
    router.push(
      `/backstage/credit/settle/detail?id=${record.liquid_cycle_id}&index=${record.liquid_cycle_index}`,
    );
  };

  const createLoadData = () => {
    setTimeout(async () => {
      const params = { page: 1, size: 10, is_time_desc: true, org_id: orgInfo.org_id };
      try {
        const dataList = await creditLiquidationList(params);
        if (dataList.total === total) {
          createLoadData();
        } else {
          setList(dataList.list);
          setTotal(dataList.total);
          setCurrentPage(1);
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    }, 3000);
  };

  const handleOk = async () => {
    const values = await modalForm.validateFields();
    const end = moment(moment(values.end_time).format('YYYY-MM-DD')).valueOf() / 1000;
    const begin = moment(moment(values.begin_time).format('YYYY-MM-DD')).valueOf() / 1000;
    const params = {
      org_id: orgInfo.org_id,
      name: values.name,
      end_time: begin === end ? end + 1 : end,
      begin_time: begin,
    };

    setAddVisible(false);

    Modal.info({
      title: '确认提交本次新建的清算周期吗？',
      content: '提交后，本次配置的周期信息将不能修改，需等待各机构确认。',
      style: { top: 240 },
      onOk: async () => {
        // 调用接口params
        await createCycle(params);
        setLoading(true);
        createLoadData();
        message.success('清算周期新建成功！');
        handleInit();
        Modal.destroyAll();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  useEffect(() => {
    if (orgInfo && orgInfo.org_id) {
      loadData();
      handleInit();
    }
  }, [orgInfo]);

  const columns = [
    {
      title: '周期名称',
      dataIndex: 'name',
    },
    {
      title: '清算发起方',
      dataIndex: 'initiator_org_name',
    },
    {
      title: '周期区间',
      dataIndex: 'time',
      render: (_, record) => `${formatDate(record.begin_time)} 至 ${formatDate(record.end_time)}`,
    },
    {
      title: '本机构收支总计',
      align: 'right',
      dataIndex: 'total_amount',
      render: text => <div>{getTotalBalance(text)}</div>,
    },
    {
      title: '清算状态',
      dataIndex: 'liquidation_status',
      render: text => SETTLE_STATUS_TAG[text] || '-',
    },
    {
      title: '更新时间',
      dataIndex: 'create_time',
      render: text => <div>{formatTime(text)}</div>,
      sorter: true,
      sortOrder: order,
    },
    {
      title: '操作',
      dataIndex: 'order_id',
      render: (_, record) => (
        <div
          className="operate"
          onClick={() => {
            checkDetail(record);
          }}
        >
          查看详情
        </div>
      ),
    },
  ];
  return (
    <NewPage
      title="积分清算"
      alert={
        <Alert
          type="info"
          message="温馨提示：联盟内所有机构超级管理员均有权新建清算周期，周期一旦创建不能修改，且相同流水不能重复清算。"
          showIcon
        />
      }
      noContentLayout
    >
      {!filterVisible && !list.length ? null : (
        <div className={styles.tableFilterWrap}>
          <Form form={form} layout="inline" onFinish={onFinish} requiredMark={false} colon={false}>
            <Form.Item name="name" label="周期名称">
              <Input placeholder="请输入" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="liquidation_status" label="清算状态">
              <Select placeholder="请选择" style={{ width: 200 }}>
                {LIQUIDATION_STATUS.filter(item => item.key).map(item => (
                  <Select.Option key={item.key}>{item.value}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="time" label="更新时间">
              <RangePicker style={{ width: 320 }} />
            </Form.Item>
            <div className={styles.btnContainer}>
              <Button onClick={reset}>重置</Button>
              <Button style={{ marginLeft: 8 }} type="primary" htmlType="submit">
                查询
              </Button>
            </div>
          </Form>
        </div>
      )}

      <div className={styles.tableWrap}>
        <Tooltip title={disable ? '联盟内暂无交易，不支持创建清算周期！' : ''}>
          <Button
            type="primary"
            icon={<PlusIcon fill="currentColor" />}
            onClick={addSettle}
            style={{ marginBottom: 16 }}
            disabled={disable}
          >
            清算周期
          </Button>
        </Tooltip>
        <Table
          columns={columns}
          dataSource={list}
          onChange={handleRefresh}
          pagination={{ total, current: currentPage, pageSize: pSize }}
          emptyTableText={
            <div className={styles.emptyData}>
              {!filterVisible ? '暂无数据，快去新建清算周期吧～' : '暂无匹配数据'}
            </div>
          }
          loading={{
            spinning: loading,
          }}
        />
      </div>
      <Modal
        maskClosable={false}
        keyboard={false}
        destroyOnClose
        title="新建清算周期"
        visible={addVisible}
        onOk={handleOk}
        onCancel={() => {
          setAddVisible(false);
        }}
      >
        <Alert
          type="info"
          message="温馨提示：联盟内初次清算，开始时间为首次产生交易的日期；其余周期开始时间均为上一周期结束时间次日。"
          showIcon
        />
        <Form colon={false} hideRequiredMark form={modalForm} style={{ marginTop: 20 }}>
          <Form.Item
            name="name"
            label="周期名称"
            rules={[
              { required: true, message: '请输入周期名称' },
              { max: 30, message: '周期名称不可超过30个字符，请重新输入' },
            ]}
            {...formItemLayout}
          >
            <Input style={{ width: 280 }} placeholder="请输入周期名称" />
          </Form.Item>
          <Form.Item
            name="begin_time"
            label="开始时间"
            rules={[{ required: true, message: '请选择开始时间' }]}
            {...formItemLayout}
          >
            <DatePicker style={{ width: 280 }} disabled format={dateFormat} />
          </Form.Item>
          <Form.Item
            name="end_time"
            label="结束时间"
            rules={[{ required: true, message: '请选择结束时间' }]}
            {...formItemLayout}
          >
            <DatePicker
              disabledDate={disabledDate}
              style={{ width: 280 }}
              placeholder="请选择结束时间"
            />
          </Form.Item>
        </Form>
      </Modal>
    </NewPage>
  );
}

export default connect(({ organization }) => ({
  orgInfo: organization.info,
}))(CreditSettle);
