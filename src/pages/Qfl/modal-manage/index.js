import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  DatePicker,
  Form,
  IconBase,
  Icons,
  Input,
  message,
  Modal,
  Popover,
  Select,
  Spin,
  Table,
  Tooltip,
} from 'quanta-design';
import lodash from 'lodash';
import { connect } from 'dva';
import { router } from 'umi';
import { formatTime, getValueFromList } from '@/utils/helper';
import NewPage from '@/components/NewPage';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import { ReactComponent as StarIcon } from '@/icons/star.svg';
import { ReactComponent as UnstarIcon } from '@/icons/un_star.svg';
import styles from './index.less';
import {
  deleteModel,
  getModelList,
  getModelVersionList,
  handleFavorite,
} from '@/services/qfl-modal';
import moment from 'moment';
import { MODAL_ALGO, MODEL_SOURCE, PROJECT_CARD_TAG, PROJECT_TYPE } from '@/pages/Qfl/config';

const { QuestionCircleIcon } = Icons;
const { RangePicker } = DatePicker;
const Context = ({ text = '', onOk = null, onCancel = null }) => (
  <div
    style={{
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <p style={{ display: 'flex', alignItems: 'center', color: '#121212', fontSize: 14 }}>
      <QuestionCircleIcon style={{ marginRight: 8 }} fill="#0076D9" />
      {text}
    </p>
    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
      <Button onClick={onCancel} size="small" type="link" style={{ marginRight: 6 }}>
        取消
      </Button>
      <Button onClick={onOk} size="small" type="primary">
        确定
      </Button>
    </div>
  </div>
);
const { PlusIcon } = Icons;

function QflModalManage(props) {
  const { userInfo } = props;
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [showIndex, setShowIndex] = useState(-1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [showAlert, setShowAlert] = useState(true);
  const [dataList, setDataList] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [form] = Form.useForm();

  const handleRefresh = async (page = 1, size = 10, is_asc = false) => {
    setExpandedRowKeys([]);
    setSelectedRowKeys([]);
    setPSize(size);
    setLoading(true);
    try {
      const filter = await form.validateFields();
      const dateFormat = 'YYYY-MM-DD';
      const params = {
        ...filter,
        begin_time: filter.time
          ? moment(moment(filter.time[0]).format(dateFormat)).valueOf() / 1000
          : undefined,
        end_time: filter.time
          ? moment(
              moment(filter.time[1])
                .add(1, 'days')
                .format(dateFormat),
            ).valueOf() / 1000
          : undefined,
        ...filter,
      };

      delete params.time;
      const arr = Object.values(filter).filter(item => item || item === 0);
      if (arr.length > 0) {
        setFilterVisible(true);
      } else {
        setFilterVisible(false);
      }

      params.page = page;
      params.size = size;
      params.is_asc = is_asc;
      setCurrentPage(page);
      const data = await getModelList(params);
      setDataList(data);
    } finally {
      setLoading(false);
    }
  };

  const getVersionList = async parent_model_id => {
    const data = await getModelVersionList({ model_id: parent_model_id });
    dataList.list.find(item => item.parent_model_id === parent_model_id).versionList = data.list;
    setDataList({ ...dataList });
  };

  useEffect(() => {
    if (dataList.total > 0) {
      setShowAlert(false);
    }
  }, [dataList]);

  const onSelectChange = (rowKeys, rows) => {
    setSelectedRowKeys(rowKeys);
    setSelectedRows(rows);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // table 的 onChange
  const handlePageChange = ({ current, pageSize }, filters, sorter) => {
    handleRefresh(current, pageSize, sorter.order === 'ascend');
  };

  const handleDeleteClick = record => {
    setDeleteVisible(true);
    setShowIndex(record.model_id);
  };

  const handleDeleteCancel = () => {
    setDeleteVisible(false);
    setShowIndex(-1);
  };

  const handleDeleteOk = async record => {
    await deleteModel([record.model_id]);
    handleDeleteCancel();
    handleRefresh();
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const cancelChoose = () => {
    setSelectedRows([]);
    setSelectedRowKeys([]);
  };

  const deleteData = () => {
    Modal.info({
      title: `确认删除当前已选${selectedRowKeys.length}项模型吗？`,
      content: '删除后，模型列表中将不能查看相应内容。',
      okText: '确定',
      cancelText: '取消',
      style: { top: 240 },
      closable: true,
      onOk: async () => {
        await deleteModel(selectedRowKeys);
        await handleRefresh();
        message.success('模型删除成功！');
        cancelChoose();
        Modal.destroyAll();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  const handleCollect = async record => {
    // 点击收藏接口
    await handleFavorite({
      model_id: record.model_id,
      collector: userInfo.addr,
      status: record.collect_status ? 0 : 1,
    });
    if (record.collect_status) {
      message.success('模型取消收藏成功！');
    } else {
      message.success('模型收藏成功！');
    }
    const data = [...dataList.list].map(item => {
      if (item.model_id === record.model_id) {
        item.collect_status = item.collect_status ? 0 : 1;
      }
      return item;
    });
    setDataList({ total: data.total, list: data });
  };

  const columns = [
    {
      title: '模型名称',
      dataIndex: 'model_name',
      // width: 290,
      editable: true,
      render: (text, record) => {
        const obj = {
          children: (
            <div className={styles.titleItem}>
              <Tooltip title={record.collect_status ? '取消收藏' : '收藏模型'} placement="top">
                <IconBase
                  onClick={() => {
                    handleCollect(record);
                  }}
                  icon={record.collect_status ? StarIcon : UnstarIcon}
                  style={{ marginRight: 8 }}
                />
              </Tooltip>
              <Tooltip title={text} placement="top">
                <span>{text}</span>
              </Tooltip>
            </div>
          ),
          props: {},
        };
        return obj;
      },
    },
    {
      title: '模型类型',
      dataIndex: 'model_type',
      render: text => PROJECT_CARD_TAG[text],
    },
    {
      title: '模型算法',
      dataIndex: 'model_algo',
      render: text => getValueFromList(text, MODAL_ALGO),
    },

    {
      title: '模型来源',
      dataIndex: 'model_source',
      render: text => MODEL_SOURCE[text],
    },
    {
      title: '操作人',
      dataIndex: 'operator',
    },
    {
      title: '当前版本',
      dataIndex: 'version_name',
    },
    {
      title: '修改时间',
      dataIndex: 'update_time',
      render: text => <div>{formatTime(text)}</div>,
      // sortOrder: order,
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              router.push(
                `/qfl/modal-manage/detail?modelId=${record.model_id}&jobId=${record.job_id}&tableId=${record.model_table_id}&parentModelId=${record.parent_model_id}`,
              );
            }}
            style={{ marginRight: 24 }}
          >
            详情
          </a>
          <Popover
            visible={deleteVisible && showIndex === record.model_id}
            placement="topRight"
            content={
              <Context
                text="你确定要删除所选模型吗?"
                onCancel={handleDeleteCancel}
                onOk={() => {
                  handleDeleteOk(record);
                }}
              />
            }
          >
            <a
              onClick={() => {
                handleDeleteClick(record);
              }}
            >
              删除
            </a>
          </Popover>
        </>
      ),
    },
  ];

  const versionColumns = [
    {
      title: '模型版本号',
      dataIndex: 'version_name',
    },
    {
      title: '模型名称',
      dataIndex: 'model_name',
    },
    {
      title: '操作人',
      dataIndex: 'operator',
    },
    {
      title: '保存时间',
      dataIndex: 'saved_time',
      render: text => <div>{formatTime(text)}</div>,
    },
  ];

  const handleSearch = () => {
    handleRefresh();
  };

  const alert = (
    <Alert
      type="info"
      message="模型管理的功能定义：模型管理是提供对联邦建模或本地导入的模型进行统一管理，后期也将支持对模型的部署和使用。"
      showIcon
    />
  );

  const reset = () => {
    form.resetFields();
    handleRefresh();
  };

  const hasPublished = selectedRows.filter(item => item.status === 1 || item.status === 1);
  return (
    <NewPage
      title="模型管理"
      extra={
        <div className="alert-trigger-wrap" onClick={() => setShowAlert(!showAlert)}>
          模型管理使用说明
          <IconBase className={showAlert ? 'up' : 'down'} icon={ArrowsDown} fill="#888888" />
        </div>
      }
      alert={showAlert ? alert : null}
      noContentLayout
    >
      <Spin spinning={loading}>
        {dataList.list?.length || filterVisible ? (
          <div className={styles.tableFilterWrap}>
            <Form form={form} name="model_name" layout="inline" requiredMark={false} colon={false}>
              <Form.Item name="model_name" label="模型名称">
                <Input placeholder="请输入" maxLength={30} style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="model_type" label="模型类型">
                <Select placeholder="请选择" style={{ width: 200 }}>
                  {PROJECT_TYPE.map((item, index) => (
                    <Select.Option value={index}>{item}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="model_algo" label="模型算法">
                <Select placeholder="请选择" style={{ width: 200 }}>
                  {MODAL_ALGO.map(item => (
                    <Select.Option key={item.key} value={item.key}>
                      {item.value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="model_source" label="模型来源">
                <Select placeholder="请选择" style={{ width: 200 }}>
                  {MODEL_SOURCE.map((item, index) => (
                    <Select.Option value={index}>{item}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="collect_status" label="收藏状态">
                <Select placeholder="请选择" style={{ width: 200 }}>
                  <Select.Option value="0">未收藏</Select.Option>
                  <Select.Option value="1">已收藏</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="time" label="修改时间">
                <RangePicker style={{ width: 320 }} />
              </Form.Item>
              <div className={styles.btnContainer}>
                <Button onClick={reset}>重置</Button>
                <Button type="primary" style={{ marginLeft: 12 }} onClick={handleSearch}>
                  查询
                </Button>
              </div>
            </Form>
          </div>
        ) : null}
        <div
          className="container-card"
          style={{
            padding: '20px 20px 40px 20px',
            marginTop: 12,
            minHeight:
              dataList.list?.length || filterVisible
                ? 'calc(100vh - 278px)'
                : 'calc(100vh - 166px)',
          }}
        >
          <Button
            type="primary"
            icon={<PlusIcon fill="#fff" />}
            onClick={() => router.push(`/qfl/modal-manage/upload`)}
          >
            导入模型
          </Button>
          {selectedRowKeys.length > 0 ? (
            <div className="rowSelectionWrap" style={{ marginTop: 12 }}>
              <span style={{ color: '#292929' }}>已选择 {selectedRowKeys.length || 0} 项</span>
              {hasPublished.length > 0 ? null : <span onClick={deleteData}>删除</span>}
              <span className="lastBtn" onClick={cancelChoose}>
                取消选择
              </span>
            </div>
          ) : null}

          <Table
            style={{ marginTop: 14 }}
            showSorterTooltip={false}
            rowKey="model_id"
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataList.list}
            onChange={handlePageChange}
            pagination={{
              pageSize: pSize,
              current: currentPage,
              total: dataList.total,
            }}
            expandable={{
              expandedRowRender: record => (
                <Table
                  style={{ paddingLeft: 80 }}
                  rowKey="model_id"
                  columns={versionColumns}
                  dataSource={record.versionList}
                  pagination={false}
                />
              ),
              onExpand: (expanded, record) => {
                if (expanded) {
                  getVersionList(record.parent_model_id);
                  expandedRowKeys.push(record.model_id);
                  setExpandedRowKeys(expandedRowKeys);
                } else {
                  lodash.remove(expandedRowKeys, item => item === record.model_id);
                  setExpandedRowKeys(expandedRowKeys);
                }
              },
              expandedRowKeys,
              expandIcon: ({ expanded, onExpand, record }) =>
                expanded ? (
                  <i
                    style={{ fontSize: 20, color: '#888', cursor: 'pointer' }}
                    className="iconfont icontongyongxing_jianshao_fangxingx"
                    onClick={e => onExpand(record, e)}
                  />
                ) : (
                  <i
                    style={{ fontSize: 20, color: '#888', cursor: 'pointer' }}
                    className="iconfont icontongyongxing_zengjia_fangxingx"
                    onClick={e => onExpand(record, e)}
                  />
                ),
            }}
            emptyTableText={
              <div style={{ color: '#888888' }}>
                {filterVisible ? '暂无匹配数据' : '暂无数据，快去导入模型吧～'}
              </div>
            }
          />
        </div>
      </Spin>
    </NewPage>
  );
}

export default connect(({ account }) => ({
  userInfo: account.info,
}))(QflModalManage);
