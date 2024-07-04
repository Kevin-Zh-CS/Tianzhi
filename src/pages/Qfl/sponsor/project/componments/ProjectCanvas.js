import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import styles from './index.less';
import classnames from 'classnames';
import { Button, Icons, Select, Tooltip, Modal, Spin } from 'quanta-design';
import sponsor from '@/assets/federate/sponsor.png';
import participant from '@/assets/federate/participant.png';
import Prompt from 'umi/prompt';
import {
  addSponsorPartners,
  getSponsorPartners,
  getOrgList,
  loadJobs,
  getInviteDetail,
  deletePartners,
  deleteSelfData,
  deleteParticipateData,
  getPreprocessInfo,
  getFeatureEngineerInfo,
  getModelInfo,
} from '@/services/qfl-sponsor';
import { STEP_STATUS } from '@/pages/Qfl/config';
import dataSaveStep from '@/assets/qfl/data-safe-step.png';
import dataSpecialStep from '@/assets/qfl/data-special-step.png';
// import dataStepTwo from '@/assets/qfl/data-resolve-step.png';
import DrawerDataDeal from './DrawerDataDeal';
import AddQflDataModal from './AddQflDataModal';
import DataItem from '@/pages/Qfl/sponsor/project/componments/DetailItem';
import PrepareDataItemModal from '@/pages/Qfl/sponsor/project/componments/PrepareDataItemModal';
import DrawerStepTwo from '@/pages/Qfl/sponsor/project/componments/DrawerStepTwo';
import DrawerStepThree from '@/pages/Qfl/sponsor/project/componments/DrawerStepThree';
import dataStepTwo from '@/assets/qfl/data-resolve-step.png';
import dataResolveIcon from '@/assets/qfl/data-resolve-icon.png';
import dataStepThreeIcon from '@/assets/qfl/data-special-icon.png';
import dataStepFourIcon from '@/assets/qfl/data-safe-icon.png';
import { PROJECT_STATUS, PROJECT_STATUS_TAG } from '@/utils/enums';
// import { getLocalDataDetail } from '@/services/qfl';
import TaskQueenModal from '@/pages/Qfl/sponsor/project/componments/TaskQueenModal';
import { getNewImportDataInfo } from '@/services/importer';

