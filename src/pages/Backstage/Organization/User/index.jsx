import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import {
  Modal,
  Table,
  Icons,
  Button,
  Popover,
  message,
  IconBase,
  Form,
  Input,
  Select,
} from 'quanta-design';
import copy from 'copy-to-clipboard';
import Page from '@/components/NewPage';
import { useForm } from 'antd/lib/form/Form';
import styles from './index.less';
import CreateModal from './CreateModal';
import BatchInputModal from './BatchInputModal';
import { USER_STATE, ACCOUNT_STATUS_TAG, USER_STATUS_TYPE } from '@/utils/enums';
import { formatTime } from '@/utils/helper';
import { ReactComponent as Member } from '@/icons/member.svg';
import { ReactComponent as Super } from '@/icons/super.svg';
import { userList } from '@/services/account';

const { PlusIcon, UploadIcon, QuestionCircleIcon } = Icons;

const Context = ({ text = '', onOk = null, onCancel = null }) => (
  <div
    style={{
      padding: 8,
      width: 248,
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

function User({ dispatch = null, userInfo = {} }) {
  const { is_admin: isAdmin = false } = userInfo;
  const [createVisible, setCreateVisible] = useState(false);
  const [batchVisible, setBatchVisible] = useState(false);
  const [showIndex, setShowIndex] = useState(-1);
  const [showType, setShowType] = useState(-1);
  const [filterVisible, setFilterVisible] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [order, setOrder] = useState(false);
  const [form] = useForm();

  const empty = (
    <div className={styles.emptyData}>{!filterVisible ? '暂无数据' : '暂无匹配数据'}</div>
  );

  const loadData = async (page = 1, size = 10, isAsc = false) => {
    const values = await form.getFieldsValue();
    setPSize(size);
    const { userName, phone, status } = values;
    const params = {
      page,
      size,
      isAsc,
      username: userName ? encodeURIComponent(userName) : '',
      tel: phone ? encodeURIComponent(phone) : '',
      status: status || -1,
    };
    const arr = Object.values(values).filter(item => item === 0 || item);
    if (arr.length > 0) {
      setFilterVisible(true);
    } else {
      setFilterVisible(false);
    }
    try {
      setLoading(true);
      const res = await userList(params);
      setList(res.status_users);
      setTotal(res.total);
      setCurrent(page);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (p, filters, sorter) => {
    loadData(p.current, p.pageSize, sorter.order === 'ascend');
    setOrder(sorter.order);
  };

  const getInfo = () => {
    dispatch({
      type: 'account/info',
    });
  };

  useEffect(() => {
    getInfo();
    loadData();
  }, []);

  const onCancel = () => {
    setShowIndex(-1);
    setShowType(-1);
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: ['mem', 'name'],
      key: 'name',
      render: (text, record) => (
        <div className={styles}>
          {record.is_admin === true ? (
            <IconBase icon={Super} fill="#0076D9" className={styles.iconItem} />
          ) : (
            <IconBase icon={Member} className={styles.iconItem} />
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: '手机号',
      dataIndex: ['mem', 'tel'],
      key: 'tel',
    },
    {
      title: '用户角色',
      dataIndex: 'is_admin',
      key: 'is_admin',
      render: val => (val ? '超级管理员' : '普通用户'),
    },
    {
      title: '使用状态',
      dataIndex: 'status',
      key: 'status',
      render: val => ACCOUNT_STATUS_TAG[val],
    },
    {
      title: '修改时间',
      dataIndex: 'update_time',
      key: 'update_time',
      render: val => formatTime(val),
      sorter: true,
      sortOrder: order,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (_, record, index) =>
        record.is_admin ? null : (
          <>
            <Popover
              visible={showIndex === index && showType === 0}
              content={
                <Context
                  text={`你确定要重置${record.mem.name}的密码吗?`}
                  onCancel={onCancel}
                  onOk={() => {
                    if (dispatch) {
                      dispatch({
                        type: 'account/resetPwd',
                        payload: { tel: record.mem.tel },
                        callback: res => {
                          Modal.success({
                            title: '重置密码成功！',
                            content: (
                              <>
                                {`已为${record.mem.name}重置密码如下：`}
                                <div className={styles.pwdWrap}>
                                  <span className={styles.label}>密码</span>
                                  {res.newPassword}
                                </div>
                              </>
                            ),
                            showCancelBtn: false,
                            okText: '复制手机号和密码',
                            onOk: () => {
                              copy(`${res.tel} ${res.newPassword}`);
                              message.success('复制成功，请及时发给用户！');
                            },
                          });
                        },
                      });
                    }
                    onCancel();
                  }}
                />
              }
            >
              <a
                onClick={() => {
                  setShowIndex(index);
                  setShowType(0);
                }}
                style={{ marginRight: 24 }}
              >
                重置密码
              </a>
            </Popover>
            {record.status === USER_STATE.FAIL ? (
              <a className="disabled-style" style={{ marginRight: 24 }}>
                禁用
              </a>
            ) : (
              <Popover
                visible={showIndex === index && showType === 1}
                content={
                  <Context
                    text={`你确定要禁用${record.mem.name}吗?`}
                    onCancel={onCancel}
                    onOk={() => {
                      if (dispatch) {
                        dispatch({
                          type: 'account/disable',
                          payload: { tel: record.mem.tel },
                          callback: () => {
                            loadData();
                            message.success('禁用用户成功！');
                          },
                        });
                      }
                      onCancel();
                    }}
                  />
                }
              >
                <a
                  onClick={() => {
                    setShowIndex(index);
                    setShowType(1);
                  }}
                  style={{ marginRight: 24 }}
                >
                  禁用
                </a>
              </Popover>
            )}
            {record.status !== USER_STATE.FAIL ? (
              <a className="disabled-style">启用</a>
            ) : (
              <Popover
                visible={showIndex === index && showType === 2}
                content={
                  <Context
                    text={`你确定要启用${record.mem.name}吗?`}
                    onCancel={onCancel}
                    onOk={() => {
                      if (dispatch) {
                        dispatch({
                          type: 'account/enable',
                          payload: { tel: record.mem.tel },
                          callback: () => {
                            loadData();
                            message.success('启用用户成功！');
                          },
                        });
                      }
                      onCancel();
                    }}
                  />
                }
              >
                <a
                  onClick={() => {
                    setShowIndex(index);
                    setShowType(2);
                  }}
                >
                  启用
                </a>
              </Popover>
            )}
          </>
        ),
    },
  ];
  const columnsNoAdmin = [
    {
      title: '用户名',
      dataIndex: ['mem', 'name'],
      key: 'name',
      render: (text, record) => (
        <div className={styles}>
          {record.is_admin === true ? (
            <IconBase icon={Super} fill="#0076D9" className={styles.iconItem} />
          ) : (
            <IconBase icon={Member} className={styles.iconItem} />
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: '手机号',
      dataIndex: ['mem', 'tel'],
      key: 'tel',
    },
    {
      title: '用户角色',
      dataIndex: 'is_admin',
      key: 'is_admin',
      render: val => (val ? '超级管理员' : '普通用户'),
    },
    {
      title: '使用状态',
      dataIndex: 'status',
      key: 'status',
      render: val => ACCOUNT_STATUS_TAG[val],
    },
    {
      title: '修改时间',
      dataIndex: 'update_time',
      key: 'update_time',
      render: val => formatTime(val),
    },
  ];

  const reset = () => {
    form.resetFields();
    setOrder(false);
    loadData();
  };

  const search = async () => {
    loadData();
  };

  return (
    <Page title="用户管理" noContentLayout>
      <div className={styles.tableFilterWrap}>
        <Form form={form} requiredMark={false} colon={false} layout="inline">
          <Form.Item label="用户名" name="userName">
            <Input style={{ width: 200 }} placeholder="请输入" />
          </Form.Item>
          <Form.Item label="手机号" name="phone">
            <Input style={{ width: 200 }} placeholder="请输入" />
          </Form.Item>
          <Form.Item label="使用状态" name="status">
            <Select style={{ width: 200 }} placeholder="请选择">
              {USER_STATUS_TYPE.map(item => (
                <Select.Option key={item.key} value={item.key}>
                  {item.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className={styles.btnContainer}>
            <Button onClick={reset}>重置</Button>
            <Button style={{ marginLeft: 8 }} type="primary" onClick={search}>
              查询
            </Button>
          </div>
        </Form>
      </div>
      <div style={{ marginTop: 12, padding: '22px 30px' }} className="container-card">
        <div className={styles.buttonWrap}>
          {isAdmin && (
            <>
              <Button
                onClick={() => setCreateVisible(true)}
                type="primary"
                icon={<PlusIcon fill="#fff" />}
              >
                新建用户
              </Button>
              <Button onClick={() => setBatchVisible(true)} icon={<UploadIcon />}>
                批量导入
              </Button>
            </>
          )}
          {/* <Button onClick={handlRefresh} icon={<RefreshIcon />} /> */}
        </div>
        <Table
          columns={isAdmin ? columns : columnsNoAdmin}
          dataSource={list}
          showSorterTooltip={false}
          onChange={handleRefresh}
          pagination={{ total, current, pageSize: pSize }}
          emptyTableText={empty}
          loading={{
            spinning: loading,
          }}
        />
      </div>
      <CreateModal
        visible={createVisible}
        onCancel={() => setCreateVisible(false)}
        handlRefresh={loadData}
      />
      <BatchInputModal
        visible={batchVisible}
        onCancel={() => setBatchVisible(false)}
        handlRefresh={loadData}
      />
    </Page>
  );
}

export default connect(({ account }) => ({
  userInfo: account.info,
}))(User);
