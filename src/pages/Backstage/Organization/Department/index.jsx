import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Breadcrumb, Popover, Typography } from 'antd';
import { Button, Table, Icons, IconBase, Modal, message, Menu } from 'quanta-design';
import Page from '@/components/Page';
import noRepositoryImg from '@/assets/no_repository.png';
import { ReactComponent as DepartmentIcon } from '@/icons/department.svg';
import emptyTable from '@/assets/blacklist/emptyTable.png';
import { DEPARTMENT_TYPE_TEXT } from '@/utils/enums';
import { formatTime } from '@/utils/helper';
import ModifyMemberModal from './ModifyMemberModal';
import AddMemberModal from './AddMemberModal';
import EditableTree from './editable-tree';
import styles from './index.less';
import { getDepartTree, getRoot } from '@/services/organization';
import { ReactComponent as OrgIcon } from '@/icons/organization.svg';

const { PlusIcon } = Icons;
const { Paragraph } = Typography;

const columnsOrg = [
  {
    title: '部门名称',
    dataIndex: 'name',
    key: 'name',
    width: '30%',
    render: val => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <IconBase fill="#0076D9" style={{ marginRight: 8 }} icon={DepartmentIcon} />
        <div style={{ width: 280, height: 22 }}>
          <Popover content={val}>
            <Paragraph ellipsis={{ rows: 1, expandable: false }}>{val}</Paragraph>
          </Popover>
        </div>
      </div>
    ),
  },
  {
    title: '部门成员数量',
    dataIndex: 'total',
    key: 'total',
  },
  {
    title: '新建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    render: val => formatTime(val),
  },
];

