// 检查页面是否需要有数据才能进入
import React from 'react';
import router from 'umi/router';
import { Alert, IconBase, Button, Icons } from 'quanta-design';
import Page from '@/components/Page';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import NoData from './noData';
import Step from '../../pages/Manage/component/Step';
import { PERMISSION } from '@/utils/enums';
import { getAuth } from '@/services/resource';

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
const { PlusIcon } = Icons;

export default (config = {}) => WrappedComponent =>
  class CheckDatabase extends React.Component {
    constructor() {
      super();
      this.state = {
        loaded: false,
        showAlert: true,
        auth: [],
      };
    }

    async componentDidMount() {
      const { type } = config;
      const { dispatch } = window.g_app._store; // eslint-disable-line
      dispatch({
        type,
        payload: {
          namespace: this.props.location.query.namespace,
        },
        callback: () => {
          this.setState({ loaded: true });
        },
      });
      const res = await getAuth({ ns_id: this.props.location.query.namespace });
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ auth: res });
    }

    render() {
      const { stepData, stepCurrent, title, message, hint, extraTitle } = config;
      const hasStep = !!stepData;
      const { loaded, showAlert, auth } = this.state;
      const { databaseList } = this.props;
      const BtnAndModal = () =>
        auth.includes(PERMISSION.create) ? (
          <Button
            style={{ marginTop: 31 }}
            type="primary"
            icon={<PlusIcon fill="#fff" />}
            onClick={() => {
              router.push(
                `/manage/inner/repository/database/connect?namespace=${this.props.location.query.namespace}`,
              );
            }}
          >
            连接数据库
          </Button>
        ) : null;
      let list = [];
      if (databaseList != null) {
        list = databaseList;
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
            <NoData hint={hint} btn={<BtnAndModal />} hasStep={hasStep} />
          </>
        );
      }
      if (loaded && list.length > 0) {
        return <WrappedComponent {...this.props} auth={auth} />;
      }
      return <Page title={title} noContentLayout></Page>;
    }
  };
