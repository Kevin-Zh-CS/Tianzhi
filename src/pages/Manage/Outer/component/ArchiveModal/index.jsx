import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { Modal, Form, Select, IconBase, Icons, message, Tooltip } from 'quanta-design';
import { getExternalList } from '@/services/outer-data';

import HintText from '@/components/HintText';
import CreateRepositoryModal from '../CreateRepositoryModal';
import styles from './index.less';

const { PlusIcon } = Icons;

function ArchiveModal(props) {
  const { onOk, onCancel, visible, setVisible, id } = props;
  const formItemLayout = {
    labelCol: { style: { width: 76, textAlign: 'left' } },
    wrapperCol: {},
  };
  const [createVisible, setCreateVisible] = useState(false);
  const [list, setList] = useState([]);
  const [filterList, setFilterList] = useState([]);
  const [form] = Form.useForm();

  const getList = async () => {
    const res = await getExternalList({ order_id: id });
    setList(res);
    setFilterList(res);
  };

  useEffect(() => {
    if (visible) getList();
  }, [visible]);

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const openModal = () => {
    onCancel();
    setCreateVisible(true);
  };

  const handleCreateOk = () => {
    setCreateVisible(false);
    message.success('数据转存成功！');
  };

  const handleCreateCancel = () => {
    setCreateVisible(false);
    setVisible(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    onOk(values);
    handleCancel();
  };

  const handleSearch = value => {
    const data = list.filter(item => item.ns_name.includes(value));
    setFilterList(data);
  };

  const getRender = menuNode => (
    <div>
      {menuNode}
      <div className={styles.createBtn} onMouseDown={e => e.preventDefault()} onClick={openModal}>
        <IconBase icon={PlusIcon} fill="#0076d9" style={{ marginRight: 4 }} />
        新建外部资源库
      </div>
    </div>
  );

  return (
    <>
      <Modal
        maskClosable={false}
        keyboard={false}
        destroyOnClose
        className={classnames(styles.archiveModal, 'modal-has-top-border')}
        title="转存数据"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        style={{ width: 560, margin: '0 auto', top: 240 }}
      >
        <HintText>
          <div>对外部获取的数据，转存至外部资源库中，进行分区管理。</div>
        </HintText>
        <Form colon={false} hideRequiredMark form={form} style={{ padding: '24px 49px 0px' }}>
          <Form.Item
            name="ns_id"
            label="外部资源库"
            {...formItemLayout}
            rules={[{ required: true, message: '请选择外部资源' }]}
          >
            <Select
              style={{ width: 280 }}
              placeholder="请选择"
              filterOption={false}
              dropdownRender={menuNode => getRender(menuNode)}
              onSearch={handleSearch}
              notFoundContent={<div>当前机构暂无已创建的外部资源库！</div>}
              showSearch
              allowClear
            >
              {filterList
                .filter(item => item.role !== null)
                .map(item => (
                  <Select.Option key={item.ns_id} value={item.ns_id} disabled={item.exist}>
                    <Tooltip placement="top" title={item.exist ? '当前资源库已存在所选数据' : ''}>
                      <div>{item.ns_name}</div>
                    </Tooltip>
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <CreateRepositoryModal
        visible={createVisible}
        onCancel={handleCreateCancel}
        onOk={handleCreateOk}
        isNew
      />
    </>
  );
}

export default ArchiveModal;
