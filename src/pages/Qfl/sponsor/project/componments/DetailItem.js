import React, { useState } from 'react';
import SuccessNote from '@/icons/success_note.png';
import FailNote from '@/icons/fail_note.png';
import ProgressNote from '@/icons/processing_note.png';
import WaitingNote from '@/icons/waiting_note.png';
import StopImg from '@/icons/stop.png';
import styles from './index.less';
import classNames from 'classnames';
import { message, Progress } from 'antd';
// import { Tooltip } from 'quanta-design';
import { STEP_STATUS } from '@/pages/Qfl/config';
import { router } from 'umi';
import { IconBase, Modal, Tooltip } from 'quanta-design';
import { ReactComponent as deleteIcon } from '@/icons/delete.svg';
import { ReactComponent as freshIcon } from '@/icons/fresh.svg';
import { ReactComponent as pauseIcon } from '@/icons/pause.svg';
// import { ReactComponent as toTopIcon } from '@/icons/to_top.svg';
import {
  cancelJob,
  deleteJob,
  getFeatureEngineerInfo,
  getModelInfo,
  getPreprocessInfo,
  // handlePlaceTop,
  restartStepFourJob,
  restartStepThreeJob,
  restartStepTwoJob,
} from '@/services/qfl-sponsor';

let prev = Date.now();
export default function DataItem(props) {
  const {
    icon,
    job_name,
    isActive = false,
    job_status,
    progress = 70,
    step,
    job_id,
    biz_job_id,
    job_abstract,
    type,
    projectId,
    activeId,
    onAdd,
    onEdit,
    loadData,
    loadDrawData,
    auth = [],
    onCancel, // 处理删除按钮弹出时，active状态消失
    isPartner,
  } = props;

  const [deleteId, setDeleteId] = useState('');
  const [hoverId, setHoverId] = useState('');

  const getParams = data => {
    const { job_config } = data;
    const params = {
      ...data,
      job_id,
      job_desc: data.desc,
    };

    const {
      common,
      advanced,
      label_map,
      select_feature,
      bin_feature_map = {},
      ...rest
    } = job_config;

    if (common) {
      params.params = {
        ...common,
        ...advanced,
        select_feature,
      };
    } else {
      params.params = {
        ...rest,
      };
    }

    if (label_map) {
      params.params.label_map = label_map;
    }

    if (bin_feature_map) {
      params.params.bin_feature_map = bin_feature_map;
    }

    delete params.job_config;
    delete params.progress;
    delete params.status;
    delete params.desc;

    return params;
  };

  const throttle = (func, e) => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - prev >= 1000) {
      func();
      prev = Date.now();
    } else {
      prev = Date.now();
    }
  };

  const handleFreshItem = async () => {
    onCancel();
    setHoverId('');
    if (step === 0) {
      const data = await getPreprocessInfo({ job_id, caller_type: isPartner });
      const params = getParams(data);

      await restartStepTwoJob(params);
    } else if (step === 1) {
      const data = await getFeatureEngineerInfo({ job_id, caller_type: isPartner });
      const params = getParams(data);
      await restartStepThreeJob(params);
    } else if (step === 2) {
      const data = await getModelInfo({ job_id, caller_type: isPartner });
      const params = getParams(data);
      await restartStepFourJob(params);
    }
    await loadDrawData();
    loadData();
    message.success('任务重新运行成功！');
  };

  const goToDetail = e => {
    if (e) {
      e.preventDefault();
    }

    if (auth.includes('qfl_restart_task') && job_status === STEP_STATUS.closed) {
      onEdit();
    } else if (isPartner) {
      router.push(
        `/qfl/partner/project-detail-info?step=${step}&jobId=${job_id}&type=${type}&projectId=${projectId}&isPartner=true`,
      );
    } else {
      router.push(
        `/qfl/sponsor/project/detail/info?step=${step}&jobId=${job_id ||
          biz_job_id}&type=${type}&projectId=${projectId}`,
      );
    }
  };

  const handleAdd = e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    onAdd(job_id);
  };

  const handleDeleteItem = e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onCancel();
    setHoverId('');
    setDeleteId('');
    Modal.info({
      title: `确认删除任务-${job_name}吗？`,
      content: '任务删除后，本次执行数据将清除且不可恢复。',
      okText: '删除',
      style: { top: 240 },
      wrapClassName: 'delete-data',
      okButtonProps: { danger: true },
      onOk: async () => {
        // 调用移除接口
        await deleteJob({ job_id: biz_job_id, project_id: projectId });
        // 重新绘制线
        await loadDrawData();
        await loadData();
        message.success('任务删除成功！');
        Modal.destroyAll();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  const handleStopItem = e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onCancel();
    setHoverId('');
    Modal.info({
      title: `确认取消运行-${job_name}吗？`,
      content: '任务取消运行后，将无法获得本次任务执行的结果和数据。',
      okText: '确定',
      style: { top: 240 },
      wrapClassName: 'delete-data',
      onOk: async () => {
        // 调用暂停接口
        await cancelJob({ job_id: job_id || biz_job_id, project_id: projectId });
        // 立刻渲染数据
        await loadData();
        message.success('任务取消运行成功！');
        Modal.destroyAll();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  const handleHover = e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setHoverId(job_id);
  };

  const handleHoverCancel = e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onCancel();
    setHoverId('');
  };

  // const handleToTop = async e => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   await handlePlaceTop({
  //     project_id: projectId,
  //     job_id: job_id || biz_job_id,
  //   });
  //   await loadDrawData();
  //   await loadData();
  //   message.success('任务置顶成功！');
  // };

  return (
    <div
      className={
        // eslint-disable-next-line
        isActive
          ? deleteId === biz_job_id
            ? classNames(styles.dataCanvasItem, styles.activeDelete)
            : styles.dataCanvasItem
          : classNames(styles.dataCanvasItem, styles.activeItem)
      }
      onClick={goToDetail}
    >
      {isActive ? (
        <div>
          {job_status === STEP_STATUS.closed && auth.includes('qfl_restart_task') ? (
            <div
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverCancel}
              className={classNames(styles.itemIcon, styles.refreshIcon)}
            >
              <Tooltip title="重新运行">
                <IconBase
                  fill={hoverId === job_id ? '#292929' : '#888'}
                  icon={freshIcon}
                  onClick={e => throttle(handleFreshItem, e)}
                />
              </Tooltip>
            </div>
          ) : null}
          {/* {job_status === STEP_STATUS.waiting && auth.includes('qfl_top_model') ? ( */}
          {/*  <div */}
          {/*    onMouseEnter={handleHover} */}
          {/*    onMouseLeave={handleHoverCancel} */}
          {/*    className={classNames(styles.itemIcon, styles.refreshIcon)} */}
          {/*  > */}
          {/*    <Tooltip title="置顶任务"> */}
          {/*      <IconBase */}
          {/*        fill={hoverId === job_id ? '#292929' : '#888'} */}
          {/*        icon={toTopIcon} */}
          {/*        onClick={handleToTop} */}
          {/*      /> */}
          {/*    </Tooltip> */}
          {/*  </div> */}
          {/* ) : null} */}
          {(job_status === STEP_STATUS.closed ||
            job_status === STEP_STATUS.fail ||
            job_status === STEP_STATUS.waiting) &&
          auth.includes('qfl_delete_task') ? (
            <div
              onMouseEnter={e => {
                e.preventDefault();
                e.stopPropagation();
                setDeleteId(biz_job_id);
              }}
              onMouseLeave={e => {
                e.preventDefault();
                e.stopPropagation();
                setDeleteId('');
                onCancel();
              }}
              className={
                job_status !== STEP_STATUS.closed
                  ? classNames(styles.itemIcon, styles.failIcon)
                  : classNames(styles.itemIcon, styles.closeIcon)
              }
            >
              <Tooltip title="删除任务">
                <IconBase
                  icon={deleteIcon}
                  onClick={handleDeleteItem}
                  fill={deleteId === biz_job_id ? '#E53B43' : '#888'}
                />
              </Tooltip>
            </div>
          ) : null}
          {job_status === STEP_STATUS.loading && auth.includes('qfl_stop_task') ? (
            <div
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverCancel}
              className={styles.itemIcon}
            >
              <Tooltip title="取消运行">
                <IconBase
                  fill={hoverId === biz_job_id ? '#292929' : '#888'}
                  icon={pauseIcon}
                  onClick={handleStopItem}
                />
              </Tooltip>
            </div>
          ) : null}
        </div>
      ) : null}
      {/* <div className={styles.line}></div> */}
      <img className={styles.icon} src={icon} alt="" />
      <div className={styles.textContent}>
        <div className={styles.title}>
          {/* <Tooltip title={job_status === STEP_STATUS.fail ? 're' : null}> */}
          <div className={styles.t}>{job_name}</div>
          {/* </Tooltip> */}
          {job_status === STEP_STATUS.success ? (
            <img className={styles.success} src={SuccessNote} alt="" />
          ) : null}
          {job_status === STEP_STATUS.fail ? (
            <img className={styles.success} src={FailNote} alt="" />
          ) : null}
          {job_status === STEP_STATUS.waiting ? (
            <img className={styles.success} src={WaitingNote} alt="" />
          ) : null}
          {job_status === STEP_STATUS.loading ? (
            <img className={styles.success} src={ProgressNote} alt="" />
          ) : null}
          {job_status === STEP_STATUS.closed ? (
            <img className={styles.success} src={StopImg} alt="" />
          ) : null}
        </div>
        <div className={styles.subTitle}>
          {job_status === STEP_STATUS.loading ? (
            <Progress percent={progress} size="small" status="active" />
          ) : (
            <span>{job_abstract || '-'}</span>
          )}
        </div>
      </div>
      <div>
        {job_status === STEP_STATUS.success &&
        activeId === biz_job_id &&
        step !== 2 &&
        auth.includes('qfl_create_task') ? (
          <div className={styles.addBtn} onClick={handleAdd}>
            +
          </div>
        ) : null}
      </div>
    </div>
  );
}
