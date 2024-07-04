import React, { useState } from 'react';
import { connect } from 'dva';
import ItemTitle from '@/components/ItemTitle';
import { VISIBLE_TYPE, PERMISSION } from '@/utils/enums';
import { Dropdown, Menu } from 'quanta-design';
import ModuleInfoCard from '../../component/ModuleInfoCard';
import CreateRepositoryModal from '../component/CreateRepositoryModal';
import styles from './index.less';
import WithLoading from '@/components/WithLoading';

function ResourceInfo(props) {
  const { info = {}, namespace = '', auth, style } = props;

  const [visible, setVisible] = useState(false);

  const menu = (
    <Menu>
      <Menu.Item
        onClick={() => {
          setVisible(true);
        }}
      >
        修改基本信息
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.tabPaneWrap} style={style}>
      <div className={styles.baseInfoWrap}>
        <div className={styles.itemWrap} style={{ marginBottom: 8 }}>
          <div>
            <span>资源库名称</span>
            <span>{info.ns_name}</span>
          </div>
          {auth.includes(PERMISSION.edit) && (
            <Dropdown
              overlay={menu}
              overlayStyle={{ minWidth: 120 }}
              placement="bottomLeft"
              overlayClassName={styles.resourceInfoDropdown}
            >
              <i className="iconfont icontongyongxing_gengduo_shuipingx" />
            </Dropdown>
          )}
        </div>
        <div className={styles.itemWrap}>
          <div>
            <span>资源库描述</span>
            <span>{info.ns_desc}</span>
          </div>
        </div>
        <div className={styles.itemWrap}>
          <div>
            <span>公开类型</span>
            <span>{VISIBLE_TYPE[info.private_type]}</span>
          </div>
        </div>
      </div>
      <div className={styles.overviewWrap}>
        <ItemTitle title="概览信息" />
        <div className={styles.modulesWrap}>
          {info?.resource_info_list?.map(v => (
            <ModuleInfoCard key={v.type} {...v} />
          ))}
        </div>
      </div>
      <CreateRepositoryModal
        isNew={false}
        visible={visible}
        namespace={namespace}
        resource={info}
        onOk={() => {
          setVisible(false);
        }}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );
}

export default connect(({ resource, loading }) => ({
  info: resource.resourceInfo,
  loading: loading.effects['resource/resourceInfo'],
}))(
  WithLoading(ResourceInfo, { skeletonNum: 1, skeletonProps: { 1: { paragraph: { rows: 10 } } } }),
);
