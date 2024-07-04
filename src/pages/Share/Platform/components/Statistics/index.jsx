import React, { useEffect, useState } from 'react';
import { IconBase } from 'quanta-design';
import { ReactComponent as DoubleArrowDown } from '@/icons/double_arrow_down.svg';
import { ReactComponent as DoubleArrowUp } from '@/icons/double_arrow_up.svg';
import platform from '@/assets/share/statistics_platform.png';
import file from '@/assets/share/statistics_file.png';
import model from '@/assets/share/statistics_model.png';
import restful from '@/assets/share/statistics_restful.png';
import database from '@/assets/share/statistics_database.png';
import styles from './index.less';
import { getDataStatistic } from '@/services/datasharing';

const Context = ({ src, label, number }) => (
  <div className={styles.context}>
    <img alt="" src={src} width={40} height={40} />
    <div className={styles.numberContext}>
      <span className={styles.label}>{label}</span>
      <span className={styles.number}>{number}</span>
    </div>
  </div>
);

const DescCard = ({ src, label, desc, color, ...restProps }) => (
  <div className={styles.descCard} style={{ backgroundColor: color }} {...restProps}>
    <div className={styles.title}>
      <img alt="" src={src} width={24} height={24} />
      <span>{label}</span>
    </div>
    <span className={styles.body}>{desc}</span>
  </div>
);

function Statistics() {
  const [dataStatistic, setDataStatistic] = useState({});
  const [visible, setVisible] = useState(false);

  const initData = async () => {
    const res = await getDataStatistic();
    setDataStatistic(res);
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <div className={`container-card ${styles.container}`}>
      <div className={styles.statistics}>
        <Context src={platform} label="平台数据总量（个）" number={dataStatistic.data_num} />
        <div className={styles.divider} />
        <Context src={file} label="文件总量（个）" number={dataStatistic.file_num} />
        <Context src={model} label="模型总量（个）" number={dataStatistic.model_num} />
        <Context src={restful} label="接口总量（个）" number={dataStatistic.interface_num} />
        <Context src={database} label="数据源总量（个）" number={dataStatistic.data_source_num} />
        <a className={styles.open} onClick={() => setVisible(!visible)}>
          数据类型描述{' '}
          {visible ? (
            <IconBase icon={DoubleArrowUp} width={20} height={20} fill="currentColor" />
          ) : (
            <IconBase icon={DoubleArrowDown} width={20} height={20} fill="currentColor" />
          )}
        </a>
      </div>
      {visible && (
        <div className={styles.descContainer}>
          <DescCard
            src={file}
            label="文件"
            desc="文件元信息发布到数据共享平台中，需通过平台获取使用权，再从链上请求数据，点对点进行数据传输。"
            color="#D8F1FF"
          />
          <DescCard
            src={model}
            label="模型"
            desc="模型是用于执行数据库查询、接口调用、计算逻辑等任务的自定义脚本。"
            color="#FFF6D8"
          />
          <DescCard
            src={restful}
            label="接口"
            desc="接口元信息发布到数据共享平台，需通过平台获取使用权，才能使用数据。"
            color="#FFE6D8"
          />
          <DescCard
            src={database}
            label="数据源"
            desc="数据源是选择数据库中特定表的特定字段，可供数据使用方自定义模型进行调用的数据库数据。"
            color="#DAF2E1"
          />
        </div>
      )}
    </div>
  );
}

export default Statistics;
