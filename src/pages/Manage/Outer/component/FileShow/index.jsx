import React from 'react';
import { IconBase, Button } from 'quanta-design';
import { ReactComponent as UnknownFileIcon } from '@/icons/unknown_file.svg';
// import { Byte2AllB } from '@/utils/helper';
import { PERMISSION } from '@/utils/enums';
import styles from './index.less';

function FileShow(props) {
  const {
    type = 'unknown',
    tip = '暂不支持预览该格式文件，请下载后用其他应用打开。',
    data,
    handleDownload,
    onPreview,
    src,
    content,
    icon,
    auth = [],
    onLoad,
  } = props;
  let element;
  switch (type) {
    case 'pdf':
      element = (
        <div className={styles.pdfFileWrap}>
          <object
            data={src}
            type="application/pdf"
            width="100%"
            height="100%"
            onLoad={() => {
              if (onLoad) onLoad();
            }}
          >
            This browser does not support PDFs. Please download the PDF to view it:{' '}
            <a onClick={handleDownload}>Download PDF</a>
          </object>
        </div>
      );
      break;
    case 'image':
      element = (
        <div className={styles.imageWrap}>
          <img
            src={src}
            style={{ maxWidth: '100%' }}
            onLoad={() => {
              if (onLoad) onLoad();
            }}
            alt="xxxx"
          />
        </div>
      );
      break;
    case 'video':
      element = (
        <div className={styles.videoWrap}>
          <video controls="controls" width="100%">
            <source
              src={src}
              onLoad={() => {
                if (onLoad) onLoad();
              }}
            />
          </video>
        </div>
      );
      break;
    case 'audio':
      element = (
        <div className={styles.audioWrap}>
          <audio width="100%" controls="controls">
            <source
              src={src}
              onLoad={() => {
                if (onLoad) onLoad();
              }}
            />
          </audio>
        </div>
      );
      break;
    case 'text':
      element = (
        <div
          className={styles.textWrap}
          style={{ background: '#F6F6F6', width: '100%', height: '100%' }}
        >
          <pre>{content}</pre>
        </div>
      );
      break;
    default:
      element = (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            background: '#F6F6F6',
          }}
        >
          <div className={styles.unknownFileWrap}>
            <IconBase icon={icon || UnknownFileIcon} fontSize={40} />
            <span style={{ marginTop: 15 }}>{data.data_name}</span>
            {/* <span>{Byte2AllB(data.data_size || 0)}</span> */}
            <div style={{ marginTop: 15, color: '#B7B7B7' }}>{tip}</div>
            {auth.includes(PERMISSION.usage) && (
              <Button type="primary" style={{ marginTop: 16 }} onClick={handleDownload}>
                下载文件
              </Button>
            )}
            {onPreview ? (
              <Button style={{ marginTop: 16 }} onClick={onPreview}>
                预览文件
              </Button>
            ) : null}
          </div>
        </div>
      );
      break;
  }
  return element;
}

export default FileShow;
