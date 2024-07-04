// 检查页面是否需要有数据才能进入
import React, { useEffect, useState } from 'react';
import { Alert, IconBase, Spin } from 'quanta-design';
import NewPage from '@/components/NewPage';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import NoData from './noData';
import Step from '../Step';

/*
  stepData: 步骤条内容
  stepCurrent: 当前步骤条
  title: 左上角title
  extraTitle: 右上角title
  message: alert的message
  hint:  图片下的说明文字
  btn: 图片下的按钮
  children: 点击按钮的Modal
*/
export default function NewCheckRepository(props = {}) {
  const [showAlert, setShowAlert] = useState(true);
  const {
    stepData,
    stepCurrent,
    title,
    message,
    hint,
    btn,
    extraTitle,
    list,
    component,
    loading = false,
  } = props;
  const hasStep = !!stepData;

  const handleShow = () => {
    setShowAlert(!showAlert);
  };

  useEffect(() => {
    if (list.length) {
      setShowAlert(false);
    }
  }, [list]);

  return (
    <NewPage
      title={title}
      extra={
        <div className="alert-trigger-wrap" onClick={handleShow}>
          {extraTitle}
          <IconBase className={showAlert ? 'up' : 'down'} icon={ArrowsDown} fill="#888888" />
        </div>
      }
      alert={
        showAlert ? (
          <>
            <Alert type="info" message={<span>{message}</span>} showIcon />
            {hasStep ? <Step stepData={stepData} current={stepCurrent} /> : null}
          </>
        ) : null
      }
      noContentLayout
    >
      <Spin spinning={loading}>
        {list.length === 0 ? (
          <NoData
            hint={hint}
            btn={btn}
            hasStep={hasStep}
            style={{ marginLeft: 0, marginRight: 0 }}
          />
        ) : (
          <div style={{ marginTop: showAlert ? 20 : 0 }}>{component}</div>
        )}
      </Spin>
    </NewPage>
  );
}
