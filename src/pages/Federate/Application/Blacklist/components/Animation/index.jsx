import React, { useRef, useState, useEffect } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import animBackground from '@/assets/blacklist/animBackground.png';
import OrgNode from '@/assets/blacklist/OrgNode.png';
import OrgLineLeft from '@/assets/blacklist/OrgLineLeft.png';
import OrgLineRight from '@/assets/blacklist/OrgLineRight.png';
import circle1 from '@/assets/blacklist/animation/circle1_pos.png';
import circle2 from '@/assets/blacklist/animation/circle2_inv.png';
import circle3 from '@/assets/blacklist/animation/circle3_inv.png';
import circle4 from '@/assets/blacklist/animation/circle4_pos.png';
import OrgMaskLeft from '@/assets/blacklist/OrgMaskLeft.png';
import OrgMaskRight from '@/assets/blacklist/OrgMaskRight.png';
import arrowGroup from '@/assets/blacklist/animation/orgNode/arrow_group.png';
import computing from '@/assets/blacklist/animation/orgNode/computing.png';
import searchBackground from '@/assets/blacklist/animation/searchBackground.png';
import scanner from '@/assets/blacklist/animation/scanner.png';
import publish from '@/assets/blacklist/animation/publish.png';
import response from '@/assets/blacklist/animation/response.png';
import skeleton from '@/assets/blacklist/animation/orgNode/skeleton.png';
import gatherBackground from '@/assets/blacklist/animation/gatherBackground.png';
import gatherArrow from '@/assets/blacklist/animation/gatherArrow.png';
import gatherCircle from '@/assets/blacklist/animation/gatherCircle.png';
import resultSingle from '@/assets/blacklist/animation/resultSingle.png';
import resultBatch from '@/assets/blacklist/animation/resultBatch.png';
import people from '@/assets/blacklist/animation/people.png';
import KUTE from 'kute.js';
import styles from './index.less';

function Rotate(props) {
  const { flag } = props;

  return flag ? (
    <>
      <img alt="" className={`${styles.back} ${styles.rotate1}`} src={circle1} />
      <img alt="" className={`${styles.back} ${styles.rotate2}`} src={circle2} />
      <img alt="" className={`${styles.back} ${styles.rotate2}`} src={circle3} />
      <img alt="" className={`${styles.back} ${styles.rotate1}`} src={circle4} />
    </>
  ) : null;
}

const position = [
  {
    left: '80px',
    top: '80px',
  },
  {
    right: '80px',
    top: '80px',
  },
  {
    left: '80px',
    bottom: '80px',
  },
  {
    right: '80px',
    bottom: '80px',
  },
];

