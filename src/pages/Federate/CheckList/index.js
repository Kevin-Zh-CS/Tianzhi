// 检查页面是否需要有数据才能进入
import React, { useState } from 'react';
import { Alert, IconBase } from 'quanta-design';
import NewPage from '@/components/Page';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import NoData from './noData';

/*
  title: 左上角title
  extraTitle: 右上角title
  message: alert的message
  hint:  图片下的说明文字
*/
export default function CheckList(config = {}) {
  const [showAlert, setShowAlert] = useState(true);
  const { title, message, hint, extraTitle, list, component, typeMenu } = config;

  const handleShow = () => {
    setShowAlert(!showAlert);
  };
  if (list.length === 0) {
    return (
      <>
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
              </>
            ) : null
          }
          noContentLayout
        >
          {typeMenu}
        </NewPage>
        <NoData hint={hint} />
      </>
    );
  }
  return component;
}
