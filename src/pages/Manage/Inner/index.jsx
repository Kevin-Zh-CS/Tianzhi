import React, { useState } from 'react';
import { Button, Icons } from 'quanta-design';
import router from 'umi/router';
import { connect } from 'dva';
import CheckRepository from '@/components/CheckRepository';
import Page from '@/components/Page';
import InnerRepositoryCard from './component/InnerRepositoryCard';
import CreateRepositoryModal from './component/CreateRepositoryModal';
import styles from './index.less';
import WithLoading from '@/components/WithLoading';

const { PlusIcon } = Icons;

const BtnAndModal = () => {
  const [visible, setVisible] = useState(false);
  return (
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
        onOk={() => {
          setVisible(false);
          router.push('/manage/inner/repository');
        }}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};

@CheckRepository({
  type: 'resource/resourceList',
  stepData: [
    {
      title: '创建资源库',
      content: '为不同类型事务创建资源库，方便管理本地资源',
    },
    {
      title: '上传/新建数据',
      content: '在指定资源库中上传/新建数据，用于内部使用或节点共享',
    },
    {
      title: '发布数据元信息',
      content: '将数据元信息发布至数据共享平台，进行数据共享',
    },
  ],
  stepCurrent: 1,
  title: '内部资源库',
  extraTitle: '内部资源库使用说明',
  message:
    '内部资源库的功能定义：内部资源库是对机构内部资源分区管理，可以界定不同用户对不同资源的功能操作权限。同时也作为数据发布的前置准备，所有需要发布到数据平台的数据都必须存储在内部资源库中。',
  hint: '你所在的机构还没有内部资源库，快去创建吧～',
  btn: <BtnAndModal />,
})
class Inner extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { resourceList, dispatch, style } = this.props;
    return (
      <Page title="内部资源库" noContentLayout>
        <div className={styles.repositoryWrap} style={style}>
          <InnerRepositoryCard isCreate />
          {resourceList.map(v => (
            <InnerRepositoryCard key={v.ns_id} resource={v} dispatch={dispatch} />
          ))}
        </div>
      </Page>
    );
  }
}

export default connect(({ resource, loading }) => ({
  resourceList: resource.resourceList,
  loading: loading.effects['resource/resourceList'],
}))(WithLoading(Inner, { skeletonTemplate: 4 }));
