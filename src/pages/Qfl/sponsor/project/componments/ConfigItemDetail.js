import React, { useEffect, useState } from 'react';
import { Descriptions } from 'quanta-design';
import {
  resolveDataPrepareParams,
  resolveDataPrepareData,
  stepThreeEnums,
} from '@/pages/Qfl/config';
import HighConfigDetailModal from '@/pages/Qfl/sponsor/project/componments/HighConfigDetailModal';
import 'rc-slider/assets/index.css';
import { PROJECT_STATUS } from '@/utils/enums';
import styles from './index.less';
import ConfigInfo from '@/pages/Qfl/componments/ConfigInfo';

// 1:数据预处理 2：特征工程 3：安全建模
function ConfigItemDetail(props) {
  const { info = {}, step, type, dataList } = props;
  const { job_config = {} } = info;
  const { advanced = {}, bin_feature = null, pearson_feature = null } = job_config;
  const [configData, setConfigData] = useState([]);
  const [highVisible, setHighVisible] = useState(false);
  const [pearsonData, setPearsonData] = useState([]);
  const [stepOneFeature, setStepOneFeature] = useState([]);

  const handleConfig = () => {
    if (step === '1') {
      if (bin_feature) {
        if (type === '0') {
          const data = dataList
            .filter(item => item.data_status === PROJECT_STATUS.INITIATOR_CONFIGURE_FINISHED)
            .map(li => ({
              data_name: li.data_name,
              labels: bin_feature[li.data_id]?.join(','),
            }));
          setConfigData(data);
        } else {
          const data = dataList
            .map(li => ({
              data_name: li.data_name,
              labels: bin_feature[li.data_id]?.join(','),
            }))
            .filter(ol => ol.labels);
          setConfigData(data);
        }
      }

      if (pearson_feature) {
        const data = dataList.map(li => ({
          data_name: li.data_name,
          labels: pearson_feature[li.data_id]?.join(','),
        }));
        setPearsonData(data);
      }
    } else if (step === '0') {
      if (job_config.label_map) {
        const filterData = dataList.filter(item => job_config.label_map[item.data_id]);
        const data = filterData.map((li, i) => ({
          data_name: i === filterData.length - 1 ? `(${li.data_name})` : `(${li.data_name}),`,
          labels: job_config.label_map[li.data_id],
        }));
        setConfigData(data);
      }

      if (job_config.scale_feature) {
        const data = dataList.map(li => ({
          data_name: li.data_name,
          labels: job_config.scale_feature[li.data_id]?.join(','),
        }));
        setStepOneFeature(data);
      }
    }
  };

  useEffect(() => {
    if (dataList && job_config) {
      handleConfig();
    }
  }, [dataList, job_config]);

  const getValuesByKeys = arr => {
    if (!Array.isArray(arr)) return '';
    const dataNames = (arr || []).map(item => resolveDataPrepareParams[item]);
    return dataNames.join('、');
  };

  return (
    <>
      {step === '2' ? (
        <ConfigInfo info={info} type={type} step={step} dataList={dataList} divider={false} />
      ) : null}
      {step === '1' ? (
        <Descriptions title="配置信息" labelStyle={{ width: 105 }} column={2}>
          <Descriptions.Item label="特征工程方法">
            {job_config.approach && job_config.approach.length
              ? getValuesByKeys(job_config?.approach || [])
              : '-'}
          </Descriptions.Item>
        </Descriptions>
      ) : null}

      {step === '0' ? (
        <>
          <Descriptions title="配置信息" labelStyle={{ width: 105 }}>
            <Descriptions.Item label="预处理方法">
              {job_config.approach && job_config.approach.length ? 'ID对齐、无量纲化' : 'ID对齐'}
            </Descriptions.Item>
          </Descriptions>
          <div className={styles.stepTwoBinTitle}>预处理方法——ID对齐</div>
          <Descriptions labelStyle={{ width: 105 }}>
            <Descriptions.Item label="ID对齐方法">
              {resolveDataPrepareData[job_config.intersection] || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="标签字段">
              {configData.map((item, index) => (
                <span>
                  {item.labels}
                  <span className={styles.configText}>({item.data_name})</span>
                  {configData.length === index + 1 ? null : '，'}
                </span>
              ))}
            </Descriptions.Item>
          </Descriptions>
          {job_config.approach && job_config.approach.length ? (
            <>
              <div className={styles.stepTwoBinTitle}>预处理方法——无量纲化</div>
              <Descriptions labelStyle={{ width: 105 }}>
                <Descriptions.Item label="无量纲化方法">
                  {resolveDataPrepareData[job_config.scale]}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions labelStyle={{ width: 105 }}>
                <Descriptions.Item label="特征字段">
                  {stepOneFeature.map((item, index) => (
                    <span>
                      {item.labels}
                      <span className={styles.configText}>({item.data_name})</span>
                      {stepOneFeature.length === index + 1 ? null : '，'}
                    </span>
                  ))}
                </Descriptions.Item>
              </Descriptions>
            </>
          ) : null}
        </>
      ) : null}
      {step === '1' ? (
        <div className={styles.stepTwoBin}>
          {bin_feature ? (
            <>
              <div className={styles.stepTwoBinTitle}>特征工程方法——分箱</div>
              <Descriptions column={2}>
                <Descriptions.Item label="分箱方法">
                  {stepThreeEnums[job_config.binning]}
                </Descriptions.Item>
                <Descriptions.Item label="分箱数">{job_config.bin_num}</Descriptions.Item>
                <Descriptions.Item label="特征字段" span={2}>
                  {configData.map((item, index) => (
                    <span className={styles.breakWord}>
                      {item.labels}
                      <span className={styles.configText}>({item.data_name})</span>
                      {configData.length === index + 1 ? null : '，'}
                    </span>
                  ))}
                </Descriptions.Item>
              </Descriptions>
            </>
          ) : null}

          {pearson_feature ? (
            <>
              <div className={styles.stepTwoBinTitle}>特征工程方法——特征相关性分析</div>
              <Descriptions>
                <Descriptions.Item label="特征字段">
                  {pearsonData.map((item, index) => (
                    <span className={styles.breakWord}>
                      {item.labels}
                      <span className={styles.configText}>({item.data_name})</span>
                      {pearsonData.length === index + 1 ? null : '，'}
                    </span>
                  ))}
                </Descriptions.Item>
              </Descriptions>
            </>
          ) : null}
        </div>
      ) : null}
      {advanced ? (
        <HighConfigDetailModal
          visible={highVisible}
          info={advanced || {}}
          type={type}
          onCancel={() => setHighVisible(false)}
        />
      ) : null}
    </>
  );
}

export default ConfigItemDetail;
