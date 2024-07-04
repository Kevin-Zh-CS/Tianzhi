import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import { Button, Form, message, Spin, Pagination, Select } from 'quanta-design';
import { Table } from 'antd';
import styles from './index.less';
import {
  createModelVersion,
  getModelContent,
  getModelInfo,
  updateModel,
} from '@/services/qfl-modal';
import { PROJECT_TYPE, TRANSVERSE_MODAL_ALGO, MODAL_ALGO } from '@/pages/Qfl/config';

function StepTwo(props) {
  const {
    onBefore,
    model_id,
    model_table_id,
    job_id,
    name,
    desc,
    handleFormChange,
    onSave,
    pageSource,
    location,
  } = props;
  const { targetModelId, parentModelId } = location?.query || {};
  const [currentPage, setCurrent] = useState(1);
  const [contents, setContents] = useState({});
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(undefined);
  const [form] = Form.useForm();
  const columns = [];
  const arr = Object.keys(contents);
  if (arr.length > 0 && contents.records.length > 0) {
    Object.keys(contents.records[0]).forEach(res => {
      columns.push({
        key: res,
        dataIndex: res,
        title: res,
        render: txt => <div className={styles.column}>{txt}</div>,
      });
    });
  }

  const initContent = async (page = 1, size = 10) => {
    const data = await getModelContent({ model_id, model_table_id, page, size });
    setContents(data);
  };

  const initData = async () => {
    setLoading(true);
    try {
      await initContent();
    } finally {
      setLoading(false);
    }
  };

  const initInfo = async () => {
    // eslint-disable-next-line no-shadow
    const info = await getModelInfo(targetModelId);
    form.setFieldsValue({ model_algo: info.model_algo });
    form.setFieldsValue({ model_type: info.model_type });
  };

  useEffect(() => {
    initData();
    if (targetModelId) initInfo();
  }, []);

  const confirmData = async () => {
    const data = await form.validateFields();
    onSave();
    if (pageSource === 'upload') {
      await updateModel({ name, desc, model_id, ...data });
      message.success('模型导入成功！');
      router.push('/qfl/modal-manage');
    } else {
      await createModelVersion({
        model_id,
        model_table_id,
        target_model_id: targetModelId,
        ...data,
      });
      message.success('版本新建成功！');
      router.push(
        `/qfl/modal-manage/detail?modelId=${model_id}&jobId=${job_id}&tableId=${model_table_id}&parentModelId=${parentModelId}`,
      );
    }
  };

  const changePage = (current, pageSize) => {
    setCurrent(current);
    initContent(current, pageSize);
  };

  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: {},
  };

  const handleChangeType = val => {
    setType(val);
    form.setFieldsValue({ model_algo: undefined });
  };

  return (
    <Spin spinning={loading}>
      <Form
        onFieldsChange={handleFormChange}
        colon={false}
        form={form}
        hideRequiredMark
        className={styles.pageTwoTable}
      >
        <Form.Item label="模型内容" {...formItemLayout}>
          <div>
            <Table
              columns={columns}
              dataSource={contents.records}
              pagination={false}
              emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
            />
            {contents.total ? (
              <Pagination
                className={styles.pagination}
                total={contents.total}
                current={currentPage}
                onChange={changePage}
                showSizeChanger
                showQuickJumper
              />
            ) : null}
          </div>
        </Form.Item>
        <Form.Item
          name="model_type"
          label="模型类型"
          rules={[{ required: true, message: '请选择模型类型' }]}
          {...formItemLayout}
        >
          <Select
            placeholder="请选择模型类型"
            style={{ width: 360 }}
            onChange={handleChangeType}
            disabled={pageSource === 'add'}
          >
            {PROJECT_TYPE.map((item, index) => (
              <Select.Option value={index}>{item}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="model_algo"
          label="模型算法"
          rules={[{ required: true, message: '请选择模型算法' }]}
          {...formItemLayout}
        >
          <Select
            placeholder="请选择模型算法"
            style={{ width: 360 }}
            disabled={type === undefined || pageSource === 'add'}
          >
            {type === 0
              ? TRANSVERSE_MODAL_ALGO.map(item => (
                  <Select.Option key={item.key} value={item.key}>
                    {item.value}
                  </Select.Option>
                ))
              : MODAL_ALGO.map(item => (
                  <Select.Option key={item.key} value={item.key}>
                    {item.value}
                  </Select.Option>
                ))}
          </Select>
        </Form.Item>
        <div style={{ marginLeft: 117 }}>
          <Button type="primary" onClick={confirmData}>
            确定
          </Button>
          <Button style={{ marginLeft: 12 }} onClick={onBefore}>
            上一步
          </Button>
        </div>
      </Form>
    </Spin>
  );
}

export default connect(({ importer }) => ({
  argsList: importer.argsList,
  contentList: importer.contentList,
}))(StepTwo);
