import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import actionBackground from '@/assets/blacklist/actionBackground.png';
import { Badge } from 'quanta-design';
import { SingleLabel, BatchLabel } from '../TypeLabel';
import styles from './index.less';
import moment from 'moment';
import Slider from 'react-slick';

const Item = props => {
  const { org_name, is_batch, block_hash = '', created_time } = props.item;

  return (
    <div className={styles.box}>
      <div className={styles.item}>
        <span className={styles.company}>
          <Badge color="#61CBF7" />
          {org_name}
        </span>
        {Number(is_batch) ? <BatchLabel /> : <SingleLabel />}
      </div>
      <div className={styles.item}>
        {/* eslint-disable-next-line */}
        <span>区块哈希：{block_hash?.slice(0, 10) + '...' + block_hash.slice(-5)}</span>
        <span>{moment(+created_time).format('YYYY-MM-DD')}</span>
      </div>
    </div>
  );
};

const Context = props => {
  const { contextList } = props;
  const box = useRef(null);
  const settings = {
    dots: false,
    infinite: true,
    speed: 3000,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    vertical: true,
    verticalSwiping: true,
  };

  return (
    <div ref={box} className={styles.slider}>
      <Slider {...settings}>
        {contextList.map(item => (
          <div className={styles.boxContent}>
            <Item key={item.block_hash} className={styles.item} item={item} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

const ActionCard = props => {
  const { recentRecordList, dispatch } = props;
  const [contextList, setContextList] = useState([]);

  const getRecord = () => {
    if (dispatch) {
      dispatch({
        type: 'blacklist/recentRecord',
      });
    }
  };

  let timer = null;
  const destory = () => {
    clearInterval(timer);
  };
  useEffect(() => {
    getRecord();
    timer = setInterval(() => {
      getRecord();
    }, 1000 * 10);
    return destory;
  }, []);

  useEffect(() => {
    let tmp = recentRecordList;
    if (recentRecordList.length < 3) {
      tmp = tmp
        .concat(tmp)
        .concat(tmp)
        .slice(0, 3);
    }
    setContextList(tmp);
  }, [recentRecordList]);

  return (
    <div className={styles.actionContainer}>
      <img alt="" src={actionBackground} />
      <div className={styles.actionCard}>
        <Context contextList={contextList} />
      </div>
    </div>
  );
};

export default connect(({ blacklist }) => ({
  recentRecordList: blacklist.recentRecordList,
}))(ActionCard);
