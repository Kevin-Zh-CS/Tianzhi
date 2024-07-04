import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import CountUp from 'react-countup';
import countCard from '@/assets/blacklist/countCard.png';
import styles from './index.less';

const CountItem = props => {
  const { title, number } = props;
  const [init, setInit] = useState(true);
  const [pre, setPre] = useState(0);

  useEffect(() => {
    if (init) {
      setPre(0);
      setInit(false);
    } else {
      setPre(number - 1);
    }
  }, [number]);

  return (
    <div className={styles.countCard}>
      <img alt="" src={countCard} />
      <span className={styles.title}>{title}</span>
      <CountUp
        start={pre}
        end={number}
        delay={0}
        redraw
        formattingFn={num => {
          let tmp = num.toString().replace(/\B(?=(?:\d{3})+\b)/g, ',');
          if (tmp.length === 1) {
            tmp = `0${tmp}`;
          }
          return tmp;
        }}
      >
        {({ countUpRef }) => (
          <div>
            <span className={styles.number} ref={countUpRef} />
          </div>
        )}
      </CountUp>
    </div>
  );
};

const CountCard = props => {
  const { result, dispatch, org, black, search, height, tx, style } = props;

  useEffect(() => {
    if (result && dispatch) {
      dispatch({
        type: 'blacklist/info',
      });
    }
  }, [result]);

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'blacklist/info',
      });
    }
  }, []);

  return (
    <div className={styles.countContainer} style={style}>
      <CountItem title="参与机构数" number={org} />
      <CountItem title="黑名单总数" number={black} />
      <CountItem title="查询总次数" number={search} />
      <CountItem title="区块高度" number={height} />
      <CountItem title="交易总数" number={tx} />
    </div>
  );
};

export default connect(({ blacklist }) => ({
  org: blacklist.countInfo.org_num,
  black: blacklist.blackListAmount,
  search: blacklist.countInfo.query_num,
  height: blacklist.countInfo.block_num,
  tx: blacklist.countInfo.tx_num,
}))(CountCard);
