import React, { useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Button } from 'quanta-design';
import styles from './index.less';
import bank from '@/assets/riskControl/animation/bank.png';
import layer2 from '@/assets/riskControl/animation/layer2.png';
import layer1 from '@/assets/riskControl/animation/layer1.png';
import blockChain from '@/assets/riskControl/animation/blockChain.png';
import grid from '@/assets/riskControl/animation/grid.png';
import Motion from "../Motion";

const Animation = props => {
  const { dispatch, resultVisible, queryTask, animation = false, skipAnimation } = props;
  const PERIOD_TYPE = ['日', '个月', '年'];
  const bankTop = useRef(null);
  const bankRight = useRef(null);
  const bankBottom = useRef(null);
  const bankLeft = useRef(null);
  const resultRef = useRef(null);
  const blockChainRef = useRef(null);
  const timerRef = useRef(null);
  const timerRef2 = useRef(null);

  useEffect(() => {
    if (animation) {
      // 动画开始
      bankTop.current.className = `${bankTop.current.className} ${styles.bankTopStart}`
      bankRight.current.className = `${bankRight.current.className} ${styles.bankRightStart}`
      bankBottom.current.className = `${bankBottom.current.className} ${styles.bankBottomStart}`
      bankLeft.current.className = `${bankLeft.current.className} ${styles.bankLeftStart}`
    } else if (!animation && resultVisible) {
      if (!skipAnimation) {
        // 动画自然结束，展示动效
        bankTop.current.className = `${bankTop.current.className} ${styles.bankTopEnd}`
        bankRight.current.className = `${bankRight.current.className} ${styles.bankRightEnd}`
        bankBottom.current.className = `${bankBottom.current.className} ${styles.bankBottomEnd}`
        bankLeft.current.className = `${bankLeft.current.className} ${styles.bankLeftEnd}`
        timerRef.current = setTimeout(() => {
          bankTop.current.className = `${styles.bank} ${styles.bankTop}`
          bankRight.current.className = `${styles.bank} ${styles.bankRight}`
          bankBottom.current.className = `${styles.bank} ${styles.bankBottom}`
          bankLeft.current.className = `${styles.bank} ${styles.bankLeft}`
          resultRef.current.style.display = 'block'
          resultRef.current.className = `${resultRef.current.className} ${styles.resultClip}`
          blockChainRef.current.className = `${blockChainRef.current.className} ${styles.blockChainBubble}`
          timerRef2.current = setTimeout(() => {
            resultRef.current.className = styles.result
            blockChainRef.current.className = styles.blockChain
          }, 1000)
        }, 600)
      } else {
        // 点击跳过动效
        bankTop.current.className = `${styles.bank} ${styles.bankTop}`
        bankRight.current.className = `${styles.bank} ${styles.bankRight}`
        bankBottom.current.className = `${styles.bank} ${styles.bankBottom}`
        bankLeft.current.className = `${styles.bank} ${styles.bankLeft}`
        resultRef.current.style.display = 'block'
        dispatch({
          type: 'riskControl/saveSkipAnimation',
          payload: false
        })
      }
    }
    return () => {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      clearTimeout(timerRef2.current);
      timerRef2.current = null;
    };
  }, [animation]);

  const handleClickResult = () => {
    const payload = {
      taskId: queryTask.task_id,
      jobId: queryTask.job_id,
    }
    if (queryTask.execute_type === 0) {
      payload.singleVisible = true
    } else {
      payload.loopVisible = true
      payload.tab = 'resultDetail'
    }
    dispatch({
      type: 'riskControl/saveModalInfo',
      payload
    })
  }

  return (
    <div className={styles.animationContainer}>
      <img src={bank} ref={bankTop} alt="" className={`${styles.bank} ${styles.bankTop}`}/>
      <img src={bank} ref={bankRight} alt="" className={`${styles.bank} ${styles.bankRight}`}/>
      <img src={bank} ref={bankBottom} alt="" className={`${styles.bank} ${styles.bankBottom}`}/>
      <img src={bank} ref={bankLeft} alt="" className={`${styles.bank} ${styles.bankLeft}`}/>
      {!animation ? (
        <div className={styles.animation}>
          {
            queryTask.task_id ? (
              <div className={styles.result} ref={resultRef}>
                <div className={styles.cardTitle}>
                  {queryTask.task_type === 1 ? (
                    <>
                      <i className="iconfont iconxian1"/>
                      <span>一人多企</span>
                    </>
                  ) : (
                    <>
                      <i className="iconfont iconxian"/>
                      <span>短期内频繁开户</span>
                    </>
                  )}
                </div>
                <div className={styles.rule}>
                  <span className={styles.ruleTitle}>预警规则</span>
                  <div className={styles.ruleContainer}>
                    <div className={styles.ruleItem}>
                      <span>时间范围：</span>
                      <span>{`${queryTask[queryTask.execute_type === 0 ? 'period_time' : 'cycle_time']}${PERIOD_TYPE[queryTask.period_type]}`}</span>
                    </div>
                    <div className={styles.ruleItem}>
                      <span>预警阈值：</span>
                      <span>{`>=${queryTask.threshold}`}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.riskNum}>
                    <span>风险数量：<span
                      className={styles.num}>{String(queryTask.risk_num).replace(/\B(?=(?:\d{3})+\b)/g, ',')}</span> 条</span>
                </div>
                <Button type="text"
                        className={styles.detail}
                        onClick={handleClickResult}>
                  查看详情
                </Button>
              </div>
            ) : (
              <div className={styles.descriptionBg}>
                运用BitXMesh提供的隐私计算服务搭建该金融风险应用，任务发起及审核、数据权限校验均通过区块链协调，任务运行结果也将在区块链上进行存证，请严格按规范使用！
              </div>
            )
          }
          <div className={`${styles.privacy} ${styles.privacyTop}`}>
            <div className={styles.name}>
              <p>参与方</p>
              <p>预言机银行</p>
            </div>
          </div>
          <div className={`${styles.privacy} ${styles.privacyRight}`}>
            <div className={styles.name}>
              <p>参与方</p>
              <p>时间戳银行</p>
            </div>
          </div>
          <div className={`${styles.privacy} ${styles.privacyBottom}`}>
            <div className={styles.name}>
              <p>发起方<i className="iconfont iconqizhi"/></p>
              <p>哈希银行</p>
            </div>
          </div>
          <div className={`${styles.privacy} ${styles.privacyLeft}`}>
            <div className={styles.name}>
              <p>参与方</p>
              <p>随机数银行</p>
            </div>
          </div>
          <img className={styles.layer2} src={layer2} alt=""/>
          <img className={styles.layer1} src={layer1} alt=""/>
          <img className={styles.blockChain} src={blockChain} ref={blockChainRef} alt=""/>
          <img className={styles.grid} src={grid} alt=""/>
        </div>
      ) : (
        <Motion/>
      )}
    </div>
  )
}

export default connect(({ riskControl }) => ({
  resultVisible: riskControl.resultVisible,
  queryTask: riskControl.queryTask,
  animation: riskControl.animation,
  skipAnimation: riskControl.skipAnimation,
}))(Animation);
