import React from 'react';
import { connect } from 'dva';
import { Modal, Table, Alert, IconBase, Tooltip, Pagination } from 'quanta-design';
import ButtonGroup from '@/components/ButtonGroup';
import { ReactComponent as questionCircleIcon } from '@/assets/question_circle.svg';
import styles from './index.less';

function MissingQFLValueModal(props) {
  const { visible, setVisible, onDelete, list, onChange, total } = props;
  const arr = Object.keys(list);
  const columns = [];

  if (arr.length > 0 && list.records.length > 0) {
    Object.keys(list.records[0]).forEach(res => {
      columns.push({
        key: res,
        dataIndex: res,
        title: res,
        render: txt => <div className={styles.column}>{txt}</div>,
      });
    });
  }

  return (
    <Modal
      title="缺失值识别"
      visible={visible}
      onCancel={() => setVisible(false)}
      className={styles.modal}
      width={984}
      footer={
        <div className={styles.footer}>
          <Tooltip
            arrowPointAtCenter
            placement="topLeft"
            title="一键删除：删除所有已识别的缺失值。"
          >
            <IconBase icon={questionCircleIcon} fontSize={20} fill="#888" />
          </Tooltip>
          <ButtonGroup
            left="取消"
            onClickL={() => {
              setVisible(false);
            }}
            right="一键删除"
            onClickR={onDelete}
            style={{ marginLeft: 20 }}
          />
        </div>
      }
    >
      <div style={{ marginBottom: 18 }}>
        <span style={{ color: '#888', marginRight: 20 }}>识别结果</span>
        当前导入数据中共计有{total}条数据，含{list.total}
        个字段缺失。
      </div>
      <Alert
        type="info"
        message={<span>温馨提示：建议将缺失数据删除，否则缺失数据将会影响实际计算结果。</span>}
        style={{ marginBottom: 12 }}
        showIcon
        // closable
      />
      <div className={styles.tableContent}>
        <Table columns={columns} dataSource={list.records} onChange={onChange} pagination={false} />
        <Pagination className={styles.pagination} total={list.total} onChange={onChange} simple />
      </div>
    </Modal>
  );
}
export default connect(({ importer }) => ({
  missingContent: importer.missingContent,
}))(MissingQFLValueModal);
