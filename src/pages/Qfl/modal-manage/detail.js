import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import {
  Table,
  Pagination,
  Descriptions,
  Spin,
  Button,
  Tooltip,
  Timeline,
  Dropdown,
  Menu,
  Modal,
  message,
} from 'quanta-design';
import { Drawer } from 'antd';
import ItemTitle from '@/components/ItemTitle';
import NewPage from '@/components/NewPage';
import styles from './index.less';
import {
  deleteModelVersion,
  downloadModel,
  getModelContent,
  getModelInfo,
  getModelVersionList,
  getModelingInfo,
  restoreModelVersion,
} from '@/services/qfl-modal';
import { getSponsorPartners } from '@/services/qfl-sponsor';
import { MODAL_ALGO, MODEL_SOURCE, PROJECT_TYPE, goDownload } from '@/pages/Qfl/config';
import { formatTime, getValueFromList } from '@/utils/helper';
import ConfigInfo from '@/pages/Qfl/componments/ConfigInfo';
import avatar from '@/assets/qfl/avatar.png';
import { PROJECT_STATUS } from '@/utils/enums';

function QflDetail(props) {
  const { location } = props;

  const { modelId, jobId, tableId, parentModelId } = location.query;
  const [currentPage, setCurrent] = useState(1);
  const [dataInfo, setDataInfo] = useState({});
  const [dataRowList, setDataRowList] = useState({});
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [jobInfo, setJobInfo] = useState({});
  const [dataList, setDataList] = useState([]);
  const [dlist, setDList] = useState([]);
  const columns = [];
  const timelineItemRef = useRef({});

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
    labelCol: { style: { width: 105, textAlign: 'left', marginLeft: 12 } },
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
    setDList(flatList);
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

  const handleEdit = () => {
    // modelId, tableId
    router.push(`/qfl/modal-manage/edit?modelId=${modelId}&jobId=${jobId}&tableId=${tableId}`);
  };

  const handleAddVersion = () => {
    router.push(
      `/qfl/modal-manage/add-version?targetModelId=${modelId}&parentModelId=${parentModelId}`,
    );
  };

  const handleDiff = item => {
    if (dataInfo.model_source === 1) {
      router.push(
        `/qfl/modal-manage/diff?modelId=${modelId}&tableId=${tableId}&jobId=${jobId}&diffModelId=${item.model_id}&diffTableId=${item.model_table_id}&diffJobId=${item.job_id}&parentModelId=${parentModelId}`,
      );
    } else {
      router.push(
        `/qfl/modal-manage/diff?modelId=${modelId}&tableId=${tableId}&diffModelId=${item.model_id}&diffTableId=${item.model_table_id}&parentModelId=${parentModelId}`,
      );
    }
  };

  const download = async () => {
    downloadModel({
      job_id: null,
      model_id: modelId,
      project_id: null,
      type: 0,
    }).then(res => {
      if (res.status === 200) {
        goDownload(res);
        message.success('模型导出成功！');
      }
    });
  };

  const getVersionList = async () => {
    const data = await getModelVersionList({ model_id: parentModelId });
    setDataList(data.list);
  };

  const onClose = () => {
    setDrawerVisible(false);
  };

  const handleOpenVersions = () => {
    setDrawerVisible(true);
    getVersionList();
  };

  const menuRender = item => (
    <Menu>
      <Menu.Item>
        <Button
          type="text"
          onClick={() => {
            Modal.info({
              title: `确认恢复到${item.version_name}吗？`,
              content: '版本恢复后，将在当前版本基础上进行更新。',
              style: { top: 240 },
              onOk: async () => {
                await restoreModelVersion({ target_model_id: item.model_id });
                router.replace(
                  `/qfl/modal-manage/detail?modelId=${item.model_id}&jobId=${item.job_id}&tableId=${item.model_table_id}&parentModelId=${parentModelId}`,
                );
                message.success('历史版本恢复成功！');
                window.location.reload(true);
              },
            });
          }}
        >
          恢复到该版本
        </Button>
      </Menu.Item>
      <Menu.Item>
        <Button
          type="text"
          onClick={() => {
            Modal.info({
              title: `确认删除${item.version_name}吗？`,
              content: '版本删除后，该版本数据将不可恢复。',
              style: { top: 240 },
              onOk: async () => {
                await deleteModelVersion({ model_id: item.model_id });
                await getVersionList();
                message.success('历史版本删除成功！');
                Modal.destroyAll();
              },
            });
          }}
        >
          删除
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <NewPage
      // extra={<Button onClick={handleEdit}>更新</Button>}
      extra={
        <div className="alert-trigger-wrap">
          <Tooltip title="导出模型">
            <Button
              onClick={download}
              icon={<i className="iconfont icontongyongxing_xiazai_x" />}
            />
          </Tooltip>
          <Tooltip title="编辑模型">
            <Button
              onClick={handleEdit}
              icon={<i className="iconfont iconbianji" />}
              style={{ marginLeft: '8px' }}
            />
          </Tooltip>
          <Button style={{ marginLeft: '8px' }} onClick={handleOpenVersions}>
            历史版本
          </Button>
        </div>
      }
      title="模型详情"
      onBack={() => router.push(`/qfl/modal-manage`)}
      noContentLayout
    >
      <Spin spinning={loading}>
        <div className={styles.contentWrap}>
          {dataInfo.model_source === 1 && <ConfigInfo dataList={dlist} info={jobInfo} />}
          <ItemTitle title="模型详情" />
          <Descriptions column={2} className={styles.detailPage}>
            <Descriptions.Item label="模型名称" {...formItemLayout}>
              {dataInfo.model_name}
            </Descriptions.Item>
            <Descriptions.Item label="当前版本" {...formItemLayout}>
              {dataInfo.version_name}
            </Descriptions.Item>
          </Descriptions>
          <Descriptions className={styles.detailPage}>
            <Descriptions.Item label="模型描述" {...formItemLayout}>
              {dataInfo.model_desc}
            </Descriptions.Item>
            <Descriptions.Item label="模型类型" {...formItemLayout}>
              {PROJECT_TYPE[dataInfo.model_type || 0]}
            </Descriptions.Item>
            <Descriptions.Item label="模型算法" {...formItemLayout}>
              {getValueFromList(dataInfo.model_algo, MODAL_ALGO)}
            </Descriptions.Item>
          </Descriptions>
          <Descriptions column={2} className={styles.detailPage}>
            <Descriptions.Item label="模型来源" {...formItemLayout}>
              {MODEL_SOURCE[dataInfo.model_source]}
            </Descriptions.Item>
            {dataInfo.project_name ? (
              <Descriptions.Item label="项目名称" {...formItemLayout}>
                {dataInfo.project_name}
              </Descriptions.Item>
            ) : null}
          </Descriptions>
          <Descriptions className={styles.detailPage}>
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
        </div>
      </Spin>
      <Drawer
        title={null}
        placement="right"
        width={320}
        closable={false}
        visible={drawerVisible}
        onClose={onClose}
        className={styles.drawer}
      >
        <div className={styles.header}>
          <span className={styles.title}>历史版本</span>
          {!dataInfo.model_source ? (
            <Button type="primary" onClick={handleAddVersion}>
              新建版本
            </Button>
          ) : null}
        </div>
        <div className={styles.body}>
          <Timeline>
            {dataList.map((item, index) => (
              <div
                className={styles.timelineItem}
                ref={r => {
                  timelineItemRef.current[index] = r;
                }}
              >
                <Timeline.Item>
                  <div className={styles.itemTop}>
                    <div className={styles.title}>
                      {item.version_name}
                      {item.version_status ? (
                        <span className={styles.current}>（当前版本）</span>
                      ) : null}
                    </div>
                    {!item.version_status && (
                      <div className={styles.op}>
                        <Tooltip title="版本对比">
                          <i
                            className="iconfont icontongyongxing_shu_dakaix"
                            onClick={() => handleDiff(item)}
                          />
                        </Tooltip>
                        <Dropdown
                          overlay={() => menuRender(item)}
                          getPopupContainer={() => timelineItemRef.current[index]}
                          placement="bottomLeft"
                          overlayClassName={styles.dropdown}
                        >
                          <i className="iconfont icontongyongxing_gengduo_shuipingx" />
                        </Dropdown>
                      </div>
                    )}
                  </div>
                  <div className={styles.itemBottom}>
                    <div className={styles.author}>
                      <img alt="" src={avatar} className={styles.avatar} />
                      <Tooltip title={item.operator} placement="top">
                        <div className={styles.name}>{item.operator}</div>
                      </Tooltip>
                    </div>
                    <div className={styles.time}>{formatTime(item.saved_time)}</div>
                  </div>
                </Timeline.Item>
              </div>
            ))}
          </Timeline>
        </div>
      </Drawer>
    </NewPage>
  );
}

export default connect()(QflDetail);
