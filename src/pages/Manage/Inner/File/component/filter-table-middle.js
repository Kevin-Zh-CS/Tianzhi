import React, { useRef, useState } from 'react';
import { connect } from 'dva';
import { Button, IconBase, Icons, message, Modal, Menu, Upload } from 'quanta-design';
import { ReactComponent as NewFolderIcon } from '@/icons/new_folder.svg';
import styles from '@/pages/Manage/Inner/File/index.less';
import { addFile, rmFile, downloadFile, downloadSingle } from '@/services/resource';
import { Byte2AllB, share } from '@/utils/helper';
import { Breadcrumb } from 'antd';
import { PERMISSION } from '@/utils/enums';
import { UPLOAD_STATUS, PUBLISH_INIT_STATUS, goDownload, getTypeIndex } from '../config';
import { ReactComponent as ShareIcon } from '@/icons/share.svg';
import AddUser from '@/pages/Manage/component/AddUser';
import { MANAGE_ROLE_LIST_TYPE } from '@/constant/public';

const { PlusIcon } = Icons;
let count = 0;

function FilterTableMiddle(props) {
  const {
    selectedRowKeys,
    selectedRows,
    createNewFolder,
    path,
    list,
    setUploadModal,
    cancelChoose,
    namespace,
    resourceId,
    auth,
  } = props;

  const [fileList] = useState([]);
  const breadRef = useRef(null);

  // eslint-disable-next-line
  const handleBeforeUpload = () => {
    count = 0;
    return false;
  };

  const uploadData = async (tempFile, num = 0) => {
    const { reloadData, uploadList, uploadFileList, editFileList } = props;
    const items = path.split('/');
    const i = tempFile.name.lastIndexOf('.');
    const findI = getTypeIndex(tempFile.name.substring(i));
    const len = uploadList.length + num;
    const params = {
      key: tempFile.name,
      fileName: tempFile.name.trim(),
      size: Byte2AllB(tempFile.size),
      target: path === '/' ? '文件管理' : items[items.length - 1],
      status: UPLOAD_STATUS.init,
      path,
      file: tempFile,
      icon: findI > -1 ? findI : 0,
      progress: 0,
      total: 0,
      stopProgress: 0,
    };
    addFile(
      namespace,
      {
        dir: encodeURIComponent(path),
        file_name: encodeURIComponent(tempFile.name),
        upload_type: 1,
      },
      tempFile,
      progressEvent => {
        const completePercent = progressEvent.loaded / progressEvent.total;
        params.progress = completePercent * 100;
        params.total = progressEvent.total;
        params.loaded = progressEvent.loaded;
        // params.fileName = names;
        editFileList(len, params);
      },
    ).then(res => {
      if (res.data.code === 0) {
        params.status = UPLOAD_STATUS.success;
        params.progress = 100;
        reloadData();
        message.success('文件上传成功！');
      } else {
        params.status = UPLOAD_STATUS.fail;
        params.progress = 0;
        message.error(res.data.message);
      }
      editFileList(len, params);
    });
    uploadFileList(params);
  };

  // 上传
  const handleUploadChange = async info => {
    const { file, fileList: _fileList } = info;
    const i = _fileList.findIndex(item => item.uid === file.uid);
    if (_fileList.length < 6) {
      setUploadModal();
      await uploadData(file, i);
    } else {
      // eslint-disable-next-line
      if (++count === _fileList.length) {
        message.error('单次最多可上传5个文件!');
      }
    }
  };

  const handleCancelChoose = () => {
    cancelChoose();
  };

  const deleteData = () => {
    const { reloadData } = props;
    const statusList = selectedRows.filter(item => item.status === 1);
    if (statusList.length === 0) {
      Modal.info({
        title: `确认删除当前已选${selectedRowKeys.length}项文件吗？`,
        content: '删除后，文件列表中将不能查看相应内容。',
        style: { top: 240 },
        onOk: async () => {
          await rmFile(namespace, { dir: path, names: selectedRowKeys });
          handleCancelChoose();
          reloadData();
        },
        onCancel: () => {},
      });
    } else {
      message.error('不支持删除已发布数据');
    }
  };

  const handleEditDownload = (evt, len, params, needIcon) => {
    const { editDownloadList } = props;
    const content = evt.currentTarget.getResponseHeader('content-disposition');

    const names = decodeURIComponent(content.split(';')[1].split('=')[1]);
    if (needIcon) {
      const i = names.lastIndexOf('.');
      const findI = getTypeIndex(names.substring(i));
      params.icon = findI > -1 ? findI : 0;
    } else {
      params.icon = 0;
    }
    params.fileName = names;
    editDownloadList(len, params);
  };

  const successDownload = (res, params, len) => {
    if (res.status === 200) {
      const { editDownloadList } = props;
      goDownload(res);
      if (params.status === UPLOAD_STATUS.init) {
        params.status = UPLOAD_STATUS.success;
        editDownloadList(len, params);
      }
    } else {
      // message.error(res.data.message);
    }
  };

  const download = async () => {
    const { downloadFileList, downloadList } = props;
    setUploadModal();
    const items = path.split('/');
    const len = downloadList.length;
    const params = {
      target: path === '/' ? '文件管理' : items[items.length - 1],
      status: UPLOAD_STATUS.init,
      path,
      progress: 0,
      names: selectedRowKeys,
    };
    const singleFile = selectedRows[0].file_type;

    if (selectedRowKeys.length === 1 && singleFile !== 1) {
      const newPath =
        path === '/' ? `${path}${selectedRowKeys[0]}` : `${path}/${selectedRowKeys[0]}`;
      downloadSingle(namespace, { dir: newPath }, evt => {
        if (!params.fileName) handleEditDownload(evt, len, params, true);
      }).then(res => {
        successDownload(res, params, len);
      });
    } else {
      downloadFile(namespace, { dir: path, names: selectedRowKeys }, evt => {
        if (!params.fileName) handleEditDownload(evt, len, params);
      }).then(res => {
        successDownload(res, params, len);
      });
    }
    downloadFileList(params);
  };

  const handleBreadcrumbClick = async (i, item) => {
    const { reloadData, setPath } = props;
    const flagList = list.filter(li => li.flag);
    if (flagList.length > 0) {
      message.error('正在新建文件夹');
    } else {
      const items = path.split('/').splice(0, i + 1);
      if (i) {
        await setPath(items.join('/'));
        reloadData();
      } else if (!item) {
        await setPath('/');
        reloadData();
      }
    }
  };

  const downloadFolder = async () => {
    const { downloadFileList, downloadList } = props;
    setUploadModal();
    const items = path.split('/');
    const _items = path.split('/');
    const names = [_items.pop()];
    const dir = _items.length > 1 ? [_items.join('/')] : ['/'];
    const len = downloadList.length;
    const params = {
      target: path === '/' ? '文件管理' : items[items.length - 1],
      status: UPLOAD_STATUS.init,
      path,
      progress: 0,
      names,
    };
    downloadFile(namespace, { dir, names }, evt => {
      if (!params.fileName) handleEditDownload(evt, len, params);
    }).then(res => {
      successDownload(res, params, len);
    });
    downloadFileList(params);
  };

  const items = path.split('/');
  const menu = (
    <Menu>
      {[...items].splice(0, items.length - 1).map((item, index) => (
        <Menu.Item
          key={item}
          onClick={() => {
            handleBreadcrumbClick(index, item);
          }}
          className={styles.menuWidth}
        >
          {index === 0 ? '文件管理' : item}
        </Menu.Item>
      ))}
    </Menu>
  );
  const hasPublished = selectedRows.filter(
    item =>
      item.status === PUBLISH_INIT_STATUS.publish ||
      item.status === PUBLISH_INIT_STATUS.hasPublishFile ||
      item.status === PUBLISH_INIT_STATUS.offline,
  );
  const flagList = list.filter(item => item.flag);
  const width = breadRef.current && breadRef.current.clientWidth;
  const lastOne = width && width > 600 ? [...items].slice(-1) : [...items];

  return (
    <div>
      {auth.length ? (
        <div className={styles.operator}>
          <div className={styles.left}>
            {/* eslint-disable-next-line no-nested-ternary */}
            {!auth.includes(PERMISSION.create) ? null : flagList.length === 0 ? (
              <Upload
                // eslint-disable-next-line
                multiple={true}
                name="file"
                fileList={fileList}
                showUploadList={false}
                beforeUpload={handleBeforeUpload}
                onChange={handleUploadChange}
              >
                <Button type="primary" icon={<PlusIcon fill="#fff" />}>
                  上传文件
                </Button>
              </Upload>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  message.error('正在新建文件夹');
                }}
                icon={<PlusIcon fill="#fff" />}
              >
                上传文件
              </Button>
            )}
            {auth.includes(PERMISSION.create) && (
              <Button
                icon={<IconBase icon={NewFolderIcon} fill="#888" />}
                style={{ marginLeft: 12 }}
                onClick={createNewFolder}
              >
                新建文件夹
              </Button>
            )}
            {/* <Button */}
            {/*  icon={<RefreshIcon />} */}
            {/*  onClick={() => { */}
            {/*    loadData(); */}
            {/*  }} */}
            {/*  style={{ marginLeft: 12 }} */}
            {/* /> */}
          </div>
          {path !== '/' && (
            <div className={styles.right}>
              <Button icon={<IconBase icon={ShareIcon} fill="#888888" />} onClick={share} />
              <AddUser namespace={namespace} resourceId={resourceId} auth={auth} />
              {auth.includes(PERMISSION.usage) && <Button onClick={downloadFolder}>下载</Button>}
            </div>
          )}
        </div>
      ) : null}
      {selectedRowKeys.length > 0 ? (
        <div className="rowSelectionWrap">
          <span style={{ color: '#292929' }}>已选择 {selectedRowKeys.length || 0} 项</span>
          {selectedRows.every(item => item.role !== null) && <span onClick={download}>下载</span>}
          {selectedRows.every(item => MANAGE_ROLE_LIST_TYPE[item.role] === '所有权限') &&
          hasPublished.length <= 0 ? (
            <span onClick={deleteData}>删除</span>
          ) : null}
          <span className="lastBtn" onClick={handleCancelChoose}>
            取消选择
          </span>
        </div>
      ) : null}
      <div className={styles.hideBreadcrumb} ref={breadRef}>
        <Breadcrumb separator=">">
          {items.map((item, i) => (
            <Breadcrumb.Item key={item}> {i === 0 ? '文件管理' : item}</Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </div>
      {path !== '/' ? (
        <div className={styles.breadcrumb}>
          <Breadcrumb separator=">">
            {width && width > 600 ? (
              <Breadcrumb.Item dropdownProps={{ placement: 'bottomLeft' }} overlay={menu}>
                ...
              </Breadcrumb.Item>
            ) : null}
            {lastOne.map((item, i) => (
              <Breadcrumb.Item
                key={item}
                onClick={() => {
                  handleBreadcrumbClick(i, item);
                }}
              >
                <a>{width <= 600 && i === 0 ? '文件管理' : item}</a>
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </div>
      ) : null}
    </div>
  );
}

export default connect()(FilterTableMiddle);
