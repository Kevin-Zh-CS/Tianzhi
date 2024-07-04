import React, { useState, useEffect } from 'react';
import { Modal, Alert, Table } from 'quanta-design';
import styles from './index.less';
import { PROJECT_STATUS_TAG, Step, STEP_STATUS } from '@/pages/Qfl/config';
import { cancelJob, deleteJob, getJobList, handlePlaceTop } from '@/services/qfl-sponsor';
import dataResolveIcon from '@/assets/qfl/data-resolve-icon.png';
import dataStepThreeIcon from '@/assets/qfl/data-special-icon.png';
import dataStepFourIcon from '@/assets/qfl/data-safe-icon.png';
import { throttle } from '@/utils/helper';
import { message } from 'antd';

let taskTimer = null;
const TaskQueenModal = props => {
  const { visible, onCancel, onloadData, projectId } = props;
  const [dataList, setDataList] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const iconList = [dataResolveIcon, dataStepThreeIcon, dataStepFourIcon];
  const [loading, setLoading] = useState(false);
  const cancelTimer = () => {
    clearTimeout(taskTimer);
    taskTimer = null;
  };

  const loadData = page => {
    taskTimer = setTimeout(async () => {
      const res = await getJobList({
        job_type: '',
        project_id: projectId,
        size: 10,
        page,
      });
      setDataList(res);
      loadData(currentPage);
    }, 6000);
  };

  const initLoadData = async (page = 1) => {
    if (taskTimer) {
      cancelTimer();
    }
    const res = await getJobList({
      job_type: '',
      project_id: projectId,
      size: 10,
      page,
    });
    setCurrentPage(page);
    setDataList(res);
    loadData(page);
  };

  useEffect(() => {
    if (visible) {
      initLoadData();
    } else {
      cancelTimer();
    }
  }, [visible]);

  const handleClose = async () => {
    onCancel();
    await onloadData();
  };

  const handleTop = async record => {
    try {
      setLoading(true);
      await handlePlaceTop({
        project_id: projectId,
        job_id: record.job_id || record.biz_job_id,
      });
      message.success('任务置顶成功！');
      await initLoadData();
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  const handleCancel = record => {
    Modal.info({
      title: `确认取消运行-${record.job_name}吗？`,
      content: '任务取消运行后，将无法获得本次任务执行的结果和数据。',
      okText: '确定',
      style: { top: 240 },
      wrapClassName: 'delete-data',
      onOk: async () => {
        await cancelJob({ job_id: record.job_id || record.biz_job_id, project_id: projectId });
        message.success('任务取消运行成功！');
        await initLoadData();
        Modal.destroyAll();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  const handleDeleteClick = record => {
    Modal.info({
      title: `确认删除任务-${record.job_name}吗？`,
      content: '任务删除后，本次执行数据将清除且不可恢复。',
      okText: '删除',
      style: { top: 240 },
      wrapClassName: 'delete-data',
      okButtonProps: { danger: true },
      onOk: async () => {
        // 调用移除接口
        await deleteJob({ job_id: record.job_id || record.biz_job_id, project_id: projectId });
        message.success('任务删除成功！');
        await initLoadData();
        Modal.destroyAll();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  const handlePageChange = ({ current, pageSize }) => {
    initLoadData(current, pageSize);
  };

  const columns = [
    {
      title: '执行序号',
      dataIndex: 'index',
    },
    {
      title: '任务名称',
      dataIndex: 'job_name',
      render: (text, record) => (
        <div className={styles.jobImg}>
          <img src={iconList[record.fl_step]} alt="" />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: '任务类型',
      dataIndex: 'job_type',
      render: text => Step[text],
    },
    {
      title: '任务状态',
      dataIndex: 'job_status',
      render: text => PROJECT_STATUS_TAG[text],
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_, record) => (
        <>
          {record.job_status === STEP_STATUS.loading ? (
            <a
              onClick={() => {
                handleCancel(record);
              }}
            >
              取消运行
            </a>
          ) : (
            <>
              <a
                onClick={throttle(() => {
                  handleTop(record);
                })}
                style={{ marginRight: 24 }}
              >
                置顶
              </a>
              <a
                onClick={() => {
                  handleDeleteClick(record);
                }}
              >
                删除
              </a>
            </>
          )}
        </>
      ),
    },
  ];
  return (
    <Modal
      title="任务队列"
      visible={visible}
      footer={null}
      onCancel={handleClose}
      width={984}
      className="drawerStep"
    >
      <div>
        <Alert
          type="info"
          message="温馨提示：进行中的任务是根据资源分配情况确定的，等待中的任务置顶后是在将被调度到“等待中”状态的第一个。"
          showIcon
        />

        <div>
          <Table
            style={{ marginTop: 14 }}
            showSorterTooltip={false}
            columns={columns}
            dataSource={dataList.list}
            onChange={handlePageChange}
            loading={loading}
            pagination={{
              current: currentPage,
              total: dataList.total,
              showSizeChanger: false,
              showQuickJumper: false,
            }}
            emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
          />
        </div>
      </div>
    </Modal>
  );
};

export default TaskQueenModal;
