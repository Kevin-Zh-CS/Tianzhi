import React, { useState, useEffect, useRef } from 'react';
import { router } from 'umi';
import { connect } from 'dva';
import { Spin } from 'quanta-design';
import backImg from '@/assets/blacklist/background.png';
import backTitle from '@/assets/blacklist/backTitle.png';
import titleBackgroundMask from '@/assets/blacklist/background/titleBackgroundMask.png';
import titleText from '@/assets/blacklist/titleText.png';
import backLeft from '@/assets/blacklist/backLeft.png';
import backRight from '@/assets/blacklist/backRight.png';
import backBottom from '@/assets/blacklist/backBottom.png';
import fullScreen from '@/assets/blacklist/fullScreen.png';
import exit from '@/assets/blacklist/exit.png';
import fullScreenExit from '@/assets/blacklist/fullScreenExit.png';
import { LeftButton, RightButton } from './components/BlackButton';
import InputCard from './components/InputCard';
import DescCard from './components/DescCard';
import Animation from './components/Animation';
import BlackListModal from './components/BlackListModal';
import ActionCard from './components/ActionCard';
import CountCard from './components/CountCard';
import styles from './index.less';
import Mosaic from './components/Mosaic';
import BatchInputModal from './components/BatchInputModal';

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

function Background(props) {
  const { goFullScreen, OutFullScreen, isFullscreen } = props;
  const [visible, setVisible] = useState(false);

  const handleExit = () => {
    router.push(`/federate/application`);
  };

  const handleOpenRecord = () => {
    setVisible(!visible);
  };

  return (
    <div className={styles.back}>
      <img alt="" src={backImg} className={styles.backImg} />
      <Mosaic />
      <img alt="" src={titleBackgroundMask} className={styles.backMask} />
      <img alt="" src={backTitle} className={styles.backTitle} />
      <TimeComponent />
      <img alt="" src={titleText} className={styles.titleText} />
      <img alt="" src={backLeft} className={styles.backLeft} />
      <LeftButton onClick={handleOpenRecord} className={styles.leftButton} />
      <RightButton className={styles.rightButton} disabled />
      <img alt="" src={backRight} className={styles.backRight} />
      <img alt="" src={backBottom} className={styles.backBottom} />
      <span className={`${styles.fullScreen} ${styles.icon}`}>
        {isFullscreen ? (
          <img alt="" src={fullScreenExit} onClick={OutFullScreen} />
        ) : (
          <img alt="" src={fullScreen} onClick={goFullScreen} />
        )}
      </span>
      <span onClick={handleExit} className={`${styles.exit} ${styles.icon}`}>
        <img alt="" src={exit} />
      </span>
      <BlackListModal visible={visible} handleOpenRecord={handleOpenRecord} />
    </div>
  );
}

const Main = props => {
  const { dispatch, loading } = props;
  const blacklist = useRef(null);
  const [target, setTarget] = useState(null);
  const [result, setResult] = useState(null);
  const [showResultInfo, setShowResultInfo] = useState(false);
  const [rate, setRate] = useState(1);
  const [queyrLoading, setQueyrLoading] = useState(false);
  // BatchInputModal 用到的变量
  const [visible, setVisible] = useState(false);
  const [fileName, setFileName] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const updateWindowDimensions = () => {
      // 根据屏幕大小缩放核心区域
      const w = blacklist.current.offsetWidth / 1440;
      const h = blacklist.current.offsetHeight / 810;
      setRate(w < h ? w : h);
      setIsFullscreen(
        document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement,
      );
    };
    updateWindowDimensions();
    window.addEventListener('resize', updateWindowDimensions);
    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, []);

  // initAnimation
  const init = () => {
    setTarget(null);
    setResult(null);
    setShowResultInfo(null);
  };
  const handleStart = param => {
    init();
    setTarget(param);
  };

  const goFullScreen = () => {
    const el = blacklist.current;
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

  const handleSkip = () => {
    init();
    setResult(true);
  };
  const generateResult = () => {
    setShowResultInfo(true);
  };

  const handleQuery = (value, queryList) => {
    const _fileName = value.lastIndexOf('.') === -1 ? '' : value;
    setFileName(_fileName);
    setQueyrLoading(true);
    dispatch({
      type: 'blacklist/query',
      payload: {
        file_name: _fileName,
        is_local: true,
        query_list: queryList,
      },
    })
      .then(() => {
        setQueyrLoading(false);
        handleStart(value);
      })
      .catch(msg => {
        setQueyrLoading(false);
        setErrMsg(msg);
      });
  };

  const handleCloseModal = () => {
    setVisible(!visible);
    init();
  };
  // BatchInputModal 用到的方法
  const handleBatchSearch = params => {
    if (inputRef.current) {
      handleCloseModal();
      inputRef.current.handleBatchSearch(params);
    }
  };
  const setDataList = params => {
    if (inputRef.current) {
      inputRef.current.setDataList(params);
    }
  };
  const handleInputChange = () => {
    init();
  };

  return (
    <div ref={blacklist} className={`${styles.container} ${styles.blacklist}`}>
      {loading && (
        <div className={styles.spin}>
          <Spin />
        </div>
      )}
      <CountCard result={result} style={{ transform: `scale(${rate})` }} />
      <Background
        goFullScreen={goFullScreen}
        OutFullScreen={OutFullScreen}
        isFullscreen={isFullscreen}
      />
      {
        // transform 影响了 fixed 生效
        // 为了 BatchInputModal 的蒙版（.mask) 能够全屏显示，将组件移出 (.centerBox)
      }
      <BatchInputModal
        visible={visible}
        handleCloseModal={handleCloseModal}
        handleBatchSearch={handleBatchSearch}
        setDataList={setDataList}
      />
      <div className={styles.centerBox} style={{ transform: `scale(${rate})` }}>
        <div style={{ width: '1380px', height: '79px' }}></div>
        <ActionCard />
        <InputCard
          inputRef={inputRef}
          showResultInfo={showResultInfo}
          handleCloseModal={handleCloseModal}
          handleInputChange={handleInputChange}
          handleQuery={handleQuery}
        />
        <DescCard
          target={target}
          result={result}
          fileName={fileName}
          showResultInfo={showResultInfo}
          handleSkip={handleSkip}
          generateResult={generateResult}
          queyrLoading={queyrLoading}
          errMsg={errMsg}
        />
        <Animation
          target={target}
          result={result}
          showResultInfo={showResultInfo}
          setResult={setResult}
        />
      </div>
    </div>
  );
};

export default connect(({ loading }) => ({
  loading: loading.effects['blacklist/info'],
}))(Main);
