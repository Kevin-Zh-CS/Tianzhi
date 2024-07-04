import React, { useState, useEffect } from 'react';
import { Alert, Button, IconBase, Descriptions, message } from 'quanta-design';
import { downloadSingle, fileInfo, getFileView, getFileUrl } from '@/services/resource';
import router from 'umi/router';
import Page from '@/components/Page';
import AddUser from '@/pages/Manage/component/AddUser';
import FileShow from '@/pages/Manage/Inner/component/FileShow';
import { ReactComponent as ShareIcon } from '@/icons/share.svg';
import { share } from '@/utils/helper';
import DataItem from '@/pages/Manage/component/DataItem';
import {
  fileIconMap,
  fileTypeMap,
  PUBLISH_INIT_STATUS,
  getFileType,
  goDownload,
} from '../../config';
import { connect } from 'dva';
import styles from './index.less';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import PermissionDenied from '@/pages/Manage/component/PermissionDenied';
import { PERMISSION } from '@/utils/enums';

function ModalDetail(props) {
  const { location, style } = props;
  const { dir, namespace, id } = location.query;
  const auth = useAuth({ ns_id: namespace, resource_id: id });

  const [info, setInfo] = useState({});
  const [content, setContent] = useState('');

  const getInfo = async () => {
    const _info = await fileInfo(namespace, dir);
    if (getFileType(fileTypeMap[_info.format]) === 'text') {
      getFileView(namespace, dir).then(res => {
        const reader = new window.FileReader();
        reader.readAsText(res.data);
        reader.onload = e => {
          const { result } = e.target;
          const encodingRight = result.indexOf('�') > -1;
          if (encodingRight) {
            reader.readAsText(res.data, 'gbk');
          }
          setContent(result);
        };
      });
    }
    setInfo(_info);
  };

  useEffect(() => {
    getInfo();
  }, []);

  const download = async () => {
    downloadSingle(namespace, { dir }).then(res => {
      if (res.status === 200) {
        goDownload(res);
        message.success('数据下载成功！');
      }
    });
  };

  const goBack = () => {
    const _dir =
      dir
        .split('/')
        .slice(0, -1)
        .join('/') || '/';
    router.replace(
      `/manage/inner/repository/file?namespace=${namespace}&dir=${window.encodeURIComponent(_dir)}`,
    );
  };

  return (
    <div>
      <Page
        title="数据详情"
        alert={
          auth.includes(PERMISSION.query) ? (
            <Alert
              type="info"
              message="温馨提示：数据发布时仅发布数据元信息（如数据名称、数据描述等）至区块链，并可为某些机构设置默认的数据访问权限；原始数据不发布。"
              showIcon
            />
          ) : null
        }
        status={
          <>
            <Button icon={<IconBase icon={ShareIcon} fill="#888888" />} onClick={share} />
            <AddUser namespace={namespace} resourceId={info.file_id} auth={auth} />
            {auth.includes(PERMISSION.usage) && <Button onClick={download}>下载</Button>}
            {auth.includes(PERMISSION.publish) && info.status === PUBLISH_INIT_STATUS.init ? (
              <Button
                type="primary"
                onClick={() => {
                  router.push(
                    `/manage/inner/repository/file/publish?dir=${window.encodeURIComponent(
                      dir,
                    )}&namespace=${namespace}`,
                  );
                }}
              >
                发布
              </Button>
            ) : null}
          </>
        }
        showBackIcon
        backFunction={goBack}
        noContentLayout
        className={styles.unpublishedPage}
      >
        {auth.includes(PERMISSION.query) ? (
          <div className={styles.contentWrap} style={style}>
            <DataItem info={{ ...info, type: 'file' }} auth={auth} />
            <Descriptions>
              <Descriptions.Item label="文件内容" className={styles.fileContent}>
                <div style={{ minHeight: 600, height: 600 }}>
                  <FileShow
                    type={getFileType(fileTypeMap[info.format || 0])}
                    icon={fileIconMap[info.format || 0]}
                    data={info}
                    handleDownload={download}
                    src={getFileUrl(namespace, dir)}
                    content={content}
                  />
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          <PermissionDenied />
        )}
      </Page>
    </div>
  );
}

export default connect(({ global }) => ({
  loading: global.loading,
  loadingAuth: global.loadingAuth,
}))(ModalDetail);
