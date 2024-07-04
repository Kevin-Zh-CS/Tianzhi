import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import light from '@/assets/riskControl/motion/light.png';
import titleBg1 from '@/assets/riskControl/motion/titleBg1.png';
import titleBg0 from '@/assets/riskControl/motion/titleBg0.png';
import circle from '@/assets/riskControl/motion/circle.png';
import motionBg from '@/assets/riskControl/motion/motionBg.png';
import orgIconRight from '@/assets/riskControl/motion/orgIconRight.png';
import orgIconLeft from '@/assets/riskControl/motion/orgIconLeft.png';
import nodeRotate from '@/assets/riskControl/motion/nodeRotate.png';
import nodeTopBg from '@/assets/riskControl/motion/nodeTopBg.png';
import orgArrowLeft from '@/assets/riskControl/motion/orgArrowLeft.png';
import orgArrowRight from '@/assets/riskControl/motion/orgArrowRight.png';
import orgSpot from '@/assets/riskControl/motion/orgSpot.png';
import traceDark from '@/assets/riskControl/motion/traceDark.png';
import traceLight from '@/assets/riskControl/motion/traceLight.png';
import traceSpot from '@/assets/riskControl/motion/traceSpot.png';
import traceSpot2 from '@/assets/riskControl/motion/traceSpot2.png';
import traceCenter from '@/assets/riskControl/motion/traceCenter.png';
import traceCenterDark from '@/assets/riskControl/motion/traceCenterDark.png';
import scan from '@/assets/riskControl/motion/scan.png';
import dataTrace from '@/assets/riskControl/motion/dataTrace.png';
import dataTrace2 from '@/assets/riskControl/motion/dataTrace2.png';
import layer1 from '@/assets/riskControl/motion/layer1.png';
import layer2 from '@/assets/riskControl/motion/layer2.png';

const OrgClip = ({ node, title, className }) =>
  <div className={`${styles.orgClip} ${className}`}>
    <img src={orgIconLeft} className={styles.orgIconLeft} alt=""/>
    <div className={styles.orgContainer}>
      <div className={styles.org}>
        <div className={styles.node}>
          <div className={styles.nodeTop}>
            <img src={nodeTopBg} className={styles.nodeTopBg} alt=""/>
            <img src={nodeRotate} className={styles.nodeRotate} alt=""/>
          </div>
          <div className={styles.bottom}>
            <p>{node}</p>
          </div>
        </div>
        <div className={`${styles.arrow} ${styles.arrowLeft}`}>
          <img src={orgArrowLeft} className={styles.orgArrow} alt=""/>
          <img src={orgSpot} className={`${styles.orgSpotTranslate} ${styles.orgSpotTranslateLeft}`} alt=""/>
        </div>
        <div className={styles.local}>
          <p>本地</p>
          <p>数据</p>
        </div>
      </div>
      <div className={styles.name}>
        {title}
      </div>
    </div>
  </div>

const OrgClip2 = ({ node, title, className }) =>
  <div className={`${styles.orgClip} ${className}`}>
    <div className={styles.orgContainer}>
      <div className={styles.org}>
        <div className={styles.local}>
          <p>本地</p>
          <p>数据</p>
        </div>
        <div className={`${styles.arrow} ${styles.arrowRight}`}>
          <img src={orgArrowRight} className={styles.orgArrow} alt=""/>
          <img src={orgSpot} className={`${styles.orgSpotTranslate} ${styles.orgSpotTranslateRight}`} alt=""/>
        </div>
        <div className={styles.node}>
          <div className={styles.nodeTop}>
            <img src={nodeTopBg} className={styles.nodeTopBg} alt=""/>
            <img src={nodeRotate} className={styles.nodeRotate} alt=""/>
          </div>
          <div className={styles.bottom}>
            <p>{node}</p>
          </div>
        </div>
      </div>
      <div className={styles.name}>
        {title}
      </div>
    </div>
    <img src={orgIconRight} className={styles.orgIconRight} alt=""/>
  </div>

