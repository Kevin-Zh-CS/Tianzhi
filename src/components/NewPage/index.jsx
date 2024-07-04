import React, {
  Fragment,
  // createContext
} from 'react';
import { PageHeader, Dropdown, Menu, Icons } from 'quanta-design';
import { SiderContext } from 'quanta-design/lib/components/layout';
import router from 'umi/router';
import classnames from 'classnames';

import './index.less';

const { EllipsisIcon, ArrowLeftIcon } = Icons;

const defaultPageConext = {};

export const PageContext = React.createContext(defaultPageConext);

function Page(props) {
  // static defaultProps = {
  //   actions: [],
  //   alert: null,
  //   noContentLayout: false,
  //   status: null, // 页面右上角的状态标签
  // };

  // constructor() {
  //   super();
  //   this.state = {};
  // }

  const renderPage = ({ siderCollapsed }) => {
    const {
      title,
      children,
      className,
      header,
      status,
      actions,
      extra,
      alert,
      noContentLayout,
      showBackIcon = false,
      backFunction = () => router.goBack(),
      ...restProps
    } = props;
    let cls = classnames('quanta-control-page', className, {
      'quanta-control-page-sider-collapsed': siderCollapsed,
      'quanta-control-page-no-content-layout': noContentLayout,
    });
    let pageChildren = null;
    if (!title && !header) {
      pageChildren = (
        <Fragment>
          {alert}
          {children}
        </Fragment>
      );
      cls = `${cls} quanta-control-page-without-header`;
    } else if (title && !header) {
      let pageHeaderExtra = null;
      let titleWithBackIcon = null;
      if (status) {
        pageHeaderExtra = status;
      }
      if (showBackIcon) {
        titleWithBackIcon = (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ArrowLeftIcon
              style={{ marginRight: 8 }}
              fill="#888888"
              showHover
              fontSize={24}
              onClick={backFunction}
            />
            {title}
          </div>
        );
      }
      if (actions && actions.length > 0) {
        const menu = (
          <Menu>
            {actions.map(action => (
              <Menu.Item {...action}>{action.name}</Menu.Item>
            ))}
          </Menu>
        );
        pageHeaderExtra = (
          <>
            {pageHeaderExtra}
            <Dropdown overlay={menu} overlayStyle={{ minWidth: 120 }} placement="bottomRight">
              <a>
                <EllipsisIcon />
              </a>
            </Dropdown>
          </>
        );
      }
      pageChildren = (
        <>
          <PageHeader
            {...restProps}
            title={showBackIcon ? titleWithBackIcon : title}
            extra={extra || pageHeaderExtra}
            className="quanta-control-page-header"
          />
          <div className="quanta-control-page-main">
            <div>{alert}</div>
            <div className="quanta-control-page-content">{children}</div>
          </div>
        </>
      );
    } else if (header) {
      let customizeHeader = null;
      if (typeof header === 'string') {
        customizeHeader = <div className="quanta-control-page-header">{header}</div>;
      } else if (typeof header === 'object') {
        const { className: customizeHeaderClassName, ...restCustomizeHeaderProps } = header.props;
        customizeHeader = React.cloneElement(header, {
          className: classnames('quanta-control-page-header', customizeHeaderClassName),
          ...restCustomizeHeaderProps,
        });
      }
      pageChildren = (
        <>
          {customizeHeader}
          <div className="quanta-control-page-main">
            {alert}
            <div className="quanta-control-page-content">{children}</div>
          </div>
        </>
      );
      cls = `${cls} quanta-control-page-with-customize-header`;
    }

    return (
      <div id="page" className={cls}>
        {pageChildren}
      </div>
    );
  };

  return <SiderContext.Consumer>{renderPage}</SiderContext.Consumer>;
}

export default Page;
