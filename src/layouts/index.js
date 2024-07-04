import React from 'react';
import { Layout } from 'quanta-design';
import { SiderContext } from 'quanta-design/lib/components/layout';
import classnames from 'classnames';
import router from 'umi/router';
import { connect } from 'dva';
import ControlHeader from './ControlHeader';
import PasswordModal from '@/components/PasswordModal';
import './index.less';
import { USER_STATE } from '@/utils/enums';
import SharePage from './share-page';
import MangePage from './manage-page';
import FederatePage from './federate-page';
import ManageInnerPage from './manage-inner-page';
import ManageOuterPage from './manage-outer-page';
import FederateSponsorPage from './federate-sponsor-page';
import BasicPage from './basic-page';
import QflPage from './qfl-page';
import QflDetailPage from './qfl-detail-page';

const { Sider, Content } = Layout;

@connect(({ sponsor, account, resource, outer }) => ({
  taskList: sponsor.taskList,
  userInfo: account.info,
  resourceList: resource.resourceList,
  outerList: outer.outerList,
  authAll: account.authAll,
}))
class BasicLayout extends React.Component {
  constructor() {
    super();
    this.state = {
      collapsed: false,
      showModel: false,
    };
  }

  getSelectedKeysByPath = () => {
    const { location } = this.props;
    return location.pathname || '';
  };

  getDefaultOpenKeys = () => {
    const { location } = this.props;
    return [
      location.pathname
        .split('/')
        .slice(0, 3)
        .join('/'),
    ];
  };

  handleCollapse = collapsed => {
    this.setState({ collapsed }, () => {
      if (!this.state.collapsed) {
        setTimeout(() => {
          window.location.reload(true);
        }, 300);
      }
    });
  };

  handleSelect = ({ key, item }) => {
    const { dispatch, location } = this.props;
    const { namespace } = location.query;
    if (key === 'logout') {
      dispatch({ type: 'global/logout' });
      return;
    }
    if (key) {
      const { params } = item.props;
      router.push({
        pathname: key,
        query: { namespace, ...params },
      });
    }
  };

  handleUserState = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'account/info' });
  };

  handleGetResourceList = () => {
    const {
      dispatch,
      location: { pathname },
    } = this.props;

    if (
      pathname.indexOf('/manage/outer/repository/') !== -1 ||
      pathname.indexOf('/manage/inner/repository/') !== -1
    ) {
      dispatch({ type: 'resource/resourceList' });
    }
    if (pathname.indexOf('/manage/outer/repository/') !== -1) {
      dispatch({ type: 'outer/outerList' });
    }

    if (pathname.indexOf('/federate/sponsor/') > -1) {
      dispatch({
        type: 'sponsor/taskList',
        payload: {
          size: 50,
        },
      });
    }
    // getAllAuthList
    if (!this.props.authAll.length) {
      dispatch({
        type: 'account/getAllAuthList',
        payload: dispatch,
      });
    }
  };

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.handleGetResourceList();
    }
  }

  componentDidMount() {
    this.handleGetResourceList();
  }

  handleCancelModel = () => {
    if (this.state.showModel) {
      this.setState({
        showModel: false,
      });
    }
  };

  handleShowModel = () => {
    const { showModel } = this.state;
    this.setState({
      showModel: !showModel,
    });
  };

  handleShowUser = () => {
    this.setState({
      showModel: false,
    });
  };

  render() {
    const {
      children,
      className,
      location,
      location: { pathname },
      userInfo: { status = 0, is_admin: isAdmin = true },
    } = this.props;
    const { collapsed, showModel } = this.state;
    const isApplicationPage =
      ['/blacklist', '/risk-control'].some(item => pathname.includes(item)) &&
      !pathname.includes('/info');
    const notEditorPage = pathname.indexOf('/editor') === -1;
    const notAccountPage = pathname.indexOf('/account') === -1;
    const notMessagePage = pathname.indexOf('/message') === -1;
    const notPricePage = pathname.indexOf('/price-config') === -1;

    return (
      <>
        <Layout
          className={classnames('quanta-control-layout', className, {
            'quanta-control-layout-collapsed': collapsed,
          })}
          onClick={this.handleCancelModel}
        >
          <ControlHeader
            location={location}
            showModel={showModel}
            onShowModel={this.handleShowModel}
          />
          <Layout>
            {!isApplicationPage &&
              notEditorPage &&
              notAccountPage &&
              notMessagePage &&
              notPricePage && (
                <Sider
                  theme="light"
                  collapsible
                  collapsed={collapsed}
                  onCollapse={this.handleCollapse}
                >
                  <SharePage location={location} collapsed={collapsed} />
                  <MangePage location={location} collapsed={collapsed} />
                  <FederatePage location={location} collapsed={collapsed} />
                  <ManageInnerPage location={location} collapsed={collapsed} />
                  <ManageOuterPage location={location} collapsed={collapsed} />
                  <FederateSponsorPage location={location} collapsed={collapsed} />
                  <BasicPage location={location} collapsed={collapsed} />
                  <QflPage location={location} collapsed={collapsed} />
                  <QflDetailPage location={location} collapsed={collapsed} />
                </Sider>
              )}
            <Content className="quanta-control-main">
              <SiderContext.Provider value={{ siderCollapsed: collapsed }}>
                {children}
              </SiderContext.Provider>
            </Content>
          </Layout>
        </Layout>
        <PasswordModal
          visible={!isAdmin && status === USER_STATE.FIRST}
          onCancel={this.handleUserState}
        />
      </>
    );
  }
}

export default BasicLayout;
