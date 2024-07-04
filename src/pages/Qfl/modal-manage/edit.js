import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import { Table, Pagination, Descriptions, Spin, Button, Form, Input, message } from 'quanta-design';
import ItemTitle from '@/components/ItemTitle';
import NewPage from '@/components/NewPage';
import styles from './index.less';
import { getModelContent, getModelInfo, updateModel, getModelingInfo } from '@/services/qfl-modal';
import { MODAL_ALGO, MODEL_SOURCE, PROJECT_TYPE } from '@/pages/Qfl/config';
import { getValueFromList } from '@/utils/helper';
import ConfigInfo from '@/pages/Qfl/componments/ConfigInfo';
import { PROJECT_STATUS } from '@/utils/enums';
import { getSponsorPartners } from '@/services/qfl-sponsor';

function QflDetail(props) {
  const { location } = props;
  const { modelId, jobId, tableId } = location.query;
  const [currentPage, setCurrent] = useState(1);
  const [dataInfo, setDataInfo] = useState({});
  const [dataRowList, setDataRowList] = useState({});
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [jobInfo, setJobInfo] = useState({});
  const [dataList, setDataList] = useState([]);
  const [form] = Form.useForm();
  const columns = [];

  const arr = Object.keys(dataRowList);
  if (arr.length > 0 && dataRowList.records.length > 0) {
    Object.keys(dataRowList.records[0]).forEach(res => {
      columns.push({
        key: res,
        dataIndex: res,
        title: res,
        render: txt => <div className={styles.column}>{txt}</div>,
      });
    });
  }
  const formItemLayout = {
    labelCol: { style: { width: 80, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: {},
  };

  const initLabelMap = data => {
    const list = data.map(item => {
      const { data_list } = item;
      const itemList = data_list
        .filter(
          ul =>
            ul.data_status === PROJECT_STATUS.PARTICIPANT_CONFIGURE_FINISHED ||
            ul.data_status === PROJECT_STATUS.INITIATOR_CONFIGURE_FINISHED,
        )
        .map(li => ({
          data_name: `${item.org_name}-${li.data_name}`,
          data_id: li.data_id,
          key: li.data_id,
          data_status: li.data_status,
        }));
      return [...itemList];
    });
    const flatList = list.flat();
    setDataList(flatList);
  };

  const getPartners = async projectId => {
    const data = await getSponsorPartners({
      project_id: projectId,
      caller_type: 0,
    });
    initLabelMap(data);
  };

  const initInfo = async () => {
    // eslint-disable-next-line no-shadow
    const info = await getModelInfo(modelId);
    setDataInfo(info);
    form.setFieldsValue({
      name: info.model_name,
      desc: info.model_desc,
    });
    if (info.model_source === 1) {
      // eslint-disable-next-line no-shadow
      const jobInfo = await getModelingInfo({ job_id: jobId });
      setJobInfo(jobInfo);
      await getPartners(info.project_id);
    }
  };

  const initList = async (page = 1, size = 10) => {
    const list = await getModelContent({
      model_id: modelId,
      model_table_id: tableId,
      page,
      size,
      is_asc: true,
    });
    setDataRowList(list);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await initInfo();
      await initList();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const changePage = async (current, pageSize) => {
    setTableLoading(true);
    try {
      await initList(current, pageSize);
      setCurrent(current);
    } finally {
      setTableLoading(false);
    }
  };

  const confirmData = async () => {
    const data = await form.validateFields();
    await updateModel({
      model_id: modelId,
      model_type: dataInfo.model_type,
      model_algo: dataInfo.model_algo,
      ...data,
    });
    message.success('模型信息修改成功！');
    router.goBack();
  };

  return (
    <NewPage title="编辑模型" onBack={() => router.goBack()} noContentLayout>
      <Spin spinning={loading}>
        <div className={styles.contentWrap}>
          {dataInfo.model_source === 1 && <ConfigInfo dataList={dataList} info={jobInfo} />}
          <ItemTitle title="模型详情" />
          <Form form={form} colon={false} hideRequiredMark>
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
              <Input.TextArea
                rows={4}
                placeholder="请输入100字以内的模型描述"
                style={{ width: 360 }}
              />
            </Form.Item>
          </Form>
          <Descriptions className={styles.detailPage}>
            <Descriptions.Item label="模型类型" {...formItemLayout}>
              {PROJECT_TYPE[dataInfo.model_type || 0]}
            </Descriptions.Item>
            <Descriptions.Item label="模型算法" {...formItemLayout}>
              {getValueFromList(dataInfo.model_algo, MODAL_ALGO)}
            </Descriptions.Item>
            <Descriptions.Item label="模型来源" {...formItemLayout}>
              {MODEL_SOURCE[dataInfo.model_source]}
            </Descriptions.Item>
            <Descriptions.Item label="模型内容" {...formItemLayout}>
              <div>
                <Table
                  columns={columns}
                  dataSource={dataRowList.records}
                  pagination={false}
                  loading={tableLoading}
                  emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                />
                {dataRowList.total ? (
                  <Pagination
                    className={styles.pagination}
                    total={dataRowList.total}
                    current={currentPage}
                    onChange={changePage}
                    showSizeChanger
                    showQuickJumper
                  />
                ) : null}
              </div>
            </Descriptions.Item>
          </Descriptions>
          <div style={{ marginLeft: 92 }}>
            <Button type="primary" onClick={confirmData}>
              确定
            </Button>
            <Button style={{ marginLeft: 12 }} onClick={() => router.goBack()}>
              取消
            </Button>
          </div>
        </div>
      </Spin>
    </NewPage>
  );
}

export default connect()(QflDetail);
