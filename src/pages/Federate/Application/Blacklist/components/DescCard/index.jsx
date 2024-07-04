import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { connect } from 'dva';
import KUTE from 'kute.js';
import { Button, Steps, message } from 'quanta-design';
import descBackground from '@/assets/blacklist/descBackground.png';
import BlackTable from '../BlackTable';
import styles from './index.less';

// tmp control function
function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

const TitleNode = props => {
  const { title, stepFlag } = props;
  const titleRef = useRef(null);

  useEffect(() => {
    if (stepFlag && titleRef.current) {
      titleRef.current.style.color = '#176383';
    }
  }, [stepFlag]);

  return (
    <span ref={titleRef} className={styles.desc}>
      {title}
    </span>
  );
};

const DescNode = props => {
  const { context, descFlag, onNext } = props;
  const descRef = [];
  const N = context.length;
  for (let i = 0; i < N; i += 1) {
    // eslint-disable-next-line
    descRef.push(useRef(null));
  }

  const typed = index => {
    if (descRef[index]) {
      KUTE.to(
        descRef[index].current,
        { width: 400 },
        {
          duration: 800,
          onComplete: async () => {
            if (N === 1) {
              await sleep(3000);
            }
            if (descRef[index].current) {
              descRef[index].current.childNodes[0].style.color = '#176383';
              if (index < N - 1) {
                typed(index + 1);
              } else {
                onNext();
              }
            }
          },
        },
      ).start();
    }
  };

  useEffect(() => {
    if (descFlag && descRef[0].current) {
      typed(0);
    }
  }, [descFlag]);

  const list = descRef.map((item, index) => (
    <div ref={item} className={styles.lineBox}>
      <span className={styles.process}>{context[index]}</span>
    </div>
  ));
  return <>{list}</>;
};

const PrintItem = forwardRef(({ childRef, ...props }) => {
  const { flag, config } = props;
  const [stepFlag, setStepFlag] = useState(0);
  const [descFlag, setDescFlag] = useState(0);
  const stepBoxRef = useRef(null);
  const stepRef = useRef(null);

  useImperativeHandle(childRef, () => ({
    skip: () => {
      if (stepBoxRef.current && stepRef.current) {
        setStepFlag(4);
      }
    },
  }));

  const tween6 = KUTE.to(stepBoxRef.current, { height: 280 }, { duration: 1 });

  const step1Anim = () => {
    setDescFlag(1);
  };
  const step2Anim = () => {
    setDescFlag(2);
    setStepFlag(1);
  };
  const scrollStep3 = () => {
    setTimeout(() => {
      if (stepRef.current) {
        stepRef.current.scrollTop += 5;
        if (stepRef.current.scrollTop < 185) {
          scrollStep3();
        }
      }
    }, 80);
  };
  const scrollStep4 = () => {
    setTimeout(async () => {
      if (stepRef.current) {
        stepRef.current.scrollTop += 5;
        if (stepRef.current.scrollTop < 244) {
          scrollStep4();
        } else {
          await sleep(3000);
          setStepFlag(4);
        }
      }
    }, 50);
  };
  const step3Anim = () => {
    scrollStep3();
    setDescFlag(3);
    setStepFlag(2);
  };
  const step4Anim = async () => {
    setStepFlag(3);
    scrollStep4();
    await sleep(2000);
    setDescFlag(4);
  };
  const step5Anim = async () => {
    setStepFlag(4);
  };

  useEffect(() => {
    if (flag && stepBoxRef.current && stepRef.current) {
      tween6.start();
      step1Anim();
    }
  }, [flag]);

  return (
    config && (
      <div ref={stepBoxRef} className={styles.stepBox}>
        <div ref={stepRef} className={styles.step}>
          <Steps ref={stepRef} direction="vertical" current={stepFlag}>
            <Steps.Step
              title={
                <TitleNode stepFlag={stepFlag === 1} title="主模型分发查询对象至子模型（已加密）" />
              }
              description={
                <DescNode
                  context={['查询内容已加密', '分发加密查询对象至参与机构']}
                  descFlag={descFlag === 1}
                  onNext={step2Anim}
                />
              }
            />
            <Steps.Step
              title={<TitleNode stepFlag={stepFlag === 2} title="子模型检索查询对象（已加密）" />}
              description={
                <DescNode
                  context={[
                    `${config[0]?.name}开始执行黑名单查询`,
                    `${config[1]?.name}开始执行黑名单查询`,
                    `${config[2]?.name}开始执行黑名单查询`,
                    `${config[3]?.name}开始执行黑名单查询`,
                  ]}
                  descFlag={descFlag === 2}
                  onNext={step3Anim}
                />
              }
            />
            <Steps.Step
              title={<TitleNode stepFlag={stepFlag === 3} title="子模型返回检索结果（已加密）" />}
              description={
                <DescNode
                  context={[
                    `${config[0]?.name}完成查询任务`,
                    `${config[0]?.name}加密返回黑名单查询结果`,
                    `${config[1]?.name}完成查询任务`,
                    `${config[1]?.name}加密返回黑名单查询结果`,
                    `${config[2]?.name}完成查询任务`,
                    `${config[2]?.name}加密返回黑名单查询结果`,
                    `${config[3]?.name}完成查询任务`,
                    `${config[3]?.name}加密返回黑名单查询结果`,
                  ]}
                  descFlag={descFlag === 3}
                  onNext={step4Anim}
                />
              }
            />
            <Steps.Step
              title={<TitleNode stepFlag={stepFlag === 4} title="主模型汇总检索结果" />}
              description={
                <DescNode
                  context={['黑名单查询结果汇总']}
                  descFlag={descFlag === 4}
                  onNext={step5Anim}
                />
              }
            />
          </Steps>
        </div>
      </div>
    )
  );
});

