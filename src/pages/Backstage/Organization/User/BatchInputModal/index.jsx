import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Tabs,
  Icons,
  Alert,
  IconBase,
  Upload,
  Progress,
  message,
} from 'quanta-design';
import { connect } from 'dva';
import { ReactComponent as ProcessingIcon } from '@/icons/huixingzhen.svg';
import XLSX from 'xlsx';
import styles from './index.less';
import UploadResultModal from '../UploadResultModal';
import { ERROR_CODE } from '@/utils/enums';
import HintText from '@/components/HintText';
import { confirmBatchRegister } from '@/services/account';

const { UploadIcon } = Icons;

const StepOne = props => {
  const {
    visible = false,
    onCancel = null,
    onNext = null,
    setFileInfo = null,
    dispatch = null,
  } = props;
  const [fileList, setFileList] = useState([]);
  const [files, setFiles] = useState({});

  const handleChange = e => {
    let tmp = [...e.fileList];
    tmp = tmp.slice(-1);
    setFileList(tmp);
  };
  const getFile = file => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (file.size === 0) {
      message.error('请勿上传空文件！');
      return Upload.LIST_IGNORE;
    }
    if (!isLt5M) {
      message.error('请勿上传大于5M的文件！');
      return Upload.LIST_IGNORE;
    }
    setFileInfo(file);
    setFiles(file);
    return false;
  };

  const handleNext = () => {
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = e => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (data[0] === undefined || data.length === 1) {
        message.error('请勿上传空数据');
      } else {
        onNext();
      }
    };

    if (rABS) {
      reader.readAsBinaryString(files);
    } else {
      reader.readAsArrayBuffer(files);
    }
  };

  const handleDownload = () => {
    const fileName = '批量新建用户模版.xlsx';
    if (dispatch) {
      dispatch({
        type: 'account/template',
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

  return (
    <Modal
      title="批量导入"
      visible={visible}
      okText="导入"
      onCancel={onCancel}
      onOk={handleNext}
      className={styles.stepOne}
    >
      <HintText>后台直接批量新建账号后进行分配。</HintText>
      <div size={20} className={styles.item}>
        <span style={{ marginRight: 20, whiteSpace: 'nowrap' }}>模版下载</span>
        <a onClick={handleDownload}>批量新建用户模版.xlsx</a>
      </div>
      <div size={150} className={styles.item}>
        <span style={{ marginRight: 20, whiteSpace: 'nowrap' }}>导入文件</span>
        <div className={styles.uploadBox}>
          <Upload
            beforeUpload={getFile}
            onChange={handleChange}
            fileList={fileList}
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          >
            <Button className={styles.button} icon={<UploadIcon />}>
              {fileList.length ? '重新上传' : '上传数据'}
            </Button>
          </Upload>
        </div>
        <span className={styles.tips}>文件大小不得超过5M</span>
      </div>
    </Modal>
  );
};
const StepTwo = props => {
  const {
    visible = false,
    onCancel = null,
    onNext = null,
    fileInfo = null,
    onBack = null,
    onOk = null,
    dispatch,
  } = props;
  const [percent, setPercent] = useState(0);

  // 读取 Excel
  const getInfo = file => {
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = async e => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const fileList = [];
      if (data[0][0] === '用户名' && data[0][1] === '手机号') {
        data.forEach((obj, index) => {
          if (index && obj.length) {
            fileList.push({
              name: obj[0] || '',
              tel: obj[1] || '',
            });
          }
        });
        if (fileList.length) {
          try {
            dispatch({
              type: 'account/batchRegister',
              payload: { fileList },
              callback: () => {
                setPercent(100);
                onOk(fileList);
              },
            });
          } catch (err) {
            setPercent(-1);
          }
        }
      } else {
        message.error('文件格式错误，请使用正确的模版');
        onBack();
      }
    };
    if (rABS) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  useEffect(() => {
    if (visible) {
      getInfo(fileInfo);
      setPercent(1);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      if (percent < 100) {
        setTimeout(() => {
          setPercent(parseInt(Math.min(percent + 10 * Math.random(), 100), 10));
        }, 10);
      }
      if (percent === 100) {
        setTimeout(() => {
          onNext();
        }, 500);
      }
      if (percent === -1) {
        onBack();
      }
    } else {
      setPercent(0);
    }
  }, [percent]);

  return (
    <Modal
      title="上传数据"
      visible={visible}
      onCancel={onCancel}
      footer={
        <Button onClick={onBack} type="link">
          取消导入
        </Button>
      }
      className={styles.stepTwo}
    >
      <div className={styles.loading}>
        数据解析中，请耐心等待！
        <Progress style={{ margin: '24px 0 4px' }} percent={percent} status="active" />
        <span className={styles.text}>
          <IconBase icon={ProcessingIcon} />
          <span className={styles.label}>{fileInfo.name}</span>
        </span>
      </div>
    </Modal>
  );
};
const StepThr = props => {
  const { visible = false, onCancel = null, onNext = null, passList = [], failList = [] } = props;

  const columns1 = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render: val => val + 1,
    },
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '手机号',
      dataIndex: 'tel',
      key: 'tel',
    },
  ];
  const columns2 = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render: val => val + 1,
    },
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '手机号',
      dataIndex: 'tel',
      key: 'tel',
    },
    {
      title: '错误原因',
      dataIndex: 'err_code',
      key: 'err_code',
      render: val => <span className={styles.error}>{ERROR_CODE[val]}</span>,
    },
  ];

  return (
    <Modal
      title="批量导入"
      visible={visible}
      onCancel={onCancel}
      onOk={onNext}
      okButtonProps={{
        disabled: !passList.length,
      }}
      okText="确定"
      width={720}
      className={styles.stepThr}
    >
      <HintText>
        {' '}
        解析结果
        <span className={styles.desc}>
          解析成功数据 {passList.length} 条，解析失败数据 {failList.length} 条。
        </span>
      </HintText>
      <Alert
        type="info"
        showIcon
        message="温馨提示：当前导入仅能导入解析成功的数据，建议将解析失败的数据修改后补充导入。"
        style={{ margin: '18px 0' }}
      />
      <Tabs>
        <Tabs.TabPane tab="解析成功" key="1">
          <Table
            columns={columns1}
            dataSource={passList}
            pagination={{
              pageSize: 5,
              simple: true,
            }}
            emptyTableText={<div style={{ color: '#888888' }}>暂无内容</div>}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="解析失败" key="2">
          <Table
            columns={columns2}
            dataSource={failList}
            pagination={{
              pageSize: 5,
              simple: true,
            }}
            emptyTableText={<div style={{ color: '#888888' }}>暂无内容</div>}
          />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

function BatchInputModal(props) {
  const {
    visible = false,
    onCancel = null,
    handlRefresh = null,
    passList = [],
    failList = [],
    dispatch = null,
  } = props;
  const [visibleOne, setVisibleOne] = useState(false);
  const [visibleTwo, setVisibleTwo] = useState(false);
  const [visibleThr, setVisibleThr] = useState(false);
  const [visibleSuccess, setVisibleSuccess] = useState(false);
  const [fileInfo, setFileInfo] = useState({});
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (visible) {
      setVisibleOne(true);
    }
  }, [visible]);

  const handleClose = () => {
    setVisibleOne(false);
    setVisibleTwo(false);
    setVisibleThr(false);
    onCancel();
  };
  const onOne = () => {
    setVisibleOne(true);
    setVisibleTwo(false);
  };
  const onTwo = () => {
    setVisibleOne(false);
    setVisibleTwo(true);
  };
  const onThr = () => {
    setVisibleTwo(false);
    setVisibleThr(true);
  };
  const done = async () => {
    await confirmBatchRegister({ fileList })
      .then(() => {
        handlRefresh();
        setVisibleSuccess(true);
      })
      .catch(msg => {
        message.error(msg || '上传失败');
      });
    handleClose();
  };

  return (
    <>
      {visible ? (
        <>
          <StepOne
            visible={visibleOne}
            onCancel={handleClose}
            onNext={onTwo}
            setFileInfo={setFileInfo}
            dispatch={dispatch}
          />
          <StepTwo
            visible={visibleTwo}
            onCancel={handleClose}
            onNext={onThr}
            onOk={val => setFileList(val)}
            fileInfo={fileInfo}
            onBack={onOne}
            dispatch={dispatch}
          />
          <StepThr
            visible={visibleThr}
            onCancel={handleClose}
            onNext={done}
            passList={passList}
            failList={failList}
          />
        </>
      ) : null}
      {!visible && passList.length ? (
        <UploadResultModal
          visible={visibleSuccess}
          title={`批量新建${passList.length}名用户成功！`}
          onCancel={() => setVisibleSuccess(false)}
        />
      ) : null}
      {!visible && !passList.length ? (
        <UploadResultModal
          visible={visibleSuccess}
          error
          title="批量新建失败！"
          desc="批量新建的用户已存在，请确认文件后再上传。"
          onCancel={() => setVisibleSuccess(false)}
        />
      ) : null}
    </>
  );
}

export default connect(({ account }) => ({
  passList: account.passList,
  failList: account.failList,
}))(BatchInputModal);
