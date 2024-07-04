import React, { useState } from 'react';
import { Button, IconBase, Icons, message, Modal, Upload } from 'quanta-design';
import { ReactComponent as UploadIcon } from '@/icons/upload.svg';
import CreateModal from './CreateModal';
import { PUBLISH_INIT_STATUS } from '../config';
import {
  deleteBatchModel,
  deleteModel,
  downloadSingleModel,
  downloadSome,
  uploadModel,
} from '@/services/resource-model';
import { PERMISSION } from '@/utils/enums';
import { MANAGE_ROLE_LIST_TYPE } from '@/constant/public';

const { PlusIcon } = Icons;
let count = 0;
function FilterTableMiddle(props) {
  const [fileL, setFileList] = useState([]);
  const [visible, setVisible] = useState(false);
  const { namespace, reloadData, cancelChoose, selectedRowKeys, selectedRows, auth } = props;

  const hasSelected = selectedRowKeys.length > 0;
  const hasPublished = selectedRows.filter(
    item =>
      item.status === PUBLISH_INIT_STATUS.publish || item.status === PUBLISH_INIT_STATUS.offline,
  );

  // eslint-disable-next-line
  const handleBeforeUpload = () => {
    return false;
  };

  const uploadData = async tempFile => {
    const data = await uploadModel(namespace, tempFile);
    if (data.code === 0) {
      message.success('模型上传成功！');
      reloadData();
    } else {
      message.error(data.message);
    }
  };

  // 上传
  const handleUploadChange = async info => {
    const { file, fileList } = info;
    // eslint-disable-next-line
    if (--fileList.length === 0) {
      setFileList([...fileList]);
      count = 0;
    }
    if (fileList.length < 5) {
      count = 0;
    } else if (fileList.length - fileL.length > 5 && !count) {
      count = 1;
      message.error('单次最多可上传5个文件!');
      return;
    }
    if (count) return;
    await uploadData(file);
  };

  const deleteData = () => {
    Modal.info({
      title: `确认删除当前已选${selectedRowKeys.length}项吗？`,
      content: '删除后，列表中将不能查看相应内容。',
      style: { top: 240 },
      onOk: async () => {
        if (selectedRowKeys.length === 1) {
          await deleteModel(namespace, selectedRowKeys[0]);
        } else {
          await deleteBatchModel(namespace, selectedRowKeys);
        }
        message.success('数据删除成功！');
        cancelChoose();
        reloadData();
      },
      onCancel: () => {},
    });
  };

  const download = async () => {
    if (selectedRowKeys.length === 1) {
      await downloadSingleModel(namespace, selectedRowKeys[0], selectedRows[0].name);
    } else {
      await downloadSome(namespace, selectedRowKeys);
    }
    message.success('数据下载成功！');
  };

  return (
    <div>
      <div style={{ marginBottom: 14, display: 'flex' }}>
        {auth.includes(PERMISSION.create) && (
          <Button icon={<PlusIcon fill="#fff" />} type="primary" onClick={() => setVisible(true)}>
            新建模型
          </Button>
        )}
        {auth.includes(PERMISSION.create) && (
          <div style={{ marginLeft: 12 }}>
            <Upload
              // eslint-disable-next-line
              multiple={true}
              accept=".lua"
              name="file"
              fileList={fileL}
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              onChange={handleUploadChange}
            >
              <Button icon={<IconBase icon={UploadIcon} />}>上传模型</Button>
            </Upload>
          </div>
        )}
      </div>
      {hasSelected ? (
        <div className="rowSelectionWrap">
          <span style={{ color: '#292929' }}>已选择 {selectedRowKeys.length || 0} 项</span>
          {selectedRows.every(item => item.role !== null) && <span onClick={download}>下载</span>}
          {selectedRows.every(item => MANAGE_ROLE_LIST_TYPE[item.role] === '所有权限') &&
          hasPublished.length <= 0 ? (
            <span onClick={deleteData}>删除</span>
          ) : null}
          <span className="lastBtn" onClick={cancelChoose}>
            取消选择
          </span>
        </div>
      ) : null}
      <CreateModal namespace={namespace} visible={visible} onCancel={() => setVisible(false)} />
    </div>
  );
}

export default FilterTableMiddle;