let timer = null;
const { CloseIcon, CheckIcon, PlusIcon } = Icons;
export default function ProjectCanvas(props) {
  const {
    projectId,
    setHeight,
    type,
    setPrepareTotal,
    setResolveTotal,
    setSpecialTotal,
    setSafeTotal,
    setCurrent,
    org_id,
    initiator_id,
    initiator_name,
    setLoading,
    queueVisible,
    setCancel,
    auth,
    isPartner,
  } = props;
  const [partners, setPartners] = useState([]);
  const [stepTwoList, setStepTwoData] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectInitList, setSelectInitList] = useState([]);
  const [orgList, setOrgList] = useState([]);
  const [tmpTaskList, setTmpTaskList] = useState([]);
  const [containerHeight, setContainerHeight] = useState(300);
  const [isActive, setActive] = useState(false);
  const [isAddActive, setAddActive] = useState(true);
  const [record, setRecord] = useState({});
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [resolveVisible, setResolveVisible] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [deleteOrgId, setDeleteOrgId] = useState('');
  const [activeOrgId, setActiveOrgId] = useState('');
  const [activePreId, setActivePreId] = useState('');
  const [adding, setAdding] = useState(false);
  const [dataDetailVisible, setDataDetailVisible] = useState(false);
  const [prepareInfo, setPrepareInfo] = useState({});
  const [drawerTwoVisible, setDrawerTwoVisible] = useState(false);
  const [drawerThreeVisible, setDrawerThreeVisible] = useState(false);

  const [stepThreeList, setStepThreeList] = useState([]);
  const [stepFourList, setStepFourList] = useState([]);
  const [treeList, setTreeList] = useState([]);
  const [prevJobId, setPrevJobId] = useState('');
  const [editItem, setEditItem] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const getPartners = async () => {
    const data = await getSponsorPartners({ project_id: projectId, caller_type: isPartner });
    setPartners(data);
    let s = 0;
    (data || []).forEach(item => {
      const { data_list } = item;
      const acceptData = data_list.filter(
        li =>
          li.data_status === PROJECT_STATUS.INITIATOR_CONFIGURE_FINISHED ||
          li.data_status === PROJECT_STATUS.PARTICIPANT_CONFIGURE_FINISHED ||
          li.data_status === PROJECT_STATUS.READY,
      );
      s += acceptData.length;
    });
    setPrepareTotal(s);
  };

  const getOrgs = async () => {
    const data = await getOrgList(projectId);
    setOrgList(data);
    setSelectInitList(data);
  };

  const sumTotal = (index, list = treeList) => {
    let s = 0;
    // eslint-disable-next-line
    for (let i = 0; i < index; i++) {
      s += list[i]?.height + 8 || 0;
    }
    return s;
  };

  const sumTotal1 = (index, list = treeList) => {
    let s = 0;
    // eslint-disable-next-line
    for (let i = 0; i < index; i++) {
      s += list[i]?.height;
    }
    return s;
  };

  // 绘制路线
  const drawSvg = data => {
    const newList = data.map(item => {
      const { children } = item;
      (children || []).forEach(li => {
        const list = li.children;
        li.height = list.length === 0 ? 66 : list.length * 74 - 8;
      });

      const heightList = children.map(li => li.height);

      let height = 66;
      if (heightList.length) {
        const h1 = heightList.reduce(function(prev, curr) {
          return prev + curr;
        });
        const h = heightList.length === 0 ? 0 : heightList.length * 8 - 8;
        height = h1 + h;
      } else if (children.length) {
        height = children.length === 0 ? 66 : children.length * 74 - 8;
      }

      return {
        ...item,
        height,
      };
    });
    setTreeList(newList);
  };

  // 定时器获取数据
  // 如果当前列表中所有数据都已经是完成状态，当前列表不再循环
  const loadDataList = async (loadingTwoData, loadingThreeData, loadingFourData) => {
    timer = setTimeout(async () => {
      if (loadingTwoData.length || loadingThreeData.length || loadingFourData.length) {
        let loadTwoList = [];
        let loadThreeList = [];
        let loadFourList = [];
        if (loadingTwoData.length) {
          const resTwo = await loadJobs(projectId, isPartner, 0);
          loadTwoList = resTwo.filter(
            item =>
              item.job_status === STEP_STATUS.waiting || item.job_status === STEP_STATUS.loading,
          );
          const initWaitTwoData = loadingTwoData.filter(
            item => item.job_status === STEP_STATUS.waiting,
          );
          const localWaitTwoData = resTwo.filter(item => item.job_status === STEP_STATUS.waiting);
          if (
            initWaitTwoData.length !== localWaitTwoData.length ||
            loadTwoList.length !== loadingTwoData.length
          ) {
            const activeResolveData = resTwo.filter(
              item => item.job_status === STEP_STATUS.success,
            );
            setResolveTotal(activeResolveData.length);
          }
          setStepTwoData(resTwo);
        }

        if (loadingThreeData.length) {
          const resThree = await loadJobs(projectId, isPartner, 1);
          loadThreeList = resThree.filter(
            item =>
              item.job_status === STEP_STATUS.waiting || item.job_status === STEP_STATUS.loading,
          );
          const initWaitThreeData = loadingThreeData.filter(
            item => item.job_status === STEP_STATUS.waiting,
          );
          const localWaitThreeData = resThree.filter(
            item => item.job_status === STEP_STATUS.waiting,
          );
          if (
            initWaitThreeData.length !== localWaitThreeData.length ||
            loadThreeList.length !== loadingThreeData.length
          ) {
            const activeStepThreeData = resThree.filter(
              item => item.job_status === STEP_STATUS.success,
            );
            setSpecialTotal(activeStepThreeData.length);
          }
          setStepThreeList(resThree);
        }

        if (loadingFourData.length) {
          const resFour = await loadJobs(projectId, isPartner, 2);
          loadFourList = resFour.filter(
            item =>
              item.job_status === STEP_STATUS.waiting || item.job_status === STEP_STATUS.loading,
          );
          const initWaitFourData = loadingFourData.filter(
            item => item.job_status === STEP_STATUS.waiting,
          );
          const localWaitFourData = resFour.filter(item => item.job_status === STEP_STATUS.waiting);
          if (
            initWaitFourData.length !== localWaitFourData.length ||
            loadFourList.length !== loadingFourData.length
          ) {
            const activeStepFourData = resFour.filter(
              item => item.job_status === STEP_STATUS.success,
            );
            // setStepFourList(resFour);
            setSafeTotal(activeStepFourData.length);
          }
          setStepFourList(resFour);
        }

        await loadDataList(loadTwoList, loadThreeList, loadFourList);
      } else {
        clearTimeout(timer);
        timer = null;
      }
    }, 6000);
  };

  const loadLeafData = (biz_job_id, list) => {
    const itemList = list.filter(item => item.biz_job_id === biz_job_id);
    return itemList[0];
  };

  // eslint-disable-next-line
  const drawAllJobs = async () => {
    const tree = await loadJobs(projectId, isPartner);
    drawSvg(tree);
  };

  const loadAllJobs = async () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    const [stepTwoData, stepThreeData, stepFourData] = await Promise.all([
      loadJobs(projectId, isPartner, 0),
      loadJobs(projectId, isPartner, 1),
      loadJobs(projectId, isPartner, 2),
    ]);
    setStepTwoData(stepTwoData);
    setStepThreeList(stepThreeData);
    setStepFourList(stepFourData);
    const activeTwoList = stepTwoData.filter(item => item.job_status === STEP_STATUS.success);
    const activeThreeList = stepThreeData.filter(item => item.job_status === STEP_STATUS.success);
    const activeFourList = stepFourData.filter(item => item.job_status === STEP_STATUS.success);
    setResolveTotal(activeTwoList.length);
    setSpecialTotal(activeThreeList.length);
    setSafeTotal(activeFourList.length);
    if (stepFourData.length) {
      setCurrent(4);
    } else if (stepThreeData.length) {
      setCurrent(3);
    } else if (stepTwoData.length) {
      setCurrent(2);
    }
    // const loadingTwoData = stepTwoData.filter(
    //   item => item.job_status === STEP_STATUS.waiting || item.job_status === STEP_STATUS.loading,
    // );
    // const loadingThreeData = stepThreeData.filter(
    //   item => item.job_status === STEP_STATUS.waiting || item.job_status === STEP_STATUS.loading,
    // );
    // const loadingFourData = stepFourData.filter(
    //   item => item.job_status === STEP_STATUS.waiting || item.job_status === STEP_STATUS.loading,
    // );
    if (!isPartner) {
      loadDataList(stepTwoData, stepThreeData, stepFourData);
    }
  };

  // 初始化+添加右侧列表时渲染数据
  const initAlljob = async () => {
    await drawAllJobs();
    await loadAllJobs();
  };

  const initLoadData = async () => {
    setLoading(true);
    try {
      await getPartners();
      await getOrgs();
      await initAlljob();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initLoadData();

    return () => {
      clearTimeout(timer);
      timer = null;
    };
  }, []);

  const handleSearchData = val => {
    const list = selectInitList.filter(item => item.orgName.includes(val));
    setSelectedOrg(list);
  };

  const handleAdd = async e => {
    e.preventDefault();
    e.stopPropagation();
    if (!adding) {
      const len = stepTwoList.length;
      if (len) {
        const lastChild = stepTwoList[len - 1];
        const data = await getPreprocessInfo({
          job_id: lastChild.job_id || lastChild.biz_job_id,
          caller_type: isPartner,
        });
        setEditItem({ ...data });
      }
      setResolveVisible(true);
    } else {
      message.error('正在添加参与方');
    }
  };

  // 数据预处理 - 添加数据
  const handleAddData = item => {
    if (!adding) {
      setRecord(item);
      setAddModalVisible(true);
    } else {
      message.error('正在添加参与方');
    }
  };

  const sum = index => {
    let s = 0;
    // eslint-disable-next-line
    for (let i = 0; i < index; i++) {
      s += partners[i].data_list?.length || 0;
    }
    return s;
  };

  const activeSum = () => {
    let s = 0;
    (partners || []).forEach(item => {
      const { data_list } = item;
      const acceptData = data_list.filter(
        li =>
          li.data_status === PROJECT_STATUS.INITIATOR_CONFIGURE_FINISHED ||
          li.data_status === PROJECT_STATUS.PARTICIPANT_CONFIGURE_FINISHED ||
          li.data_status === PROJECT_STATUS.READY,
      );
      s += acceptData.length;
    });
    return s;
  };

  // 数据准备高度
  const totalReadyHeight = () => {
    const dataList = partners.map(item => item.data_list?.length || 0);
    if (dataList.length === 0) return 0;
    const total = dataList.reduce((prev, curr) => prev + curr);
    return 80 + partners.length * 144 + total * 60;
  };

  // 右侧整体数据的高度
  const totalResolveHeight = () => {
    const dataList = treeList.map(item => item.height);
    if (dataList.length === 0) return 0;
    const total = dataList.reduce(function(prev, curr) {
      return prev + curr;
    });
    return total + treeList.length * 40;
  };

  // 绘制左侧数据
  const drawStep = (index, i) => {
    const d = 183 + i * 60 + sum(index) * 60 + 143 * index;
    const h = totalReadyHeight();
    return `M0 ${d} h37 v ${h / 2 - d}`;
  };

  // 绘制数据准备
  const drawStepTwo = (item, index) => {
    const h = totalReadyHeight();
    const h1 = item.height;
    return `M0 ${h / 2 + 35} h 10 v ${-(h / 2 - sumTotal1(index) - index * 40 - h1 / 2 + 14)} h 17`;
  };

  // 绘制特征工程
  const drawStepThree = (item, currentItem, index) => {
    const h = item.height;
    const h1 = currentItem.height;
    if (item.children?.length <= 1) {
      return `M0 ${h / 2} h 53`;
    }
    return `M0 ${h / 2} h 26 v ${-(h / 2 - sumTotal(index, item.children) - h1 / 2)} h 27`;
  };

  // 绘制数据准备到安全建模
  const drawStepThreeFour = (item, index) => {
    const h = item.height;
    const h1 = 66;
    if (item.itemSafeList?.length === 1) {
      return `M0 ${h / 2} h 341`;
    }
    return `M0 ${h / 2} h 315 v ${-(h / 2 - 74 * index - h1 / 2)} h 27`;
  };

  // 绘制特征工程到安全建模
  const drawStepFour = (item, index, drawType) => {
    const h = item.height;
    if (item.children?.length === 1) {
      return `M0 ${h / 2} h 53`;
    }
    if (drawType) {
      return `M0 ${h / 2} h 25 v${-(h / 2 - index * 74 - 33)} h 28`;
    }
    return `M0 ${h / 2} h 25 v${-(h / 2 - index * 74 - 33)} h 28`;
  };

  const addMember = () => {
    if (!adding) {
      const h = totalReadyHeight();
      if (h > 560) {
        setContainerHeight(h + 80);
        setHeight(h + 193);
      }
      setTmpTaskList([{ init: true }]);
      setAdding(true);
    }
  };

  const handleCancelPartner = () => {
    const h = totalReadyHeight();
    if (h > 560) {
      setContainerHeight(h);
      setHeight(h + 113);
    }
    setTmpTaskList([]);
    setAdding(false);
  };

  const handleAddPartner = async () => {
    if (selectedOrg) {
      await addSponsorPartners({
        project_id: projectId,
        partners: [selectedOrg],
      });
      handleCancelPartner();
      message.success('参与方添加成功！');
      await getPartners();
      await getOrgs();
    } else {
      message.error('请选择参与方');
    }
  };

  const h1 = totalReadyHeight();
  const h2 = totalResolveHeight();

  useEffect(() => {
    // 设置父元素及各个元素的高度
    // partners.length * 141 每个元素的高度
    // 100 padding高度
    // 113为 ProjectStep高度
    if (h2 > h1) {
      setContainerHeight(h2);
      setHeight(h2 + 113);
    } else {
      setContainerHeight(h1);
      setHeight(h1 + 113);
    }
  }, [partners, treeList]);

  const handleKeyClick = e => {
    if (adding) {
      if (e.keyCode === 13) {
        handleAddPartner();
      } else if (e.keyCode === 27) {
        handleCancelPartner();
      }
    }
  };

  const handleDataPrepareDetailVisible = async list => {
    if (!adding) {
      setRecord(list);
      const { data_id } = list;
      if (list.org_id === org_id) {
        if (!isPartner) {
          const info = await getNewImportDataInfo({ namespace: projectId, dataId: data_id });
          setPrepareInfo(info);
          setDataDetailVisible(true);
        }
      } else {
        const data = await getInviteDetail({
          project_id: projectId,
          org_id: list.org_id,
          caller_type: isPartner,
          data_id,
        });
        // const { projectBriefInfoVO = {} } = data;
        setPrepareInfo({ ...data, initiator_id, initiator_name });
        setDataDetailVisible(true);
      }
    }
  };

  // 处理
  const handleEditStepTwo = async item => {
    const { job_id, biz_job_id } = item;
    const data = await getPreprocessInfo({
      job_id: job_id || biz_job_id,
      caller_type: isPartner,
    });
    setEditItem({ ...data, job_id });
    setIsEdit(true);
    setResolveVisible(true);
  };

  const handleAddStepTwo = async job_id => {
    const len = stepThreeList.length;
    if (len) {
      const lastChild = stepThreeList[len - 1];
      const data = await getFeatureEngineerInfo({
        job_id: lastChild.job_id || lastChild.biz_job_id,
        caller_type: isPartner,
      });
      setEditItem({ ...data });
    }
    setPrevJobId(job_id);
    setDrawerTwoVisible(true);
  };

  const handleEditStepThree = async item => {
    const { job_id, biz_job_id } = item;
    setPrevJobId(item.pre_job_id);
    const data = await getFeatureEngineerInfo({
      job_id: job_id || biz_job_id,
      caller_type: isPartner,
    });
    setEditItem({ ...data, job_id });
    setIsEdit(true);
    setDrawerTwoVisible(true);
  };

  const handleAddStepThree = async job_id => {
    const len = stepFourList.length;
    if (len) {
      const lastChild = stepFourList[len - 1];
      const data = await getModelInfo({
        job_id: lastChild.job_id || lastChild.biz_job_id,
        caller_type: isPartner,
      });
      setEditItem({ ...data });
    }

    setPrevJobId(job_id);
    setDrawerThreeVisible(true);
  };

  const handleEditStepFour = async item => {
    const { job_id, biz_job_id } = item;
    setPrevJobId(item.pre_job_id);
    const data = await getModelInfo({
      job_id: job_id || biz_job_id,
      caller_type: isPartner,
    });
    setEditItem({ ...data, job_id });
    setIsEdit(true);
    setDrawerThreeVisible(true);
  };

  const handleDeleteData = list => {
    setActiveId('');
    // data_name
    Modal.info({
      title: `确认移除数据-${list.data_name}吗？`,
      content: '移除后，该数据与该项目将会取消关联。',
      okText: '移除',
      style: { top: 240 },
      wrapClassName: 'delete-data',
      okButtonProps: { danger: true },
      onOk: async () => {
        // 调用移除接口
        const params = {
          org_id: list.org_id,
          data_id: list.data_id,
          project_id: projectId,
        };
        if (list.org_id === org_id) {
          await deleteSelfData(params);
        } else {
          await deleteParticipateData(params);
        }
        setDeleteId('');
        setActiveId('');
        if (stepTwoList.length) {
          setLoaded(true);
          await initLoadData();
          setLoaded(false);
        } else {
          await getPartners();
        }
        message.success('数据移除成功！');
        Modal.destroyAll();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  const handleDeleteOrgData = item => {
    Modal.info({
      title: `确认移除参与方-${item.org_name}吗？`,
      content: '移除后，将不能为该机构添加数据。',
      okText: '移除',
      style: { top: 240 },
      wrapClassName: 'delete-data',
      okButtonProps: { danger: true },
      onOk: async () => {
        // 调用移除接口
        await deletePartners({ org_id: item.org_id, project_id: projectId });
        message.success('参与方移除成功！');
        await getPartners();
        await getOrgs();
        Modal.destroyAll();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  const handleActive = item => {
    if (!isActive) {
      setActiveId(item.biz_job_id);
      setActivePreId(item.prev_list);
      setActive(true);
      setAddActive(false);
    }
  };

  const handleActiveCancel = () => {
    if (isActive) {
      setActiveId('');
      setActivePreId([]);
      setActive(false);
      setAddActive(true);
    }
  };

  // eslint-disable-next-line
  const isActiveData = item => {
    return (
      activeId === item.biz_job_id ||
      activePreId.includes(item.biz_job_id) ||
      activeId === item.data_id
    );
  };

  return (
    <Spin spinning={loaded}>
      <div
        className={styles.canvasContainer}
        style={{ height: containerHeight + 40 }}
        onKeyDown={handleKeyClick}
      >
        <div className={styles.orgContainer} style={{ height: containerHeight }}>
          <div className={styles.body}>
            {!auth.includes('qfl_add_participant') ? (
              <div className={styles.addBtn} />
            ) : (
              <Button
                onClick={addMember}
                icon={<PlusIcon />}
                className={styles.addBtn}
                // disabled={stepTwoList.length > 0}
                disabled={stepTwoList.length > 0}
              >
                添加参与方
              </Button>
            )}

            {partners.concat(tmpTaskList).map(item => (
              <div key={item.org_id}>
                <div className={styles.card} style={{ justifyContent: 'center' }}>
                  <div className={item.init ? '' : styles.cardItem}>
                    {/* eslint-disable-next-line */}
                    <div
                      className={styles.org}
                      style={{ borderWidth: item.init ? 0 : 1 }}
                      onMouseEnter={() => setActiveOrgId(item.org_id)}
                      onMouseLeave={() => setActiveOrgId('')}
                      onMouseOver={() => {
                        setActiveOrgId(item.org_id);
                      }}
                    >
                      <img
                        alt=""
                        src={item.org_id === org_id ? sponsor : participant}
                        width={32}
                        height={32}
                      />
                      <div className={styles.orgCard}>
                        {item.init ? (
                          <div className={styles.inputWrap}>
                            <Prompt
                              message={() => {
                                message.error('正在添加参与方');
                                return false;
                              }}
                            />
                            <Select
                              onChange={val => setSelectedOrg(val)}
                              onSearch={handleSearchData}
                              filterOption={false}
                              showArrow={false}
                              placeholder="请选择参与方"
                              style={{ width: 200 }}
                            >
                              {orgList.map(li => (
                                <Select.Option key={li.org_id} disabled={li.is_added}>
                                  <Tooltip title={li.is_added ? '该参与方已添加！' : ''}>
                                    <div>{li.org_name}</div>
                                  </Tooltip>
                                </Select.Option>
                              ))}
                            </Select>
                            <Button
                              onClick={handleAddPartner}
                              style={{ marginLeft: 8 }}
                              icon={<CheckIcon />}
                            />
                            <Button
                              onClick={handleCancelPartner}
                              style={{ marginLeft: 8 }}
                              icon={<CloseIcon />}
                            />
                          </div>
                        ) : (
                          <Tooltip title={item.org_name}>
                            <span
                              className={
                                // eslint-disable-next-line
                                item.org_id === activeOrgId
                                  ? item.org_id === deleteOrgId
                                    ? styles.deleteTitle
                                    : styles.activeTitle
                                  : styles.title
                              }
                            >
                              {item.org_name}
                            </span>
                          </Tooltip>
                        )}
                        {item.init ? null : (
                          <span className={styles.subTitle}>
                            {item.org_id === org_id ? '发起方' : '参与方'}
                          </span>
                        )}

                        {!item.init &&
                        item.org_id !== org_id &&
                        item.org_id === activeOrgId &&
                        auth.includes('qfl_remove_participant') ? (
                          <>
                            {item.data_list?.length ? (
                              <>
                                {stepTwoList.length ? null : (
                                  <div className={styles.disabledOrgDelete}>
                                    <Tooltip title="已添加数据的机构，需要移除数据后才支持移除">
                                      <i className="iconfont iconshanchu" />
                                    </Tooltip>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div
                                className={
                                  deleteOrgId === item.org_id
                                    ? styles.orgDeleteActive
                                    : styles.orgDelete
                                }
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteOrgData(item);
                                }}
                                onMouseEnter={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDeleteOrgId(item.org_id);
                                }}
                                onMouseLeave={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDeleteOrgId('');
                                  setActiveOrgId('');
                                }}
                              >
                                <Tooltip title="移除参与方">
                                  <i className="iconfont iconshanchu" />
                                </Tooltip>
                              </div>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className={styles.itemBottomContainer}>
                      {(item.data_list || []).map(li => (
                        // eslint-disable-next-line
                        <div
                          key={li.data_id}
                          className={
                            // eslint-disable-next-line
                            isActiveData(li) ||
                            (isActive && (li.data_status === 5 || li.data_status === 1))
                              ? deleteId === li.data_id
                                ? classnames(styles.subBox, styles.activeDelete)
                                : classnames(styles.subBox, styles.active)
                              : styles.subBox
                          }
                          onClick={e => {
                            e.preventDefault();
                            handleDataPrepareDetailVisible({ ...li, ...item });
                          }}
                          onMouseEnter={() => {
                            setActiveId(li.data_id);
                          }}
                          onMouseOver={() => {
                            setActiveId(li.data_id);
                          }}
                          onMouseLeave={() => setActiveId('')}
                        >
                          {/* #E53B43 */}
                          {((activeId === li.data_id && stepTwoList.length === 0) ||
                            (activeId === li.data_id &&
                              stepTwoList.length &&
                              li.data_status === PROJECT_STATUS.PARTICIPANT_REJECT)) &&
                          auth.includes('qfl_remove_data') ? (
                            <div
                              className={
                                deleteId === li.data_id
                                  ? styles.stepOneDeleteActive
                                  : styles.stepOneDelete
                              }
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteData({ ...li, ...item });
                              }}
                              onMouseEnter={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeleteId(li.data_id);
                              }}
                              onMouseLeave={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeleteId('');
                                setActiveId('');
                              }}
                            >
                              <Tooltip title="移除数据">
                                <i className="iconfont iconshanchu" />
                              </Tooltip>
                            </div>
                          ) : null}
                          <i className="iconfont iconbendishuju"></i>
                          <div className={styles.subBoxTag}>
                            <Tooltip
                              title={
                                li.data_status === PROJECT_STATUS.PARTICIPANT_REJECT
                                  ? `拒绝理由：${li.refuse_reason}`
                                  : null
                              }
                            >
                              <div className={styles.subBoxTxt}>{li.data_name}</div>
                            </Tooltip>
                            <div>{PROJECT_STATUS_TAG[li.data_status]}</div>
                          </div>
                        </div>
                      ))}

                      {item.init ? null : (
                        <div className={styles.addBtnBox}>
                          {!auth.includes('qfl_add_data') ? (
                            <div className={styles.emptyButton} />
                          ) : (
                            <Button
                              onClick={() => {
                                handleAddData(item);
                              }}
                              size="small"
                              disabled={
                                item.data_list.filter(
                                  li => li.data_status !== PROJECT_STATUS.PARTICIPANT_REJECT,
                                ).length
                              }
                            >
                              添加数据
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {partners.length > 0 && activeSum() > 1 ? (
              <span
                className={styles.lineWrap}
                onMouseEnter={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!adding) {
                    setActive(true);
                  }
                }}
                onMouseLeave={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActive(false);
                }}
              >
                <svg width="46" height={h1} fill="none" xmlns="http://www.w3.org/2000/svg">
                  {partners.map((item, index) =>
                    (item.data_list || []).map((li, i) => (
                      <>
                        {index > 0 ? (
                          <>
                            {li.data_status === PROJECT_STATUS.PARTICIPANT_CONFIGURE_FINISHED ||
                            li.data_status === PROJECT_STATUS.READY ||
                            li.data_status === PROJECT_STATUS.INITIATOR_CONFIGURE_FINISHED ? (
                              <path
                                key={`stepOnePath${item.data_id}`}
                                d={drawStep(index, i)}
                                stroke={isActive ? '#0076D9' : '#B7B7B7'}
                                className={styles.pathActive}
                                strokeWidth="2"
                              />
                            ) : null}
                          </>
                        ) : (
                          <path
                            key={`activeOnePath${item.data_id}`}
                            d={drawStep(index, i)}
                            stroke={isActive ? '#0076D9' : '#B7B7B7'}
                            strokeWidth="2"
                          />
                        )}
                      </>
                    )),
                  )}
                </svg>

                <div>
                  {isActive &&
                  isAddActive &&
                  activeSum() > 1 &&
                  auth.includes('qfl_create_task') ? (
                    <div className={styles.add} style={{ top: h1 / 2 + 22 }} onClick={handleAdd}>
                      +
                    </div>
                  ) : null}
                </div>
              </span>
            ) : null}
          </div>
        </div>

        {/* 数据预处理 */}
        <div className={classnames(styles.dataItem)} style={{ height: containerHeight }}>
          {stepTwoList.length === 0 ? (
            <div className={styles.body}>
              <div className={styles.emptyContainer}>
                <img src={dataStepTwo} alt="" />
                <div>
                  <div>暂无数据预处理任务,</div>
                  <div>请先添加至少两方的数据</div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.bodyItem}>
              <span className={styles.preLineWrap}>
                <svg
                  width="60"
                  height={h1 > h2 ? h1 : h2}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {treeList.map((item, index) => (
                    <path
                      key={`stepTwoPath${item.job_id || item.biz_job_id}`}
                      d={drawStepTwo(item, index)}
                      stroke={isActiveData(item) ? '#0076D9' : '#B7B7B7'}
                      strokeWidth="2"
                    />
                  ))}

                  {treeList.map((item, index) => (
                    <>
                      {isActiveData(item) ? (
                        <path
                          key={`activeTwoPath${item.job_id || item.biz_job_id}`}
                          d={drawStepTwo(item, index, 'draw')}
                          stroke="#0076D9"
                          strokeWidth="2"
                        />
                      ) : null}
                    </>
                  ))}
                </svg>
              </span>
              {treeList.map(item => (
                <div
                  key={`stepTwoContent${item.job_id || item.biz_job_id}`}
                  className={styles.stepItemContent}
                >
                  <div className={styles.stepItem} style={{ height: item.height }}>
                    {/* eslint-disable-next-line */}
                    <div
                      onMouseEnter={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleActive({ ...item, prev_list: [item.biz_job_id] });
                      }}
                      onMouseOver={() => {
                        handleActive({ ...item, prev_list: [item.biz_job_id] });
                      }}
                      onMouseLeave={handleActiveCancel}
                    >
                      <DataItem
                        {...loadLeafData(item.biz_job_id, stepTwoList)}
                        icon={dataResolveIcon}
                        isActive={isActiveData(item)}
                        activeId={activeId}
                        type={type}
                        step={0}
                        loadData={loadAllJobs}
                        loadDrawData={drawAllJobs}
                        projectId={projectId}
                        auth={auth}
                        isPartner={isPartner}
                        onAdd={value => {
                          handleAddStepTwo(value);
                        }}
                        onEdit={() => {
                          handleEditStepTwo(item);
                        }}
                        onCancel={handleActiveCancel}
                      />
                    </div>
                  </div>
                  <span className={styles.threeLineWrap}>
                    <svg
                      width="60"
                      height={item.height}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {(item.children || []).map((twoItem, i) => (
                        <path
                          key={twoItem.job_id || twoItem.biz_job_id}
                          d={drawStepThree(item, twoItem, i)}
                          stroke={isActiveData(twoItem) ? '#0076D9' : '#B7B7B7'}
                          strokeWidth="2"
                        />
                      ))}

                      {(item.children || []).map((twoItem, i) => (
                        <>
                          {isActiveData(twoItem) ? (
                            <path
                              key={`active${twoItem.job_id || twoItem.biz_job_id}`}
                              d={drawStepThree(item, twoItem, i, 'draw')}
                              stroke="#0076D9"
                              strokeWidth="2"
                            />
                          ) : null}
                        </>
                      ))}
                    </svg>
                  </span>
                  {/* 没有特征工程只有安全建模的 */}
                  {item.children?.length && item.is_empty ? (
                    <span className={styles.threeFourLineWrap}>
                      <svg
                        width="345"
                        height={item.height}
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {(item.children || []).map((threeItem, i) => (
                          <path
                            key={`stepThreeFour${threeItem.job_id || threeItem.biz_job_id}`}
                            d={drawStepThreeFour(item, i)}
                            stroke={activeId === threeItem.job_id ? '#0076D9' : '#B7B7B7'}
                            strokeWidth="2"
                          />
                        ))}

                        {(item.children || []).map((threeItem, i) => (
                          <>
                            {isActiveData(threeItem) ? (
                              <path
                                key={`activeThreeFour${threeItem.job_id || threeItem.biz_job_id}`}
                                d={drawStepThreeFour(item, i, 'draw')}
                                stroke="#0076D9"
                                strokeWidth="2"
                              />
                            ) : null}
                          </>
                        ))}
                      </svg>
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 特征工程 */}
        <div className={classnames(styles.dataItem)} style={{ height: containerHeight, left: 580 }}>
          {stepThreeList.length === 0 ? (
            <div className={styles.body}>
              <div className={styles.emptyContainer}>
                <img src={dataSpecialStep} alt="" />
                <div>
                  <div>暂无特征工程任务,</div>
                  <div>请先完成数据预处理任务</div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.bodyItem}>
              {treeList.map(item => (
                <div
                  key={`stepThree${item.job_id || item.biz_job_id}`}
                  className={styles.stepThreeItemContent}
                >
                  <div className={styles.stepItem} style={{ height: item.height }}>
                    {item.children?.length
                      ? item.children.map(threeItem => (
                          <div
                            key={`stepThreeContent${threeItem.job_id || threeItem.biz_job_id}`}
                            className={styles.stepItemContent}
                          >
                            <div
                              className={styles.stepThreeItem}
                              style={{
                                height: threeItem.height,
                                marginBottom: 8,
                              }}
                            >
                              {/* eslint-disable-next-line */}
                              <div
                                onMouseEnter={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleActive({ ...threeItem, prev_list: [item.biz_job_id] });
                                }}
                                onMouseOver={() => {
                                  handleActive({ ...threeItem, prev_list: [item.biz_job_id] });
                                }}
                                onMouseLeave={handleActiveCancel}
                              >
                                <DataItem
                                  {...loadLeafData(threeItem.biz_job_id, stepThreeList)}
                                  icon={dataStepThreeIcon}
                                  isActive={isActiveData(threeItem)}
                                  loadData={loadAllJobs}
                                  loadDrawData={drawAllJobs}
                                  activeId={activeId}
                                  type={type}
                                  step={1}
                                  auth={auth}
                                  projectId={projectId}
                                  isPartner={isPartner}
                                  onAdd={value => {
                                    handleAddStepThree(value);
                                  }}
                                  onEdit={() => {
                                    handleEditStepThree({ ...threeItem, pre_job_id: item.job_id });
                                  }}
                                  onCancel={handleActiveCancel}
                                />
                              </div>
                            </div>
                            <span className={styles.threeLineWrap}>
                              <svg
                                width="60"
                                height={threeItem.height}
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <>
                                  {threeItem.children?.length ? (
                                    <>
                                      {(threeItem.children || []).map((fourItem, i) => (
                                        <path
                                          key={`stepThreePath${fourItem.job_id ||
                                            fourItem.biz_job_id}`}
                                          d={drawStepFour(threeItem, i)}
                                          stroke={isActiveData(fourItem) ? '#0076D9' : '#B7B7B7'}
                                          strokeWidth="2"
                                        />
                                      ))}

                                      {(threeItem.children || []).map((fourItem, i) => (
                                        <>
                                          {isActiveData(fourItem) ? (
                                            <path
                                              key={`activeThreePath${fourItem.job_id ||
                                                fourItem.biz_job_id}`}
                                              d={drawStepFour(threeItem, i, 'draw')}
                                              stroke="#0076D9"
                                              strokeWidth="2"
                                            />
                                          ) : null}
                                        </>
                                      ))}
                                    </>
                                  ) : null}
                                </>
                              </svg>
                            </span>
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 安全建模 */}
        <div className={classnames(styles.dataItem)} style={{ height: containerHeight, left: 870 }}>
          {stepFourList.length === 0 ? (
            <div className={styles.body}>
              <div className={styles.emptyContainer}>
                <img src={dataSaveStep} alt="" />
                <div>
                  <div>暂无安全建模任务,</div>
                  <div>请先完特征工程任务</div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.bodyItem}>
              {treeList.map(item => (
                <div
                  key={`stepFourPath${item.job_id || item.biz_job_id}`}
                  className={styles.stepFourItem}
                  style={{ height: item.height }}
                >
                  {item.children?.length
                    ? item.children.map(middleItem => (
                        <>
                          {middleItem.children?.length ? (
                            middleItem.children.map(fourItem => (
                              // eslint-disable-next-line
                              <div
                                key={`stepFourContent${fourItem.job_id || fourItem.biz_job_id}`}
                                style={{
                                  marginBottom: 8,
                                }}
                                onMouseEnter={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleActive({
                                    ...fourItem,
                                    prev_list: [
                                      fourItem.biz_job_id,
                                      middleItem.biz_job_id,
                                      item.biz_job_id,
                                    ],
                                  });
                                }}
                                onMouseOver={() => {
                                  handleActive({
                                    ...fourItem,
                                    prev_list: [
                                      fourItem.biz_job_id,
                                      middleItem.biz_job_id,
                                      item.biz_job_id,
                                    ],
                                  });
                                }}
                                onMouseLeave={handleActiveCancel}
                              >
                                <DataItem
                                  {...loadLeafData(fourItem.biz_job_id, stepFourList)}
                                  icon={dataStepFourIcon}
                                  loadData={loadAllJobs}
                                  loadDrawData={drawAllJobs}
                                  isActive={isActiveData(fourItem)}
                                  step={2}
                                  type={type}
                                  auth={auth}
                                  projectId={projectId}
                                  isPartner={isPartner}
                                  onEdit={() => {
                                    handleEditStepFour({
                                      ...fourItem,
                                      pre_job_id: middleItem.biz_job_id,
                                    });
                                  }}
                                  onCancel={handleActiveCancel}
                                />
                              </div>
                            ))
                          ) : (
                            <div style={{ height: middleItem.height, marginBottom: 8 }}>
                              <div style={{ width: 237, height: 66 }}></div>
                            </div>
                          )}
                        </>
                      ))
                    : null}
                </div>
              ))}
            </div>
          )}
        </div>
        <DrawerDataDeal
          onCancel={() => {
            setResolveVisible(false);
            setIsEdit(false);
          }}
          onLoadData={initAlljob}
          len={stepTwoList.length}
          dataList={partners}
          visible={resolveVisible}
          type={type}
          projectId={projectId}
          activeItem={editItem}
          isEdit={isEdit}
          auth={auth}
          isPartner={isPartner}
        />

        <DrawerStepTwo
          visible={drawerTwoVisible}
          onCancel={() => {
            setDrawerTwoVisible(false);
            setIsEdit(false);
          }}
          onloadData={initAlljob}
          len={stepThreeList.length}
          dataList={partners}
          projectId={projectId}
          prevJobId={prevJobId}
          activeItem={editItem}
          type={type}
          isEdit={isEdit}
          auth={auth}
          isPartner={isPartner}
        />
        <DrawerStepThree
          visible={drawerThreeVisible}
          onCancel={() => {
            setDrawerThreeVisible(false);
            setIsEdit(false);
          }}
          onloadData={initAlljob}
          len={stepFourList.length}
          dataList={partners}
          projectId={projectId}
          prevJobId={prevJobId}
          type={type}
          activeItem={editItem}
          isEdit={isEdit}
          auth={auth}
          isPartner={isPartner}
        />
        <AddQflDataModal
          onCancel={() => setAddModalVisible(false)}
          load={getPartners}
          visible={addModalVisible}
          isSponsor={record.org_id === org_id}
          {...props}
          {...record}
        />
        <PrepareDataItemModal
          onCancel={() => {
            setDataDetailVisible(false);
          }}
          isSponsor={record.org_id === org_id}
          projectId={projectId}
          visible={dataDetailVisible}
          {...prepareInfo}
        />
        <TaskQueenModal
          visible={queueVisible}
          onloadData={initAlljob}
          onCancel={setCancel}
          projectId={projectId}
        />
      </div>
    </Spin>
  );
}