// tmp control function
function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function Searching(props) {
  const { flag, onNext } = props;
  const node1 = useRef(null);
  const node2 = useRef(null);
  const node3 = useRef(null);
  const node4 = useRef(null);

  function initPosition(nodeIndex, index) {
    const node = [null, node1, node2, node3, node4];
    const { left = '', right = '', top = '', bottom = '' } = position[index];
    node[nodeIndex].current.style.left = left;
    node[nodeIndex].current.style.right = right;
    node[nodeIndex].current.style.top = top;
    node[nodeIndex].current.style.bottom = bottom;
  }

  function movePosition() {
    KUTE.to(node1.current, { translate: [-260, 0] }, { duration: 2000 }).start();
    KUTE.to(node2.current, { translate: [0, 0] }, { duration: 2000 }).start();
    KUTE.to(node3.current, { translate: [-260, 260] }, { duration: 2000 }).start();
    KUTE.to(
      node4.current,
      { translate: [0, 260] },
      {
        duration: 2000,
        onComplete: async () => {
          onNext();
        },
      },
    ).start();
  }

  useEffect(() => {
    if (flag) {
      initPosition(1, 1);
      initPosition(2, 1);
      initPosition(3, 1);
      initPosition(4, 1);
      movePosition();
    }
  }, [flag]);

  return flag ? (
    <div className={styles.searching}>
      <div className={styles.scannering}>
        <img alt="" className={styles.background} src={searchBackground} />
        <img alt="" className={`${styles.scanner} ${flag ? styles.moveLine : ''}`} src={scanner} />
      </div>
      <div className={styles.org}>
        <img alt="" ref={node1} className={styles.org1} src={publish} />
        <img alt="" ref={node2} className={styles.org2} src={publish} />
        <img alt="" ref={node3} className={styles.org3} src={publish} />
        <img alt="" ref={node4} className={styles.org4} src={publish} />
      </div>
    </div>
  ) : null;
}
function Gathering(props) {
  const { flag, onNext } = props;
  const node1 = useRef(null);
  const node2 = useRef(null);
  const node3 = useRef(null);
  const node4 = useRef(null);
  const [nodeFlag, setNodeFlag] = useState(true);
  const [complexFlag, setComplexFlag] = useState(false);

  function initPosition(nodeIndex, index) {
    const node = [null, node1, node2, node3, node4];
    const { left = '', right = '', top = '', bottom = '' } = position[index];
    node[nodeIndex].current.style.left = left;
    node[nodeIndex].current.style.right = right;
    node[nodeIndex].current.style.top = top;
    node[nodeIndex].current.style.bottom = bottom;
  }

  function movePosition() {
    KUTE.to(node1.current, { translate: [260, 0] }, { duration: 3000, delay: 500 }).start();
    KUTE.to(node2.current, { translate: [0, 0] }, { duration: 3000, delay: 1000 }).start();
    KUTE.to(node3.current, { translate: [260, -260] }, { duration: 3000, delay: 1500 }).start();
    KUTE.to(
      node4.current,
      { translate: [0, -260] },
      {
        duration: 3000,
        delay: 2000,
        onComplete: async () => {
          await sleep(3000);
          setNodeFlag(false);
          setComplexFlag(true);
        },
      },
    ).start();
  }

  useEffect(() => {
    if (flag) {
      initPosition(1, 0);
      initPosition(2, 1);
      initPosition(3, 2);
      initPosition(4, 3);
      movePosition();
    }
  }, [flag]);

  useEffect(() => {
    if (complexFlag) {
      setTimeout(() => {
        setComplexFlag(false);
        onNext();
      }, 3000);
    }
  }, [complexFlag]);

  function Complex() {
    return complexFlag ? (
      <div className={styles.complex}>
        <img alt="" className={styles.background} src={gatherBackground} />
        <img alt="" className={`${styles.arrow} ${styles.bubble}`} src={gatherArrow} />
        <img alt="" className={styles.rotate1} src={gatherCircle} />
      </div>
    ) : null;
  }

  function NodeGroup() {
    return nodeFlag ? (
      <div className={styles.org}>
        <img alt="" ref={node1} className={styles.org1} src={response} />
        <img alt="" ref={node2} className={styles.org2} src={response} />
        <img alt="" ref={node3} className={styles.org3} src={response} />
        <img alt="" ref={node4} className={styles.org4} src={response} />
      </div>
    ) : null;
  }

  return flag ? (
    <div className={styles.gethering}>
      <Complex />
      <NodeGroup />
    </div>
  ) : null;
}

const Result = props => {
  const { queryResult = { query_id: '', query_name: '', query_result: '', is_batch: '' } } = props;
  const { query_id, query_name, query_result, is_batch } = queryResult;
  const type = Number(is_batch);

  return type ? (
    <div className={`${styles.result} ${styles.showMaskR}`}>
      <img alt="" className={styles.batchBox} src={resultBatch} />
      <div className={styles.batchBox}>
        <img alt="" src={people} className={styles.people} />
        <div className={styles.text}>
          查询对象：<span>{query_name || '-'}</span>
        </div>
        <div className={styles.text}>
          证件号码：<span>{query_id || '-'}</span>
        </div>
        <div className={styles.text}>
          查询结果：<span>不良记录{query_result || 0}条</span>
        </div>
      </div>
    </div>
  ) : (
    <div className={`${styles.result} ${styles.showMaskR}`}>
      <img alt="" className={styles.singleBox} src={resultSingle} />
      <div className={styles.singleBox}>
        <img alt="" src={people} className={styles.people} />
        <div className={styles.text}>
          证件号码：<span>{query_id || '-'}</span>
        </div>
        <div className={styles.text}>
          查询结果：<span>不良记录{query_result || 0}条</span>
        </div>
      </div>
    </div>
  );
};

