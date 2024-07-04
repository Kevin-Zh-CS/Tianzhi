import React from 'react';
import { connect } from 'dva';
import CheckDatabase from '@/components/CheckDatabase';
import Page from '@/components/Page';
import DatabaseCard from '@/pages/Manage/component/DatabaseCard';
import styles from './index.less';
import { Alert, IconBase } from 'quanta-design';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import Step from '@/pages/Manage/component/Step';
import WithLoading from '@/components/WithLoading';
import { PERMISSION } from '@/utils/enums';

@CheckDatabase({
  type: 'database/databaseList',
  stepData: [
    {
      title: '连接数据库',
      content: '发起设置数据源信息的请求，连接数据库',
    },
    {
      title: '选择数据库表字段',
      content: '打开已连接的数据库，选择需要发布的数据库字段',
    },
    {
      title: '发布库表元信息',
      content: '将数据元信息发布至数据共享平台，进行数据共享',
    },
  ],
  stepCurrent: 1,
  title: '数据库管理',
  extraTitle: '数据库使用说明',
  message:
    '数据库管理的功能定义：数据库管理模块可以与已有数据库建立连接，能够查看数据库信息、数据表等，选择字段并发布。',
  hint: '当前资源库中还没有已连接的数据库，快去连接吧～',
})
class Database extends React.Component {
  constructor() {
    super();
    this.state = {
      showAlert: false,
    };
  }

  render() {
    const { databaseList, auth } = this.props;
    const { showAlert } = this.state;
    const stepData = [
      {
        title: '连接数据库',
        content: '发起设置数据源信息的请求，连接数据库',
      },
      {
        title: '选择数据库表字段',
        content: '打开已连接的数据库，选择需要发布的数据库字段',
      },
      {
        title: '发布库表元信息',
        content: '将数据元信息发布至数据共享平台，进行数据共享',
      },
    ];
    const extra = (
      <div
        className="alert-trigger-wrap"
        onClick={() => {
          this.setState({ showAlert: !showAlert });
        }}
      >
        <span>数据源管理说明</span>
        <IconBase className={showAlert ? 'down' : 'up'} icon={ArrowsDown} fill="#888888" />
      </div>
    );

    const alert = (
      <>
        <Alert
          type="info"
          message="数据库管理的功能定义：数据库管理模块可以与已有数据库建立连接，能够查看数据库信息、数据表等，选择字段并发布。"
          showIcon
        />
        <Step stepData={stepData} current={1} />
      </>
    );
    return (
      <Page title="数据库管理" noContentLayout extra={extra} alert={showAlert ? alert : null}>
        <div className={styles.repositoryWrap} style={showAlert ? { paddingTop: 15 } : {}}>
          {auth.includes(PERMISSION.create) && (
            <DatabaseCard isCreate namespace={this.props.location.query.namespace} auth={auth} />
          )}
          {databaseList.map(v => (
            <DatabaseCard
              database={v}
              namespace={this.props.location.query.namespace}
              auth={auth}
            />
          ))}
        </div>
      </Page>
    );
  }
}

export default connect(({ database, loading }) => ({
  databaseList: database.databaseList,
  loading: loading.global,
}))(WithLoading(Database, { spinStyle: { height: '400px', marginTop: '-16px' } }));