const Motion = props => {
  const { dispatch, queryTask, resultVisible, animation } = props;
  const [tip, setTip] = useState(`各银行分别执行隐私计算…`);
  const timerRef = useRef(null);
  const timerRef2 = useRef(null);
  const timerRef3 = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      // motion页动画播放自然结束
      dispatch({
        type: 'riskControl/saveResultVisible',
        payload: true
      })
    }, 14000)
    return () => {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      clearTimeout(timerRef2.current);
      timerRef2.current = null;
      clearTimeout(timerRef3.current);
      timerRef3.current = null;
    };
  }, []);

  useEffect(() => {
    if (animation) {
      timerRef2.current = setTimeout(() => {
        setTip(`计算结果汇总…`)
        timerRef3.current = setTimeout(() => {
          setTip(`各银行分别执行隐私计算…`)
        }, 2000)
      }, 12000)
    }
  }, [animation]);

  useEffect(() => {
    if (resultVisible) {
      dispatch({
        type: 'riskControl/saveAnimation',
        payload: false
      })
    }
  }, [resultVisible]);

  return (
    <div className={styles.motion}>
      <div className={styles.motionBgClip}>
        <img src={light} className={styles.light} alt=""/>
        <img src={queryTask.task_type === 1 ? titleBg1 : titleBg0} className={styles.title} alt=""/>
        <img src={circle} className={styles.circle} alt=""/>
        <img src={motionBg} className={styles.motionBg} alt=""/>
      </div>
      <div className={styles.motionCenter}>
        <OrgClip node="隐私计算节点 01" title="参与方：预言机银行" className={styles.orgClipTop}/>
        <OrgClip node="隐私计算节点 04" title="参与方：时间戳银行" className={styles.orgClipRight}/>
        <OrgClip2 node="隐私计算节点 03" title="发起方：哈希银行" className={styles.orgClipBottom}/>
        <OrgClip2 node="隐私计算节点 02" title="参与方：随机数银行" className={styles.orgClipLeft}/>
        <img src={traceDark} className={`${styles.trace} ${styles.traceTop}`} alt=""/>
        <img src={traceDark} className={`${styles.trace} ${styles.traceRight}`} alt=""/>
        <img src={traceDark} className={`${styles.trace} ${styles.traceBottom}`} alt=""/>
        <img src={traceDark} className={`${styles.trace} ${styles.traceLeft}`} alt=""/>
        <img src={traceLight} className={`${styles.trace} ${styles.traceTop} ${styles.traceLightTop}`} alt=""/>
        <img src={traceLight} className={`${styles.trace} ${styles.traceRight} ${styles.traceLightRight}`} alt=""/>
        <img src={traceLight} className={`${styles.trace} ${styles.traceBottom} ${styles.traceLightBottom}`} alt=""/>
        <img src={traceLight} className={`${styles.trace} ${styles.traceLeft} ${styles.traceLightLeft}`} alt=""/>
        <img src={traceSpot} className={`${styles.traceSpotTranslate} ${styles.traceSpotTranslateTop}`} alt=""/>
        <img src={traceSpot} className={`${styles.traceSpotTranslate} ${styles.traceSpotTranslateRight}`} alt=""/>
        <img src={traceSpot} className={`${styles.traceSpotTranslate} ${styles.traceSpotTranslateBottom}`} alt=""/>
        <img src={traceSpot} className={`${styles.traceSpotTranslate} ${styles.traceSpotTranslateLeft}`} alt=""/>
        <img src={traceSpot2} className={`${styles.traceSpotTranslate} ${styles.traceSpot2TranslateRight}`} alt=""/>
        <img src={traceSpot2} className={`${styles.traceSpotTranslate} ${styles.traceSpot2TranslateBottom}`} alt=""/>
        <img src={traceCenter} className={`${styles.traceCenter} ${styles.traceCenterVertical}`} alt=""/>
        <img src={traceCenter}
             className={`${styles.traceCenter} ${styles.traceHorizontal} ${styles.traceCenterHorizontal}`} alt=""/>
        <img src={traceCenterDark} className={styles.traceCenter} alt=""/>
        <img src={traceCenterDark} className={`${styles.traceCenter} ${styles.traceHorizontal}`} alt=""/>
        <img src={traceSpot} className={`${styles.traceSpotTranslate} ${styles.traceSpotTranslateVertical}`} alt=""/>
        <img src={traceSpot} className={`${styles.traceSpotTranslate} ${styles.traceSpotTranslateHorizontal}`} alt=""/>
        <img src={traceSpot2} className={`${styles.traceSpotTranslate} ${styles.traceSpot2TranslateVertical}`} alt=""/>
        <img src={scan} className={styles.scanner} alt=""/>
        <div className={styles.scanLightTranslate}/>
        <img src={layer1} className={styles.layer1} alt=""/>
        <img src={layer2} className={styles.layer2} alt=""/>
      </div>
      <div className={styles.motionInfo}>
        <div className={styles.infoItem}>
          <img src={dataTrace2} className={styles.dataTrace} alt=""/>
          <img src={traceSpot2} className={`${styles.traceSpotTranslate} ${styles.dataTraceSpot}`} alt=""/>
          <span className={styles.dataInfo}>中间结果汇总</span>
        </div>
        <div className={`${styles.infoItem} ${styles.infoItem2}`}>
          <img src={dataTrace} className={styles.dataTrace} alt=""/>
          <img src={traceSpot} className={`${styles.traceSpotTranslate} ${styles.dataTraceSpot}`} alt=""/>
          <span className={styles.dataInfo}>中间数据加密传输</span>
        </div>
        <div className={`${styles.infoItem} ${styles.infoItem3}`}>
          <div className={styles.left}>
            <div className={styles.nodeTop}>
              <img src={nodeTopBg} className={styles.nodeTopBg} alt=""/>
              <img src={nodeRotate} className={styles.nodeRotate} alt=""/>
            </div>
          </div>
          <span className={styles.dataInfo}>计算节点本地运行</span>
        </div>
      </div>
      <div className={styles.tip}>{tip}</div>
    </div>
  )
}

export default connect(({ riskControl }) => ({
  queryTask: riskControl.queryTask,
  animation: riskControl.animation,
  resultVisible: riskControl.resultVisible,
}))(Motion);
