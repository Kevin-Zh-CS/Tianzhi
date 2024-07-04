import React from 'react';
import { withRouter, router } from 'umi';
import { Button } from 'quanta-design';
import Empty from '@/assets/search_empty.png';
import NoFound from '@/assets/404.png';
import NoAuthority from '@/assets/403.png';
import Coding from '@/assets/coding.png';
import Page from '@/components/Page';
import styles from './404.less';

const pageConfig = {
  NoFound: {
    img: NoFound,
    title: '404，抱歉，你访问的页面不存在',
    desc: '你可能输入了错误的网址，或者该网页已删除或移动',
    action: null,
  },
  NoAuthority: {
    img: NoAuthority,
    title: '403，抱歉，你无权访问此页面',
    desc: '如需访问请联系管理员设置',
    action: null,
  },
  Coding: {
    img: Coding,
    title: '功能开发中，敬请期待',
    desc: (
      <span style={{ display: 'inline-block', maxWidth: 316 }}>
        <span style={{ fontWeight: 'bold' }}>告警管理</span>
        ：支持自定义告警规则，探测资源使用和运行情况，及时对收到的异常报警做出反应，保证平台顺畅运行。
      </span>
    ),
    action: null,
  },
  Empty: {
    img: Empty,
    title: '搜索为空，请重新搜索',
    desc: '下载并安装导入组件，安装后进行导入节点操作。',
    action: (
      <p>
        <Button type="primary" onClick={() => router.push('/')} style={{ marginRight: 12 }}>
          重新加载
        </Button>
        <Button onClick={() => router.push('/')}>返回概览</Button>
      </p>
    ),
  },
};

const NoFoundPage = props => {
  const {
    type = 'NoFound',
    location: { pathname },
  } = props;
  const page = pageConfig[type] || pageConfig.NoFound;
  const isConsole = pathname.indexOf('/control') !== -1;
  const emptyContent = (
    <div className={styles.emptyContainer}>
      <img src={page.img} width="200" height="200" alt="" />
      <div className={styles.pageDesc}>
        <p className={styles.title}>{page.title}</p>
        <p className={styles.desc}>{page.desc}</p>
        <p>
          {page.action ? (
            page.action
          ) : (
            <Button type="primary" onClick={() => router.push('/')}>
              返回概览
            </Button>
          )}
        </p>
      </div>
    </div>
  );
  return isConsole ? (
    <Page title="404">{emptyContent}</Page>
  ) : (
    <div className={styles.pageContent}>{emptyContent}</div>
  );
};

export default withRouter(NoFoundPage);
