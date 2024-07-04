import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import { Button, Form, Input, IconBase, message } from 'quanta-design';
import { Upload } from 'antd';
import RadioCard from '@/pages/Federate/components/RadioCard';
import { ReactComponent as uploadIcon } from '@/icons/upload.svg';
import styles from './index.less';
import { importModel, importModelVersion } from '@/services/qfl-modal';

function UploadLocalData(props) {
  const { form, onNext, file, handleFormChange, pageSource } = props;
  const [fileInfo, setFileInfo] = useState({});
  // const [isImport, setIsImport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [defaultFileList, setDefaultFileList] = useState([]);
  const formData = new FormData();

  // eslint-disable-next-line
  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, []);

  useEffect(() => {
    if (file) {
      setDefaultFileList(file.fileList);
      setFileInfo(file);
    }
  }, [file]);

  const uploadData = async () => {
    const data = await form.validateFields();
    const { name, desc } = data;
    setLoading(true);
    formData.append('file', data?.file?.file || data.file[0].originFileObj);
    formData.append('name', name);
    formData.append('desc', desc || undefined);
    const method = pageSource === 'upload' ? importModel : importModelVersion;
    const res = await method(formData);
    if (res?.code === 0) {
      onNext({
        name,
        desc,
        model_id: res.data.model_id,
        model_table_id: res.data.model_table_id,
        step: 2,
        ...data,
        file: {
          file: data?.file?.file || file.file,
          fileList: data?.file?.fileList || file.fileList,
        },
        ...data,
      });
    } else {
      message.error(res.message);
    }
    setLoading(false);
  };

  const beforeUpload = files => {
    const isLt5M = files.size / 1024 / 1024 < 5;
    if (files.size === 0) {
      message.error('请勿上传空文件！');
      return Upload.LIST_IGNORE;
    }
    if (!isLt5M) {
      message.error('请勿上传大于5M的文件！');
      return Upload.LIST_IGNORE;
    }
    setFileInfo(files);
    return false;
  };

  const onRemove = () => {
    setFileInfo({});
  };

  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: { style: { width: 360 } },
  };

  const onCancel = () => {
    router.goBack();
  };

  const handleChange = e => {
    let tmp = [...e.fileList];
    tmp = tmp.slice(-1);
    setDefaultFileList(tmp);
  };

  return (
    <Form
      colon={false}
      hideRequiredMark
      form={form}
      className={styles.stepOnePage}
      onFieldsChange={handleFormChange}
    >
      <Form.Item
        name="name"
        label="模型名称"
        rules={[
          { required: true, message: '请输入模型名称' },
          { max: 30, message: '模型名称不可超过30个字符，请重新输入' },
        ]}
        {...formItemLayout}
      >
        <Input style={{ width: 360 }} placeholder="请输入模型名称" />
      </Form.Item>
      <Form.Item
        name="desc"
        label="模型描述"
        rules={[
          { required: true, message: '请输入模型描述' },
          { max: 100, message: '模型描述不可超过100个字符，请重新输入' },
        ]}
        {...formItemLayout}
      >
        <Input.TextArea rows={4} placeholder="请输入100字以内的模型描述" style={{ width: 360 }} />
      </Form.Item>
      <Form.Item name="importMethod" label="导入方式" {...formItemLayout}>
        <div style={{ display: 'flex', flexDirection: 'row', width: 360, height: 63 }}>
          <RadioCard active icon={uploadIcon} title="上传模型" desc="上传本地模型" />
        </div>
      </Form.Item>
      <Form.Item
        label="导入文件"
        name="file"
        multiple={false}
        rules={[
          {
            validator() {
              if (Object.keys(fileInfo).length > 0) {
                return Promise.resolve();
              }
              return Promise.reject('请上传模型');
            },
          },
        ]}
        {...formItemLayout}
      >
        <Upload
          fileList={defaultFileList}
          style={{ width: 360 }}
          maxCount={1}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          accept=".csv"
          onRemove={onRemove}
        >
          <span className={styles.upload}>
            <Button style={{ display: 'flex', itemAlign: 'center' }}>
              <IconBase fill="currentColor" icon={uploadIcon} />
              上传模型
            </Button>
            <span style={{ marginLeft: 12, color: '#888' }}>
              文件仅支持csv格式，文件大小不得超过5M
            </span>
          </span>
        </Upload>
      </Form.Item>

      <div style={{ marginLeft: 117 }}>
        <Button type="primary" onClick={uploadData} loading={loading}>
          下一步
        </Button>
        <Button style={{ marginLeft: 12 }} onClick={onCancel}>
          取消
        </Button>
      </div>
    </Form>
  );
}

export default connect(() => ({}))(UploadLocalData);
