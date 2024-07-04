import React, { useState } from 'react';
import { Upload, Icons, message } from 'quanta-design';
import ImgCrop from 'antd-img-crop';
import styles from './index.less';

const { PlusIcon, LoadingIcon } = Icons;

function UploadAvatar({ title = '', desc = '', disabled = false, ...restProps }) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(undefined);

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const beforeUpload = file => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt300KB = file.size < 300 * 1024;
    if (!isLt300KB) {
      message.error('文件大小不超过300KB！');
    }
    return isJpgOrPng && isLt300KB;
  };

  const handleChange = info => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, url => {
        setImageUrl(url);
        setLoading(false);
      });
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingIcon fill="#b7b7b7" /> : <PlusIcon fill="#b7b7b7" />}
      <div style={{ marginTop: 8, color: '#b7b7b7' }}>上传{desc}</div>
    </div>
  );
  return (
    <div {...restProps}>
      <ImgCrop modalTitle={title}>
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          disabled={disabled}
          style={{ width: 120 }}
        >
          {imageUrl ? (
            <div className={styles.hoverAvatar}>
              <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
              <div className={styles.changeAvatar}>更换{desc}</div>
            </div>
          ) : (
            uploadButton
          )}
        </Upload>
      </ImgCrop>
    </div>
  );
}
export default UploadAvatar;