const OrgItemLeft = props => {
  const { className, id, info, flag } = props;
  const mask = useRef(null);
  const [hover, setHover] = useState(false);

  function Search() {
    return flag ? (
      <>
        <img
          alt=""
          ref={mask}
          className={`${styles.orgMask} ${styles.showMaskL}`}
          src={OrgMaskLeft}
        />
        <img alt="" className={`${styles.arrow} ${styles.bubble}`} src={arrowGroup} />
        <img alt="" className={`${styles.computing} ${styles.rotate1}`} src={computing} />
        <img alt="" className={`${styles.skeleton} ${styles.showSkeleton}`} src={skeleton} />
        <span className={styles.fileName}>{info.fileName}</span>
      </>
    ) : null;
  }
  const Hover = e => {
    const { onMouseLeave } = e;
    return hover ? (
      <div onMouseLeave={onMouseLeave} className={styles.hoverMask}>
        <img alt="" className={`${styles.orgMask} ${styles.showMaskL}`} src={OrgMaskLeft} />
        <img alt="" className={styles.skeleton} src={skeleton} />
        <span className={styles.fileName}>{info.fileName}</span>
      </div>
    ) : null;
  };

  return (
    <div className={classNames(className, styles.orgItemLeft)}>
      <img alt="" src={OrgLineLeft} className={styles.orgLine} />
      <img alt="" src={OrgNode} className={styles.orgNode} onMouseEnter={() => setHover(true)} />
      <Hover onMouseLeave={() => setHover(false)} />
      <span className={styles.orgId}>[{id}]</span>
      <span className={styles.orgName}>
        <span className={styles.parentheses}>[</span>
        <span className={styles.name}>{info.name}</span>
        <span className={styles.parentheses}>]</span>
      </span>
      <Search />
    </div>
  );
};
const OrgItemRight = props => {
  const { className, id, info, flag } = props;
  const mask = useRef(null);
  const [hover, setHover] = useState(false);

  function Search() {
    return flag ? (
      <>
        <img
          alt=""
          ref={mask}
          className={`${styles.orgMask} ${styles.showMaskR}`}
          src={OrgMaskRight}
        />
        <img alt="" className={`${styles.arrow} ${styles.bubble}`} src={arrowGroup} />
        <img alt="" className={`${styles.computing} ${styles.rotate1}`} src={computing} />
        <img alt="" className={`${styles.skeleton} ${styles.showSkeleton}`} src={skeleton} />
        <span className={styles.fileName}>{info.fileName}</span>
      </>
    ) : null;
  }
  const Hover = e => {
    const { onMouseLeave } = e;
    return hover ? (
      <div onMouseLeave={onMouseLeave} className={styles.hoverMask}>
        <img alt="" className={`${styles.orgMask} ${styles.showMaskR}`} src={OrgMaskRight} />
        <img alt="" className={styles.skeleton} src={skeleton} />
        <span className={styles.fileName}>{info.fileName}</span>
      </div>
    ) : null;
  };

  return (
    <div className={classNames(className, styles.orgItemRight)}>
      <img alt="" src={OrgLineRight} className={styles.orgLine} />
      <img alt="" src={OrgNode} className={styles.orgNode} onMouseEnter={() => setHover(true)} />
      <Hover onMouseLeave={() => setHover(false)} />
      <span className={styles.orgId}>[{id}]</span>
      <span className={styles.orgName}>
        <span className={styles.parentheses}>[</span>
        <span className={styles.name}>{info.name}</span>
        <span className={styles.parentheses}>]</span>
      </span>
      <Search />
    </div>
  );
};

const SearchTarget = props => {
  const { target, onNext } = props;
  const box = useRef(null);

  function initTargetPosition(index) {
    const targetPosition = [
      {
        left: 0,
        top: '73px',
      },
      {
        right: 0,
        top: '73px',
      },
      {
        left: 0,
        bottom: '73px',
      },
      {
        right: 0,
        bottom: '73px',
      },
    ];
    const { left = '', right = '', top = '', bottom = '' } = targetPosition[index];
    box.current.style.left = left;
    box.current.style.right = right;
    box.current.style.top = top;
    box.current.style.bottom = bottom;
  }

  function fadeInOut() {
    const tween1 = KUTE.fromTo(box.current, { opacity: 0 }, { opacity: 1 }, { duration: 1000 });
    const tween2 = KUTE.fromTo(
      box.current,
      { scale: 0.1 },
      { scale: 1 },
      {
        duration: 1000,
        onComplete: () => {
          onNext();
        },
      },
    );
    const tween3 = KUTE.fromTo(box.current, { opacity: 1 }, { opacity: 0 }, { duration: 1000 });
    const tween4 = KUTE.fromTo(box.current, { scale: 1 }, { scale: 0.1 }, { duration: 1000 });
    tween1.chain(tween3);
    tween2.chain(tween4);
    tween1.start();
    tween2.start();
  }

  useEffect(() => {
    if (box.current && target) {
      initTargetPosition(1);
      fadeInOut();
    }
  }, [target]);

  return target ? (
    <div ref={box} className={styles.searchTarget}>
      {target}
    </div>
  ) : null;
};

