import React from 'react';
import { Card } from 'quanta-design';
import { Button } from 'antd';
import { router } from 'umi';
import blacklist from '@/assets/blacklist/blacklist.png';
import riskControl from '@/assets/riskControl/riskControl.png';
import Page from '@/components/Page';
import styles from './index.less';

const AppCard = props => {
  const { title, detail, type, cover } = props;
  const handleGoApp = e => {
    e.stopPropagation();
    router.push(`/federate/application/${type}`);
  };
  const handleGoInfo = () => {
    router.push(`/federate/application/info/${type}`);
  };
  return (
    <Card>
      <div onClick={handleGoInfo} className={`${styles.container} hover-style`}>
        <img alt="" className={styles.logo} src={cover} />
        <div className={styles.detail}>
          <div className={styles.title}>{title}</div>
          <p>{detail}</p>
          <Button onClick={handleGoApp} className={styles.button} type="primary">
            立即体验
          </Button>
        </div>
      </div>
    </Card>
  );
};

const appList = [
  {
    key: 'blacklist',
    cover: blacklist,
    title: '隐私黑名单查询',
    detail:
      '隐私黑名单查询是基于不对称加密、不经意传输等密码学技术，用户只需输入企业或个人的身份ID，即可联合多方数据，一键查询是否为风险用户。',
  },
  {
    key: 'risk-control',
    cover: riskControl,
    title: '金融风险协同预警',
    detail:
      '多家金融机构形成风险信息共享联盟，借助多方隐私交集算法在业务办理前筛查个人/企业已存在的风险行为，各方数据真实有效且隐私不外泄，同时大大提高风险筛查的数据范围，提升预警能力。',
  },
];

const AppItem = appList.map(item => (
  <div key={item.key} className={styles.appItem}>
    <AppCard title={item.title} detail={item.detail} type={item.key} cover={item.cover} />
  </div>
));

export default () => (
  <Page title="应用中心" noContentLayout>
    <div className={styles.appList}>{AppItem}</div>
  </Page>
);
