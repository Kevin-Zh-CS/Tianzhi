import React, { useEffect, useState } from 'react';
import { router } from 'umi';
import { connect } from 'dva';
import { Icons, Button, Select, Input, message, Modal, IconBase, Spin } from 'quanta-design';
import EditorPad from '@/components/EditorPad';
import { modeInfo, updateModel, runModel } from '@/services/resource-model';
import { Prompt } from 'react-router';
import styles from './index.less';
import { ReactComponent as freshIcon } from '@/icons/fresh.svg';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import { PERMISSION } from '@/utils/enums';
import { getRoleAuth } from '@/utils/helper';

const { ArrowLeftIcon } = Icons;

let isSave = false;
const { CloseIcon } = Icons;
function Editor(props) {
  const { location, dispatch, loading, authAll } = props;
  const { id = '', namespace = '', role } = location.query;
  const [modelCode, setModelCode] = useState('');
  const [luaScript, setLuaScript] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paramsList, setParamsList] = useState([]);
  const [argsList, setArgsList] = useState([]);
  // const [dataStatus, setDataStatus] = useState(status);
  const [invokeResult, setInvokeResult] = useState('输入参数后，点击"运行模型"计算运行结果');
  const [invokeLog, setInvokeLog] = useState('输入参数后，点击"运行模型"生成运行日志');
  const [iconColor, setIconColor] = useState('#888');
  // const [rejectVisible, setRejectVisible] = useState(false);
  // const [chainVisible, setChainVisible] = useState(false);
  const [info, setInfo] = useState({});

  const auth = useAuth({ ns_id: namespace, resource_id: id });

  const allAuth = role ? getRoleAuth(authAll, Number(role)) : auth;

  const getInfo = async () => {
    // await modeInfo(namespace, id);
    const data = await modeInfo(namespace, id, dispatch);
    setModelCode(data.model);
    setInfo(data);
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
    isSave = false;
  }, [luaScript, selectedIndex]);

  const hanldeInputParmas = (e, idx) => {
    argsList[idx] = e.target.value;
    setArgsList(argsList);
  };
  const handleRunModel = async () => {
    const res = await runModel(
      namespace,
      {
        id,
        abi: { args: argsList, func_name: luaScript[selectedIndex]?.funName },
        model: modelCode,
      },
      dispatch,
    );
    setInvokeResult(res.ret ? JSON.stringify(JSON.parse(res.ret), null, 2) : res.err_msg);
    setInvokeLog(res.logs || '');
  };

  const update = async () => {
    if (luaScript.length) {
      isSave = true;
      await updateModel(namespace, { id, model: modelCode }, dispatch);
      message.success('模型更新成功!');
      getInfo();
    } else {
      message.error('请输入正确的模型');
    }
  };

  const closeModalSave = async path => {
    await updateModel(namespace, { id, model: modelCode }, dispatch);
    message.success('模型更新成功!');
    isSave = true;
    router.replace({
      pathname: path.pathname,
      query: { ...location.query },
    });
  };

  const showModalSave = path => {
    Modal.info({
      title: '确认离开当前正在编辑的页面吗？',
      content: '若不保存，当前正在编辑的内容将丢失。',
      okText: '保存',
      cancelText: '不保存',
      style: { top: 240 },
      closable: true,
      closeIcon: <CloseIcon fill="#888" />,
      onOk: () => closeModalSave(path),
      onCancel: e => {
        if (!e.triggerCancel) {
          isSave = true;
          router.replace({
            pathname: path.pathname,
            query: { ...location.query },
          });
        }
        Modal.destroyAll();
      },
    });
  };

  const handlePrompt = path => {
    if (
      !isSave &&
      !path.pathname.startsWith('/manage/inner/repository/model/publish/success') &&
      (info.status === 0 || info.status === undefined)
    ) {
      showModalSave(path);
      return false;
    }
    return true;
  };

  return (
    <div className={styles.editorWrap}>
      {loading && (
        <div className={styles.spin}>
          <Spin />
        </div>
      )}
      <Prompt message={handlePrompt} />
      <div className={`${styles.title} ${styles.iconCenter}`}>
        <ArrowLeftIcon
          className="hover-style"
          onClick={() => router.goBack()}
          fill="#FFF"
          style={{ fontSize: 24, marginRight: 8 }}
        />
        {info.name}
      </div>
      <div className={styles.body}>
        <div className={styles.middle}>
          {(info.status === undefined || info.status === 0) && (
            <div className={styles.detail}>
              <span
                onClick={update}
                className={styles.freshTxt}
                onMouseEnter={() => {
                  setIconColor('rgba(255,255,255,.9)');
                }}
                onMouseLeave={() => {
                  setIconColor('#888');
                }}
              >
                <IconBase icon={freshIcon} className={styles.freshIcon} fill={iconColor} />
                <span>更新模型</span>
              </span>
            </div>
          )}
          <EditorPad
            setModelCode={setModelCode}
            modelCode={modelCode}
            setLuaScript={setLuaScript}
            readOnly={info.status}
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
            输入参数
          </div>
          {paramsList.length ? (
            paramsList.map((item, index) => (
              <>
                <span className={styles.subTitle}>{item}</span>
                <Input placeholder="请输入" onChange={e => hanldeInputParmas(e, index)} />
              </>
            ))
          ) : (
            <div className={styles.emptyParams}>暂无输入参数</div>
          )}
          {allAuth.includes(PERMISSION.usage) && (
            <div className={styles.textRight}>
              <Button
                type="primary"
                disabled={luaScript.length === 0 && argsList.length === 0}
                onClick={handleRunModel}
              >
                运行模型
              </Button>
            </div>
          )}
          <div className={styles.title} style={{ marginTop: 16, marginBottom: 2 }}>
            输出结果
          </div>
          <div className={styles.subTitle}>
            <span>运行结果</span>
          </div>
          <div className={styles.output}>
            <pre>{invokeResult}</pre>
          </div>
          <div className={styles.subTitle}>
            <span>运行日志</span>
          </div>
          <div className={styles.output}>
            <pre>{invokeLog}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default connect(({ partner, global, account }) => ({
  dataInfo: partner.dataInfo,
  loading: global.loading,
  authAll: account.authAll,
}))(Editor);
