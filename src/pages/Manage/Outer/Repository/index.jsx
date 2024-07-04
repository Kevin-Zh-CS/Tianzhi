import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import {
  Input,
  Button,
  Table,
  Form,
  DatePicker,
  Tooltip,
  Popconfirm,
  Icons,
  Modal,
  IconBase,
  message,
} from 'quanta-design';
import Page from '@/components/NewPage';
import router from 'umi/router';
import moment from 'moment';
import {
  getResourceList,
  downloadSingle,
  dataDelete,
  dataBatchDelete,
  downloadFile,
} from '@/services/outer';
import { TITLE_TYPE, goDownload, dataTypeMap } from '@/pages/Manage/Outer/config';
import { formatTime, getRoleAuth } from '@/utils/helper';
import styles from './index.less';
import { PERMISSION } from '@/utils/enums';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import { connect } from 'dva';
import WithLoading from '@/components/WithLoading';

const { QuestionCircleIcon } = Icons;
const { RangePicker } = DatePicker;

function OuterRepository(props) {
  const { authAll } = props;
  const { namespace, dataType } = props.location.query;
  const type = Number(dataType);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [list, setList] = useState([]);
  // const [initList, setInitList] = useState([]);
  const [showAlert, setShowAlert] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [form] = Form.useForm();
  const [myOrders, setMyOrders] = useState(false);
  const [loading, setLoading] = useState(false);
  const auth = useAuth({ ns_id: namespace });

  const empty = (
    <div className={styles.emptyData}>
      {list.length === 0 && !filterVisible ? '暂无数据，快去已获取数据中转存吧～' : '暂无匹配数据'}
    </div>
  );

  const loadData = async (page = 1, size = 10, is_asc = false) => {
    const filter = { page, size, is_asc };
    setPSize(size);
    const data = await form.getFieldsValue();
    const dateFormat = 'YYYY-MM-DD';
    const filterData = {
      data_name: data.data_name ? window.encodeURIComponent(data.data_name) : undefined,
      data_type: type,
      ns_id: namespace,
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
    if (arr.length > 2) {
      setFilterVisible(true);
    } else {
      setFilterVisible(false);
    }
    setLoading(true);
    const resData = await getResourceList({ ...filter, ...filterData });
    setLoading(false);
    setList(resData.list);
    // setInitList([...resData.list]);
    setTotal(resData.total);
    setShowAlert(resData.length === 0 && arr.length === 0);
    setCurrentPage(page);
  };

  const reset = () => {
    form.resetFields();
    setMyOrders(false);
    loadData();
  };

  const onFinish = () => {
    loadData();
  };

  useEffect(() => {
    loadData();
  }, [type]);

  const onSelectChange = (rowKey, keys) => {
    setSelectedRowKeys(rowKey);
    setSelectedRows(keys);
  };

  // 文件的下载
  const download = async record => {
    downloadSingle({ app_key: record.app_key, namespace }).then(res => {
      goDownload(res);
    });
  };

  // 文件的批量下载
  const downloadFiles = async () => {
    const singleFile = selectedRows[0].file_type;
    if (selectedRowKeys.length === 1 && singleFile !== 1) {
      const app_key = selectedRows.map(item => item.app_key);
      downloadSingle({ app_key, namespace }).then(res => {
        goDownload(res);
      });
    } else {
      const names = selectedRows.map(item => item.name);
      downloadFile({ namespace, names }).then(res => {
        goDownload(res);
      });
    }
  };

  // 详情
  const goToDetail = record => {
    switch (type) {
      case 0:
        router.push(
          `/manage/outer/repository/file/detail?namespace=${namespace}&id=${record.order_id}&dataType=${dataType}`,
        );
        break;
      case 1:
        router.push(
          `/manage/outer/repository/interface/detail?namespace=${namespace}&id=${record.order_id}&dataType=${dataType}`,
        );
        break;
      case 2:
        router.push(
          `/manage/outer/repository/model/detail?namespace=${namespace}&id=${record.order_id}&dataType=${dataType}`,
        );
        break;
      case 3:
        router.push(
          `/manage/outer/repository/origin/detail?namespace=${namespace}&id=${record.order_id}&dataType=${dataType}`,
        );
        break;
      default:
        break;
    }
  };

  // 删除
  const deleteFile = async record => {
    await dataDelete({ namespace, data_type: type, order_id: record.order_id });
    message.success('数据删除成功！');
    loadData();
  };

  // table 的 onChange
  const handlePageChange = async ({ current, pageSize }, filters, sorter) => {
    await loadData(current, pageSize, sorter.order === 'ascend');
    setMyOrders(sorter.order);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;

  const columns = [
    {
      title: '数据标题',
      dataIndex: 'data_title',
      editable: true,
      render: (text, record) => (
        <Tooltip title={text} placement="top">
          <div className={styles.tableItem}>
            {type === 3 ? (
              <i className={classNames('iconfont', dataTypeMap[type][record.file_format])} />
            ) : (
              <IconBase
                icon={type === 2 ? dataTypeMap[type] : dataTypeMap[type][record.file_format]}
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
          <div className={styles.hashItem}>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: '转存时间',
      dataIndex: 'update_time',
      render: text => <div>{formatTime(text)}</div>,
      sortOrder: myOrders,
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 200,
      render: (text, record) => (
        <div>
          {record.role !== null && (
            <div
              className="operate"
              onClick={() => {
                goToDetail(record);
              }}
            >
              详情
            </div>
          )}
          {getRoleAuth(authAll, record.role).includes(PERMISSION.usage) && type === 0 && (
            <div className="operate" onClick={() => download(record)}>
              下载
            </div>
          )}
          {getRoleAuth(authAll, record.role).includes(PERMISSION.del) && (
            <div className="operate">
              <Popconfirm
                title="你确定要删除当前数据吗?"
                icon={<QuestionCircleIcon fill="#0076D9" />}
                onConfirm={() => deleteFile(record)}
              >
                删除
              </Popconfirm>
            </div>
          )}
        </div>
      ),
    },
  ];

  const cancelChoose = () => {
    setSelectedRowKeys([]);
  };

  const deleteData = () => {
    Modal.info({
      title: `确认删除当前已选${selectedRowKeys.length}项数据吗？`,
      content: '删除后，文件列表中将不能查看相应内容。',
      style: { top: 240 },
      onOk: async () => {
        await dataBatchDelete({ ids: selectedRowKeys, namespace });
        loadData();
        setSelectedRowKeys([]);
      },
    });
  };

  return (
    <div>
      <Page title={TITLE_TYPE[type].value} noContentLayout>
        <div className={styles.tableFilterWrap} style={{ marginTop: showAlert ? '12px' : '' }}>
          <Form layout="inline" form={form} requiredMark={false} colon={false}>
            <Form.Item name="data_name" label="数据标题">
              <Input placeholder="请输入" maxLength={30} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="time" label="转存时间">
              <RangePicker style={{ width: 320 }} />
            </Form.Item>
            <div className={styles.btnContainer}>
              <Button onClick={reset}>重置</Button>
              <Button style={{ marginLeft: 8 }} type="primary" onClick={onFinish}>
                查询
              </Button>
            </div>
          </Form>
        </div>
      </Page>
      <div className={styles.contentWrap}>
        <div>
          {hasSelected ? (
            <div className="rowSelectionWrap">
              <span style={{ color: '#292929' }}>已选择 {selectedRowKeys.length || 0} 项</span>
              {auth.includes(PERMISSION.usage) && type === 0 ? (
                <span onClick={downloadFiles}>下载</span>
              ) : null}
              <span onClick={deleteData}>删除</span>
              <span className="lastBtn" onClick={cancelChoose}>
                取消选择
              </span>
            </div>
          ) : null}
        </div>
        <Table
          showSorterTooltip={false}
          columns={columns}
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
    </div>
  );
}

export default connect(({ global, account }) => ({
  loading: global.loading,
  authAll: account.authAll,
}))(WithLoading(OuterRepository));
