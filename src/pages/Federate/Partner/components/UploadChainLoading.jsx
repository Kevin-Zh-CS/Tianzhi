import React, { useRef, useEffect, useState } from 'react';
import { Modal, Button, IconBase } from 'quanta-design';
import lottie from 'lottie-web';
import animationData from '@/../public/loading.json';
import { ReactComponent as SuccessIcon } from '@/icons/check_circle_filled.svg';

/*
  上链动画
  type: 0-接受邀请 1-审核模型
*/
function UploadChainLoading({ visible = false, onOk = null, type = 0 }) {
  const [loaded, setLoaded] = useState(false);
  const animation = useRef(null);
  useEffect(() => {
    if (visible) {
      lottie.loadAnimation({
        container: animation.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData,
      });
      setTimeout(() => {
        setLoaded(true);
      }, 2500);
    }
  }, [visible]);

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      visible={visible}
      closable={false}
      footer={null}
      style={{ textAlign: 'center' }}
      width={428}
    >
      {loaded ? (
        <>
          <IconBase icon={SuccessIcon} fill="#08CB94" fontSize="72px" />
          <p style={{ fontWeight: 600, fontSize: 16, color: '#121212' }}>
            {type ? '审核通过成功！' : '接受邀请成功！'}
          </p>
          <p>已通过私钥签名进行验证。</p>
          <Button onClick={onOk}>{type ? '我知道了' : '立即添加数据'}</Button>
        </>
      ) : (
        <>
          <div ref={animation} style={{ width: 64, height: 64, margin: '0 auto 24px auto' }}></div>
          <span style={{ fontWeight: 600, fontSize: 16, color: '#121212' }}>
            正在用您的私钥进行签名，请耐心等待！
          </span>
        </>
      )}
    </Modal>
  );
}

export default UploadChainLoading;
