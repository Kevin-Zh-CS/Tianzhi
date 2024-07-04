import React from 'react';
import { connect } from 'dva';
import { Modal } from 'quanta-design';
import questionBlue from '@/icons/question_blue.png';
import styles from './index.less';

function PassModal(props) {
  const { isModalVisible, handleCancel, onOk } = props;

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      visible={isModalVisible}
      onOk={onOk}
      okText="确定"
      onCancel={handleCancel}
      width={428}
      height={176}
    >
      <div className={styles.note}>
        <img className={styles.img} src={questionBlue} alt=""></img>
        <div className={styles.title}>确认下架当前已发布数据吗</div>
        <div className={styles.desc}>数据下架后，数据平台将不再显示该数据信息。</div>
      </div>
    </Modal>
  );
}

export default connect()(PassModal);
