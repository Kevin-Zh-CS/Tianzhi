import React, { useState, useEffect } from 'react';
import { Button, Tabs, message, Icons, Alert, IconBase } from 'quanta-design';
import { connect } from 'dva';
import batchBackground from '@/assets/blacklist/batchBackground.png';
import sheetBackground from '@/assets/blacklist/sheetBackground.png';
import { ReactComponent as ProcessingIcon } from '@/icons/huixingzhen.svg';
import { Space, Upload, Progress } from 'antd';
import ButtonGroup from '@/components/ButtonGroup';
import XLSX from 'xlsx';
import styles from './index.less';
import BlackTable from '../BlackTable';

const { CloseIcon, UploadIcon } = Icons;

const StepOne = props => {
  const { onClose, onNext, setFileData, dispatch } = props;
  const [fileList, setFileList] = useState([]);

  const handleChange = e => {
    let tmp = [...e.fileList];
    tmp = tmp.slice(-1);
    setFileList(tmp);
  };
  const getFile = file => {
    setFileData(file);
    return false;
  };
  const handleDownload = () => {
    const fileName = '批量查询导入模版表.xlsx';
    if (dispatch) {
      dispatch({
        type: 'blacklist/template',
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
    <div className={styles.mask}>
      <div className={styles.blackModal}>
        <img alt="" src={batchBackground} className={styles.back} />
        <div className={styles.titleItem}>
          <span className={styles.title}>批量导入</span>
          <CloseIcon
            className={`${styles.closeIcon} hover-style`}
            style={{ fill: 'currentColor' }}
            onClick={onClose}
          />
        </div>
        <Space size={20} className={styles.item}>
          <span>模版下载</span>
          <a onClick={handleDownload}>批量查询导入模版表.xlsx</a>
        </Space>
        <Space size={150} className={styles.item}>
          <span>导入文件</span>
          <span>文件大小不得超过5M</span>
        </Space>
        <div className={styles.uploadBox}>
          <Upload
            beforeUpload={getFile}
            onChange={handleChange}
            fileList={fileList}
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          >
            <Button className={styles.button} icon={<UploadIcon />}>
              {fileList.length ? '重新上传' : '上传文件'}
            </Button>
          </Upload>
        </div>
        <ButtonGroup
          className={styles.buttonGroup}
          left="取消"
          onClickL={onClose}
          right="导入"
          onClickR={onNext}
        />
      </div>
    </div>
  );
};
const StepTwo = props => {
  const { onClose, onNext, fileData, setFilePass, setFileFail, onOne } = props;
  const [percent, setPercent] = useState(0);

  // 读取 Excel
  const getInfo = file => {
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = e => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const pass = [];
      const fail = [];
      if (data[0][1] === '身份证号/统一社会信用代码') {
        data.forEach(obj => {
          const target = obj[1];
          if (!isNaN(obj[0])) {
            // 筛选规则
            const rule1 = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9X]$/;
            const rule2 = /^([0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}|[1-9]\d{14})$/;
            if (rule1.test(target) || rule2.test(target)) {
              pass.push({
                index: obj[0],
                qname: obj[2],
                qid: target,
              });
            } else {
              fail.push({
                index: obj[0],
                qname: obj[2],
                qid: target,
                reason: '格式错误',
              });
            }
          }
        });
        setFilePass(pass);
        setFileFail(fail);
        setTimeout(() => {
          if (pass.length || fail.length) {
            onNext();
          } else {
            message.error('请勿上传空文件');
            onOne();
          }
        }, 1000);
      } else {
        setTimeout(() => {
          message.error('文件格式错误，请使用正确的模版');
          onOne();
        }, 1000);
      }
    };
    if (rABS) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  useEffect(() => {
    getInfo(fileData);
  }, []);

  useEffect(() => {
    if (percent < 100) {
      setTimeout(() => {
        setPercent(percent + 10);
      }, 100);
    }
  }, [percent]);

  return (
    <div className={styles.mask}>
      <div className={styles.blackModal}>
        <img alt="" src={batchBackground} className={styles.back} />
        <div className={styles.titleItem}>
          <span className={styles.title}>批量导入</span>
          <CloseIcon
            className={`${styles.closeIcon} hover-style`}
            style={{ fill: 'currentColor' }}
            onClick={onClose}
          />
        </div>
        <div className={styles.loading}>
          <div style={{ marginTop: 43 }}>数据解析中，请耐心等待！</div>
          <div style={{ position: 'relative' }}>
            <Progress
              className={styles.progress}
              showInfo={false}
              strokeColor="rgba(0, 118, 217, 0.2)"
              trailColor="rgba(0, 118, 217, 0.1)"
              strokeWidth={32}
              percent={percent}
              status="active"
            />
            <span className={styles.text}>
              <IconBase icon={ProcessingIcon} className={styles.icon} />
              {fileData.name}
            </span>
          </div>
        </div>
        <a className={styles.buttonGroup} onClick={onClose}>
          取消导入
        </a>
      </div>
    </div>
  );
};
const StepThr = props => {
  const { onClose, onNext, filePass, fileFail } = props;

  const columns1 = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: '查询对象',
      dataIndex: 'qname',
      key: 'qname',
    },
    {
      title: '证件号码',
      dataIndex: 'qid',
      key: 'qid',
    },
  ];
  const columns2 = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: '查询对象',
      dataIndex: 'qname',
      key: 'qname',
    },
    {
      title: '证件号码',
      dataIndex: 'qid',
      key: 'qid',
    },
    {
      title: '错误原因',
      dataIndex: 'reason',
      key: 'reason',
      render: text => <span className={styles.error}>{text}</span>,
    },
  ];

  return (
    <div className={styles.mask}>
      <div className={`${styles.blackModal} ${styles.sheet}`}>
        <img alt="" src={sheetBackground} className={styles.back} />
        <div className={styles.titleItem}>
          <span className={styles.title}>批量导入</span>
        </div>
        <Space className={styles.box} size={20}>
          <span className={styles.subTitle}>解析结果</span>
          <span className={styles.desc}>
            解析成功数据 {filePass.length} 条，解析失败数据 {fileFail.length} 条。
          </span>
        </Space>
        <Alert
          type="info"
          showIcon
          message="温馨提示：当前导入仅能导入解析成功的数据，建议将解析失败的数据修改后补充导入。"
        />
        <Tabs>
          <Tabs.TabPane tab="解析成功" key="1">
            <BlackTable
              columns={columns1}
              dataSource={filePass}
              pagination={{
                pageSize: 5,
                simple: true,
              }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="解析失败" key="2">
            <BlackTable
              columns={columns2}
              dataSource={fileFail}
              pagination={{
                pageSize: 5,
                simple: true,
              }}
            />
          </Tabs.TabPane>
        </Tabs>
        <ButtonGroup
          className={styles.buttonGroup}
          left="取消"
          onClickL={onClose}
          right="确定"
          onClickR={onNext}
          rightDisabled={!filePass.length}
        />
      </div>
    </div>
  );
};

