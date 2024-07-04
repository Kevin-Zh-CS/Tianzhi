import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import { Table, Descriptions, Spin, Button, Form, Input, message, Select } from 'quanta-design';
import ItemTitle from '@/components/ItemTitle';
import NewPage from '@/components/NewPage';
import styles from './index.less';
import { getModelVersionTargets, saveModel, updateVersionModel } from '@/services/qfl-modal';
import { getModelInfo, getModelJobResult, getSponsorPartners } from '@/services/qfl-sponsor';
import { MODAL_ALGO, MODEL_SOURCE, PROJECT_TYPE } from '@/pages/Qfl/config';
import { getValueFromList } from '@/utils/helper';
import { getProjectInfo } from '@/services/qfl';
import ConfigInfo from '@/pages/Qfl/componments/ConfigInfo';
import RadioCard from '@/pages/Federate/components/RadioCard';
import { PROJECT_STATUS } from '@/utils/enums';

function QflDetail(props) {
  const { location } = props;
  const { jobId, projectId } = location.query;
  // const [currentPage, setCurrent] = useState(1);
  const [dataInfo, setDataInfo] = useState({});
  const [dataRowList, setDataRowList] = useState([]);
  const [versionTargets, setVersionTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  // const [tableLoading, setTableLoading] = useState(false);
  const [saveMethod, setSaveMethod] = useState(0);
  const [form] = Form.useForm();
  const [saveForm] = Form.useForm();
  const columns = [];

  if (dataRowList && dataRowList.length) {
    const args = Object.keys(dataRowList[0]);
    (args || []).forEach(res => {
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

  const initInfo = async () => {
    // eslint-disable-next-line no-shadow
    const info = await getModelInfo({ job_id: jobId });
    const data = await getProjectInfo({ project_id: projectId });
    setDataInfo({ ...data, ...info });
    form.setFieldsValue({
      model_name: info.job_name,
      model_desc: info.desc,
    });
  };

  const initList = async () => {
    const data = await getModelJobResult(jobId);
    setDataRowList(data.content);
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

  const getPartners = async () => {
    const data = await getSponsorPartners({
      project_id: projectId,
      caller_type: 0,
    });
    initLabelMap(data);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await initInfo();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    initList();
    getPartners();
  }, []);

  // const changePage = async (current, pageSize) => {
  //   setTableLoading(true);
  //   try {
  //     await initList(current, pageSize);
  //     // setCurrent(current);
  //   } finally {
  //     setTableLoading(false);
  //   }
  // };

  const confirmData = async () => {
    const data = await form.validateFields();
    if (saveMethod === 0) {
      await saveModel({
        project_id: projectId,
        job_id: jobId,
        ...data,
      });
    } else {
      const _data = await saveForm.validateFields();
      await updateVersionModel({
        project_id: projectId,
        job_id: jobId,
        ...data,
        ..._data,
      });
    }
    message.success('模型保存成功！');
    router.push('/qfl/modal-manage');
  };

  const handleClickItem = async method => {
    if (method === 1) {
      const data = await getModelVersionTargets({
        project_id: projectId,
        job_id: jobId,
      });
      setVersionTargets(data.list);
    }
    setSaveMethod(method);
    form.validateFields(['saveMethod']);
  };

  return (
    <NewPage title="保存模型" onBack={() => router.goBack()} noContentLayout>
      <Spin spinning={loading}>
        <div className={styles.contentWrap}>
          <ConfigInfo dataList={dataList} info={dataInfo} step="3" />
          <ItemTitle title="模型详情" />
          <Form form={form} colon={false} hideRequiredMark>
            <Form.Item
              name="model_name"
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
              name="model_desc"
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
          <Descriptions className={styles.detailPage} column={2}>
            <Descriptions.Item label="模型类型" span={2} {...formItemLayout}>
              {PROJECT_TYPE[dataInfo.type || 0]}
            </Descriptions.Item>
            <Descriptions.Item label="模型算法" span={2} {...formItemLayout}>
              {getValueFromList(dataInfo?.job_config?.common?.approach, MODAL_ALGO)}
            </Descriptions.Item>
            <Descriptions.Item label="模型来源" {...formItemLayout}>
              {MODEL_SOURCE[1]}
            </Descriptions.Item>
            <Descriptions.Item label="项目名称" {...formItemLayout}>
              {dataInfo.name}
            </Descriptions.Item>
            <Descriptions.Item label="模型内容" span={2} {...formItemLayout}>
              <div>
                <Table
                  columns={columns}
                  dataSource={dataRowList || []}
                  pagination={false}
                  // loading={tableLoading}
                  emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                />
                {/* {dataRowList.total ? ( */}
                {/*  <Pagination */}
                {/*    className={styles.pagination} */}
                {/*    total={dataRowList.total} */}
                {/*    current={currentPage} */}
                {/*    onChange={changePage} */}
                {/*    showSizeChanger */}
                {/*    showQuickJumper */}
                {/*  /> */}
                {/* ) : null} */}
              </div>
            </Descriptions.Item>
          </Descriptions>
          <ItemTitle title="保存方式" style={{ marginTop: 10 }} />
          <Form form={saveForm} colon={false} hideRequiredMark>
            <Form.Item
              name="saveMethod"
              label="保存方式"
              rules={[
                {
                  validator() {
                    if (saveMethod || saveMethod === 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject('请选择保存方式');
                  },
                },
              ]}
              {...formItemLayout}
            >
              <div style={{ display: 'flex' }}>
                <RadioCard
                  active={saveMethod === 0}
                  icon={<i className="iconfont iconxinjianmoxing" />}
                  title="新建模型"
                  desc="保存为新的模型"
                  onClick={() => handleClickItem(0)}
                  style={{ width: 180, height: 64 }}
                />
                <RadioCard
                  active={saveMethod === 1}
                  icon={<i className="iconfont icongengxinmoxingbanben" />}
                  title="更新模型"
                  desc="更新已保存的模型"
                  onClick={() => handleClickItem(1)}
                  style={{ width: 180, height: 64 }}
                />
              </div>
            </Form.Item>
            {saveMethod === 1 && (
              <Form.Item
                name="target_model_id"
                label="目标模型"
                rules={[{ required: true, message: '请选择目标模型' }]}
                {...formItemLayout}
              >
                <Select
                  style={{ width: 360 }}
                  placeholder="请选择目标模型"
                  notFoundContent={<div className={styles.emptyBox}>暂无匹配模型</div>}
                >
                  {versionTargets.map(item => (
                    <Select.Option key={item.model_id} value={item.model_id}>
                      {item.model_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </Form>
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
