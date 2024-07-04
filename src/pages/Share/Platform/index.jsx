import React, { useEffect, useState } from 'react';
import { router } from 'umi';
import { connect } from 'dva';
import Page from '@/components/Page';
import WithLoading from '@/components/WithLoading';
import banner from '@/assets/share/banner.png';
import styles from './index.less';
import Statistics from './components/Statistics';
import SearchModel from './components/SearchModel';
import closeImg from '@/icons/close1.png';
import bg from '@/assets/bg.png';
import bg2 from '@/assets/bg2.png';
import OrgListCard from '@/pages/Share/Platform/components/OrgListCard';
import { Pagination } from 'quanta-design';
import NoData from '@/components/NewCheckRepository/noData';
import DataCard from '@/pages/Share/Platform/components/DataCard';
import { searchData } from '@/services/datasharing';

function Platform(props) {
  const { dispatch, close } = props;
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [searchList, setSearchList] = useState({});

  const onChange = async (page = 1, pageSize = 10) => {
    setCurrentPage(page);
    setPSize(pageSize);
    const res = await searchData({ page, size: pageSize }, dispatch);
    setSearchList(res);
  };

  const onSearch = e => {
    router.push({
      pathname: '/share/platform/search-list',
      state: { title: e },
    });
  };

  useEffect(() => {
    if (dispatch) {
      onChange();
    }
  }, []);

  const handleCloseBanner = () => {
    // closeBanner
    dispatch({
      type: 'datasharing/closeBanner',
      payload: true,
    });
  };

  return (
    <Page noContentLayout>
      <SearchModel onSearch={onSearch} page={0} />
      <div style={{ background: `url(${close ? bg2 : bg})` }} className={styles.bannerContainer}>
        {close ? null : (
          <div className={styles.banner}>
            <span className={styles.title}>打通数据孤岛，释放数据价值</span>
            <span className={styles.desc}>促进产业互联网和数字经济领域的协同创新</span>
            <span>
              <img src={closeImg} alt="" className={styles.close} onClick={handleCloseBanner} />
            </span>
            <img alt="" src={banner} width={932} height={160} />
          </div>
        )}
        <Statistics />
      </div>
      <div className={styles.platform}>
        <div>
          <div className={styles.left}>
            <OrgListCard selected={selected} setSelected={setSelected} />
          </div>
        </div>
        <div className={styles.right}>
          <>
            {searchList.list?.length > 0 ? (
              <>
                {(searchList.list || []).map(obj => (
                  <DataCard key={obj.key} {...obj} />
                ))}
                {searchList.total ? (
                  <Pagination
                    showQuickJumper
                    total={searchList.total}
                    pageSize={pSize}
                    current={currentPage}
                    onChange={onChange}
                    className={styles.pagination}
                  />
                ) : null}
              </>
            ) : (
              <NoData hint="暂无数据" style={{ margin: 0, background: 'rgba(0,0,0,0)' }} />
            )}
          </>
        </div>
      </div>
    </Page>
  );
}
export default connect(({ datasharing, global }) => ({
  close: datasharing.close,
  loading: global.loading,
}))(WithLoading(Platform));
