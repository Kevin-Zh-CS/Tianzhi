import React, { useState, useEffect } from 'react';
import {
  Alert,
  Input,
  Icons,
  Button,
  Table,
  Form,
  message,
  Select,
  DatePicker,
  Dropdown,
  Menu,
  IconBase,
  Popconfirm,
  Tooltip,
} from 'quanta-design';
import Page from '@/components/NewPage';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import { ReactComponent as luaIcon } from '@/icons/lua.svg';
import router from 'umi/router';
import {
  renameModel,
  getModelList,
  deleteModel,
  downloadSingleModel,
  modeInfo,
} from '@/services/resource-model';
import moment from 'moment';
import luaparse from 'luaparse';
import { PUBLISH_STATUS, PUBLISH_INIT_STATUS, PUBLISH_STATUS_TAG } from './config';
import FilterTableMiddle from './component/filter-table-middle';
import { Byte2AllB, formatTime, getRoleAuth } from '@/utils/helper';
import Step from '../../component/Step';
import styles from './index.less';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import { PERMISSION } from '@/utils/enums';
import { connect } from 'dva';

const { RangePicker } = DatePicker;
const { QuestionCircleIcon, CaretDownIcon } = Icons;
const stepData = [
  {
    title: '创建资源库',
    content: '为不同类型事务创建资源库，方便管理本地资源',
  },
  {
    title: '上传/新建模型',
    content: '在指定资源库中上传/新建模型，用于内部使用或节点共享',
  },
  {
    title: '发布数据元信息',
    content: '将数据元信息发布至数据共享平台，进行数据共享',
  },
];

