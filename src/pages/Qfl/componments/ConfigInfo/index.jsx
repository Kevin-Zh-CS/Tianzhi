import React, { useEffect, useState } from 'react';
import { stepFourEnums } from '@/pages/Qfl/config';
import { Descriptions, Button } from 'quanta-design';
import HighConfigDetailModal from '@/pages/Qfl/sponsor/project/componments/HighConfigDetailModal';
import { Range } from 'rc-slider';
import styles from './index.less';
// import { MB2GB } from '@/utils/helper';

function ConfigInfo(props) {
  const { info = {}, type = '0', dataList, divider } = props;
  const { job_config = {} } = info;
  const { common = {}, advanced = {}, select_feature = null } = job_config;
  const [highVisible, setHighVisible] = useState(false);
  const [selectFeatureData, setFeatureData] = useState([]);

  const handleConfigData = () => {
    if (select_feature) {
      const list = dataList
        .map(li => ({
          data_name: li.data_name,
          labels: select_feature[li.data_id]?.join(','),
        }))
        .filter(li => li.labels);
      setFeatureData(list);
    }
  };

  useEffect(() => {
    if (dataList && select_feature) {
      handleConfigData();
    }
  }, [dataList, select_feature]);

  return (
    <div>
      <Descriptions
        title="配置信息"
        labelStyle={{ width: 105 }}
        column={3}
        extra={
          common?.approach !== 'kmeans' && common?.approach !== 'dnn' ? (
            <Button size="small" onClick={() => setHighVisible(true)}>
              查看高级配置
            </Button>
          ) : null
        }
      >
        <Descriptions.Item label="建模方法">{stepFourEnums[common.approach]}</Descriptions.Item>
        {select_feature ? (
          <Descriptions.Item label="选择特征" span={2}>
            {selectFeatureData.map((item, index) => (
              <span>
                {item.labels}
                <span className={styles.configText}>({item.data_name})</span>
                {selectFeatureData.length === index + 1 ? null : '，'}
              </span>
            ))}
          </Descriptions.Item>
        ) : null}
        <Descriptions.Item label="数据乱序">{common.shuffle ? '是' : '否'}</Descriptions.Item>
        {common?.approach !== 'dnn' ? (
          <>
            {common?.approach !== 'kmeans' ? (
              <Descriptions.Item label="优化器">
                {stepFourEnums[common.optimizer]}
              </Descriptions.Item>
            ) : (
              <Descriptions.Item label="聚类数">{common.k}</Descriptions.Item>
            )}
          </>
        ) : null}

        {common?.approach !== 'kmeans' ? (
          <Descriptions.Item label="学习率">{common.learning_rate}</Descriptions.Item>
        ) : null}

        <Descriptions.Item label="最大迭代数">{common.max_iter || common.epochs}</Descriptions.Item>
        {common?.approach !== 'kmeans' && common?.approach !== 'dnn' ? (
          <Descriptions.Item label="早停方法">{stepFourEnums[common.early_stop]}</Descriptions.Item>
        ) : null}

        {common?.approach !== 'dnn' ? (
          <>
            <Descriptions.Item label="误差值" span={common?.approach !== 'kmeans' ? 3 : 1}>
              {common.tol}
            </Descriptions.Item>

            {common?.approach !== 'kmeans' ? null : (
              <Descriptions.Item label="随机种子">{common.random_stat}</Descriptions.Item>
            )}
          </>
        ) : null}
        {common.approach === 'logistic-regression' ? (
          <Descriptions.Item label="分类方法">{stepFourEnums[common.task_type]}</Descriptions.Item>
        ) : null}
      </Descriptions>

      <Descriptions className={styles.detailDescriptions}>
        <Descriptions.Item label="数据切分">
          <div
            className={
              common.approach === 'kmeans'
                ? 'detail-progress color-progress2 '
                : 'detail-progress color-progress'
            }
          >
            <div className="detail-progress-range">
              <Range
                count={2}
                value={[
                  common.train_size * 100 || 80,
                  (common.test_size + common.train_size) * 100 || 90,
                  100,
                ]}
                pushable
                trackStyle={[{ backgroundColor: '#eea844' }, { backgroundColor: '#08CB94' }]}
                railStyle={{ backgroundColor: '#0076D9' }}
              />
            </div>
            {common.approach === 'logistic-regression' && common.task_type === 'multi' ? (
              <div className="colorContent">
                <div className="colorItem">
                  <span className="colorBox color1" />
                  <span className="colorTxt">训练集 {Math.round(common.train_size * 100)}%</span>
                </div>
                <div className="colorItem">
                  <span className="colorBox color2" />
                  <span className="colorTxt">验证集 {Math.round(common.validate_size * 100)}%</span>
                </div>
              </div>
            ) : (
              <div className="colorContent">
                <div className="colorItem">
                  <span className="colorBox color1" />
                  <span className="colorTxt">训练集 {Math.round(common.train_size * 100)}%</span>
                </div>
                <div className="colorItem">
                  <span className="colorBox color3" />
                  <span className="colorTxt">测试集 {Math.round(common.test_size * 100)}%</span>
                </div>
                {common.approach === 'kmeans' ? null : (
                  <div className="colorItem">
                    <span className="colorBox color2" />
                    <span className="colorTxt">
                      验证集 {Math.round(common.validate_size * 100)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Descriptions.Item>
      </Descriptions>
      {/* <div className={styles.configTitle}>资源分配</div> */}
      {/* <Descriptions column={3}> */}
      {/*  <Descriptions.Item label="cpu负载上限">{info.job_cpu_load_limit}%</Descriptions.Item> */}
      {/*  <Descriptions.Item label="系统内存上限"> */}
      {/*    {info.job_memory_limit ? MB2GB(info.job_memory_limit) : '不限'} */}
      {/*  </Descriptions.Item> */}
      {/* </Descriptions> */}
      {divider !== false && <div className={styles.divider} />}
      {advanced ? (
        <HighConfigDetailModal
          visible={highVisible}
          info={advanced || {}}
          type={type}
          onCancel={() => setHighVisible(false)}
        />
      ) : null}
    </div>
  );
}

export default ConfigInfo;
