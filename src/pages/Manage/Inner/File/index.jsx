import React from 'react';
import {
  Alert,
  Input,
  Icons,
  Button,
  Table,
  Form,
  Select,
  DatePicker,
  Dropdown,
  Menu,
  IconBase,
  Modal,
  message,
  Popconfirm,
  Tooltip,
} from 'quanta-design';
import Page from '@/components/NewPage';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import { ReactComponent as fileIcon } from '@/icons/file-list.svg';
import router from 'umi/router';
import moment from 'moment';
import { Prompt } from 'react-router';
import UploadModal from './component/UploadModal';
import {
  mkdirFile,
  getResourceList,
  renameFile,
  rmFile,
  downloadSingle,
  downloadFile,
  cancelUpload,
  cancelDownload,
  getAuth,
} from '@/services/resource';
import {
  PUBLISH_STATUS,
  fileIconMap,
  PUBLISH_INIT_STATUS,
  PUBLISH_STATUS_TAG,
  UPLOAD_STATUS,
  getTypeIndex,
  goDownload,
} from './config';
import FilterTableMiddle from './component/filter-table-middle';
import { Byte2AllB, formatTime, getRoleAuth, replaceName } from '@/utils/helper';
import Step from '../../component/Step';
import styles from './index.less';
import PermissionDenied from '@/pages/Manage/component/PermissionDenied';
import { PERMISSION } from '@/utils/enums';
import { connect } from 'dva';

const { RangePicker } = DatePicker;
const { QuestionCircleIcon, CaretDownIcon, CloseIcon, CheckIcon } = Icons;
const stepData = [
  {
    title: '创建资源库',
    content: '为不同类型事务创建资源库，方便管理本地资源',
  },
  {
    title: '上传/新建文件',
    content: '在指定资源库中上传/新建文件，用于内部使用或节点共享',
  },
  {
    title: '发布数据元信息',
    content: '将数据元信息发布至数据共享平台，进行数据共享',
  },
];

@connect(({ account }) => ({
  authAll: account.authAll,
}))
class FileList extends React.Component {
  inputRef = React.createRef();

  constructor(props) {
    super(props);
    const { namespace, dir = '/' } = props.location.query;
    this.state = {
      selectedRowKeys: [],
      list: [],
      initList: [],
      // visible: false,
      showAlert: true,
      showUploadModal: false,
      namespace,
      filterVisible: false,
      currentPath: dir,
      total: 0,
      uploadList: [],
      downloadList: [],
      selectedRows: [],
      activeKey: '1',
      inputValue: '',
      currentPage: 1,
      pageSize: 10,
      order: false,
      loading: false,
      folderAuth: true,
      resourceId: null,
      authList: [],
    };
    this.formRef = React.createRef();
  }

  getAllAuth = async resourceId => {
    const { namespace } = this.state;
    const res = await getAuth({ resource_id: resourceId, ns_id: namespace });
    this.setState({ authList: res });
  };

  initUploadList = fileList => {
    const { uploadList } = this.state;
    const list = [...uploadList];
    list.push(fileList);
    this.setState({ uploadList: list, activeKey: '1' });
  };

  initDownloadList = fileList => {
    const { downloadList } = this.state;
    const list = [...downloadList];
    list.push(fileList);
    this.setState({ downloadList: list, activeKey: '2' });
  };

  editDownloadList = (index, item) => {
    const { downloadList } = this.state;
    const list = [...downloadList];
    list[index] = item;
    this.setState({ downloadList: list });
  };

  editUploadList = (index, item) => {
    const { uploadList } = this.state;
    const list = [...uploadList];
    list[index] = item;
    this.setState({ uploadList: list });
  };

