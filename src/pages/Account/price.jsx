import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Alert, Form, Input, Tooltip, Descriptions, Button, Modal, Icons } from 'quanta-design';
import { Prompt } from 'react-router';
import styles from './index.less';
import NewPage from '@/components/NewPage';
import Step from '@/components/Step';
import ItemTitle from '@/components/ItemTitle';
import { validatorInput } from '@/pages/Manage/Inner/config';
import { Tag, TreeSelect } from 'antd';
import router from 'umi/router';
import _ from 'lodash';
import { getDepartTree, groupList, memberList } from '@/services/organization';
import { searchMembers } from '@/services/resource';
import RadioCard from '@/pages/Federate/components/RadioCard';
import { ReactComponent as DepartIcon } from '@/icons/depart.svg';

const { Item } = Form;

let isSave = true;
const { CloseIcon } = Icons;
function AccountPrice() {
  const stepData = [{ title: '分配配置' }, { title: '信息确认' }, { title: '提交分配' }];
  const formItemLayout = {
    labelCol: { style: { width: 90, textAlign: 'left' } },
    wrapperCol: {},
  };
  const [form] = Form.useForm();
  const [initialTreeData, setInitialTreeData] = useState([]);
  const [searchTreeData, setSearchTreeData] = useState([]);
  const [members, setMembers] = useState([]);
  const [value, setValue] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [current, setCurrent] = useState(1);
  const [valueStr, setValueStr] = useState('');

  // eslint-disable-next-line consistent-return
  const findTreeNode = (data, key) => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < data.length; i++) {
      if (data[i].key === key) return data[i];
      if (data[i].children?.length) {
        const treeNode = findTreeNode(data[i].children, key);
        if (treeNode) return treeNode;
      }
    }
  };

  const initData = (data, _members = members) =>
    data?.map(item => {
      const key = item.id || item.address;
      const total = item.total ?? item.amount;
      item.key = key;
      item.value = key;
      item.children = item.children || [];
      item.isLeaf = !(item.total > 0 || item.amount > 0 || item.children.length > 0);
      item.filter = item.name + item.tel;
      const member = _members.find(_item => _item.address === key);
      const title = item.tel ? `${item.name}（${item.tel}）` : `${item.name}·${total}人`;
      if (member.exist) {
        item.title = (
          <Tooltip title={`该${member.type === 1 ? '部门' : '成员'}已添加!`} placement="top">
            <div className={styles.title}>
              {title}
              <i className="iconfont icontishixing_duihao_morenx" />
            </div>
          </Tooltip>
        );
        item.disabled = true;
      } else {
        item.title = (
          <div className={styles.title}>
            {title}
            <i className="iconfont icontishixing_duihao_morenx" />
          </div>
        );
      }
      if (item.children?.length) {
        initData(item.children, _members);
      }
      return item;
    });

  const insertData = (_treeData, id, data) => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < _treeData.length; i++) {
      if (_treeData[i].key === id) {
        _treeData[i].children = _treeData[i].children.concat(data);
        _treeData[i].load = true;
        return true;
      }
      if (_treeData[i].children?.length) {
        const flag = insertData(_treeData[i].children, id, data);
        if (flag) return true;
      }
    }
    return false;
  };

  const onSearch = val => {
    const _members = JSON.parse(JSON.stringify(members)); // 防止对象引用
    const list = initData(
      _members.filter(item => item.name.includes(val) || item.tel?.includes(val)),
    );
    setSearchValue(val);
    setSearchTreeData(val ? list : []);
  };

  const tagRender = ({ value: _value, closable, onClose }) => {
    let title = '';
    const item = members.find(
      _item => _item.address === _value || _item.address === _value.split('-')[0],
    );
    if (item) title = item.tel ? `${item.name}` : `${item.name}·${item.amount}人`;
    return (
      <Tag closable={closable} onClose={onClose} style={{ margin: '2px 4px 2px 0' }}>
        {title}
      </Tag>
    );
  };

  const onChange = _value => {
    setValue(_value);
    if (searchValue) setExpandedKeys([]);
    onSearch('');
  };

  const init = () => {
    Promise.all([getDepartTree(), searchMembers({ ns_id: '' })]).then(([res1, res2]) => {
      const noDepartmentMembers = res2.filter(item => item.department === '暂无部门信息');
      setInitialTreeData(initData([...res1, ...noDepartmentMembers], res2));
      setMembers(res2);
    });
  };

  useEffect(() => {
    init();
    setInitialTreeData([]);
    setExpandedKeys([]);
  }, []);

  const onTreeExpand = async _expandedKeys => {
    if (_expandedKeys.length > expandedKeys.length) {
      const key = _.difference(_expandedKeys, expandedKeys)[0];
      const _treeData = searchValue ? [...searchTreeData] : [...initialTreeData];
      const treeNode = findTreeNode(_treeData, key);
      if (!treeNode.load) {
        const groupId = treeNode.key;
        if (searchValue) {
          // 搜索条件下还需要加载子部门
          const _res = await groupList({ groupId });
          if (_res) {
            const departments = initData(_res);
            insertData(_treeData, groupId, departments);
          }
        }
        const res = await memberList({ groupId, size: -1 });
        const _members = initData(res.members).map(item => {
          item.key = `${item.id}-${groupId}`; // 重新赋值key，防重复
          item.value = `${item.id}-${groupId}`; // 重新赋值key，防重复
          return item;
        });
        insertData(_treeData, groupId, _members);
        if (searchValue) {
          setSearchTreeData(_treeData);
        } else {
          setInitialTreeData(_treeData);
        }
      }
    }
    setExpandedKeys(_expandedKeys);
  };

  const handleConfirm = () => {
    // 调用接口
    Modal.info({
      title: '确认分配积分吗？',
      content: '确认后将使用您的私钥签名并扣除相应积分。',
      okText: '确定',
      style: { top: 240 },
      closable: true,
      closeIcon: <CloseIcon fill="#888" />,
      onOk: () => {
        isSave = true;
        // 调用接口
        Modal.destroyAll();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  const handleNext = async () => {
    const values = await form.validateFields();
    console.log(values);
    const data = [...value].splice(0, 4).map(item => item.split('-')[0]);
    const dataList = members
      .filter(item => data.includes(item.id) || data.includes(item.address))
      .map(li => li.name);
    setValueStr(dataList.join('、'));
    // 调用接口
    setCurrent(2);
  };

  const handleBefore = () => {
    setCurrent(1);
  };

  const showModalSave = path => {
    Modal.info({
      title: '是否在离开前保存当前内容？',
      content: '若离开，当前正在编辑的内容将丢失。',
      okText: '不离开',
      cancelText: '离开',
      style: { top: 240 },
      closable: true,
      closeIcon: <CloseIcon fill="#888" />,
      onOk: () => {
        Modal.destroyAll();
      },
      onCancel: () => {
        isSave = true;
        router.replace({
          pathname: path.pathname,
        });
        Modal.destroyAll();
      },
    });
  };

  const handlePrompt = path => {
    if (!isSave) {
      showModalSave(path);
      return false;
    }
    return true;
  };

  const formChange = () => {
    if (isSave) isSave = false;
  };

  return (
    <>
      <Prompt message={handlePrompt} />
      <NewPage title="积分分配" showBackIcon noContentLayout className={styles.account}>
        <div className={styles.accountPrice}>
          <div className={styles.header}>
            <ItemTitle title="分配详情" />
          </div>
          <div className={styles.priceStep}>
            <Step stepData={stepData} current={current} />
          </div>
          <div className={styles.priceContent}>
            {current === 1 ? (
              <div className={styles.alert}>
                <Alert
                  type="info"
                  message={
                    <div>
                      积分分配规则：
                      <div> 1.超级管理员可将账户积分分配给机构内其他用户；</div>
                      <div> 2.超级管理员的积分可用于机构内分配和机构间数据共享；</div>
                      <div> 3.普通用户的积分可用于机构间数据共享。；</div>
                    </div>
                  }
                  showIcon
                />
              </div>
            ) : (
              <Alert
                type="warning"
                message="分配成员为空或当前可用积分不足，请确认后再提交。"
                showIcon
              />
            )}
            <div className={styles.priceBg}>
              <div>
                <div className={styles.label}>当前可用积分</div>
                <div className={styles.priceValue}>
                  <span>8000.00</span>
                  <span className={styles.extra}>Bx</span>
                </div>
              </div>
              {current === 2 ? (
                <div className={styles.two}>
                  <div className={styles.label}>预计使用积分</div>
                  <div className={styles.value}>
                    <span>2000.00</span>
                    <span className={styles.extra}>Bx</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <Form
                form={form}
                onFieldsChange={formChange}
                hideRequiredMark
                style={{ display: current === 1 ? 'block' : 'none' }}
              >
                <Item {...formItemLayout} label="分配方式">
                  <RadioCard
                    active
                    icon={DepartIcon}
                    style={{ width: 180 }}
                    title="等额分配"
                    desc="人均分配的积分相同"
                  />
                </Item>
                <Item
                  {...formItemLayout}
                  name="price"
                  label="人均积分"
                  rules={[
                    { required: true, message: '请输入人均积分' },
                    { validator: validatorInput },
                  ]}
                >
                  <Input style={{ width: 280 }} placeholder="请输入人均积分" suffix="Bx" />
                </Item>
                <Item
                  {...formItemLayout}
                  name="members"
                  label="分配成员"
                  rules={[{ required: true, message: '请选择分配成员' }]}
                >
                  <TreeSelect
                    style={{ width: 378 }}
                    treeData={searchValue ? searchTreeData : initialTreeData}
                    treeExpandedKeys={expandedKeys}
                    onTreeExpand={onTreeExpand}
                    showSearch
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    placeholder="请选择分配成员"
                    allowClear
                    multiple
                    tagRender={tagRender}
                    value={value}
                    onChange={onChange}
                    onSearch={onSearch}
                    onBlur={() => onSearch('')}
                    filterTreeNode={false}
                    dropdownClassName={styles.createModalTree}
                    notFoundContent={<div className={styles.emptyBox}>暂无匹配结果！</div>}
                  />
                </Item>

                <Item {...formItemLayout} label="&nbsp;">
                  <div style={{ marginTop: 12 }}>
                    <Button type="primary" onClick={handleNext}>
                      下一步
                    </Button>
                    <Button
                      style={{ marginLeft: 8 }}
                      onClick={() => {
                        router.goBack();
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </Item>
              </Form>

              <Descriptions
                labelStyle={{ width: 90 }}
                style={{ display: current === 2 ? 'block' : 'none' }}
              >
                <Descriptions.Item label="分配方式">
                  <RadioCard
                    active
                    icon={DepartIcon}
                    style={{ width: 180 }}
                    title="等额分配"
                    desc="人均分配的积分相同"
                  />
                </Descriptions.Item>
                <Descriptions.Item label="人均积分">100.00 Bx</Descriptions.Item>
                <Descriptions.Item label="分配成员">
                  {value.length > 3 ? `${valueStr}等` : valueStr} 20人
                </Descriptions.Item>
                <Descriptions.Item label="&nbsp;">
                  <div style={{ marginTop: 28 }}>
                    <Button type="primary" onClick={handleConfirm}>
                      确定
                    </Button>
                    <Button style={{ marginLeft: 8 }} onClick={handleBefore}>
                      上一步
                    </Button>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        </div>
      </NewPage>
    </>
  );
}

export default connect(({ account, organization, resource }) => ({
  userInfo: account.info,
  orgInfo: organization.info,
  members: resource.members,
}))(AccountPrice);
