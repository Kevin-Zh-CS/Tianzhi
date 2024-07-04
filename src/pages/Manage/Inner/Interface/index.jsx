import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Table,
  Form,
  Alert,
  DatePicker,
  IconBase,
  Modal,
  Select,
  Icons,
  Popconfirm,
  Tooltip,
  message,
} from 'quanta-design';
import Page from '@/components/NewPage';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import Step from '../../component/Step';
import router from 'umi/router';
import styles from './index.less';
import moment from 'moment';
import { getInterfaceList, interfaceBatchDestroy, interfaceDestroy } from '@/services/interface';
import {
  PUBLISH_INIT_STATUS,
  PUBLISH_STATUS,
  PUBLISH_STATUS_TAG,
} from '@/pages/Manage/Inner/File/config';
import { formatTime, getRoleAuth } from '@/utils/helper';
import { ReactComponent as Get } from '@/icons/get.svg';
import { ReactComponent as Post } from '@/icons/post.svg';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import { MANAGE_ROLE_LIST_TYPE } from '@/constant/public';
import { PERMISSION } from '@/utils/enums';
import { connect } from 'dva';

const { RangePicker } = DatePicker;
const { QuestionCircleIcon, PlusIcon } = Icons;

function InterfaceManage(props) {
  const stepData = [
    {
      title: '创建资源库',
      content: '为不同类型事务创建资源库，方便管理本地资源',
    },
    {
      title: '准备接口信息',
      content: '准备需要发布的指定接口的基本信息',
    },
    {
      title: '发布数据元信息',
      content: '将数据元信息发布至数据共享平台，进行数据共享',
    },
  ];
  const stepCurrent = 2;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [rowKeys, setRowKeys] = useState([]);
  const [showAlert, setShowAlert] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [order, setOrder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { authAll } = props;
  const { namespace } = props.location.query;

  const auth = useAuth({ ns_id: namespace });

  // 获取数据
  const loadData = async (page = 1, size = 10, is_asc = false) => {
    const filter = {
      page,
      size,
      is_asc,
    };
    const res = await form.getFieldsValue();
    const arr = Object.values(res).filter(item => item || item === 0);
    const dateFormat = 'YYYY-MM-DD';
    setPSize(size);
    const filterData = {
      name: res.name,
      status: res.status,
      begin_time: res.time
        ? moment(moment(res.time[0]).format(dateFormat)).valueOf() / 1000
        : undefined,
      end_time: res.time
        ? moment(
            moment(res.time[1])
              .add(1, 'days')
              .format(dateFormat),
          ).valueOf() / 1000
        : undefined,
    };
    if (arr.length > 0) {
      setFilterVisible(true);
    } else {
      setFilterVisible(false);
    }
    setLoading(true);
    const data = await getInterfaceList(namespace, { ...filter, ...filterData });
    setLoading(false);
    setCurrentPage(page);
    setList(data.list);
    setTotal(data.total);
    return data.list.length === 0 && arr.length === 0;
  };

  // 重置
  const reset = () => {
    form.resetFields();
    setOrder(false);
    loadData().then(_showAlert => setShowAlert(_showAlert));
  };

  const onFinish = () => {
    loadData();
  };

  useEffect(() => {
    loadData().then(_showAlert => setShowAlert(_showAlert));
  }, []);

  const onSelectChange = (rowKey, keys) => {
    setSelectedRowKeys(rowKey);
    setRowKeys(keys);
  };

  // 删除
  const deleteFile = async record => {
    await interfaceDestroy(namespace, record.id);
    message.success('数据删除成功！');
    loadData();
  };

  // 详情
  const goToDetail = record => {
    router.push(
      record.status === PUBLISH_INIT_STATUS.init
        ? `/manage/inner/repository/interface/detail/unpublished?&namespace=${namespace}&id=${record.id}`
        : `/manage/inner/repository/interface/detail/published?&namespace=${namespace}&id=${record.id}`,
    );
  };

  // 发布
  const goToPublish = record => {
    router.push(
      `/manage/inner/repository/interface/publish?namespace=${namespace}&id=${record.id}`,
    );
  };

  // table 的 onChange
  const handlePageChange = ({ current, pageSize }, filters, sorter) => {
    loadData(current, pageSize, sorter.order === 'ascend');
    setOrder(sorter.order);
  };

  const start = () => {
    Modal.info({
      title: `确认删除当前所选的${selectedRowKeys.length}行数据吗？`,
      content: '删除后，数据将会更新。',
      style: { top: 240 },
      onOk: async () => {
        await interfaceBatchDestroy(namespace, selectedRowKeys);
        loadData();
        setSelectedRowKeys([]);
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: record => ({
      disabled:
        !getRoleAuth(authAll, record.role).includes(PERMISSION.del) ||
        record.status === PUBLISH_INIT_STATUS.publish,
    }),
  };

  const hasSelected = selectedRowKeys.length > 0;
  const hasPublishedData = rowKeys.filter(item => item.status === 1 || item.status === 2);

  const columns = [
    {
      title: '数据名称',
      dataIndex: 'name',
      render: (text, record) => (
        <Tooltip title={text} placement="top">
          <div className={styles.titleItem}>
            {record.req_method === 0 ? (
              <IconBase icon={Get} style={{ marginRight: 10, verticalAlign: 'text-top' }} />
            ) : (
              <IconBase icon={Post} style={{ marginRight: 10, verticalAlign: 'text-top' }} />
            )}
            <span>{text}</span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: '数据哈希',
      dataIndex: 'hash',
      render: text => (
        <Tooltip title={text} placement="top">
          <div style={{ cursor: 'default' }} className={styles.hashItem}>
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: '发布状态',
      dataIndex: 'status',
      render: text => <div>{PUBLISH_STATUS_TAG[text] || '-'}</div>,
    },
    {
      title: '修改时间',
      dataIndex: 'update_time',
      render: (text, record) => {
        const obj = {
          children: <div>{formatTime(text)}</div>,
          props: {},
        };
        if (record.flag) obj.props.colSpan = 0;
        return obj;
      },
      sortOrder: order,
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (text, record) => (
        <div>
          <div
            className="operate"
            onClick={() => {
              goToDetail(record);
            }}
          >
            详情
          </div>
          {getRoleAuth(authAll, record.role).includes(PERMISSION.publish) &&
          record.status === PUBLISH_INIT_STATUS.init ? (
            <div className="operate" onClick={() => goToPublish(record)}>
              发布
            </div>
          ) : null}
          {getRoleAuth(authAll, record.role).includes(PERMISSION.del) &&
          record.status === PUBLISH_INIT_STATUS.init ? (
            <div className="operate">
              <Popconfirm
                title="你确定要删除当前数据吗?"
                icon={<QuestionCircleIcon fill="#0076D9" />}
                onConfirm={() => deleteFile(record)}
              >
                删除
              </Popconfirm>
            </div>
          ) : null}
        </div>
      ),
    },
  ];

  const alert = (
    <>
      <Alert type="info" message="接口管理的功能定义：接口管理对接口进行统一管理。" showIcon />
      <Step stepData={stepData} current={stepCurrent} />
    </>
  );

  return (
    <div>
      <Page
        title="接口管理"
        extra={
          <div
            className="alert-trigger-wrap"
            onClick={() => {
              setShowAlert(!showAlert);
            }}
          >
            接口管理使用说明
            <IconBase className={showAlert ? 'up' : 'down'} icon={ArrowsDown} fill="#888888" />
          </div>
        }
        alert={showAlert ? alert : null}
        noContentLayout
      >
        {list.length === 0 && !filterVisible ? null : (
          <div className={styles.tableFilterWrap} style={{ marginTop: showAlert ? '12px' : '' }}>
            <Form
              name="modal-ref"
              layout="inline"
              form={form}
              onFinish={onFinish}
              requiredMark={false}
              colon={false}
            >
              <Form.Item name="name" label="数据名称">
                <Input placeholder="请输入" style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="status" label="发布状态">
                <Select placeholder="请选择" style={{ width: 200 }}>
                  {PUBLISH_STATUS.map(item => (
                    <Select.Option key={item.key} value={item.key}>
                      {item.value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="time" label="修改时间">
                <RangePicker style={{ width: 320 }} />
              </Form.Item>
              <div className={styles.btnContainer1}>
                <Button onClick={reset}>重置</Button>
                <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }}>
                  查询
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Page>

      <div className={styles.contentWrap}>
        {auth.includes(PERMISSION.create) && (
          <div style={{ marginBottom: 14 }}>
            <Button
              type="primary"
              icon={<PlusIcon fill="#fff" />}
              onClick={() =>
                router.push(`/manage/inner/repository/interface/publish?namespace=${namespace}`)
              }
            >
              发布接口
            </Button>
          </div>
        )}
        {hasSelected && hasPublishedData.length === 0 ? (
          <div className="rowSelectionWrap">
            <span style={{ color: '#292929' }}>已选择 {selectedRowKeys.length || 0} 项</span>
            {rowKeys.every(item => MANAGE_ROLE_LIST_TYPE[item.role] === '所有权限') && (
              <span onClick={start}>删除</span>
            )}
            <span
              className="lastBtn"
              onClick={() => {
                setSelectedRowKeys([]);
              }}
            >
              取消选择
            </span>
          </div>
        ) : null}
        <Table
          showSorterTooltip={false}
          columns={columns}
          dataSource={[...list]}
          rowSelection={rowSelection}
          onChange={handlePageChange}
          pagination={{ total, current: currentPage, pageSize: pSize }}
          emptyTableText={
            <div className={styles.emptyData}>
              {list.length === 0 && !filterVisible ? '暂无数据，快去发布接口吧～' : '暂无匹配数据'}
            </div>
          }
          loading={{
            spinning: loading,
          }}
        />
      </div>
    </div>
  );
}

export default connect(({ account }) => ({
  authAll: account.authAll,
}))(InterfaceManage);