const Anim = props => {
  const {
    resultFlag,
    showResultInfo,
    queryResult,
    searchFlag,
    setSearchFlag,
    setGatherFlag,
    gatherFlag,
    setResult,
  } = props;

  return resultFlag ? (
    showResultInfo ? (
      <Result queryResult={queryResult} />
    ) : null
  ) : (
    <>
      <Searching
        flag={searchFlag}
        onNext={async () => {
          await sleep(3000);
          setSearchFlag(false);
          setGatherFlag(true);
        }}
      />
      <Gathering
        flag={gatherFlag}
        onNext={() => {
          setGatherFlag(false);
          setResult(true);
        }}
      />
    </>
  );
};

const Animation = props => {
  const { target, result, setResult, queryResult, dispatch, showResultInfo, orgList } = props;
  const [animFlag, setAnimFlag] = useState(false);
  const [searchFlag, setSearchFlag] = useState(false);
  const [gatherFlag, setGatherFlag] = useState(false);
  const [resultFlag, setResultFlag] = useState(false);

  const init = () => {
    setAnimFlag(false);
    setSearchFlag(false);
    setGatherFlag(false);
    setResultFlag(false);
  };

  useEffect(() => {
    dispatch({
      type: 'organization/info',
      callback: () => {
        dispatch({ type: 'blacklist/orgList' });
      },
    });
  }, []);

  useEffect(() => {
    if (target) {
      init();
    }
  }, [target]);

  useEffect(() => {
    init();
    if (result) {
      setResultFlag(true);
      if (dispatch) {
        dispatch({
          type: 'blacklist/localRecord',
          payload: {
            page: 1,
            size: 3,
          },
        });
      }
    }
  }, [result]);

  return (
    orgList && (
      <div className={styles.animationContainer}>
        <img alt="" src={animBackground} className={styles.back} />
        <Rotate flag={searchFlag} />
        <OrgItemLeft
          flag={animFlag || resultFlag}
          className={styles.OrgItem1}
          id="01"
          info={{
            name: orgList[0]?.name,
            fileName: `${orgList[0]?.name}黑名单`,
          }}
        />
        <OrgItemRight
          flag={animFlag || resultFlag}
          className={styles.OrgItem2}
          id="02"
          info={{
            name: orgList[1]?.name,
            fileName: `${orgList[1]?.name}黑名单`,
          }}
        />
        <OrgItemLeft
          flag={animFlag || resultFlag}
          className={styles.OrgItem3}
          id="03"
          info={{
            name: orgList[2]?.name,
            fileName: `${orgList[2]?.name}黑名单`,
          }}
        />
        <OrgItemRight
          flag={animFlag || resultFlag}
          className={styles.OrgItem4}
          id="04"
          info={{
            name: orgList[3]?.name,
            fileName: `${orgList[3]?.name}黑名单`,
          }}
        />
        <SearchTarget
          target={target}
          onNext={() => {
            setAnimFlag(true);
            setSearchFlag(true);
          }}
        />
        <Anim
          resultFlag={resultFlag}
          showResultInfo={showResultInfo}
          queryResult={queryResult[0]}
          searchFlag={searchFlag}
          setSearchFlag={setSearchFlag}
          setGatherFlag={setGatherFlag}
          gatherFlag={gatherFlag}
          setResult={setResult}
        />
      </div>
    )
  );
};

export default connect(({ blacklist }) => ({
  queryResult: blacklist.queryResult,
  orgList: blacklist.orgList,
}))(Animation);