const ResultItem = ({ config }) => {
  const TitleDone = ({ title }) => <span className={styles.done}>{title}</span>;
  const DescDone = ({ context }) => {
    const list = context.map(item => <div className={styles.done}>{item}</div>);
    return <>{list}</>;
  };
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = 447;
    }
  }, []);

  return (
    config && (
      <div style={{ paddingTop: 40 }}>
        <div ref={ref} className={styles.step}>
          <Steps direction="vertical" current={4}>
            <Steps.Step
              title={<TitleDone title="主模型分发查询对象至子模型（已加密）" />}
              description={<DescDone context={['查询内容已加密', '分发加密查询对象至参与机构']} />}
            />
            <Steps.Step
              title={<TitleDone title="子模型检索查询对象（已加密）" />}
              description={
                <DescDone
                  context={[
                    `${config[0]?.name}开始执行黑名单查询`,
                    `${config[1]?.name}开始执行黑名单查询`,
                    `${config[2]?.name}开始执行黑名单查询`,
                    `${config[3]?.name}开始执行黑名单查询`,
                  ]}
                />
              }
            />
            <Steps.Step
              title={<TitleDone title="子模型返回检索结果（已加密）" />}
              description={
                <DescDone
                  context={[
                    `${config[0]?.name}完成查询任务`,
                    `${config[0]?.name}加密返回黑名单查询结果`,
                    `${config[1]?.name}完成查询任务`,
                    `${config[1]?.name}加密返回黑名单查询结果`,
                    `${config[2]?.name}完成查询任务`,
                    `${config[2]?.name}加密返回黑名单查询结果`,
                    `${config[3]?.name}完成查询任务`,
                    `${config[3]?.name}加密返回黑名单查询结果`,
                  ]}
                />
              }
            />
            <Steps.Step
              title={<TitleDone title="主模型汇总检索结果" />}
              description={<DescDone context={['黑名单查询结果汇总']} />}
            />
          </Steps>
        </div>
      </div>
    )
  );
};

