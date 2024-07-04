// 检查页面是否需要有数据才能进入
import React from 'react';
import { Alert, IconBase } from 'quanta-design';
import Page from '@/components/Page';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import NoData from './noData';
import Step from '../../pages/Manage/component/Step';

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
export default (config = {}) => WrappedComponent =>
  class CheckRepository extends React.Component {
    constructor() {
      super();
      this.state = {
        loaded: false,
        showAlert: true,
      };
    }

    componentDidMount() {
      const { type } = config;
      const { dispatch } = window.g_app._store; // eslint-disable-line
      dispatch({
        type,
        callback: () => {
          this.setState({ loaded: true });
        },
      });
    }

    render() {
      const { stepData, stepCurrent, title, message, hint, btn, extraTitle } = config;
      const hasStep = !!stepData;
      const { loaded, showAlert } = this.state;
      const { taskList, resourceList } = this.props;
      let list = [];
      if (taskList != null) {
        list = taskList;
      } else if (resourceList != null) {
        list = resourceList;
      }
      if (loaded && list.length === 0) {
        return (
          <>
            <Page
              title={title}
              extra={
                <div
                  className="alert-trigger-wrap"
                  onClick={() => {
                    this.setState({ showAlert: !showAlert });
                  }}
                >
                  {extraTitle}
                  <IconBase
                    className={showAlert ? 'up' : 'down'}
                    icon={ArrowsDown}
                    fill="#888888"
                  />
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
            ></Page>
            <NoData hint={hint} btn={btn} hasStep={hasStep} />
          </>
        );
      }
      if (loaded && list.length > 0) {
        return <WrappedComponent {...this.props} />;
      }

      return <Page title={title} noContentLayout></Page>;
    }
  };