function ModelList(props) {
  const inputRef = React.createRef();
  const { namespace } = props.location.query;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [list, setList] = useState([]);
  const [showAlert, setShowAlert] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selected, setSelect] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [order, setOrder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { authAll } = props;
  const auth = useAuth({ ns_id: namespace });

  const loadData = async (page = 1, size = 10, is_asc = false) => {
    const params = {
      page,
      size,
      is_asc,
    };
    setPSize(size);
    const filterList = await form.getFieldValue();
    const dateFormat = 'YYYY-MM-DD';
    const filter = {
      status: filterList.status,
      name: filterList.names,
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
    const arr = Object.values(filterList).filter(item => item || item === 0);
    if (arr.length > 0) {
      setFilterVisible(true);
    } else {
      setFilterVisible(false);
    }
    setLoading(true);
    const data = await getModelList(namespace, { ...filter, ...params });
    setLoading(false);
    setCurrentPage(page);
    setList(data.list);
    setTotal(data.total);
    return data.list.length === 0 && arr.length === 0;
  };

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

  const onSelectChange = (rowKeys, rows) => {
    setSelectedRowKeys(rowKeys);
    setSelectedRows(rows);
  };

  const renderNewFolder = () => (
    <div className={styles.newFolder}>
      <Input
        onClick={e => e.stopPropagation()}
        ref={inputRef}
        onChange={e => setInputValue(e.target.value)}
        defaultValue={inputValue}
        className={inputValue.length > 30 || inputValue.length === 0 ? styles.errorInput : ''}
        style={{ width: 200 }}
      />
      <span>.lua</span>
    </div>
  );

  const handleRename = async () => {
    const flagList = list.filter(item => item.flag);
    setSelect(false);
    if (flagList.length > 0) {
      if (!inputValue || flagList[0].name === `${inputValue}.lua`) {
        const initList = list.map(item => ({ ...item, flag: false }));
        setList(initList);
      } else {
        if (inputValue.length > 30) {
          message.error('输入超过30个字符，请重新输入');
          return;
        }
        await renameModel(namespace, { id: flagList[0].id, name: `${inputValue}.lua` });
        message.success('数据重命名成功！');
        await loadData();
      }
    }
  };

  // 重命名
  const rename = async record => {
    const arr = list.map(item => {
      if (item.id === record.id) {
        item.flag = true;
      }
      return item;
    });
    const lastI = record.name.lastIndexOf('.');
    const title = lastI > 0 ? record.name.substr(0, lastI) : record.name;
    setInputValue(title);
    setSelect(true);
    setList([...arr]);
  };

  useEffect(() => {
    if (inputRef.current && selected) inputRef.current.select();
  }, [selected]);

  // 删除
  const deleteFile = async record => {
    await deleteModel(namespace, record.id);
    message.success('数据删除成功！');
    loadData();
  };

  // 下载
  const download = async record => {
    await downloadSingleModel(namespace, record.id, record.name);
    message.success('数据下载成功！');
  };

  // 详情
  const goToDetail = async record => {
    await handleRename();
    router.push(
      record.status === PUBLISH_INIT_STATUS.init
        ? `/manage/inner/repository/model/detail/unpublished?namespace=${namespace}&id=${record.id}&role=${record.role}`
        : `/manage/inner/repository/model/detail/published?namespace=${namespace}&id=${record.id}&role=${record.role}`,
    );
  };

  // 发布
  const goToPublish = async record => {
    try {
      const modelInfo = await modeInfo(namespace, record.id);
      const parseResult = luaparse
        .parse(modelInfo.model)
        .body.filter(item => item.type === 'FunctionDeclaration');
      if (parseResult.length > 0) {
        await handleRename();
        router.push(
          `/manage/inner/repository/model/publish?namespace=${namespace}&id=${record.id}`,
        );
      } else {
        message.warn('该模型未识别到调用方法，请完善后再发布！');
      }
    } catch (e) {
      message.warn('该模型未识别到调用方法，请完善后再发布！');
    }
  };

  // table 的 onChange
  const handlePageChange = async ({ current, pageSize }, filters, sorter) => {
    await handleRename();
    loadData(current, pageSize, sorter.order === 'ascend');
    setOrder(sorter.order);
  };

  const handleKeyDown = async e => {
    if (e.keyCode === 13) {
      const flagList = list.filter(item => item.flag);
      if (!inputValue || flagList[0].name === `${inputValue}.lua`) {
        const initList = list.map(item => ({ ...item, flag: false }));
        setList(initList);
      } else {
        if (inputValue.length > 30) {
          message.error('输入超过30个字符，请重新输入');
          return;
        }
        await renameModel(namespace, { id: flagList[0].id, name: `${inputValue}.lua` });
        message.success('数据重命名成功！');
        reset();
      }
    } else if (e.keyCode === 27) {
      const initList = list.map(item => ({ ...item, flag: false }));
      setList(initList);
    }
    setSelect(false);
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

  const columns = [
    {
      title: '数据名称',
      dataIndex: 'name',
      // width: 290,
      editable: true,
      render: (text, record) => {
        const obj = {
          children: (
            <Tooltip title={text} placement="top">
              <div className={styles.titleItem}>
                <IconBase icon={luaIcon} style={{ marginRight: 10, verticalAlign: 'text-top' }} />
                <span>{text}</span>
              </div>
            </Tooltip>
          ),
          props: {},
        };
        if (record.flag) {
          obj.children = renderNewFolder(record, !record.name);
        }
        return obj;
      },
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
      title: '数据大小',
      dataIndex: 'size',
      render: text => <div>{Byte2AllB(text || 0)}</div>,
    },

    {
      title: '发布状态',
      dataIndex: 'status',
      render: text => <div>{PUBLISH_STATUS_TAG[text] || '-'}</div>,
    },

    {
      title: '修改时间',
      dataIndex: 'update_time',
      render: text => <div>{formatTime(text)}</div>,
      sortOrder: order,
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      // width: 200,
      render: (text, record) => (
        <div>
          {record.role !== null ? (
            <div
              className="operate"
              onClick={e => {
                e.stopPropagation();
                goToDetail(record);
              }}
            >
              详情
            </div>
          ) : null}
          {getRoleAuth(authAll, record.role).includes(PERMISSION.publish) &&
          record.status === PUBLISH_INIT_STATUS.init ? (
            <div
              className="operate"
              onClick={e => {
                e.stopPropagation();
                goToPublish(record);
              }}
            >
              发布
            </div>
          ) : null}
          {(getRoleAuth(authAll, record.role).includes(PERMISSION.usage) ||
            getRoleAuth(authAll, record.role).includes(PERMISSION.edit) ||
            getRoleAuth(authAll, record.role).includes(PERMISSION.del)) &&
          record.status === PUBLISH_INIT_STATUS.init ? (
            <div style={{ display: 'inline-block' }}>
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {getRoleAuth(authAll, record.role).includes(PERMISSION.usage) && (
                      <Menu.Item key="1" onClick={() => download(record)}>
                        下载
                      </Menu.Item>
                    )}
                    {getRoleAuth(authAll, record.role).includes(PERMISSION.edit) && (
                      <Menu.Item
                        key="2"
                        onClick={() => {
                          router.push(
                            `/manage/inner/repository/model/editor?id=${record.id}&namespace=${namespace}&role=${record.role}`,
                          );
                        }}
                      >
                        编辑
                      </Menu.Item>
                    )}
                    {getRoleAuth(authAll, record.role).includes(PERMISSION.edit) && (
                      <Menu.Item key="3">
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            rename(record);
                          }}
                        >
                          重命名
                        </span>
                      </Menu.Item>
                    )}
                    {getRoleAuth(authAll, record.role).includes(PERMISSION.del) && (
                      <Menu.Item key="4">
                        <Popconfirm
                          lassName="operate"
                          title="你确定要删除当前数据吗?"
                          icon={<QuestionCircleIcon fill="#0076D9" />}
                          onConfirm={() => deleteFile(record)}
                        >
                          <span>删除</span>
                        </Popconfirm>
                      </Menu.Item>
                    )}
                  </Menu>
                }
              >
                <a style={{ display: 'flex', alignItems: 'center', color: '#0076d9' }}>
                  更多
                  <CaretDownIcon />
                </a>
              </Dropdown>
            </div>
          ) : (
            <div style={{ display: 'inline-block' }}>
              {getRoleAuth(authAll, record.role).includes(PERMISSION.usage) && (
                <div className="operate" onClick={() => download(record)}>
                  下载
                </div>
              )}
              {getRoleAuth(authAll, record.role).includes(PERMISSION.edit) && (
                <div
                  className="operate"
                  onClick={e => {
                    e.stopPropagation();
                    rename(record);
                  }}
                >
                  重命名
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  const extra = (
    <div
      className="alert-trigger-wrap"
      onClick={() => {
        setShowAlert(!showAlert);
      }}
    >
      <span>模型管理使用说明</span>
      <IconBase className={showAlert ? 'up' : 'down'} icon={ArrowsDown} fill="#888888" />
    </div>
  );

  const alert = (
    <>
      <Alert
        type="info"
        message="模型管理的功能定义：模型管理是函数模型进行统一管理，目前只支持lua格式的模型上传。"
        showIcon
      />
      <Step stepData={stepData} current={2} />
    </>
  );

  return (
    <div onClick={handleRename} onKeyUp={handleKeyDown}>
      <Page title="模型管理" extra={extra} alert={showAlert ? alert : null} noContentLayout>
        {list.length === 0 && !filterVisible ? null : (
          <div className={styles.tableFilterWrap} style={{ marginTop: showAlert ? '12px' : '' }}>
            <Form
              form={form}
              layout="inline"
              onFinish={onFinish}
              requiredMark={false}
              colon={false}
            >
              <Form.Item name="names" label="数据名称">
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
              <div className={styles.btnContainer}>
                <Button onClick={reset}>重置</Button>
                <Button style={{ marginLeft: 8 }} type="primary" htmlType="submit">
                  查询
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Page>
      <div className={styles.contentWrap}>
        <FilterTableMiddle
          namespace={namespace}
          selectedRowKeys={selectedRowKeys}
          selectedRows={selectedRows}
          reloadData={loadData}
          list={list}
          auth={auth}
          cancelChoose={() => {
            setSelectedRows([]);
            setSelectedRowKeys([]);
          }}
        />
        <Table
          // style={{ marginTop: 14 }}
          showSorterTooltip={false}
          columns={columns}
          dataSource={[...list]}
          rowSelection={rowSelection}
          onChange={handlePageChange}
          pagination={{ total, current: currentPage, pageSize: pSize }}
          emptyTableText={
            <div className={styles.emptyData}>
              {list.length === 0 && !filterVisible
                ? '暂无数据，快去上传/新建数据吧～'
                : '暂无匹配数据'}
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
}))(ModelList);
