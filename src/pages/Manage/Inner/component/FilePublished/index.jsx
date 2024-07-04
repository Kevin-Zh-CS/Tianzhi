import React, { useState, useEffect } from 'react';
import { Alert, Button, Dropdown, IconBase, Menu, message } from 'quanta-design';
import ItemTitle from '@/components/ItemTitle';
import classnames from 'classnames';
import { share } from '@/utils/helper';
import FileShow from '@/pages/Manage/Inner/component/FileShow';
import Page from '@/components/Page';

import styles from './index.less';
import { downloadSingle, fileInfo, getFileUrl, setOffline, getFileTxt } from '@/services/resource';
import {
  fileTypeMap,
  getFileType,
  fileIconMap,
  goDownload,
} from '@/pages/Manage/Inner/File/config';
import router from 'umi/router';
import { PUBLISH_INIT_STATUS } from '@/pages/Manage/Inner/Model/config';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import OfflineModal from '@/pages/Manage/Inner/component/OfflineModal';
import { ReactComponent as ShareIcon } from '@/icons/share.svg';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import PermissionDenied from '@/pages/Manage/component/PermissionDenied';
import AddUser from '@/pages/Manage/component/AddUser';
import DataItem from '@/pages/Manage/component/DataItem';
import DataChainItem from '@/pages/Manage/component/DataChainItem';
import { PERMISSION } from '@/utils/enums';

function FileDetail(props) {
  const { dir, namespace, resouceId } = props;
  const auth = useAuth({ ns_id: namespace, resource_id: resouceId });
  const [info, setInfo] = useState({});
  const [showFloat, setShowFloat] = useState(false);
  const [offlineModalVisible, setOfflineModalVisible] = useState(false);
  const [content, setContent] = useState('');
  const getInfo = async () => {
    const data = await fileInfo(namespace, dir);
    setInfo(data);
  };

  const handleResult = blob => {
    const reader = new window.FileReader();
    reader.readAsText(blob);
    reader.onload = e => {
      const { result } = e.target;
      const encodingRight = result.indexOf('�') > -1;
      if (encodingRight) {
        reader.readAsText(blob, 'gbk');
      }
      setContent(result);
    };
  };

  const openFile = async () => {
    // const data = await dataDetail(id);
    setShowFloat(true);
    const last = dir.split('.');
    if (last[last.length - 1] === 'txt') {
      getFileTxt(namespace, dir).then(res => {
        handleResult(res.data);
      });
    }
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

  const offline = async () => {
    await setOffline(info.file_id);
    message.success('数据下架成功！');
    setOfflineModalVisible(false);
    await getInfo();
  };

  const goBack = () => {
    if (props.needGoback) {
      router.goBack();
    } else {
      const _dir =
        dir
          .split('/')
          .slice(0, -1)
          .join('/') || '/';
      router.replace(
        `/manage/inner/repository/file?namespace=${namespace}&dir=${window.encodeURIComponent(
          _dir,
        )}`,
      );
    }
  };

  const alert = (
    <Alert
      type="info"
      message="温馨提示：数据发布时仅发布数据元信息（如数据标题、数据描述等）至区块链，并可为某些机构设置默认的数据访问权限；原始数据不发布。"
      showIcon
    />
  );
  const menu = (
    <Menu>
      <Menu.Item>
        <a onClick={() => setOfflineModalVisible(true)}>下架数据</a>
      </Menu.Item>
    </Menu>
  );
  return (
    <div>
      <Page
        title="发布详情"
        alert={auth.includes(PERMISSION.query) ? alert : null}
        status={
          <>
            <Button icon={<IconBase icon={ShareIcon} fill="#888888" />} onClick={share} />
            <AddUser namespace={namespace} resourceId={resouceId} auth={auth} />
            {auth.includes(PERMISSION.usage) && <Button onClick={download}>下载</Button>}
            {info.chain_auth && info.status === PUBLISH_INIT_STATUS.publish ? (
              <Dropdown overlay={menu} placement="bottomRight">
                <div className={styles.dropdownTooltip}>
                  <IconBase style={{ verticalAlign: 'middle' }} icon={MoreIcon} />
                </div>
              </Dropdown>
            ) : null}
          </>
        }
        backFunction={goBack}
        showBackIcon
        noContentLayout
        className={styles.publishedPage}
      >
        {auth.includes(PERMISSION.query) ? (
          <>
            <div style={{ position: 'relative' }}>
              <div className={classnames(styles.floatModal, showFloat ? '' : styles.hidden)}>
                <div className={styles.btn} onClick={() => setShowFloat(false)}>
                  <div className={styles.horizontal} />
                </div>
                <div className={styles.title}>
                  <span>原始数据</span>
                </div>
                <div className={styles.nameWrap}>
                  <span>{info.name}</span>
                  <Button size="small" type="primary" onClick={download}>
                    下载
                  </Button>
                </div>
                <div className={styles.fileWrap}>
                  <FileShow
                    type={getFileType(fileTypeMap[info.format || 0])}
                    icon={fileIconMap[info.format || 0]}
                    src={getFileUrl(namespace, dir)}
                    data={info}
                    content={content}
                    handleDownload={download}
                  />
                </div>
              </div>
            </div>
            <div className={styles.contentWrap}>
              <ItemTitle
                title="数据元信息"
                extra={<Button onClick={openFile}>查看原始数据</Button>}
              />
              <DataItem
                info={{ ...info, type: 'file', isPublish: true }}
                auth={auth}
                loadData={getInfo}
              />
              <div className={styles.divider} />
              <DataChainItem info={{ ...info, type: 'file' }} />
            </div>
          </>
        ) : (
          <PermissionDenied />
        )}
      </Page>
      <OfflineModal
        isModalVisible={offlineModalVisible}
        onOk={offline}
        handleCancel={() => setOfflineModalVisible(false)}
      />
    </div>
  );
}

export default FileDetail;
