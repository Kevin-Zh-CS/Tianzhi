import React, { useEffect, useState } from 'react';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Icons,
  Modal,
  Popconfirm,
  Row,
  Table,
  Tooltip,
  Select,
} from 'quanta-design';
import {
  Message_STATUS_TAG,
  MESSAGE_STATUS,
  MESSAGE_TYPE,
  ICON_TYPE_TAG,
} from '@/pages/Manage/Inner/File/config';
import { getMessageList, messageDestroy, markMessageRead } from '@/services/message';
import moment from 'moment';
import { connect } from 'dva';
import styles from './index.less';
import Page from '@/components/Page';
import { formatTime } from '@/utils/helper';
import { gotoMessageDetail } from '@/utils/message';

const { QuestionCircleIcon } = Icons;
const { RangePicker } = DatePicker;

function MessageList(props) {
  const { dispatch } = props;
  const [form] = Form.useForm();
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [myOrders, setMyOrders] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasSelected = selectedRowKeys.length > 0;

  const empty = (
    <div className={styles.emptyData}>
      {list.length === 0 && !filterVisible ? '暂无消息～' : '暂无匹配消息'}
    </div>
  );

  // 获取所有的消息
  const loadData = async (page = 1, size = 10, is_asc = false) => {
    const filter = { page, size, is_asc };
    const data = await form.getFieldsValue();
    setPSize(size);
    const dateFormat = 'YYYY-MM-DD';
    const filterData = {
      ...data,
      begin_time: data.time
        ? moment(moment(data.time[0]).format(dateFormat)).valueOf() / 1000
        : undefined,
      end_time: data.time
        ? moment(
            moment(data.time[1])
              .add(1, 'days')
              .format(dateFormat),
          ).valueOf() / 1000
        : undefined,
    };
    if (filterData.time) delete filterData.time;
    const arr = Object.values(filterData).filter(item => item || item === 0);
    if (arr.length > 0) {
      setFilterVisible(true);
    } else {
      setFilterVisible(false);
    }
    setLoading(true);
    const resData = await getMessageList({ ...filter, ...filterData });
    setLoading(false);
    setList(resData.list);
    setTotal(resData.total);
    setCurrentPage(page);
  };

  useEffect(() => {
    loadData();
  }, []);

  const reset = () => {
    form.resetFields();
    setMyOrders(false);
    loadData();
  };

  const onFinish = () => {
    loadData();
  };

  // 左侧多项消息的选择
  const onSelectChange = (rowKey, keys) => {
    setSelectedRowKeys(rowKey);
    setSelectedRows(keys);
  };

  // 删除信息
  const deleteMessage = async record => {
    const ids = record.msg_id;
    await messageDestroy([ids]);
    dispatch({ type: 'message/noteMessage' });
    loadData(currentPage);
  };

  // 批量删除消息
  const batchDeleteMes = () => {
    Modal.info({
      title: `确认删除当前所选${selectedRowKeys.length}条数消息吗？`,
      content: '删除后，消息列表中将不能查看相应内容。',
      style: { top: 240 },
      onOk: async () => {
        const ids = selectedRows.map(item => item.msg_id);
        await messageDestroy(ids);
        dispatch({ type: 'message/noteMessage' });
        loadData(currentPage);
        setSelectedRowKeys([]);
      },
    });
  };

  // 标记已读
  const markRead = async record => {
    const ids = record.msg_id;
    await markMessageRead(ids);
    dispatch({ type: 'message/noteMessage' });
    loadData(currentPage);
  };

  // 批量标记消息已读
  const batchReadMes = () => {
    Modal.info({
      title: `确认将当前所选${selectedRowKeys.length}条消息标记已读吗？`,
      content: '标记后，所选消息状态将会更新。',
      style: { top: 240 },
      onOk: async () => {
        const ids = selectedRows.map(item => item.msg_id);
        await markMessageRead(ids);
        dispatch({ type: 'message/noteMessage' });
        loadData(currentPage);
        setSelectedRowKeys([]);
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // table 的 onChange
  const handlePageChange = async ({ current, pageSize }, filters, sorter) => {
    await loadData(current, pageSize, sorter.order === 'ascend');
    setMyOrders(sorter.order);
  };

  const cancelChoose = () => {
    setSelectedRowKeys([]);
  };

  const columns = [
    {
      title: '消息名称',
      dataIndex: 'title',
      editable: true,
      render: (text, record) => (
        <Tooltip title={text} placement="top">
          <div className={styles.titleItem}>
            <span>{ICON_TYPE_TAG[record.biz_type]}</span>
            <span
              className={styles.titleText}
              onClick={async () => {
                await markRead(record);
                gotoMessageDetail(record);
              }}
            >
              {text}
            </span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: '消息详情',
      dataIndex: 'content',
      width: '33%',
      render: text => (
        <div className={styles.detailItem}>
          <Tooltip title={text} placement="top">
            {text}
          </Tooltip>
        </div>
      ),
    },
    {
      title: '消息类型',
      dataIndex: 'msg_type',
      render: text => <div>{MESSAGE_TYPE[text].value || '-'}</div>,
    },
    {
      title: '消息状态',
      dataIndex: 'msg_status',
      render: text => <div>{Message_STATUS_TAG[text] || '-'}</div>,
    },
    {
      title: '通知时间',
      dataIndex: 'create_time',
      render: text => <div className={styles.timeItem}>{formatTime(text)}</div>,
      sortOrder: myOrders,
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (text, record) => (
        <div>
          <span
            className={record.msg_status ? 'operate disabled-text' : 'operate'}
            onClick={() => {
              markRead(record);
            }}
          >
            标记已读
          </span>
          <span>
            <Popconfirm
              className="operate"
              title="你确定要删除当前消息吗?"
              icon={<QuestionCircleIcon fill="#0076D9" />}
              onConfirm={() => {
                deleteMessage(record);
              }}
            >
              删除
            </Popconfirm>
          </span>
        </div>
      ),
    },
  ];

  return (
    <Page title="消息通知" showBackIcon noContentLayout className={styles.message}>
      <div className={styles.contentWrap}>
        <Form form={form} requiredMark={false} colon={false}>
          <Row gutter={14}>
            <Col className={styles.typeCol}>
              <Form.Item name="msg_type" label="消息类型">
                <Select placeholder="请选择消息类型">
                  {MESSAGE_TYPE.map(item => (
                    <Select.Option key={item.key} value={item.key}>
                      {item.value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col className={styles.typeCol}>
              <Form.Item name="msg_status" label="消息状态">
                <Select placeholder="请选择消息状态">
                  {MESSAGE_STATUS.map(item => (
                    <Select.Option key={item.key} value={item.key}>
                      {item.value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col className={styles.timeCol}>
              <Form.Item name="time" label="通知时间">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col>
              <Button onClick={reset}>重置</Button>
              <Button className={styles.check} type="primary" onClick={onFinish}>
                查询
              </Button>
            </Col>
          </Row>
        </Form>
        <div>
          {hasSelected ? (
            <div className="rowSelectionWrap">
              <span className={styles.fontColor}>已选择 {selectedRowKeys.length || 0} 项</span>
              <span onClick={batchDeleteMes}>删除</span>
              <span onClick={batchReadMes}>标记已读</span>
              <span className="lastBtn" onClick={cancelChoose}>
                取消选择
              </span>
            </div>
          ) : null}
        </div>
        <Table
          className={styles.tableContainer}
          showSorterTooltip={false}
          columns={columns}
          // dataSource={[...list]}
          dataSource={[...list]}
          rowSelection={rowSelection}
          onChange={handlePageChange}
          pagination={{ total, current: currentPage, pageSize: pSize }}
          emptyTableText={empty}
          loading={{
            spinning: loading,
          }}
        />
      </div>
    </Page>
  );
}

export default connect()(MessageList);

// export default Message;
