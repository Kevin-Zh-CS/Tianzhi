import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import { Input } from 'quanta-design';
import platform from '@/icons/platform.png';
import styles from './index.less';

function SearchModel(props) {
  const { onSearch, page, selected, changeHotKey, topicEmuns, dispatch } = props;
  const [hotKey, setHotKey] = useState([]);
  const [searchData, setSearchData] = useState('');

  const handleClickFilter = option => {
    if (page === 0) {
      router.push({
        pathname: '/share/platform/search-list',
        state: { title: option.value },
      });
    } else if (page === 1) {
      setHotKey(option.value);
      changeHotKey(option.value);
    }
  };

  const handleGoHome = () => {
    if (page === 1) {
      router.push('/share/platform');
    }
  };

  const handleChange = e => {
    setSearchData(e.target.value);
  };

  useEffect(() => {
    setHotKey(selected);
    setSearchData(selected);
  }, [selected]);

  useEffect(() => {
    if (topicEmuns.length === 0) {
      dispatch({
        type: 'global/setTopicEmuns',
      });
    }
  }, []);

  const renderSubjectList = topicEmuns.map(val => (
    <span
      key={val.key}
      className={`${styles.option} ${val.value === hotKey ? styles.selected : ''}`}
      onClick={() => handleClickFilter(val)}
    >
      {val.value}
    </span>
  ));
  return (
    <div className={styles.container}>
      <div className={styles.platform}>
        <div className={styles.iconContainer}>
          <div className={styles.img} onClick={handleGoHome}>
            <img src={platform} alt=" " width={86} height={38} />
          </div>
          <div className={styles.divider} />
          <div className={styles.itemFont}>
            <p>打通数据孤岛</p>
            <p>释放数据价值</p>
          </div>
        </div>
        <div className={styles.search}>
          <p style={{ marginBottom: 8 }}>
            <Input.Search
              className={styles.input}
              placeholder="请输入查找内容"
              enterButton="搜索"
              onSearch={onSearch}
              value={searchData}
              onChange={handleChange}
            />
          </p>
          <p className={styles.font2}>{renderSubjectList}</p>
        </div>
      </div>
    </div>
  );
}

export default connect(({ global }) => ({
  topicEmuns: global.topicEmuns,
}))(SearchModel);
