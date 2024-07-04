import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import HintText from '@/components/HintText';
import { Modal, Form, Input, message, Select, Tooltip } from 'quanta-design';
import { Tag } from 'antd';
import styles from './index.less';
import { replaceName } from '@/utils/helper';

function CreateModal(props) {
  const {
    visible,
    onCancel,
    dispatch,
    isNew = true,
    namespace = '',
    resourceId = '',
    resourceName = '',
    resourceDesc = '',
    // resourceType = 2,
    resourceMember = [],
    members = [],
    resource = {},
  } = props;
  const [selectList, setSelectList] = useState([]);
  const [selectInitList, setSelectInitList] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isNew && visible) {
      form.setFieldsValue({
        resourceName: resource.ns_name,
        resourceDesc: resource.ns_desc,
        // resourceType: resource.private_type,
      });
    }
  }, [visible]);

  const formItemLayout = {
    labelCol: { style: { width: 76, textAlign: 'left' } },
    wrapperCol: {},
  };
  const onOk = async () => {
    const formValues = await form.validateFields();
    dispatch({
      type: `resource/${isNew ? 'resourceCreate' : 'resourceUpdate'}`,
      payload: {
        name: replaceName(formValues.resourceName),
        desc: formValues.resourceDesc,
        // privateType: formValues.resourceType,
        privateType: 1,
        members: formValues.resourceMember,
        namespace: resource.ns_id,
      },
      callback: () => {
        message.success(`${isNew ? '资源库新建成功！' : '资源库信息修改成功！'}`);
        dispatch({
          type: 'resource/resourceList',
        });
        if (namespace) {
          dispatch({
            type: 'resource/resourceInfo',
            payload: { namespace },
          });
        }
        form.resetFields();
        onCancel();
      },
    });
  };

  const handleSearch = () => {
    if (dispatch) {
      dispatch({
        type: 'resource/searchMembers',
        payload: {
          resourceId,
          ns_id: resource.ns_id,
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
      onOk={onOk}
      okText="确定"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
    >
      <HintText>为不同类型事务创建内部资源库，方便管理本机构的内部数据。</HintText>
      <Form
        initialValues={{
          resourceName,
          resourceDesc,
          resourceMember,
        }}
        form={form}
        colon={false}
        preserve={false}
        hideRequiredMark
        style={{ padding: '24px 49px 0' }}
      >
        <Form.Item
          name="resourceName"
          label="资源库名称"
          {...formItemLayout}
          rules={[
            { required: true, message: '请输入资源库名称' },
            { max: 30, message: '请输入30字以内资源库名称' },
          ]}
        >
          <Input style={{ width: 280 }} placeholder="请输入资源库名称" />
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
          <Input.TextArea rows={4} placeholder="请输入100字以内资源库描述" style={{ width: 280 }} />
        </Form.Item>
        {/* <Form.Item
          name="resourceType"
          label="公开类型"
          {...formItemLayout}
          initialValue={resourceType}
        >
          <Select style={{ width: 280 }} placeholder="请选择公开类型">
            <Select.Option value={2}>
              内部公开<span style={{ color: '#B7B7B7' }}>（机构内部所有成员可见）</span>
            </Select.Option>
            <Select.Option value={1}>
              部分可见<span style={{ color: '#B7B7B7' }}>（仅资源库成员可见）</span>
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
