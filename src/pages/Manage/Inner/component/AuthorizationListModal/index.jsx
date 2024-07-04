import React from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Modal, Alert, Checkbox } from 'quanta-design';
import { List, Row, Col, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { getSearchList } from '@/services/resource';
import styles from './index.less';

@connect()
class ShareRecordModal extends React.Component {
  constructor() {
    super();
    this.state = {
      checkedList: [],
      defaultValueList: [],
      allList: [],
      list: [],
      indeterminate: false,
      checkAll: false,
    };
  }

  onOk = () => {
    const { checkedList } = this.state;
    const { onOk } = this.props;
    if (onOk) onOk(checkedList);
  };

  onCancel = () => {
    const { onCancel } = this.props;
    if (onCancel) onCancel();
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      this.initData();
    }
  }

  initData = async () => {
    const data = await getSearchList();
    const { checkedList } = this.props;
    let list = [];
    if (checkedList && checkedList.length > 0) {
      if (typeof checkedList[0] === 'string') {
        list = data.map(item => ({
          ...item,
          is_auth: checkedList.includes(item.org_name),
        }));
      } else {
        const checkIdList = checkedList.map(item => item.org_id);
        list = data.map(item => ({
          ...item,
          is_auth: checkIdList.includes(item.org_id),
        }));
      }
    } else {
      list = data.map(item => ({
        ...item,
        is_auth: false,
      }));
    }
    const checked = list.filter(item => item.is_auth);
    this.setState({
      list,
      allList: list,
      checkedList: checked,
      defaultValueList: [...checked].map(item => item.org_id),
      indeterminate: !!checked.length && list.length > checked.length,
      checkAll: list.length === checked.length,
    });
  };

  getValuesByKeys = (arr = [], keys = []) => {
    if (keys === null) return '';
    if (arr.length === 0) return '';

    return arr.map(item => {
      if (keys.includes(item.org_id)) {
        item.is_auth = true;
      } else {
        item.is_auth = false;
      }
      return item;
    });
  };

  onChangeAllData = e => {
    const { list, allList } = this.state;
    if (list.length === allList.length) {
      const dataList = this.getValuesByKeys(allList, e);
      const data = this.getValuesByKeys(list, e);
      const checkedList = dataList.filter(item => item.is_auth);

      this.setState({
        defaultValueList: e,
        checkedList,
        allList: dataList,
        list: data,
        indeterminate: !!checkedList.length && list.length > checkedList.length,
        checkAll: list.length === checkedList.length,
      });
    }
  };

  getList = (list, item) =>
    list.map(values => {
      if (values.org_id === item.org_id) {
        values.is_auth = false;
      }
      return values;
    });

  handleListChange = item => {
    const { list, allList } = this.state;
    if (list.length !== allList.length) {
      const allData = allList.map(li =>
        li.org_id === item.org_id ? { ...li, is_auth: !item.is_auth } : li,
      );
      const data = list.map(li =>
        li.org_id === item.org_id ? { ...li, is_auth: !item.is_auth } : li,
      );
      this.setState({
        list: data,
        allList: allData,
        defaultValueList: allData.filter(li => li.is_auth).map(em => em.org_id),
        checkedList: allData.filter(li => li.is_auth),
      });
    }
  };

  // 删除
  changeSelected = item => {
    const { list, allList } = this.state;
    const allListData = this.getList([...list], item);
    const checkedList = (allListData || []).filter(li => li.is_auth);
    this.setState({
      list: allListData,
      allList: this.getList(allList, item),
      checkedList,
      defaultValueList: (checkedList || []).map(li => li.org_id),
      indeterminate: !!checkedList.length && list.length > checkedList.length,
      checkAll: false,
    });
  };

  // 搜索
  handleSelectData = e => {
    const { allList } = this.state;
    const data = allList.filter(item => item.org_name.includes(e.target.value));
    this.setState({ list: data });
  };

  onCheckAllChange = e => {
    const { list } = this.state;
    const allCheckList = list.map(li => ({ ...li, is_auth: e.target.checked }));
    this.setState({
      indeterminate: false,
      checkAll: e.target.checked,
      checkedList: e.target.checked ? allCheckList : [],
      defaultValueList: e.target.checked ? allCheckList.map(li => li.org_id) : [],
      list: allCheckList,
    });
  };

  render() {
    const { visible } = this.props;
    const { list, defaultValueList, checkedList, indeterminate, checkAll } = this.state;
    // const checkedList = (list || []).filter((item) => item.is_auth);
    // const defaultValueList = (checkedList || []).map((item) => item.org_id)
    // console.log(defaultValueList, checkedList);

    const headEle = (
      <div>
        <Checkbox indeterminate={indeterminate} onChange={this.onCheckAllChange} checked={checkAll}>
          <div>
            所有机构 <span className={styles.checkText}>({list.length})</span>
          </div>
        </Checkbox>
        <Input
          style={{ marginTop: 12 }}
          onChange={this.handleSelectData}
          placeholder="请输入机构名称查找"
          allowClear
        />
      </div>
    );
    return (
      <Modal
        maskClosable={false}
        keyboard={false}
        destroyOnClose
        className={classnames(styles.shareRecordModal, 'modal-has-top-border')}
        title="选择授权名单"
        visible={visible}
        onOk={this.onOk}
        onCancel={this.onCancel}
        style={{ margin: '0 auto' }}
        width={720}
      >
        <div>
          <Alert
            type="info"
            message={
              <span style={{ whiteSpace: 'pre' }}>
                {`选择授权名单规则：
1.授权的初始名单为BitXMesh网络中所有已加入的机构节点。
2.授权名单中被勾选的机构在数据共享平台中获取该数据后可获得永久的数据调用权限。
3.数据发布授权名单仍可在发布详情中进行编辑和更新。`}
              </span>
            }
            showIcon
          />
          <Row style={{ marginTop: 20 }} gutter={16}>
            <Col span={12}>
              <List size="small" header={headEle} bordered>
                <div style={{ height: 340, overflow: 'scroll' }}>
                  {list.length > 0 ? (
                    <Checkbox.Group
                      value={defaultValueList}
                      onChange={this.onChangeAllData}
                      style={{ width: '100%' }}
                    >
                      {list.map((item, i) => (
                        <List.Item
                          onClick={() => {
                            this.handleListChange(item, i);
                          }}
                          style={{ width: '100%' }}
                          key={item.org_id}
                        >
                          <Checkbox value={item.org_id}>{item.org_name}</Checkbox>
                        </List.Item>
                      ))}
                    </Checkbox.Group>
                  ) : (
                    <div style={{ color: '#888888', padding: '8px 16px' }}>暂无匹配数据</div>
                  )}
                </div>
              </List>
            </Col>
            <Col span={12}>
              <List
                size="small"
                header={
                  <div>
                    已选机构<span className={styles.checkText}>({checkedList.length})</span>
                  </div>
                }
                bordered
              >
                <div style={{ height: 384, overflow: 'scroll' }}>
                  {checkedList.map(item => (
                    <List.Item
                      style={{ display: 'flex', justifyContent: 'space-between' }}
                      key={item.org_id}
                    >
                      {item.org_name}
                      <CloseOutlined
                        onClick={() => {
                          this.changeSelected(item);
                        }}
                        style={{ color: '#999' }}
                      />
                    </List.Item>
                  ))}
                </div>
              </List>
            </Col>
          </Row>
        </div>
      </Modal>
    );
  }
}

export default ShareRecordModal;