function BatchInputModal(props) {
  const { visible, handleCloseModal, handleBatchSearch, setDataList, dispatch } = props;
  const [visibleTwo, setVisibleTwo] = useState(false);
  const [visibleThr, setVisibleThr] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [filePass, setFilePass] = useState(null);
  const [fileFail, setFileFail] = useState(null);

  const onClose = () => {
    setVisibleTwo(false);
    setVisibleThr(false);
    handleCloseModal();
  };
  const onTwo = () => {
    setVisibleTwo(true);
  };
  const onThr = () => {
    setVisibleTwo(false);
    setVisibleThr(true);
  };
  const onSearch = () => {
    onClose();
    handleBatchSearch(fileData.name);
    setDataList(filePass);
  };

  return (
    <>
      {visible ? (
        visibleThr ? (
          <StepThr onClose={onClose} onNext={onSearch} filePass={filePass} fileFail={fileFail} />
        ) : visibleTwo ? (
          <StepTwo
            onClose={onClose}
            onNext={onThr}
            fileData={fileData}
            setFilePass={setFilePass}
            setFileFail={setFileFail}
            onOne={() => setVisibleTwo(false)}
          />
        ) : (
          <StepOne onClose={onClose} onNext={onTwo} setFileData={setFileData} dispatch={dispatch} />
        )
      ) : null}
    </>
  );
}

export default connect()(BatchInputModal);
