import React, { useState, useEffect } from 'react';
import Page from '@/components/Page';
import SearchModel from '@/pages/Share/Platform/components/SearchModel';
import styles from '@/pages/Share/Platform/index.less';
import FilterCard from '@/pages/Share/Platform/components/FilterCard';
import { connect } from 'dva';
import WithLoading from '@/components/WithLoading';

function SearchResult(props) {
  const {
    location: { state = {} },
  } = props;
  const { title, orgAddress, orgName } = state;
  const [selected, setSelected] = useState([]);
  const [dataTitle, setDataTitle] = useState('');

  const onSearch = e => {
    setDataTitle(e);
  };

  const handleHotTitle = value => {
    setDataTitle(value);
  };

  useEffect(() => {
    setDataTitle(title || '');
  }, []);

  return (
    <Page noContentLayout>
      <SearchModel
        onSearch={onSearch}
        page={1}
        changeHotKey={handleHotTitle}
        selected={dataTitle}
      />
      <div className={styles.platform} style={{ width: '72%' }}>
        <div className={styles.right}>
          <FilterCard
            selected={selected}
            setSelected={setSelected}
            orgName={orgName}
            title={dataTitle}
            orgs={orgAddress ? [{ key: orgAddress, value: orgName, type: 'org' }] : []}
            changeHotKey={handleHotTitle}
          />
        </div>
      </div>
    </Page>
  );
}

export default connect(({ datasharing, loading }) => ({
  dataBrief: datasharing.dataBrief,
  orgList: datasharing.orgList,
  loading: loading.global,
}))(WithLoading(SearchResult));
