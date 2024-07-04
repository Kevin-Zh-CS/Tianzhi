import React, { useEffect, useState } from 'react';
import { router } from 'umi';
import { connect } from 'dva';
import { DATA_MODEL_STATE } from '@/utils/enums';
import { Alert, Icons, Button, Select, Input, Modal, IconBase } from 'quanta-design';
import EditorPad from '@/components/EditorPad';
import ApplyRejectModal from '../components/ApplyRejectModal';
import UploadChainLoading from '../components/UploadChainLoading';
import styles from './index.less';
import { subParticipantModelInvoke, dataInfo, subModelApprove } from '@/services/partner';
import { ReactComponent as SubIcon } from '@/icons/sub.svg';
import { ReactComponent as ChiefIcon } from '@/icons/chief.svg';
import ResultModal from '@/pages/Federate/Sponsor/components/result-model';
import { getUsedTime } from '@/pages/Federate/config';

const { ArrowLeftIcon } = Icons;

function Editor(props) {
  const { location } = props;
  const { dataId = '', taskId = '', type } = location.query;
  const [modelCode, setModelCode] = useState('');
  const [chiefModelCode, setChiefModelCode] = useState('');
  const [luaScript, setLuaScript] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paramsList, setParamsList] = useState([]);
  const [argsList, setArgsList] = useState([]);
  const [dataStatus, setDataStatus] = useState(0);
  const [invokeResult, setInvokeResult] = useState('输入参数后，点击“运行模型”计算运行结果');
  const [invokeLog, setInvokeLog] = useState('输入参数后，点击“运行模型”生成运行日志');
  const [rejectVisible, setRejectVisible] = useState(false);
  const [chainVisible, setChainVisible] = useState(false);
  const [isChief, setIsChief] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [result, setResult] = useState({});
  const [info, setInfo] = useState({});

  const getInfo = async () => {
    const res = await dataInfo({ dataId });
    setInfo(res);
    setModelCode(res.sub_model || '');
    setChiefModelCode(res.chief_model || '');
    setDataStatus(res.data_status);
  };
  useEffect(() => {
    getInfo();
  }, []);

  useEffect(() => {
    if (luaScript.length && luaScript[selectedIndex]) {
      setParamsList(luaScript[selectedIndex].inputParams);
    } else {
      setParamsList([]);
    }
  }, [luaScript, selectedIndex]);

  const hanldeInputParmas = (e, idx) => {
    argsList[idx] = e.target.value;
    setArgsList(argsList);
  };
  const handleRunModel = async () => {
    const response = await subParticipantModelInvoke({
      taskId,
      dataId,
      modelCode,
      funName: luaScript[selectedIndex]?.funName,
      args: argsList,
    });
    setInvokeResult(
      response.result ? JSON.stringify(JSON.parse(response.result), null, 2) : response.err_msg,
    );
    setResult(response);
    setInvokeLog(response.logs || '');
  };
  const handleConfirm = async params => {
    const { isAgree, refuseReason } = params;
    await subModelApprove({ dataId, isAgree, refuseReason });
    getInfo();
  };

  return (
    <div className={styles.editorWrap}>
      <div className={`${styles.title} ${styles.iconCenter}`}>
        <ArrowLeftIcon
          className="hover-style"
          onClick={() => router.goBack()}
          fill="#FFF"
          style={{ fontSize: 24, marginRight: 8 }}
        />
        模型详情
      </div>
      <div className={styles.body}>
        <div className={styles.middle}>
          {dataStatus === DATA_MODEL_STATE.MODEL_REJECT && (
            <Alert
              type="error"
              showIcon
              style={{ background: 'rgba(230, 59, 67, 0.1)' }}
              message={
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  驳回理由：{info.refuse_approval_reason}
                </span>
              }
            />
          )}
          <div className={isChief ? styles.chiefDetail : styles.detail}>
            <div className={styles.detailTab} onClick={() => setIsChief(false)}>
              <IconBase icon={SubIcon} />
              <span className={styles.tabTxt}>submodel</span>
              <span style={{ color: '#888' }}> ({info.name})</span>
            </div>
            {info.need_approval && type === '2' ? (
              <div className={styles.detailTab2} onClick={() => setIsChief(true)}>
                <IconBase icon={ChiefIcon} />
                <span className={styles.tabTxt}>chiefmodel</span>
              </div>
            ) : null}
          </div>
          <EditorPad
            setModelCode={isChief ? setChiefModelCode : setModelCode}
            modelCode={isChief ? chiefModelCode : modelCode}
            setLuaScript={setLuaScript}
            readOnly
          />
        </div>
        <div className={styles.right}>
          <div className={styles.title}>方法</div>
          <Select
            placeholder="请选择"
            style={{ width: '100%' }}
            value={luaScript.length ? luaScript[selectedIndex]?.funName : null}
            onChange={e => setSelectedIndex(e)}
            dropdownClassName={styles.modelSelect}
            notFoundContent={<div className={styles.emptyBox}>暂无方法</div>}
          >
            {luaScript.map(item => (
              <Select.Option key={item.index}>{item.funName}</Select.Option>
            ))}
          </Select>
          <div className={styles.title} style={{ marginTop: 16, marginBottom: 2 }}>
            输入
          </div>
          {paramsList.length ? (
            paramsList.map((item, index) => (
              <>
                <span className={styles.subTitle}>{item}</span>
                <Input placeholder="请输入" onChange={e => hanldeInputParmas(e, index)} />
              </>
            ))
          ) : (
            <div className={styles.emptyParams}>暂无输入</div>
          )}
          <div className={styles.textRight}>
            <Button type="primary" onClick={handleRunModel} disabled={isChief}>
              运行模型
            </Button>
          </div>
          <div className={styles.outputTitle}>
            <span>输出</span>
            <i
              onClick={() => {
                setResultVisible(true);
              }}
              className="iconfont iconxfangxiangxing_qiehuan_zhankai2"
            />
          </div>
          <div className={styles.subTitle}>
            <span>运行结果</span>
          </div>
          {invokeResult !== '输入参数后，点击“运行模型”计算运行结果' ? (
            <div className={styles.outputAlert}>
              {result.err_msg ? (
                <Alert
                  type="error"
                  message={
                    <span> {`模型运行失败！(耗时：${getUsedTime(result.used_time || 0)})`} </span>
                  }
                  showIcon
                />
              ) : (
                <Alert
                  type="success"
                  message={
                    <span> {`模型运行成功！(耗时：${getUsedTime(result.used_time || 0)})`} </span>
                  }
                  showIcon
                />
              )}
            </div>
          ) : null}
          <div
            className={
              dataStatus === DATA_MODEL_STATE.MODEL_WAIT_APPROVE ? styles.outputContainer : ''
            }
          >
            <div className={styles.output}>
              <pre style={{ color: '#b7b7b7' }}>{invokeResult}</pre>
            </div>
            <div className={styles.subTitle}>
              <span>运行日志</span>
            </div>
            <div className={styles.output}>
              <pre style={{ color: '#b7b7b7' }}>{invokeLog}</pre>
            </div>
          </div>
        </div>
        {dataStatus === DATA_MODEL_STATE.MODEL_WAIT_APPROVE && (
          <div className={styles.btnGroup}>
            <Button onClick={() => setRejectVisible(true)} className={styles.ghostBtn} ghost>
              审核驳回
            </Button>
            <Button
              type="primary"
              onClick={() =>
                Modal.info({
                  title: '确认审核通过吗？',
                  content: '审核通过后，将使用您的私钥签名进行验证。',
                  okText: '确认通过',
                  cancelText: '取消',
                  onOk: () => {
                    setChainVisible(true);
                    handleConfirm({ isAgree: true });
                  },
                })
              }
            >
              审核通过
            </Button>
          </div>
        )}
      </div>
      <ApplyRejectModal
        visible={rejectVisible}
        onOk={handleConfirm}
        onCancel={() => setRejectVisible(false)}
      />
      <UploadChainLoading type={1} visible={chainVisible} onOk={() => setChainVisible(false)} />
      <ResultModal
        visible={resultVisible}
        invokeResult={invokeResult}
        invokeLog={invokeLog}
        result={result}
        onCancel={() => setResultVisible(false)}
      />
    </div>
  );
}

export default connect(({ partner }) => ({
  dataInfo: partner.dataInfo,
}))(Editor);
