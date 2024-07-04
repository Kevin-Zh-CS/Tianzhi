import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message, Select, Tooltip } from 'quanta-design';
import { createProject, updateProject } from '@/services/qfl';
import { ReactComponent as DataPlatformIcon } from '@/icons/data_h.svg';
import RadioCard from '@/pages/Federate/components/RadioCard';
import { ReactComponent as InvitationIcon } from '@/icons/data_z.svg';
import { searchMembers } from '@/services/resource';
import { Tag } from 'antd';

function CreateQFLModal(props) {
  const [form] = Form.useForm();
  const { visible, onCancel, isNew = false, info = {}, getTaskList } = props;
  const [radioOption, setRadioOption] = useState(0);
  const [selectList, setSelectList] = useState([]);
  const [selectInitList, setSelectInitList] = useState([]);

  const formItemLayout = {
    labelCol: { style: { width: 76, textAlign: 'left' } },
    wrapperCol: {},
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const onOk = async () => {
    const formValues = await form.validateFields();
    const params = { ...formValues, type: radioOption };

    if (!isNew) {
      params.project_id = info.project_id;
      await updateProject(params);
    } else {
      await createProject(params);
    }
    message.success(`项目${isNew ? '创建' : '信息修改'}成功！`);
    handleCancel();
    getTaskList();
  };

  useEffect(() => {
    if (visible && !isNew) {
      form.setFieldsValue({ ...info, members: [] });
      setRadioOption(info.type || 0);
    }
  }, [visible, isNew]);

  const handleSearch = async () => {
    const res = await searchMembers({ ns_id: info.project_id });
    setSelectList(res);
    setSelectInitList(res);
  };

  useEffect(() => {
    if (visible) {
      handleSearch();
    }
  }, [visible]);

  const handleChange = val => {
    if (isNew) {
      setRadioOption(val);
    }
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
    if (value) {
      const item = selectInitList.find(_item => _item.address === value.split('-')[0]);
      if (item) title = item.tel ? `${item.name}` : `${item.name}·${item.amount}人`;
    }
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
      title={isNew ? '新建项目' : '修改项目信息'}
      visible={visible}
      onOk={onOk}
      okText="确定"
      onCancel={handleCancel}
    >
      <Form
        form={form}
        colon={false}
        preserve={false}
        hideRequiredMark
        style={{ padding: '0 49px' }}
      >
        <Form.Item
          name="name"
          label="项目名称"
          {...formItemLayout}
          rules={[
            { required: true, message: '请输入项目名称' },
            { max: 30, message: '项目名称不可超过30个字符，请重新输入' },
          ]}
        >
          <Input style={{ width: 280 }} placeholder="请输入项目名称" />
        </Form.Item>
        <Form.Item
          name="desc"
          label="项目描述"
          {...formItemLayout}
          rules={[
            { required: true, message: '请输入项目描述' },
            { max: 100, message: '项目描述不可超过100个字符，请重新输入' },
          ]}
        >
          <Input.TextArea rows={4} placeholder="请输入100字以内项目描述" style={{ width: 280 }} />
        </Form.Item>
        <Form.Item label="项目类型" {...formItemLayout}>
          {isNew ? (
            <>
              <RadioCard
                onClick={() => handleChange(0)}
                active={radioOption === 0}
                icon={DataPlatformIcon}
                title="横向联邦"
                desc="常运用于同行业共建联合模型"
              />
              <RadioCard
                style={{ marginTop: 8 }}
                onClick={() => handleChange(1)}
                active={radioOption === 1}
                icon={InvitationIcon}
                title="纵向联邦"
                desc="常运用于跨行业数据提升的场景中"
              />
            </>
          ) : (
            <>
              {radioOption === 0 ? (
                <RadioCard
                  onClick={() => handleChange(0)}
                  active={radioOption === 0}
                  icon={DataPlatformIcon}
                  title="横向联邦"
                  desc="常运用于同行业共建联合模型"
                />
              ) : (
                <RadioCard
                  style={{ marginTop: 8 }}
                  onClick={() => handleChange(1)}
                  active={radioOption === 1}
                  icon={InvitationIcon}
                  title="纵向联邦"
                  desc="常运用于跨行业数据提升的场景中"
                />
              )}
            </>
          )}
        </Form.Item>

        <Form.Item
          name="visibility"
          label="公开类型"
          rules={[{ required: true, message: '请选择公开类型' }]}
          {...formItemLayout}
        >
          <Select style={{ width: 280 }} placeholder="请选择公开类型">
            <Select.Option value={2}>
              内部公开<span style={{ color: '#B7B7B7' }}>（机构内部所有成员可见）</span>
            </Select.Option>
            <Select.Option value={1}>
              部分可见<span style={{ color: '#B7B7B7' }}>（仅项目成员可见）</span>
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="members" label="任务成员" {...formItemLayout}>
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

export default CreateQFLModal;
