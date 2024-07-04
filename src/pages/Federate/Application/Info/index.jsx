import React from 'react';
import { Card, Button } from 'quanta-design';
import { router } from 'umi';
import info1 from '@/assets/blacklist/info1.png';
import info2 from '@/assets/blacklist/info2.png';
import risk1 from '@/assets/riskControl/risk1.png';
import risk2 from '@/assets/riskControl/risk2.png';
import Page from '@/components/Page';
import styles from './index.less';

const InfoCard = props => {
  const { type, app } = props;
  const { title, intro, preview, features } = app;
  const handleGoApp = () => {
    router.push(`/federate/application/${type}`);
  };
  return (
    <Card className={styles.appInfo}>
      <div className={styles.title}>
        <span>{title}</span>
        <Button type="primary" onClick={handleGoApp}>
          立即体验
        </Button>
      </div>
      <div className={styles.body}>
        <div className={styles.subTitle}>应用简介</div>
        <p>{intro}</p>
        <p>
          {preview.map(item => <img alt="" src={item} />)}
        </p>
      </div>
      <div className={styles.explain}>
        <div className={styles.subTitle}>特性说明</div>
        {
          features.map(item =>
          <>
            <span>{item.title}</span>
            <p className={styles.desc}>{item.content}</p>
          </>
          )
        }
      </div>
    </Card>
  );
};

const appList = {
  'blacklist': {
    title: '隐私黑名单查询',
    intro: '基于不对称加密、不经意传输等密码学技术，用户只需输入企业或个人的身份ID，即可联合多方数据，一键查询是否为风险用户。仅查询方可以获得查询结果，数据提供方无需暴露全量黑名单数据，高效完成各机构在隐私数据不出库前提下的联合黑名单查询，为风控、征信业务实践提供精准数据驱动力。',
    preview: [info1, info2],
    features: [
      {title: '·隐私安全聚合', content: '基于秘密分享实现多方真实数据的混淆，在保证数据安全的前提下进行聚合计算，得到准确结果。'},
      {title: '·隐私集合交集', content: '在不泄露双方数据集的前提下，得到两方数据集合的交集并进行汇总计算。'}
    ]
  },
  'risk-control': {
    title: '金融风险协同预警',
    intro: '多家金融机构形成风险信息共享联盟，借助多方隐私交集算法在业务办理前筛查个人/企业已存在的风险行为，各方数据真实有效且隐私不外泄，同时大大提高风险筛查的数据范围，提升预警能力。',
    preview: [risk1, risk2],
    features: [
      {title: '·多方隐私交集', content: '多方互相无法获知参与计算的原始数据及中间值，发起方只能获得最终的数据，满足各方数据的隐私合规性。'}
    ]
  },
};

export default props => (
  <Page title="应用详情" onBack={() => router.push(`/federate/application`)} noContentLayout>
    <InfoCard app={appList[props.match.params.id] || {}} type={props.match.params.id}/>
  </Page>
);
