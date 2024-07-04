import React, { useEffect, useState } from 'react';
import NewCheckRepository from '@/components/NewCheckRepository';
import Page from '@/components/Page';
import { Alert, Button, IconBase, Icons } from 'quanta-design';
import { connect } from 'dva';
import OuterRepositoryCard from './component/OuterRepositoryCard';
import styles from './index.less';
import { outerResourceList } from '@/services/outer';
import CreateRepositoryModal from '@/pages/Manage/Outer/component/CreateRepositoryModal';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import WithLoading from '@/components/WithLoading';

const { PlusIcon } = Icons;

const step = [
  {
    title: '申请/购买数据',
    content: '通过授权或者积分的形式，获取数据访问凭证',
  },
  {
    title: '请求数据',
    content: '需求方发起请求，数据提供方通过区块链验证凭证合法性',
  },
  {
    title: '转存数据',
    content: '将已获取的数据转存至指定的外部资源库',
  },
];
function Outer(props) {
  const { dispatch, loading } = props;
  const [showAlert, setShowAlert] = useState(true);
  const [visible, setVisible] = useState(false);
  const [list, setList] = useState([]);
  const alert = (
    <Alert
      type="info"
      message="外部资源库功能定义：外部资源库是对从其他机构获取的数据分区管理，界定机构内不同用户对不同资源的的权限范围"
      showIcon
    />
  );

  const extra = (
    <div
      className="alert-trigger-wrap"
      onClick={() => {
        setShowAlert(!showAlert);
      }}
    >
      <span>外部资源库使用说明</span>
      <IconBase className={showAlert ? 'down' : 'up'} icon={ArrowsDown} fill="#888888" />
    </div>
  );

  // 获取初始值
  const initData = async () => {
    const data = await outerResourceList(dispatch);
    setList(data);
  };

  useEffect(() => {
    initData();
  }, []);

  const BtnAndModal = () => (
    <div>
      <Button
        style={{ marginTop: 31 }}
        type="primary"
        icon={<PlusIcon fill="#fff" />}
        onClick={() => {
          setVisible(true);
        }}
      >
        新建资源库
      </Button>
      <CreateRepositoryModal
        visible={visible}
        isNew
        loadNewData={initData}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );

  return loading ? (
    <Page title="外部资源库" noContentLayout></Page>
  ) : (
    <>
      {list.length === 0 ? (
        <NewCheckRepository
          list={list}
          stepData={step}
          stepCurrent={3}
          title="外部资源库"
          extraTitle="外部资源库使用说明"
          message="外部资源库功能定义：外部资源库是对从其他机构获取的数据分区管理，界定机构内不同用户对不同资源的的权限范围"
          hint="你所在的机构还没有外部资源库，快去创建吧～"
          btn={<BtnAndModal />}
        />
      ) : (
        <Page title="外部资源库" extra={extra} alert={showAlert ? null : alert} noContentLayout>
          <div className={styles.repositoryWrap}>
            <OuterRepositoryCard isCreate loadNewData={initData} />
            {list.map(v => (
              <OuterRepositoryCard loadNewData={initData} key={v.ns_id} resource={v} />
            ))}
          </div>
        </Page>
      )}
    </>
  );
}

export default connect(({ global }) => ({
  loading: global.loading,
}))(WithLoading(Outer, { skeletonTemplate: 4 }));