const columns1 = [
  {
    title: '查询对象',
    dataIndex: 'query_name',
    key: 'query_name',
  },
  {
    title: '证件号码',
    dataIndex: 'query_id',
    key: 'query_id',
  },
  {
    title: '查询结果',
    dataIndex: 'query_result',
    key: 'query_result',
    render: text => <span>不良记录{text || 0}条</span>,
  },
];
const columns2 = [
  {
    title: '证件号码',
    dataIndex: 'query_id',
    key: 'query_id',
  },
  {
    title: '查询结果',
    dataIndex: 'query_result',
    key: 'query_result',
    render: text => <span>不良记录{text || 0}条</span>,
  },
];

const DescCard = props => {
  const {
    target,
    result,
    showResultInfo,
    handleSkip,
    dataSource,
    latestRecordList,
    dispatch,
    generateResult,
    queyrLoading,
    fileName,
    orgList,
    errMsg,
  } = props;
  const descDom = useRef(null);
  const [printFlag, setPrintFlag] = useState(false);
  const [type, setType] = useState(false);
  const childRef = useRef(null);

  const init = () => {
    setPrintFlag(false);
    KUTE.fromTo(
      descDom.current,
      { opacity: 1 },
      { opacity: 0 },
      {
        duration: 1000,
        onComplete: () => {
          setPrintFlag(true);
        },
      },
    ).start();
  };

  useEffect(() => {
    if (target) {
      init();
    }
  }, [target]);

  useEffect(() => {
    if (dataSource.length) {
      setType(Number(dataSource[0].is_batch));
    }
  }, [dataSource]);

  const handleExport = () => {
    if (latestRecordList.length) {
      dispatch({
        type: 'blacklist/download',
        payload: latestRecordList.find(item => item.file_name === fileName).record_id,
        callback: blob => {
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
          link.remove();
        },
      });
    }
  };

  const generate = () => {
    if (errMsg) message.error(errMsg);
    generateResult();
    setPrintFlag(false);
    dispatch({
      type: 'blacklist/latestRecord',
    });
  };
  const skip = () => {
    handleSkip();
    if (childRef.current) {
      childRef.current.skip();
    }
  };

  return (
    <div className={styles.descContainer}>
      <img alt="" src={descBackground} />
      <div className={styles.descCard}>
        <span className={styles.title}>{result ? '查询结果' : '查询说明'}</span>
        {result ? (
          showResultInfo ? (
            <div>
              <Button
                disabled={type === 0}
                className={styles.button}
                type="primary"
                size="small"
                onClick={handleExport}
              >
                导出结果
              </Button>
              <BlackTable
                small
                columns={type ? columns1 : columns2}
                dataSource={dataSource}
                pagination={{
                  pageSize: 5,
                  simple: true,
                }}
              />
            </div>
          ) : (
            <div className={styles.desc}>
              <Button type="primary" size="small" className={styles.button} onClick={generate}>
                生成查询结果
              </Button>
              <ResultItem config={orgList} />
            </div>
          )
        ) : (
          <div className={styles.desc}>
            <p ref={descDom} style={{ position: 'absolute', width: 384, margin: 40 }}>
              基于不对称加密、不经意传输等密码学技术，用户只需输入企业或个人的身份ID，
              即可联合多方数据，一键查询是否为风险用户。仅查询方可以获得查询结果，
              数据提供方无需暴露全量黑名单数据，高效完成各机构在隐私数据不出库前提下的联合黑名单查询，
              为风控、征信业务实践提供精准数据驱动力。
            </p>
            <Button
              type="primary"
              size="small"
              style={{ display: printFlag ? 'block' : 'none' }}
              className={styles.button}
              onClick={skip}
              disabled={queyrLoading}
            >
              跳过动效
            </Button>
            <PrintItem childRef={childRef} flag={printFlag} config={orgList} />
          </div>
        )}
      </div>
    </div>
  );
};

export default connect(({ blacklist }) => ({
  dataSource: blacklist.queryResult,
  latestRecordList: blacklist.latestRecordList,
  orgList: blacklist.orgList,
}))(DescCard);
