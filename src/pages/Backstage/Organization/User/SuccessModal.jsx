import React from 'react';
import { Modal, IconBase, Button } from 'quanta-design';
import { ReactComponent as SuccessIcon } from '@/icons/check_circle_filled.svg';
import { ReactComponent as ErrorIcon } from '@/icons/close_circle_filled.svg';

function SuccessModal({
  error = false,
  visible = false,
  onCancel = null,
  title = '用户新建成功！',
  desc = '初始密码为用户手机号后6位，需提醒用户及时修改。',
}) {
  return (
    <Modal visible={visible} closable={false} footer={null} width={428} height={240}>
      <div style={{ textAlign: 'center' }}>
        {error ? (
          <IconBase icon={ErrorIcon} fill="#E63B43" fontSize="72px" />
        ) : (
          <IconBase icon={SuccessIcon} fill="#08CB94" fontSize="72px" />
        )}
        <p style={{ fontWeight: 600, fontSize: 16, color: '#121212' }}>{title}</p>
        <p style={{ color: '#595959' }}>{desc}</p>
        <Button style={{ marginBottom: 12 }} onClick={onCancel}>
          我知道了
        </Button>
      </div>
    </Modal>
  );
}

export default SuccessModal;
