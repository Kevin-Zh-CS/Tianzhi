import React, { useEffect, useState } from 'react';
import { router } from 'umi';
import { Descriptions, Spin, Alert } from 'quanta-design';
import NewPage from '@/components/NewPage';
import ConfigItemDetail from '@/pages/Qfl/sponsor/project/componments/ConfigItemDetail';
import { ERROR_STEP, PROJECT_STATUS_TAG, Step, STEP_STATUS } from '@/pages/Qfl/config';
import stepOneIcon from '@/assets/qfl/data-detail-resolve-bg.png';
import stepTwoIcon from '@/assets/qfl/special-data-bg.png';
import stepThreeIcon from '@/assets/qfl/data-safe-bg.png';
import OutputStepOne from '@/pages/Qfl/sponsor/project/componments/OutputStepOne';
import OutputStepTwo from '@/pages/Qfl/sponsor/project/componments/OutputStepTwo';
import OutputStepThree from '@/pages/Qfl/sponsor/project/componments/OutputStepThree';
import styles from '@/pages/Qfl/sponsor/project/index.less';

import {
  getPreprocessInfo,
  getModelInfo,
  getFeatureEngineerInfo,
  getSponsorPartners,
} from '@/services/qfl-sponsor';
import { PROJECT_STATUS } from '@/utils/enums';

function QflPartenerDetail(props) {
  const { location } = props;
  const { jobId, step, type, projectId, isPartner } = location.query;
  const [dataInfo, setDataInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const columns = [];

  const { args = [] } = dataInfo;
  if (args && args.length) {
    args.forEach(res => {
      columns.push({ key: res.name, dataIndex: res.name, title: res.name });
    });
  }

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
      caller_type: isPartner ? 1 : 0,
    });
    initLabelMap(data);
  };

  const initInfo = async () => {
    try {
      setLoading(true);
      if (step === '2') {
        const info = await getModelInfo({ job_id: jobId, caller_type: isPartner ? 1 : 0 });
        setDataInfo(info);
      } else if (step === '1') {
        const info = await getFeatureEngineerInfo({
          job_id: jobId,
          caller_type: isPartner ? 1 : 0,
        });
        setDataInfo(info);
      } else {
        const info = await getPreprocessInfo({ job_id: jobId, caller_type: isPartner ? 1 : 0 });
        setDataInfo(info);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initInfo();
    getPartners();
  }, []);

  return (
    <NewPage title="任务详情" onBack={() => router.goBack()} noContentLayout>
      <Spin spinning={loading}>
        {dataInfo.status === STEP_STATUS.fail && dataInfo.component_step ? (
          <Alert type="error" message={ERROR_STEP[dataInfo.component_step]} showIcon />
        ) : null}
        <div className={styles.pageCard}>
          <Descriptions
            title="基本信息"
            style={{
              background: `url(${
                // eslint-disable-next-line
                step === '1' ? stepOneIcon : step === '2' ? stepTwoIcon : stepThreeIcon
              }) no-repeat top right`,
              backgroundSize: 132,
            }}
          >
            <Descriptions.Item label="所属步骤">
              <span>{Step[step]}</span>
              <span style={{ marginLeft: 20 }}>{PROJECT_STATUS_TAG[dataInfo.status]}</span>
            </Descriptions.Item>
            <Descriptions.Item label="任务名称">{dataInfo.job_name}</Descriptions.Item>
            <Descriptions.Item label="任务描述">{dataInfo.desc || '-'}</Descriptions.Item>
          </Descriptions>
          <div className={styles.divider} />
          <ConfigItemDetail
            jobId={jobId}
            step={step}
            info={dataInfo}
            dataList={dataList}
            type={type}
          />
        </div>
        {dataInfo.status === STEP_STATUS.waiting ||
        dataInfo.status === STEP_STATUS.loading ||
        dataInfo.status === STEP_STATUS.closed ? null : (
          <div className={styles.lastConfig}>
            {step === '0' ? (
              <OutputStepOne
                type={type}
                jobId={jobId}
                step={step}
                status={dataInfo.status}
                projectId={projectId}
                isPartner={isPartner}
              />
            ) : null}
            {step === '1' ? (
              <OutputStepTwo
                jobId={jobId}
                step={step}
                status={dataInfo.status}
                projectId={projectId}
                isPartner={isPartner}
              />
            ) : null}
            {step === '2' ? (
              <OutputStepThree
                dataInfo={dataInfo}
                jobId={jobId}
                step={step}
                projectId={projectId}
                isPartner={isPartner}
              />
            ) : null}
          </div>
        )}
      </Spin>
    </NewPage>
  );
}

export default QflPartenerDetail;
