import React from 'react';
import { Modal, Table } from 'quanta-design';

function ManageModal({
  visible = false,
  onCancel,
  title = '',
  dataSource = [],
  columns = [],
  loading,
}) {
  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      style={{ minWidth: 888 }}
      bodyStyle={{ minHeight: 500 }}
      title={title}
      footer={null}
      visible={visible}
      onCancel={onCancel}
    >
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        loading={loading || false}
      />
    </Modal>
  );
}

export default ManageModal;
