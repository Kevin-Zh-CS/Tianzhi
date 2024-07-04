import React from 'react';
import { Modal, Table, Alert, IconBase, Tooltip, Pagination } from 'quanta-design';
import ButtonGroup from '@/components/ButtonGroup';
import { ReactComponent as questionCircleIcon } from '@/assets/question_circle.svg';
import styles from './index.less';

function MissingValueModal(props) {
  const { missingContent, visible, setVisible, onDelete, onChange, total } = props;
  const columns = [];

  if (missingContent && missingContent.records && missingContent.records.length > 0) {
    Object.keys(missingContent.records[0]).forEach(res => {
      columns.push({ key: res, dataIndex: res, title: res });
    });
  }

  const changePage = current => {
    onChange(current);
  };
  return (
    <Modal
      title="缺失值识别"
      visible={visible}
      onCancel={() => setVisible(false)}
      className={styles.modal}
      style={{ width: 720, margin: '0 auto', top: 240 }}
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
        当前导入数据中共计有{total}条数据，含{missingContent.missing_field_num}
        个字段缺失。
      </div>
      <Alert
        type="info"
        message={<span>温馨提示：建议将缺失数据删除，否则缺失数据将会影响实际计算结果。</span>}
        style={{ marginBottom: 12 }}
        showIcon
        // closable
      />
      <div>
        <div className={styles.missTable}>
          <Table columns={columns} dataSource={missingContent.records} pagination={false} />
          <div className="overflowPagination">
            <Pagination onChange={changePage} total={missingContent.total} pageSize={5} simple />
          </div>
        </div>
      </div>
    </Modal>
  );
}
export default MissingValueModal;
