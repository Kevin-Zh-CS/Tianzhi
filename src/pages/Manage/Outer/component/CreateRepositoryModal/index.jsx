import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import HintText from '@/components/HintText';
import { Modal, Form, Input, message, Select, Tooltip } from 'quanta-design';
import { outerResourceCreate, outerResourceUpdate } from '@/services/outer';
import { Tag } from 'antd';
import styles from './index.less';
import { replaceName } from '@/utils/helper';

function CreateModal(props) {
  const [form] = Form.useForm();
  const {
    dispatch,
    visible,
    onCancel,
    isNew = true,
    namespace = '',
    resourceId = '',
    resourceName = '',
    resourceDesc = '',
    // resourceType = 2,
    resourceMember = [],
    members = [],
    resource = {},
    loadData = () => {},
    loadNewData = () => {},
  } = props;
  const [selectList, setSelectList] = useState([]);
  const [selectInitList, setSelectInitList] = useState([]);

  const formItemLayout = {
    labelCol: { style: { width: 76, textAlign: 'left' } },
    wrapperCol: {},
  };

  useEffect(() => {
    const params = {
      resourceName,
      resourceDesc,
      resourceMember,
    };
    form.setFieldsValue(params);
  }, [props]);

  // 确认新建资源库
  const onOk1 = async () => {
    const formValues = await form.validateFields();
    const data = {
      resourceId,
      name: replaceName(formValues.resourceName),
      desc: formValues.resourceDesc,
      // privateType: formValues.resourceType,
      privateType: 1,
      memberList: formValues.resourceMember,
      namespace,
    };
    await outerResourceCreate({ ...data });
    message.success(`外部资源库新建成功！`);
    loadNewData();
    loadData();
    onCancel();
  };

  // 确认更新资源库
  const onOk2 = async () => {
    const formValues = await form.validateFields();
    const data = {
      resourceId,
      name: replaceName(formValues.resourceName),
      desc: formValues.resourceDesc,
      // privateType: formValues.resourceType,
      privateType: 1,
      memberList: formValues.resourceMember,
      namespace,
    };
    await outerResourceUpdate({ ...data });
    message.success('资源库信息修改成功！');
    loadData();
    form.resetFields();
    onCancel();
  };

  const handleSearch = () => {
    if (dispatch) {
      dispatch({
        type: 'resource/searchMembers',
        payload: {
          resourceId,
          ns_id: resource.ns_id || namespace,
          keywords: encodeURIComponent(''),
        },
      });
    }
  };

  useEffect(() => {
    setSelectList(members);
    setSelectInitList(members);
  }, [members]);

  useEffect(() => {
    if (visible) {
      handleSearch();
    }
  }, [visible]);

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleSearchData = val => {
    const list = selectInitList.filter(item => item.name.includes(val) || item.tel?.includes(val));
    setSelectList(list);
  };

  const handleSelect = () => {
    handleSearchData('');
  };

  const handleBlur = () => {
    handleSearchData('');
  };

  const tagRender = ({ value, closable, onClose }) => {
    let title = '';
    const item = members.find(_item => _item.address === value.split('-')[0]);
    if (item) title = item.tel ? `${item.name}` : `${item.name}·${item.amount}人`;
    const onPreventMouseDown = event => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ margin: '2px 4px 2px 0' }}
      >
        {title}
      </Tag>
    );
  };

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      title={isNew ? '新建资源库' : '修改基本信息'}
      visible={visible}
      onOk={isNew ? onOk1 : onOk2}
      okText="确定"
      onCancel={handleCancel}
    >
      <HintText>为不同类型事务创建外部资源库，方便管理本机构获取的外部数据。</HintText>
      <Form
        form={form}
        colon={false}
        preserve={false}
        hideRequiredMark
        className={styles.formStyle}
        initialValues={{
          resourceName,
          resourceDesc,
          resourceMember,
        }}
      >
        <Form.Item
          name="resourceName"
          label="资源库名称"
          {...formItemLayout}
          rules={[
            { required: true, message: '请输入资源库名称' },
            { max: 30, message: '输入超过30个字符，请重新输入' },
          ]}
        >
          <Input className={styles.inputStyle} placeholder="请输入资源库名称" />
        </Form.Item>
        <Form.Item
          name="resourceDesc"
          label="资源库描述"
          {...formItemLayout}
          rules={[
            { required: true, message: '请输入资源库描述' },
            { max: 100, message: '请输入100字以内资源库描述' },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="请输入100字以内资源库描述"
            className={styles.inputStyle}
          />
        </Form.Item>
        {/* <Form.Item
          name="resourceType"
          label="公开类型"
          {...formItemLayout}
          initialValue={resourceType}
        >
          <Select className={styles.inputStyle} placeholder="请选择公开类型">
            <Select.Option value={2}>
              <span>内部公开</span>
              <span className={styles.spanColor}>（机构内部所有成员可见）</span>
            </Select.Option>
            <Select.Option value={1}>
              <span>部分可见</span>
              <span className={styles.spanColor}>（仅资源库成员可见）</span>
            </Select.Option>
          </Select>
        </Form.Item> */}
        <Form.Item name="resourceMember" label="资源库成员" {...formItemLayout}>
          <Select
            onSearch={handleSearchData}
            onSelect={handleSelect}
            onBlur={handleBlur}
            filterOption={false}
            style={{ width: 280 }}
            className={styles.resourceMemberSelect}
            placeholder="请选择资源库成员"
            mode="multiple"
            tagRender={tagRender}
          >
            {selectList.map(item => (
              <Select.Option key={item.address} disabled={item.exist}>
                <Tooltip
                  placement="top"
                  title={!item.exist ? '' : item.type === 1 ? '该部门已添加！' : '该成员已添加！'}
                >
                  <div>
                    {item.name}
                    {item.amount !== null && <span>·{item.amount}人</span>}
                    {item.tel && <span>（{item.tel}）</span>}
                  </div>
                </Tooltip>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default connect(({ resource }) => ({
  members: resource.members,
}))(CreateModal);
