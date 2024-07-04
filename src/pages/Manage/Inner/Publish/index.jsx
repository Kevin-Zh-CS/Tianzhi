import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Alert,
  Input,
  Button,
  Table,
  Form,
  Select,
  DatePicker,
  IconBase,
  Tooltip,
} from 'quanta-design';
import Page from '@/components/NewPage';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import router from 'umi/router';
import Step from '../../component/Step';
import styles from './index.less';
import moment from 'moment';
import { getSourcePublishList } from '@/services/resource';
import SelectResource from '@/components/SelectResource';
import {
  DATA_TYPE,
  PUB_TYPE,
  PUBLISH_STATUS_TAG,
  getKeyFromList,
  getFileIcon,
} from '@/pages/Manage/Inner/config';
import { formatTime } from '@/utils/helper';
import ButtonGroup from '@/components/ButtonGroup';

const { RangePicker } = DatePicker;

const stepData = [
  {
    title: '创建资源库',
    content: '为不同类型事务创建资源库，方便管理本地资源',
  },
  {
    title: '上传/新建数据',
    content: '在指定资源库中上传/新建数据，用于内部使用或节点共享',
  },
  {
    title: '发布数据元信息',
    content: '将数据元信息发布至数据共享平台，进行数据共享',
  },
];

const stepCurrent = 3;

function PublishInner() {
  const [form] = Form.useForm();
  const [showAlert, setShowAlert] = useState(true);
  const [list, setList] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(false);

  const loadData = async (page = 1, size = 10, is_asc = false) => {
    const params = { page, size, is_asc };
    setPSize(size);
    const filterList = await form.getFieldsValue();
    const dateFormat = 'YYYY-MM-DD';
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
    if (params.timer) delete params.timer;
    const arr = Object.values(filterList).filter(item => item === 0 || item);
    if (arr.length > 0) {
      setFilterVisible(true);
    } else {
      setFilterVisible(false);
    }
    setLoading(true);
    try {
      const data = await getSourcePublishList({ ...filter, ...params });
      setCurrentPage(page);
      setList(data.list);
      setTotal(data.total);
      setShowAlert(data.list.length === 0 && arr.length === 0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async ({ current, pageSize }, filters, sorter) => {
    await loadData(current, pageSize, sorter.order === 'ascend');
    setOrder(sorter.order);
  };

  useEffect(() => {
    loadData();
  }, []);

  const reset = () => {
    form.resetFields();
    setOrder(false);
    loadData();
  };

  const searchData = () => {
    loadData();
  };

  const goToDetail = record => {
    switch (record.data_type) {
      case 0:
        router.push(
          `/manage/inner/publish/file?namespace=${record.ns_id}&id=${record.data_id}&dir=${record.file_path}`,
        );
        break;
      case 1:
        router.push(
          `/manage/inner/publish/interface?namespace=${record.ns_id}&id=${record.data_id}`,
        );
        break;
      case 2:
        router.push(`/manage/inner/publish/model?namespace=${record.ns_id}&id=${record.data_id}`);
        break;
      case 3:
        router.push(`/manage/inner/publish/origin?namespace=${record.ns_id}&id=${record.data_id}`);
        break;
      default:
        break;
    }
  };

  const goToPublish = () => {
    router.push('/manage/inner/repository');
  };

  const columns = [
    {
      title: '数据标题',
      dataIndex: 'data_name',
      render: (text, record) => (
        <Tooltip title={text} placement="top">
          <div className={styles.tableItem}>
            {record.data_type === 3 ? (
              <i className={classNames('iconfont', getFileIcon(record.data_type, record.kind))} />
            ) : (
              <IconBase
                icon={getFileIcon(record.data_type, record.kind)}
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
      render: value => (
        <Tooltip title={value} placement="top">
          <div style={{ cursor: 'default' }} className={styles.hashItem}>
            {value}
          </div>
        </Tooltip>
      ),
    },
    {
      title: '所属资源库',
      dataIndex: 'ns_name',
      render: text => (
        <Tooltip title={text} placement="top">
          <div className={styles.hashItem}> {text || '-'}</div>
        </Tooltip>
      ),
    },
    {
      title: '数据类型',
      dataIndex: 'data_type',
      render: text => DATA_TYPE[text].value,
    },
    {
      title: '共享类型',
      dataIndex: 'pub_type',
      render: text => getKeyFromList(PUB_TYPE, text),
    },
    {
      title: '发布状态',
      dataIndex: 'status',
      render: text => <div>{PUBLISH_STATUS_TAG[text] || '-'}</div>,
    },
    {
      title: '修改时间',
      dataIndex: 'update_time',
      sorter: true,
      sortOrder: order,
      render: text => <div>{formatTime(text)}</div>,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (text, record) =>
        record.can_query ? (
          <span
            className="operate"
            onClick={() => {
              goToDetail(record);
            }}
          >
            详情
          </span>
        ) : null,
    },
  ];

  const alert = (
    <>
      <Alert
        type="info"
        message="已发布数据是内部资源库中，已经将元信息发布到数据平台中进行共享的数据，原始数据不能修改，仅能对授权名单进行修改。"
        showIcon
        // closable
      />
      <Step stepData={stepData} current={stepCurrent} />
    </>
  );

  return (
    <div>
      <Page
        title="已发布数据"
        extra={
          <div className="alert-trigger-wrap" onClick={() => setShowAlert(!showAlert)}>
            已发布数据说明
            <IconBase className={showAlert ? 'up' : 'down'} icon={ArrowsDown} fill="#888888" />
          </div>
        }
        alert={showAlert ? alert : null}
        noContentLayout
      >
        {list.length === 0 && !filterVisible ? null : (
          <div className={styles.tableFilterWrap} style={{ marginTop: showAlert ? '12px' : '' }}>
            <div className={styles.block}>
              <Form form={form} name="modal-ref" layout="inline" requiredMark={false} colon={false}>
                <Form.Item name="name" label="数据标题">
                  <Input placeholder="请输入" style={{ width: 200 }} />
                </Form.Item>
                <Form.Item name="data_type" label="数据类型">
                  <Select placeholder="请选择" style={{ width: 200 }}>
                    {DATA_TYPE.map(item => (
                      <Select.Option key={item.key} value={item.key}>
                        {item.value}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="status" label="发布状态">
                  <Select placeholder="请选择" style={{ width: 200 }}>
                    <Select.Option value={1}>已发布</Select.Option>
                    <Select.Option value={2}>已下架</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="ns_id" label="所属资源库">
                  <SelectResource style={{ width: 200 }} />
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
                <Form.Item name="time" label="修改时间">
                  <RangePicker style={{ width: 320 }} />
                </Form.Item>
                <div className={styles.btnContainer}>
                  <ButtonGroup left="重置" right="查询" onClickL={reset} onClickR={searchData} />
                </div>
              </Form>
              <div className={styles.clear}></div>
            </div>
          </div>
        )}
      </Page>
      <div className={styles.contentWrap}>
        <Table
          columns={columns}
          dataSource={list}
          showSorterTooltip={false}
          rowKey="id"
          onChange={handlePageChange}
          pagination={{ total, current: currentPage, pageSize: pSize }}
          emptyTableText={
            filterVisible ? (
              <div>暂无匹配数据</div>
            ) : (
              <div>
                <div style={{ marginBottom: 20 }}>暂无已发布数据，快去商城查看吧～</div>
                <div>
                  <Button type="primary" onClick={goToPublish}>
                    发布数据
                  </Button>
                </div>
              </div>
            )
          }
          loading={{
            spinning: loading,
          }}
        />
      </div>
    </div>
  );
}

export default PublishInner;