function Department(props) {
  const {
    groupList = [],
    memberList = [],
    memberTotal = 0,
    userInfo = {},
    dispatch = null,
    memberLoading,
    groupLoading,
  } = props;
  const [addVisible, setAddVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modifyVisible, setModifyVisible] = useState(false);
  // eslint-disable-next-line
  const [groupId, setGroupId] = useState('');
  const [target, setTarget] = useState({});
  // 用户在当前机构的角色,默认为1：表示为普通成员
  const [role, setRole] = useState(1);
  // 侧边栏和上方 Breadcrumb 的操作只修改 selectedKeys 变量
  // 由 selectedKeys 变量触发变化，保证状态同步
  const [selectedKeys, setSelectedKeys] = useState([]);
  // eslint-disable-next-line
  const [breadList, setBreadList] = useState([]);
  const [renderBreadList, setRenderBreadList] = useState([]);
  const [breadWidth, setBreadWidth] = useState(0);
  const [treeData, setTreeData] = useState([]);
  const [rootData, setRootData] = useState({});
  // const [selectKey, setSelectKey] = useState('');
  const breadRef = useRef();

  // 映射key、title
  const initData = data =>
    data?.map(item => {
      item.key = item.id;
      item.title = item.name;
      if (item.children?.length) {
        initData(item.children);
      }
      return item;
    });

  const getGroupList = (gid = '') =>
    new Promise(resolve => {
      if (dispatch) {
        dispatch({
          type: 'organization/groupList',
          payload: {
            groupId: gid,
          },
          callback: res => {
            resolve(initData(res));
          },
        });
      }
    });

  const getMember = async (gid = '') => {
    if (dispatch) {
      await dispatch({
        type: 'organization/memberList',
        payload: {
          groupId: gid,
        },
      });
    }
  };

  const initRootData = async () => {
    const root = await getRoot();
    setRootData(root);
    getGroupList(root.id);
  };

  function findParents(tree, seleKey) {
    const allparents = [];
    if (tree.length === 0) {
      return [];
    }

    const findele = (data, key) => {
      if (!key) return;
      data.forEach(item => {
        if (item.id === key) {
          const obj = {
            id: item.id,
            key: item.id,
            name: item.name,
          };
          allparents.unshift(obj);
          findele(treeData, item.parentId);
        } else if (item.children) {
          findele(item.children, key);
        }
      });
    };

    findele(tree, seleKey);
    // eslint-disable-next-line
    return allparents;
  }

  const loadData = async () => {
    setLoading(true);
    const data = await getDepartTree();
    setTreeData(initData(data));
    setLoading(false);
  };

  useEffect(() => {
    initRootData();
    loadData();
    return () => {
      dispatch({
        type: 'organization/saveGroupList',
        payload: [],
      });
    };
  }, []);

  useEffect(() => {
    const user = memberList.filter(item => item.id === userInfo.addr)[0];
    if (user) {
      setRole(user.role);
    } else if (user === undefined) {
      setRole(1);
    }
  }, [memberList]);

  const handleNew = () => {
    if (treeData[0]?.isNew) {
      return;
    }
    treeData.unshift({ isNew: true, children: [] });
    setTreeData([].concat(treeData));
  };

  const onSelect = _selectedKeys => {
    setGroupId(_selectedKeys[0]);
    if (_selectedKeys.length) setSelectedKeys(_selectedKeys);
  };

  const onAdd = (name, parentId = rootData.id) => {
    if (!name) {
      message.error('部门名称不能为空');
      return;
    }
    if (name.length > 30) {
      message.error('部门名称不可超过30个字符，请重新输入');
      return;
    }
    dispatch({
      type: 'organization/groupAdd',
      payload: {
        groupId: parentId,
        name,
      },
    })
      .then(async res => {
        message.success('部门新建成功！');
        await loadData();
        onSelect([res]);
      })
      .catch(() => {
        if (parentId === rootData.id) treeData.shift();
        setTreeData([].concat(treeData));
      });
  };

  const onEdit = (name, gid) => {
    if (!name) {
      message.error('部门名称不能为空');
      setTreeData([].concat(treeData));
      return;
    }
    if (name.length > 30) {
      message.error('部门名称不可超过30个字符，请重新输入');
      return;
    }
    dispatch({
      type: 'organization/nameUpdate',
      payload: {
        groupId: gid,
        name,
      },
    })
      .then(async () => {
        message.success('部门重命名成功！');
        await loadData();
        await getGroupList(rootData.id);
        setSelectedKeys([gid]);
      })
      .catch(() => {
        setTreeData([].concat(treeData));
      });
  };

  const onDelete = gid => {
    dispatch({
      type: 'organization/groupDelete',
      payload: {
        groupId: gid,
      },
      callback: async () => {
        message.success('部门删除成功！');
        if (selectedKeys.indexOf(gid) > -1) setSelectedKeys([]);
        await loadData();
        await getGroupList(rootData.id);
      },
    });
  };

  const handleModifyRole = e => {
    dispatch({
      type: 'organization/roleUpdate',
      payload: {
        groupId,
        memId: target.id,
        role: e,
      },
      callback: () => {
        message.success('成员角色修改成功！');
        getMember(groupId);
        setModifyVisible(false);
      },
    });
  };

  const handleRemoveModal = record => {
    Modal.info({
      title: `确认将${record.name}从${breadList[breadList.length - 1].name}移除吗？`,
      content: '移除后，该用户将不再拥有该部门已配置的所有权限。',
      okText: ' 取消 ',
      cancelText: '确定',
      onCancel: () => {
        dispatch({
          type: 'organization/groupMemberDelete',
          payload: {
            groupId,
            memId: record.id,
          },
          callback: () => {
            message.success('成员移除成功！');
            getMember(groupId);
          },
        });
      },
    });
  };

  const columnsMember = [
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '手机号',
      dataIndex: 'tel',
      key: 'tel',
    },
    {
      title: '用户角色',
      dataIndex: 'role',
      key: 'role',
      render: val => DEPARTMENT_TYPE_TEXT[val],
    },
    {
      title: '添加时间',
      dataIndex: 'update_time',
      key: 'update_time',
      render: val => formatTime(val),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) => (
        <>
          {userInfo.is_admin || (record.role && role === 0) ? (
            <>
              {userInfo.is_admin && (
                <a
                  onClick={() => {
                    setModifyVisible(true);
                    setTarget(record);
                  }}
                  style={{ marginRight: 24 }}
                >
                  修改
                </a>
              )}
              <a
                onClick={() => {
                  handleRemoveModal(record);
                }}
              >
                移除
              </a>
            </>
          ) : null}
        </>
      ),
    },
  ];

  useEffect(() => {
    const nameList = selectedKeys[0] ? findParents(treeData, selectedKeys[0]) : [];

    nameList.unshift({ key: rootData.id, id: rootData.id, name: rootData.name });
    setBreadList(nameList);
    setRenderBreadList(nameList);
  }, [selectedKeys[0], treeData]);

  useEffect(() => {
    if (selectedKeys.length) getMember(selectedKeys[0]);
  }, [selectedKeys[0]]);

  // const handleNew = () => {
  //     if (treeData[0]?.isNew) {
  //       return;
  //     }
  //     treeData.unshift({ isNew: true, children: [] });
  //     setTreeData([].concat(treeData));
  //   };

  useEffect(() => {
    function keyPress(e) {
      if (e.keyCode === 27) {
        loadData();
        // onLoadData({ update: true, ...renderTreeData[0] });
      }
    }

    document.addEventListener('keydown', keyPress);
  }, [treeData]);

  const onBreadcrumb = async item => {
    setSelectedKeys([item.key]);
    if (item.key === '0') {
      await getGroupList(item.id);
    }
  };

  const breadMenu = () => {
    const startItems = breadList.slice(0, breadList.length - 1);
    return (
      <Menu>
        {startItems.map(item => (
          <Menu.Item
            key={item.id}
            onClick={() => {
              onBreadcrumb(item);
            }}
          >
            <a className="hover-style" style={{ fontWeight: 'bold' }}>
              {item.name}
            </a>
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  const handleRootClick = () => {
    getGroupList(rootData.id);
    setSelectedKeys([]);
  };

  useEffect(() => {
    const _breadWidth = breadRef.current?.clientWidth;
    setBreadWidth(_breadWidth);
    setRenderBreadList(
      _breadWidth && _breadWidth > 600 ? [...breadList].slice(-1) : [...breadList],
    );
  }, [breadList]);

  const changeTable = ({ current, pageSize }) => {
    dispatch({
      type: 'organization/memberList',
      payload: {
        groupId,
        page: current,
        size: pageSize,
      },
    });
  };

  return (
    <Page title="部门管理" noContentLayout className={styles.departmentPage}>
      <div className={styles.departmentWrap}>
        <div style={{ paddingRight: 20 }}>
          <div className={styles.org}>部门结构</div>
          <div className={`${styles.orgInfo} hover-style`}>
            <div onClick={handleRootClick}>
              <IconBase fill="#0076D9" icon={OrgIcon} style={{ marginRight: 8 }} />
              <span style={{ display: 'inline-block', width: 200 }}>{rootData.name}</span>
            </div>
            {userInfo.is_admin ? <PlusIcon showHover onClick={handleNew} /> : null}
          </div>
          <EditableTree
            className={styles.editableTree}
            isAdmin={userInfo.is_admin}
            treeData={treeData}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            onSelect={onSelect}
            selectedKeys={selectedKeys}
            loading={loading}
          />
        </div>
        <div className={styles.right}>
          <div className={styles.hideBreadcrumb} ref={breadRef}>
            <Breadcrumb separator=">">
              {breadList.map(item => (
                <Breadcrumb.Item key={item.id}>{item.name}</Breadcrumb.Item>
              ))}
            </Breadcrumb>
          </div>
          <Breadcrumb separator=">" className={styles.breadcrumb}>
            {breadWidth && breadWidth > 600 ? (
              <Breadcrumb.Item dropdownProps={{ placement: 'bottomLeft' }} overlay={breadMenu}>
                ...
              </Breadcrumb.Item>
            ) : null}
            {renderBreadList.map((item, index) => (
              <Breadcrumb.Item
                key={item.id}
                onClick={() => {
                  onBreadcrumb(item);
                }}
              >
                {index === renderBreadList.length - 1 ? (
                  <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                ) : (
                  <a className="hover-style" style={{ color: '#0076D9', fontWeight: 'bold' }}>
                    {item.name}
                  </a>
                )}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
          <div className={`${styles.contentWrap} container-card`}>
            {breadList.length < 2 ? (
              <Table
                emptyTableText={
                  <div className={styles.noData}>
                    <img alt="" src={noRepositoryImg} width={200} height={200} />
                    <span className={styles.hintText}>你所在的机构还没有部门，快去创建吧～</span>
                    {userInfo.is_admin && (
                      <Button icon={<PlusIcon fill="#FFF" />} onClick={handleNew} type="primary">
                        新建部门
                      </Button>
                    )}
                  </div>
                }
                columns={columnsOrg}
                dataSource={groupList}
                loading={{
                  spinning: memberLoading || groupLoading,
                }}
              />
            ) : (
              <>
                {(userInfo.is_admin || !role) && (
                  <Button
                    onClick={() => setAddVisible(true)}
                    style={{ marginBottom: 16 }}
                    type="primary"
                  >
                    <PlusIcon fill="white" />
                    添加成员
                  </Button>
                )}
                <Table
                  emptyTableText={
                    <div className={styles.noData}>
                      <img alt="" src={emptyTable} />
                      <span style={{ color: '#888', marginTop: 20 }}>
                        暂无机构成员，快去添加成员吧～
                      </span>
                    </div>
                  }
                  columns={columnsMember}
                  dataSource={memberList}
                  onChange={changeTable}
                  pagination={{
                    total: memberTotal,
                  }}
                  loading={{
                    spinning: memberLoading,
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
      <ModifyMemberModal
        visible={modifyVisible}
        title="修改部门成员角色"
        desc="资源库成员信息中，只能对资源库成员的角色进行修改。"
        onCancel={() => setModifyVisible(false)}
        onOk={handleModifyRole}
        name={target.name}
        tel={target.tel}
        role={target.role}
      />
      <AddMemberModal visible={addVisible} onCancel={() => setAddVisible(false)} gid={groupId} />
    </Page>
  );
}

export default connect(({ organization, account, loading }) => ({
  root: organization.root,
  userInfo: account.info,
  groupList: organization.groupList,
  memberList: organization.memberList,
  memberTotal: organization.memberTotal,
  memberLoading: loading.effects['organization/memberList'],
  groupLoading: loading.effects['organization/groupList'],
}))(Department);