  loadData = async (page = 1, size = 10, is_time_desc = true) => {
    let filter = {};
    if (this.formRef.current) {
      const data = await this.formRef.current.getFieldValue();
      const dateFormat = 'YYYY-MM-DD';
      filter = {
        publish_status: data.publish_status,
        name: data.names ? window.encodeURIComponent(data.names) : undefined,
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
      const arr = Object.values(filter).filter(item => item || item === 0);
      if (arr.length > 0) {
        this.setState({
          filterVisible: true,
        });
      } else {
        this.setState({
          filterVisible: false,
        });
      }
    }
    const { namespace, currentPath, filterVisible } = this.state;
    filter.page = page;
    filter.size = size;
    filter.dir = currentPath;
    filter.is_time_desc = is_time_desc;
    this.setState({
      loading: true,
    });
    const data = await getResourceList(namespace, filter);

    this.setState({
      list: data.list,
      initList: [...data.list],
      total: data.total,
      currentPage: page,
      pageSize: size,
      folderAuth: data.folderAuth,
      resourceId: data.resourceId,
      loading: false,
    });
    this.getAllAuth(data.resourceId);
    return data.list.length === 0 && !filterVisible;
  };

  reset = async () => {
    // eslint-disable-next-line
    this.formRef.current?.resetFields();
    const showAlert = await this.loadData();
    this.setState({ order: false, showAlert });
  };

  onFinish = () => {
    this.loadData();
  };

  async componentDidMount() {
    const showAlert = await this.loadData();
    this.setState({ showAlert });
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    if (this.isCreated()) {
      this.setState({ selectedRowKeys, selectedRows });
    }
  };

  createNewFolder = () => {
    const { list: arr } = this.state;
    if (this.isCreated()) {
      arr.unshift({ flag: true });
      this.setState({ list: arr, inputValue: '新建文件夹' }, () => {
        this.inputRef.current.select();
      });
    }
  };

  renderNewFolder = (record, isNew = false) => {
    const { initList, inputValue } = this.state;
    return (
      <div className={styles.newFolder}>
        {isNew ? <IconBase icon={fileIcon} fill="#DFAF57" style={{ marginRight: 12 }} /> : null}
        <Input
          ref={this.inputRef}
          onChange={e => this.setState({ inputValue: e.target.value })}
          defaultValue={inputValue}
          className={inputValue.length > 30 || inputValue.length === 0 ? styles.errorInput : ''}
          style={{ width: 200 }}
        />
        <Button
          icon={<CheckIcon />}
          style={{ marginLeft: 12 }}
          onClick={() => {
            this.newFolderOnClick(record, isNew);
          }}
        />
        <Button
          icon={<CloseIcon />}
          style={{ marginLeft: 12 }}
          onClick={() => {
            this.setState({ list: initList.map(item => ({ ...item, flag: false })) });
          }}
        />
      </div>
    );
  };

  newFolderOnClick = async (record, isNew = false) => {
    const { namespace, currentPath, inputValue } = this.state;
    // const fileName = this.inputRef.current.state.value;
    if (inputValue) {
      if (inputValue.length > 30) {
        message.error('输入超过30个字符，请重新输入');
        return;
      }
      if (isNew) {
        await mkdirFile(namespace, { name: replaceName(inputValue), dir: currentPath });
        message.success('文件夹新建成功！');
      } else {
        await renameFile(namespace, { new_name: replaceName(inputValue), path: record.path });
        message.success('数据重命名成功！');
      }
      this.reset();
    } else {
      message.error('请填写文件名称');
    }
  };

  // 重命名
  rename = async record => {
    if (this.isCreated()) {
      const { list } = this.state;
      const { file_id } = record;
      const arr = list.map(item => {
        if (item.file_id === file_id) {
          item.flag = true;
        }
        return item;
      });
      this.setState({ list: arr, inputValue: record.name }, () => {
        this.inputRef.current.select();
      });
    }
  };

  // 删除
  deleteFile = async record => {
    if (this.isCreated()) {
      const { namespace, currentPath } = this.state;
      await rmFile(namespace, { dir: currentPath, names: [record.name] });
      message.success('数据删除成功！');
      this.loadData();
    }
  };

  // 下载
  download = async record => {
    const { namespace, downloadList, currentPath, showUploadModal } = this.state;
    if (!showUploadModal) {
      this.setState({ showUploadModal: true });
    }
    this.setState({ activeKey: '2' }, () => {
      const items = currentPath.split('/');
      const len = downloadList.length;
      const params = {
        target: currentPath === '/' ? '文件管理' : items[items.length - 1],
        status: UPLOAD_STATUS.init,
        names: [record.name],
        path: currentPath,
        progress: 0,
      };
      if (record.file_type === 1) {
        downloadFile(namespace, { dir: currentPath, names: [record.name] }, evt => {
          this.handleFileType(evt, params, len);
        }).then(res => {
          if (res.status === 200) {
            goDownload(res);
            params.status = UPLOAD_STATUS.success;
            this.editDownloadList(len, params);
            message.success('数据下载成功！');
          }
        });
      } else {
        downloadSingle(namespace, { dir: record.path }, evt => {
          if (!params.fileName) {
            this.handleFileType(evt, params, len);
          }
        }).then(res => {
          if (res.status === 200) {
            goDownload(res);
            params.status = UPLOAD_STATUS.success;
            this.editDownloadList(len, params);
            message.success('数据下载成功！');
          }
        });
      }
    });
  };

  handleFileType = (evt, params, len) => {
    const content = evt.currentTarget.getResponseHeader('content-disposition');
    const names = decodeURIComponent(content.split(';')[1].split('=')[1]);
    const i = names.lastIndexOf('.');
    const findI = getTypeIndex(names.substring(i));
    params.icon = findI > -1 ? findI : 0;
    params.fileName = names;
    this.editDownloadList(len, params);
  };

  // 详情
  goToDetail = record => {
    if (this.isCreated()) {
      const { namespace } = this.state;
      router.push(
        record.status === PUBLISH_INIT_STATUS.init
          ? `/manage/inner/repository/file/detail/unpublished?dir=${window.encodeURIComponent(
              record.path,
            )}&namespace=${namespace}&id=${record.file_id}`
          : `/manage/inner/repository/file/detail/published?dir=${window.encodeURIComponent(
              record.path,
            )}&namespace=${namespace}&id=${record.file_id}`,
      );
    }
  };

  // 发布
  goToPublish = record => {
    if (this.isCreated()) {
      const { namespace } = this.state;
      router.push(
        `/manage/inner/repository/file/publish?dir=${window.encodeURIComponent(
          record.path,
        )}&namespace=${namespace}`,
      );
    }
  };

  // handlePath 去到二级路径
  handlePath = record => {
    if (this.isCreated()) {
      const { list } = this.state;
      const flagList = list.filter(item => item.flag);
      if (record.file_type === 1) {
        if (flagList.length > 0) {
          message.error('正在新建文件夹');
        } else {
          this.setState({ currentPath: record.path }, () => {
            this.loadData();
            const { dir, ...last } = this.props.location.query;
            router.push({
              pathname: this.props.location.pathname,
              query: { dir: record.path, ...last },
            });
          });
        }
      }
    }
  };

  // table 的 onChange
  handlePageChange = ({ current, pageSize: _pageSize }, filters, sorter) => {
    const { list, pageSize } = this.state;
    if (list.length <= pageSize && this.isCreated()) {
      this.loadData(current, _pageSize, sorter.order !== 'ascend');
      this.setState({ order: sorter.order });
    }
    this.setState({ pageSize: _pageSize });
  };

  // 是否正在创建文件夹
  isCreated = () => {
    const { list } = this.state;
    const flagList = list.filter(item => item.flag);
    if (flagList.length > 0) {
      if (flagList[0].file_id) {
        message.error('正在重命名');
        return false;
      }
      message.error('正在新建文件夹');
      return false;
    }
    return true;
  };

  // 离开页面调用的方法
  handlePrompt = location => {
    const { list, uploadList, downloadList } = this.state;
    const flagList = list.filter(item => item.flag);
    const uploadInitList = uploadList.filter(item => item.status === UPLOAD_STATUS.init);
    const downloadInitList = downloadList.filter(item => item.status === UPLOAD_STATUS.init);

    if (!this.isSave) {
      if (flagList.length > 0) {
        message.error('正在新建文件夹');
        return false;
      }
      if (uploadInitList.length > 0 || downloadInitList.length > 0) {
        const { namespace, ...last } = location.query;
        Modal.info({
          title: '是否完成正在上传/下载的文件后离开？',
          content: '离开后，列表中未完成的文件将放弃上传/下载。',
          okText: '继续',
          cancelText: '确认离开',
          style: { top: 240 },
          onOk: () => {},
          onCancel: () => {
            this.isSave = true;
            router.push({
              pathname: location.pathname,
              query: { namespace, ...last },
            });
          },
        });
        return false;
      }
    }
    return true;
  };

  handleKeyDown = async e => {
    const { list, initList } = this.state;
    const flagList = list.filter(item => item.flag);
    if (flagList.length > 0) {
      if (e.keyCode === 13) {
        // this.newFolderOnClick(flagList[0], flagList[0].name);
        const { namespace, currentPath, inputValue } = this.state;
        // const fileName = this.inputRef.current.state.value;
        if (inputValue) {
          if (inputValue.length > 30) {
            message.error('输入超过30个字符，请重新输入');
            return;
          }
          if (flagList[0].file_id) {
            await renameFile(namespace, {
              new_name: replaceName(inputValue),
              path: flagList[0].path,
            });
          } else {
            await mkdirFile(namespace, {
              name: replaceName(inputValue),
              dir: currentPath,
            });
          }
          this.reset();
        } else {
          message.error('请填写文件名称');
        }
      } else if (e.keyCode === 27) {
        this.setState({ list: initList.map(item => ({ ...item, flag: false })) });
      }
    }
  };

  render() {
    const {
      selectedRowKeys,
      showAlert,
      showUploadModal,
      list,
      resourceId,
      pageSize,
      filterVisible,
      namespace,
      currentPath,
      total,
      uploadList,
      downloadList,
      selectedRows,
      activeKey,
      initList,
      currentPage,
      order,
      folderAuth,
      loading,
      authList,
    } = this.state;
    const { authAll } = this.props;
    const rowSelection = {
      selectedRowKeys,
      getCheckboxProps: record => ({
        disabled:
          !getRoleAuth(authAll, record.role).includes(PERMISSION.del) ||
          record.status === PUBLISH_INIT_STATUS.publish,
      }),
      onChange: this.onSelectChange,
    };

    const renderContent = (value, record) => {
      const obj = {
        children: (
          <Tooltip title={value} placement="top">
            <div style={{ cursor: 'default' }} className={styles.hashItem}>
              {value}
            </div>
          </Tooltip>
        ),
        props: {},
      };
      if (record.flag) obj.props.colSpan = 0;
      return obj;
    };

    const columns = [
      {
        title: '数据名称',
        dataIndex: 'name',
        editable: true,
        render: (text, record) => {
          const obj = {
            children: (
              <Tooltip title={text} placement="top">
                <div
                  style={{ width: 200 }}
                  onClick={() => {
                    this.handlePath(record);
                  }}
                >
                  {record.file_type === 1 ? (
                    <div style={{ cursor: 'default' }} className={styles.tableItem}>
                      <IconBase
                        icon={fileIcon}
                        fill="#DFAF57"
                        style={{ marginRight: 10, verticalAlign: 'text-top' }}
                      />
                      <span className={styles.textItem}>{text}</span>
                    </div>
                  ) : (
                    <div className={styles.tableItem}>
                      <IconBase
                        icon={fileIconMap[record.format]}
                        style={{ marginRight: 10, verticalAlign: 'text-top' }}
                      />
                      <span className={styles.textItem}>{text}</span>
                    </div>
                  )}
                </div>
              </Tooltip>
            ),
            props: {},
          };
          if (record.flag) {
            obj.props.colSpan = 7;
            obj.children = this.renderNewFolder(record, !record.name);
          }
          return obj;
        },
      },
      {
        title: '数据哈希',
        dataIndex: 'hash',
        render: renderContent,
      },
      {
        title: '数据大小',
        dataIndex: 'size',
        render: (text, record) => {
          const obj = {
            children: <div>{Byte2AllB(text)}</div>,
            props: {},
          };
          if (record.flag) obj.props.colSpan = 0;
          return obj;
        },
      },
      {
        title: '发布状态',
        dataIndex: 'status',
        render: (text, record) => {
          const obj = {
            children: <div>{PUBLISH_STATUS_TAG[text] || '-'}</div>,
            props: {},
          };
          if (record.flag) obj.props.colSpan = 0;
          return obj;
        },
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
        width: 200,
        render: (text, record) => {
          const obj = {
            children: (
              <div>
                {record.file_type !== 1 && record.status === PUBLISH_INIT_STATUS.init ? (
                  <div style={{ display: 'inline-block' }}>
                    {record.role !== null && (
                      <div
                        className="operate"
                        onClick={() => {
                          this.goToDetail(record);
                        }}
                      >
                        详情
                      </div>
                    )}
                    {getRoleAuth(authAll, record.role).includes(PERMISSION.publish) && (
                      <span className="operate" onClick={() => this.goToPublish(record)}>
                        发布
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    {record.role !== null && record.file_type !== 1 && (
                      <div
                        className="operate"
                        onClick={() => {
                          this.goToDetail(record);
                        }}
                      >
                        详情
                      </div>
                    )}
                    {getRoleAuth(authAll, record.role).includes(PERMISSION.usage) && (
                      <div className="operate" onClick={() => this.download(record)}>
                        下载
                      </div>
                    )}
                    {getRoleAuth(authAll, record.role).includes(PERMISSION.edit) && (
                      <div className="operate" onClick={() => this.rename(record)}>
                        重命名
                      </div>
                    )}
                    {getRoleAuth(authAll, record.role).includes(PERMISSION.del) &&
                    record.file_type === 1 &&
                    record.status !== PUBLISH_INIT_STATUS.hasPublishFile ? (
                      <Popconfirm
                        lassName="operate"
                        title="你确定要删除所选文件吗?"
                        icon={<QuestionCircleIcon fill="#0076D9" />}
                        onConfirm={() => this.deleteFile(record)}
                      >
                        <span style={{ color: '#0076d9' }}>删除</span>
                      </Popconfirm>
                    ) : null}
                  </div>
                )}
                {(getRoleAuth(authAll, record.role).includes(PERMISSION.usage) ||
                  getRoleAuth(authAll, record.role).includes(PERMISSION.edit) ||
                  getRoleAuth(authAll, record.role).includes(PERMISSION.del)) &&
                record.file_type !== 1 &&
                record.status === PUBLISH_INIT_STATUS.init ? (
                  <div style={{ display: 'inline-block' }}>
                    <Dropdown
                      trigger={['click']}
                      overlay={
                        <Menu className={styles.operateItem}>
                          {getRoleAuth(authAll, record.role).includes(PERMISSION.usage) ? (
                            <Menu.Item key="1" onClick={() => this.download(record)}>
                              下载
                            </Menu.Item>
                          ) : null}
                          {getRoleAuth(authAll, record.role).includes(PERMISSION.edit) && (
                            <Menu.Item key="2" onClick={() => this.rename(record)}>
                              重命名
                            </Menu.Item>
                          )}
                          {getRoleAuth(authAll, record.role).includes(PERMISSION.del) && (
                            <Menu.Item key="3" className="quanta-dropdown-menu-item-pop">
                              <Popconfirm
                                lassName="operate"
                                title="你确定要删除所选文件吗?"
                                icon={<QuestionCircleIcon fill="#0076D9" />}
                                onConfirm={() => this.deleteFile(record)}
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
                ) : null}
              </div>
            ),
            props: {},
          };
          if (record.flag) obj.props.colSpan = 0;
          return obj;
        },
      },
    ];

    const extra = (
      <div
        className="alert-trigger-wrap"
        onClick={() => {
          this.setState({ showAlert: !showAlert });
        }}
      >
        <span>文件管理使用说明</span>
        <IconBase className={showAlert ? 'down' : 'up'} icon={ArrowsDown} fill="#888888" />
      </div>
    );

    const alert = (
      <>
        <Alert
          type="info"
          message="文件管理的功能定义：文件管理是对文件类的数据进行统一管理，支持所有格式的文件上传。"
          showIcon
        />
        <Step stepData={stepData} current={2} />
      </>
    );
    return (
      <div onKeyUp={this.handleKeyDown}>
        <Prompt message={this.handlePrompt} />
        <Page
          title="文件管理"
          extra={folderAuth ? extra : null}
          alert={folderAuth && showAlert ? alert : null}
          noContentLayout
        >
          {// eslint-disable-next-line no-nested-ternary
          folderAuth ? (
            initList.length > 0 || filterVisible ? (
              <div
                className={styles.tableFilterWrap}
                style={{ marginTop: showAlert ? '12px' : '' }}
              >
                <Form
                  ref={this.formRef}
                  name="modal-ref"
                  layout="inline"
                  onFinish={this.onFinish}
                  requiredMark={false}
                  colon={false}
                >
                  <Form.Item name="names" label="数据名称">
                    <Input placeholder="请输入" maxLength={30} style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item name="publish_status" label="发布状态">
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
                    <Button onClick={this.reset}>重置</Button>
                    <Button style={{ marginLeft: 8 }} type="primary" htmlType="submit">
                      查询
                    </Button>
                  </div>
                </Form>
              </div>
            ) : null
          ) : (
            <PermissionDenied />
          )}
        </Page>
        {folderAuth ? (
          <div className={styles.contentWrap}>
            <FilterTableMiddle
              namespace={namespace}
              auth={authList}
              selectedRowKeys={selectedRowKeys}
              selectedRows={selectedRows}
              folderAuth={folderAuth}
              loadData={this.loadData}
              reloadData={this.reset}
              createNewFolder={this.createNewFolder}
              uploadFileList={this.initUploadList}
              editFileList={this.editUploadList}
              downloadFileList={this.initDownloadList}
              editDownloadList={this.editDownloadList}
              uploadList={uploadList}
              downloadList={downloadList}
              setUploadModal={() => {
                if (!showUploadModal) {
                  this.setState({ showUploadModal: true });
                }
              }}
              list={list}
              resourceId={resourceId}
              path={currentPath}
              setPath={(path = '/') => {
                this.setState({ currentPath: path });
                const { dir, ...last } = this.props.location.query;
                router.push({
                  pathname: this.props.location.pathname,
                  query: { dir: path, ...last },
                });
              }}
              cancelChoose={() => {
                this.setState({ selectedRowKeys: [] });
              }}
            />
            <Table
              // style={{ marginTop: 14 }}
              showSorterTooltip={false}
              columns={columns}
              dataSource={[...list]}
              rowSelection={rowSelection}
              onChange={this.handlePageChange}
              // 访客权限（role: null）时假分页
              pagination={list.length > pageSize ? {} : { total, current: currentPage, pageSize }}
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
        ) : null}
        <UploadModal
          list={uploadList}
          downloadList={downloadList}
          namespace={namespace}
          activeKey={activeKey}
          setActive={key => {
            this.setState({ activeKey: key });
          }}
          showRefresh
          show={showUploadModal}
          editFileList={this.editUploadList}
          editDownloadFile={this.editDownloadList}
          reloadData={this.reset}
          onClose={this.handleCloseModal}
        />
      </div>
    );
  }

  handleCloseModal = () => {
    const { uploadList, downloadList } = this.state;
    const uploadInitList = uploadList.filter(item => item.status === UPLOAD_STATUS.init);
    const downloadInitList = downloadList.filter(item => item.status === UPLOAD_STATUS.init);
    if (uploadInitList.length > 0 || downloadInitList.length > 0) {
      const { namespace } = this.state;
      Modal.info({
        title: '确认取消所有上传正在上传/下载的文件吗？',
        content: '取消后，列表中未完成的文件将放弃上传/下载。',
        style: { top: 240 },
        onOk: async () => {
          uploadInitList.map(async item => {
            await cancelUpload(namespace, { dir: item.path, file_name: item.fileName });
          });

          downloadInitList.map(async item => {
            await cancelDownload(namespace, { dir: item.path, names: item.names });
          });

          this.setState({ showUploadModal: false, uploadList: [], downloadList: [] });
        },
        onCancel: () => {},
      });
    } else {
      this.setState({ showUploadModal: false, uploadList: [], downloadList: [] });
    }
  };
}

export default FileList;
