import React, { useEffect, useState } from 'react';
import { router } from 'umi';
import { connect } from 'dva';
import Page from '@/components/Page';
import styles from './index.less';
import DataInfo from './DataInfo';
import DataDesc from './DataDesc';
import ShareSteps from './ShareSteps';
import { dataDataSharingDetail } from '@/services/datasharing';
import ItemTitle from '@/components/ItemTitle';
import qulianlogo from '@/assets/qulian_logo.png';
import WithLoading from '@/components/WithLoading';

function DataDetail(props) {
  const { location, page } = props;
  const {
    query: { dataId = '' },
  } = location;
  const [info, setInfo] = useState({});
  const initData = async () => {
    const data = await dataDataSharingDetail(dataId);
    setInfo(data);
  };
  useEffect(() => {
    initData();
  }, []);

  const goBack = () => {
    if (page) {
      router.push('/share/platform/search-list');
    } else {
      router.push('/share/platform');
    }
  };
  return (
    <Page title="数据详情" onBack={goBack} noContentLayout>
      <div className={styles.dataDetail}>
        <div className={styles.left}>
          <DataInfo dataDetail={info} />
          <DataDesc dataDetail={info} />
        </div>
        <div className={styles.right}>
          <div className={`${styles.orgInfo} container-card`}>
            <ItemTitle title="数据所属机构" />
            <div className={styles.orgTitle}>
              <img alt="" src={qulianlogo} width={60} height={60} />
              <span className={styles.orgName}>{info.org_name}</span>
            </div>
            <span className={styles.orgDesc}>
              <span className={styles.orgDownDesc}>{info.org_desc}</span>
            </span>
          </div>
          <ShareSteps dataDetail={info} />
        </div>
      </div>
    </Page>
  );
}

export default connect(({ datasharing, loading }) => ({
  dataDetail: datasharing.dataDetail,
  orgList: datasharing.orgList,
  page: datasharing.page,
  loading: loading.effects['datasharing/dataDetail'],
}))(
  WithLoading(DataDetail, {
    skeletonNum: 4,
    skeletonProps: {
      1: { paragraph: { rows: 5 } },
      3: { paragraph: { rows: 11 } },
      4: { paragraph: { rows: 11 } },
    },
    layoutWidth: document.body.clientWidth - 300,
    layout: [
      { i: 'a', x: 0, y: 0, w: 8.8, h: 1.7, static: true },
      { i: 'b', x: 9, y: 0, w: 3, h: 1.3, static: true },
      { i: 'c', x: 0, y: 1.9, w: 8.8, h: 3, static: true },
      { i: 'd', x: 9, y: 1.5, w: 3, h: 3, static: true },
    ],
  }),
);
