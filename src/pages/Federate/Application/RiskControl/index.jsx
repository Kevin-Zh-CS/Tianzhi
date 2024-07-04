import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import { Spin } from 'quanta-design';
import CountUp from 'react-countup';
import styles from './index.less';
import titleText from '@/assets/riskControl/titleText.png';
import organization from '@/assets/riskControl/organization.png';
import task from '@/assets/riskControl/task.png';
import blockHeight from '@/assets/riskControl/blockHeight.png';
import queryFrequency from '@/assets/riskControl/queryFrequency.png';
import separator from '@/assets/riskControl/separator.png';
import TaskConfig from './components/TaskConfig';
import Animation from './components/Animation';

const formatDay = time => {
  const year = time.getFullYear();
  let month = time.getMonth() + 1;
  let day = time.getDate();
  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }
  return `${year}-${month}-${day}`;
};

const formatTime = time => {
  let hour = time.getHours();
  let minute = time.getMinutes();
  let second = time.getSeconds();
  if (hour < 10) {
    hour = `0${hour}`;
  }
  if (minute < 10) {
    minute = `0${minute}`;
  }
  if (second < 10) {
    second = `0${second}`;
  }
  return `${hour}:${minute}:${second}`;
};

const TimeComponent = () => {
  const [time, setTime] = useState(new Date());

  let timer = null;
  const destory = () => {
    clearInterval(timer);
  };

  useEffect(() => {
    timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return destory;
  }, []);

  return (
    <span className={styles.time}>
      <span style={{ marginRight: 5 }}>{formatDay(time)}</span>
      <span>{formatTime(time)}</span>
    </span>
  );
};

const Title = props => {
  const { goFullScreen, OutFullScreen, isFullscreen } = props;

  const handleExit = () => {
    router.push(`/federate/application`);
  };

  return (
    <div className={styles.riskControlTitle}>
      <TimeComponent />
      <img alt="" src={titleText} className={styles.titleText} />
      <div className={styles.operate}>
        {isFullscreen ? (
          <i className="iconfont iconxfangxiangxing_qiehuan_shouqi2" onClick={OutFullScreen} />
        ) : (
          <i className="iconfont iconxfangxiangxing_qiehuan_zhankai2" onClick={goFullScreen} />
        )}
        <i
          className={`iconfont iconxfangxiangxing_denglu_dengchu ${styles.exit}`}
          onClick={handleExit}
        />
      </div>
    </div>
  );
};

const StatisticsItem = props => {
  const { icon, title, number, separate } = props;
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
    <>
      <div className={styles.statisticsItem}>
        <img alt="" src={icon} className={styles.icon} />
        <div className={styles.right}>
          <span className={styles.title}>{title}</span>
          <CountUp
            start={pre}
            end={number}
            delay={0}
            duration={0.2}
            redraw
            formattingFn={num => {
              let tmp = num.toString().replace(/\B(?=(?:\d{3})+\b)/g, ',');
              if (tmp.length === 1) {
                tmp = `0${tmp}`;
              }
              return tmp;
            }}
          >
            {({ countUpRef }) => <div className={styles.number} ref={countUpRef} />}
          </CountUp>
        </div>
      </div>
      {separate && <img alt="" src={separator} className={styles.separator} />}
    </>
  );
};

const Statistics = props => {
  const { info } = props;

  return (
    <div className={styles.statistics}>
      <StatisticsItem icon={organization} title="参与机构总数" number={info.org_num} separate />
      <StatisticsItem icon={task} title="任务总数" number={info.task_num} separate />
      <StatisticsItem icon={blockHeight} title="区块高度" number={info.block_num} separate />
      <StatisticsItem icon={queryFrequency} title="查询总次数" number={info.query_num} />
    </div>
  );
};

const RiskControl = props => {
  const { dispatch, info, loading } = props;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const riskControlDom = useRef(null);

  useEffect(() => {
    dispatch({ type: 'riskControl/info' });
    const _setIsFullscreen = () => {
      setIsFullscreen(
        document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement,
      );
    };
    window.addEventListener('resize', _setIsFullscreen);
    return () => window.removeEventListener('resize', _setIsFullscreen);
  }, []);

  const goFullScreen = () => {
    const el = riskControlDom.current;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  };

  const OutFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  return (
    <div
      ref={riskControlDom}
      className={`${styles.riskControl} ${styles.riskControlBox}`}
      id="riskControlBox"
    >
      {loading && (
        <div className={styles.spin}>
          <Spin />
        </div>
      )}
      <Title
        goFullScreen={goFullScreen}
        OutFullScreen={OutFullScreen}
        isFullscreen={isFullscreen}
      />
      <div
        className={`${styles.bg} ${styles.riskControlBg}`}
        style={
          isFullscreen ? { minHeight: 'calc(100vh - 78px)' } : { minHeight: 'calc(100vh - 128px)' }
        }
      >
        <Statistics info={info} />
        <div className={styles.container}>
          <TaskConfig />
          <Animation />
        </div>
      </div>
    </div>
  );
};

export default connect(({ riskControl, loading }) => ({
  info: riskControl.info,
  loading: loading.effects['riskControl/info'],
}))(RiskControl);
