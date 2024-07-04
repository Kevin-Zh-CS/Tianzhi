import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import {
  Alert,
  Input,
  Button,
  Table,
  Form,
  Select,
  DatePicker,
  Tooltip,
  IconBase,
  Tag,
} from 'quanta-design';
import Page from '@/components/Page';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import router from 'umi/router';
import Step from '../../component/Step';
import styles from './index.less';
import moment from 'moment';
import { getObtainList } from '@/services/outer-data';
import { DATA_TYPE, PUB_TYPE, dataTypeMap } from '@/pages/Manage/Outer/config';
import { formatTime, getValueFromList } from '@/utils/helper';
import ButtonGroup from '@/components/ButtonGroup';
import { typeList } from '@/utils/enums';

const { RangePicker } = DatePicker;
function PublishOuter() {
  const [form] = Form.useForm();
  const [showAlert, setShowAlert] = useState(true);
  const [list, setList] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [load, setLoad] = useState(false);
  const [myOrders, setMyOrders] = useState(false);

  const loadData = async (page = 1, size = 10, is_asc = false) => {
    const params = { page, size, is_asc };
    const filterList = await form.getFieldValue();
    setPSize(size);
    const dateFormat = 'YYYY-MM-DD';
    const filter = {
      ...filterList,
      begin_time: filterList.timer
        ? moment(moment(filterList.timer[0]).format(dateFormat)).valueOf() / 1000
        : undefined,
      end_time: filterList.timer
        ? moment(
            moment(filterList.timer[1])
              .add(1, 'days')
              .format(dateFormat),
          ).valueOf() / 1000
        : undefined,
    };
    if (filter.timer) delete filter.timer;
    const arr = Object.values(filterList).filter(item => item || item === 0);
    if (arr.length > 0) {
      setFilterVisible(true);
    } else {
      setFilterVisible(false);
    }
    setLoad(true);
    try {
      const data = await getObtainList({ ...filter, ...params });
      setCurrentPage(page);
      setList(data.list);
      setTotal(data.total);
      setShowAlert(data.list.length === 0 && arr.length === 0);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePageChange = async ({ current, pageSize }, filters, sorter) => {
    loadData(current, pageSize, sorter.order === 'ascend');
    setMyOrders(sorter.order);
  };

  const reset = () => {
    form.resetFields();
    setMyOrders(false);
    loadData();
  };

  const searchData = () => {
    loadData();
  };

  const goToRequest = record => {
    if (!record.is_valid) {
      const { order_id, data_type } = record;
      router.push(
        `/manage/outer/obtain/request?id=${order_id}&type=${data_type}&order_id=${order_id}`,
      );
    }
  };

  const stepData = [
    {
      title: '申请/购买数据',
      content: '通过授权或者积分的形式，获取数据访问凭证',
    },
    {
      title: '请求数据',
      content: '需求方发起请求，数据提供方通过区块链验证凭证合法性',
    },
    {
      title: '转存数据',
      content: '将已获取的数据转存至指定的外部资源库',
    },
  ];

  const stepCurrent = 1;
  const columns = [
    {
      title: '数据标题',
      dataIndex: 'data_name',
      render: (text, record) => (
        <Tooltip title={text} placement="top">
          <div className={styles.tableItem}>
            {record.data_type === 3 ? (
              <i
                className={classNames(
                  'iconfont',
                  dataTypeMap[record.data_type][record.file_format],
                )}
              />
            ) : (
              <IconBase
                icon={
                  record.data_type === 2
                    ? dataTypeMap[record.data_type]
                    : dataTypeMap[record.data_type][record.file_format]
                }
                fill="#DFAF57"
                style={{ marginRight: 10, verticalAlign: 'text-top' }}
              />
            )}
            <span className={styles.textItem}>{text}</span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: '数据哈希',
      dataIndex: 'data_hash',
      render: text => (
        <Tooltip title={text} placement="top">
          <div style={{ cursor: 'default' }} className={styles.hashItem}>
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: '数据状态',
      dataIndex: 'is_valid',
      key: 'is_valid',
      render: val => (val ? <Tag color="default">已失效</Tag> : <Tag color="success">生效中</Tag>),
    },
    {
      title: '数据类型',
      dataIndex: 'data_type',
      render: text => DATA_TYPE[text].value,
    },
    {
      title: '共享类型',
      dataIndex: 'pub_type',
      render: text => getValueFromList(text, PUB_TYPE),
    },
    {
      title: '获取时间',
      dataIndex: 'acquired_time',
      sortOrder: myOrders,
      sorter: true,
      render: text => <div>{formatTime(text)}</div>,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      // width: 200,
      render: (text, record) => (
        <div>
          <span
            className="operate"
            onClick={() => {
              router.push(
                `/manage/outer/obtain/detail?id=${record.order_id}&is_valid=${record.is_valid}`,
              );
            }}
          >
            详情
          </span>
          <Tooltip title={record.is_valid ? '该数据已失效，无权限请求！' : ''}>
            <span
              className={record.is_valid ? 'operate disabled-text' : 'operate'}
              onClick={() => {
                goToRequest(record);
              }}
            >
              请求数据
            </span>
          </Tooltip>
        </div>
      ),
    },
  ];

  const alert = (
    <>
      <Alert
        type="info"
        showIcon
        message="已发布数据是内部资源库中，已经将元信息发布到数据平台中进行共享的数据，原始数据不能修改，仅能对授权名单进行修改。"
      />
      <Step stepData={stepData} current={stepCurrent} />
    </>
  );

  const empty = (
    <div>
      <div style={{ marginBottom: 20, color: '#888' }}>
        暂无已获取数据，快去数据共享平台获取吧～
      </div>
      <Button
        type="primary"
        onClick={() => {
          router.push('/share/platform');
        }}
      >
        获取数据
      </Button>
    </div>
  );

  return (
    <>
      <Page
        title="已获取数据"
        alert={showAlert ? alert : null}
        noContentLayout
        extra={
          <div className="alert-trigger-wrap" onClick={() => setShowAlert(!showAlert)}>
            已获取数据说明
            <IconBase className={showAlert ? 'up' : 'down'} icon={ArrowsDown} fill="#888888" />
          </div>
        }
      >
        {list.length === 0 && !filterVisible ? null : (
          <div className={styles.tableFilterWrap} style={{ marginTop: showAlert ? '12px' : '' }}>
            <Form form={form} requiredMark={false} colon={false} layout="inline">
              <Form.Item name="data_name" label="数据标题">
                <Input placeholder="请输入" style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="data_type" label="数据类型">
                <Select placeholder="请选择" style={{ width: 200 }}>
                  {typeList.map(item => (
                    <Select.Option key={item.key} value={item.key}>
                      {item.value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="pub_type" label="共享类型">
                <Select placeholder="请选择" style={{ width: 200 }}>
                  {PUB_TYPE.map(item => (
                    <Select.Option key={item.key} value={item.key}>
                      {item.value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="timer" label="获取时间">
                <RangePicker style={{ width: 320 }} />
              </Form.Item>
              <div className={styles.btnContainer}>
                <ButtonGroup left="重置" right="查询" onClickL={reset} onClickR={searchData} />
              </div>
            </Form>
          </div>
        )}
      </Page>
      <div className={styles.contentWrap}>
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          onChange={handlePageChange}
          showSorterTooltip={false}
          pagination={{ total, current: currentPage, pageSize: pSize }}
          emptyTableText={
            filterVisible ? <div className={styles.fontColor}>暂无匹配数据</div> : empty
          }
          loading={{
            spinning: load,
          }}
        />
      </div>
    </>
  );
}

export default PublishOuter;
