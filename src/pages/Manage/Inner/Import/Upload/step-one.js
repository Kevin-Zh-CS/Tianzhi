import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import { Button, Form, Input, IconBase, message, Tooltip, Radio, Select } from 'quanta-design';
import { Upload } from 'antd';
import RadioCard from '@/pages/Federate/components/RadioCard';
import { ReactComponent as uploadIcon } from '@/icons/upload.svg';
import { ReactComponent as connectIcon } from '@/icons/connect.svg';
import { ReactComponent as questionCircleIcon } from '@/assets/question_circle.svg';
import { handleConfirmData, handleImportDatabase } from '@/services/importer';
import { getColumnList, getDatabaseList, getTableList } from '@/services/database';

function UploadLocalData(props) {
  const { form, onNext, file, namespace } = props;
  const [importMethod, setImportMethod] = useState(1);
  const [fileInfo, setFileInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [defaultFileList, setDefaultFileList] = useState([]);
  const [dbHash, setDbHash] = useState('');
  const [databaseList, setDatabaseList] = useState([]);
  const [databaseTables, setDatabaseTables] = useState([]);
  const [databaseColumns, setDatabaseColumns] = useState([]);
  const [isImport, setIsImport] = useState('false');
  const formData = new FormData();

  const initValue = async () => {
    const list = await getDatabaseList(namespace);
    setDatabaseList(list.filter(item => item.db_type !== 'mongo'));
  };

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

  useEffect(() => {
    initValue();
  }, []);

  const handleNext = (data_id, data) => {
    onNext({
      data_id,
      step: 2,
      isImport: importMethod,
      ...data,
    });
  };

  const uploadData = async () => {
    const data = await form.validateFields();
    setLoading(true);
    try {
      if (importMethod === 1) {
        const { name, desc } = data;
        formData.append('file', data?.file?.file || data.file[0].originFileObj);
        formData.append('name', name);
        formData.append('desc', desc);
        const res = await handleConfirmData(namespace, formData);
        if (res?.code === 0) {
          handleNext(res.data, data);
        } else {
          message.error(res.message);
        }
      } else {
        const params = {
          db_hash: dbHash,
          // eslint-disable-next-line
          is_import: isImport === 'false' ? false : true,
          ...data,
        };
        const res = await handleImportDatabase(namespace, params);
        handleNext(res, data);
      }
    } finally {
      setLoading(false);
    }
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
    labelCol: { style: { width: 90, textAlign: 'left', marginLeft: 12 } },
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

  const searchTable = async key => {
    setDbHash(key);
    form.setFieldsValue({
      table_name: null,
      col_names: [],
    });
    const list = await getTableList(namespace, key);
    setDatabaseTables(list);
  };

  const searchColumn = async table_name => {
    form.setFieldsValue({ col_names: [] });
    const list = await getColumnList(namespace, { db_hash: dbHash, table_name });
    setDatabaseColumns(list);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <Form
        colon={false}
        hideRequiredMark
        form={form}
        initialValues={{ importMethod: 1, isImport: 'false' }}
      >
        <Form.Item
          name="name"
          label="数据名称"
          rules={[
            { required: true, message: '数据名称不能为空' },
            { max: 30, message: '数据名称不可超过30个字符，请重新输入' },
          ]}
          {...formItemLayout}
        >
          <Input style={{ width: 360 }} placeholder="请输入数据名称" />
        </Form.Item>
        <Form.Item
          name="desc"
          label="数据描述"
          rules={[
            { required: true, message: '数据描述不能为空' },
            { max: 100, message: '数据描述不可超过100个字符，请重新输入' },
          ]}
          {...formItemLayout}
        >
          <Input.TextArea rows={4} placeholder="请输入100字以内的数据描述" style={{ width: 360 }} />
        </Form.Item>
        <Form.Item name="importMethod" label="导入方式" {...formItemLayout}>
          <div style={{ display: 'flex', flexDirection: 'row', width: 360, height: 63 }}>
            <RadioCard
              active={importMethod === 1}
              icon={uploadIcon}
              title="上传数据"
              desc="上传本地文件"
              onClick={() => {
                setImportMethod(1);
              }}
            />
            <RadioCard
              active={importMethod === 0}
              icon={connectIcon}
              title="关联数据库"
              desc="关联已关联数据库"
              onClick={() => {
                setImportMethod(0);
              }}
            />
          </div>
        </Form.Item>
        {importMethod === 1 ? (
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
                  return Promise.reject('请上传导入文件');
                },
              },
            ]}
            {...formItemLayout}
          >
            <Upload
              defaultFileList={defaultFileList}
              style={{ width: 360 }}
              maxCount={1}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              accept=".csv"
              onRemove={onRemove}
            >
              <span style={{ display: 'flex' }}>
                <Button style={{ display: 'flex', itemAlign: 'center' }}>
                  <IconBase fill="currentColor" icon={uploadIcon} />
                  {'上传数据'}
                </Button>
                <span style={{ marginLeft: 12, color: '#888', lineHeight: '32px' }}>
                  文件仅支持csv格式，文件大小不得超过5M
                </span>
              </span>
            </Upload>
          </Form.Item>
        ) : (
          <>
            <Form.Item
              name="database"
              label="数据库"
              rules={[{ required: true, message: '请选择所属数据库' }]}
              {...formItemLayout}
            >
              <Select
                placeholder="请选择所属数据库"
                notFoundContent="当前资源库暂无已连接数据库"
                onChange={searchTable}
                style={{ width: 360 }}
              >
                {databaseList.map(d => (
                  <Select.Option key={d.hash}>{d.conn_name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="table_name"
              label="库表"
              rules={[{ required: true, message: '请选择库表' }]}
              {...formItemLayout}
            >
              <Select
                placeholder="请选择库表"
                disabled={form.getFieldValue('database') === undefined}
                onChange={searchColumn}
                style={{ width: 360 }}
              >
                {databaseTables.map(d => (
                  <Select.Option key={d}>{d}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="col_names"
              label="字段"
              rules={[{ required: true, message: '请选择字段' }]}
              {...formItemLayout}
            >
              <Select
                placeholder="请选择字段"
                mode="multiple"
                disabled={form.getFieldValue('database') === undefined}
                allowClear
                style={{ width: 360 }}
              >
                {databaseColumns.map(d => (
                  <Select.Option key={d.name}>{d.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="isImport"
              label={
                <div style={{ display: 'flex' }}>
                  <span style={{ marginRight: 6 }}>是否导入</span>
                  <Tooltip
                    arrowPointAtCenter
                    placement="topLeft"
                    title="关联并导入：关联导入会将所选数据内容导入并保存在本地；
                      仅关联不导入：仅关联不导入关联的数据内容不会保存，数
                      据内容不能编辑，只能查看。"
                  >
                    <IconBase icon={questionCircleIcon} fontSize={20} fill="#888888" />
                  </Tooltip>
                </div>
              }
              {...formItemLayout}
            >
              <Radio.Group
                onChange={res => {
                  setIsImport(res.target.value);
                }}
              >
                <Radio value="false">仅关联不导入</Radio>
                <Radio value>关联并导入</Radio>
              </Radio.Group>
            </Form.Item>
          </>
        )}

        <div style={{ marginLeft: 92 }}>
          <Button type="primary" onClick={uploadData} loading={loading}>
            下一步
          </Button>
          <Button style={{ marginLeft: 12 }} onClick={onCancel}>
            取消
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default connect(() => ({}))(UploadLocalData);
