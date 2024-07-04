import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Alert, message, Select, Tooltip } from 'quanta-design';
import { Tag } from 'antd';
import { taskAdd, taskUpdate } from '@/services/sponsor';

function CreateTaskModal(props) {
  const [form] = Form.useForm();
  const {
    visible,
    onCancel,
    dispatch,
    isNew = false,
    taskId = '',
    taskName = '',
    taskDesc = '',
    taskType = 2,
    getTaskList = null,
    members = [],
  } = props;
  const [selectList, setSelectList] = useState([]);
  const [selectInitList, setSelectInitList] = useState([]);

  useEffect(() => {
    const params = {
      taskName,
      taskDesc,
    };
    form.setFieldsValue(params);
  }, [props]);

  const formItemLayout = {
    labelCol: { style: { width: 76, textAlign: 'left' } },
    wrapperCol: {},
  };
  const onOk = async () => {
    const formValues = await form.validateFields();
    const params = {
      taskId,
      name: formValues.taskName,
      desc: formValues.taskDesc,
      visibility: Number(formValues.taskType),
      members: formValues.taskMember,
    };
    if (isNew) {
      await taskAdd(params);
      message.success('任务新建成功！');
    } else {
      await taskUpdate(params);
      message.success('任务信息修改成功！');
      dispatch({
        type: 'sponsor/taskInfo',
        payload: taskId,
      });
    }
    if (getTaskList) getTaskList();

    form.resetFields();
    onCancel();
  };
  const handleSearch = () => {
    if (dispatch) {
      dispatch({
        type: 'resource/searchMembers',
        payload: {
          ns_id: taskId,
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
      title={isNew ? '新建任务' : '修改任务信息'}
      visible={visible}
      onOk={onOk}
      okText="确定"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
    >
      {isNew && (
        <Alert type="info" message="温馨提示：确定新建后，任务信息将保存到区块链上。" showIcon />
      )}
      <Form
        initialValues={{
          taskName,
          taskDesc,
        }}
        form={form}
        colon={false}
        preserve={false}
        hideRequiredMark
        style={{ padding: '24px 49px 0' }}
      >
        <Form.Item
          name="taskName"
          label="任务名称"
          {...formItemLayout}
          rules={[
            { required: true, message: '请输入任务名称' },
            { max: 30, message: '任务名称不可超过30个字符，请重新输入' },
          ]}
        >
          <Input style={{ width: 280 }} placeholder="请输入任务名称" />
        </Form.Item>
        <Form.Item
          name="taskDesc"
          label="任务描述"
          {...formItemLayout}
          rules={[
            { required: true, message: '请输入任务描述' },
            { max: 100, message: '任务描述不可超过100个字符，请重新输入' },
          ]}
        >
          <Input.TextArea rows={4} placeholder="请输入100字以内任务描述" style={{ width: 280 }} />
        </Form.Item>
        <Form.Item
          name="taskType"
          label="公开类型"
          initialValue={taskType}
          rules={[{ required: true, message: '请选择公开类型' }]}
          {...formItemLayout}
        >
          <Select style={{ width: 280 }} placeholder="请选择公开类型">
            <Select.Option value={2}>
              内部公开<span style={{ color: '#B7B7B7' }}>（机构内部所有成员可见）</span>
            </Select.Option>
            <Select.Option value={1}>
              部分可见<span style={{ color: '#B7B7B7' }}>（仅任务成员可见）</span>
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="taskMember" label="任务成员" {...formItemLayout}>
          <Select
            onSearch={handleSearchData}
            onSelect={handleSelect}
            onBlur={handleBlur}
            filterOption={false}
            style={{ width: 280 }}
            placeholder="请选择任务成员"
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

export default connect(({ account, resource }) => ({
  checkedList: account.checkedList,
  members: resource.members,
}))(CreateTaskModal);
