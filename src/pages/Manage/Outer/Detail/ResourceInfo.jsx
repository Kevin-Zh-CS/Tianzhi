import React, { useState } from 'react';
import ItemTitle from '@/components/ItemTitle';
// import OuterModuleInfoCard from '../../component/OuterModuleInfoCard';
import { Icons, IconBase, Dropdown, Menu, Button } from 'quanta-design';
import { connect } from 'dva';
import CreateRepositoryModal from '../component/CreateRepositoryModal';
import { ReactComponent as FileManageIcon } from '@/icons/file_manage.svg';
import { ReactComponent as DataOriginManageIcon } from '@/icons/data_origin_manage.svg';
import { ReactComponent as InterfaceManageIcon } from '@/icons/interface_manage.svg';
import { ReactComponent as ModalManageIcon } from '@/icons/modal_manage.svg';
import styles from './index.less';
import WithLoading from '@/components/WithLoading';
import { PERMISSION } from '@/utils/enums';

const { EllipsisIcon } = Icons;

function ResourceInfo(props) {
  const { info = {}, namespace = '', loadData, auth, style } = props;
  const [visible, setVisible] = useState(false);
  const handleOk = () => {
    setVisible(false);
  };
  const handleCancel = () => {
    setVisible(false);
  };
  const menu = (
    <Menu>
      <Menu.Item>
        <Button
          type="text"
          style={{ width: 84, height: 24, paddingLeft: 12 }}
          onClick={() => {
            setVisible(true);
          }}
        >
          修改基本信息
        </Button>
      </Menu.Item>
    </Menu>
  );
  return (
    <div className={styles.tabPaneWrap} style={style}>
      <div className={styles.baseInfoWrap}>
        <div className={styles.itemWrap}>
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
              <a>
                <EllipsisIcon fontSize={22} />
              </a>
            </Dropdown>
          )}
        </div>
        <div className={styles.itemWrap}>
          <div>
            <span>资源库描述</span>
            <span>{info.ns_desc || '-'}</span>
          </div>
        </div>
      </div>
      <div className={styles.overviewWrap}>
        <ItemTitle title="概览信息" />
        <div className={styles.modulesWrap}>
          <div className={styles.wrap}>
            <div className={styles.iconWrap}>
              <div className={styles.iconBackground} style={{ background: '#66ADE8' }}></div>
              <IconBase icon={FileManageIcon} fill="#fff" />
            </div>
            <div className={styles.contentWrapDetail}>
              <span>文件已获取:</span>
              <span>{info.file_num}个</span>
            </div>
          </div>
          <div className={styles.wrap}>
            <div className={styles.iconWrap}>
              <div className={styles.iconBackground} style={{ background: '#FFCE84' }}></div>
              <IconBase icon={ModalManageIcon} fill="#fff" />
            </div>
            <div className={styles.contentWrapDetail}>
              <span>模型已获取:</span>
              <span>{info.model_num}个</span>
            </div>
          </div>
          <div className={styles.wrap}>
            <div className={styles.iconWrap}>
              <div className={styles.iconBackground} style={{ background: '#EF898E' }}></div>
              <IconBase icon={InterfaceManageIcon} fill="#fff" />
            </div>
            <div className={styles.contentWrapDetail}>
              <span>接口已获取:</span>
              <span>{info.restful_num}个</span>
            </div>
          </div>
          <div className={styles.wrap}>
            <div className={styles.iconWrap}>
              <div className={styles.iconBackground} style={{ background: '#9EEAC5' }}></div>
              <IconBase icon={DataOriginManageIcon} fill="#fff" />
            </div>
            <div className={styles.contentWrapDetail}>
              <span>数据源已获取:</span>
              <span>{info.datasource_num}个</span>
            </div>
          </div>
        </div>
      </div>
      <CreateRepositoryModal
        isNew={false}
        visible={visible}
        namespace={namespace}
        resourceName={info.ns_name}
        resourceDesc={info.ns_desc}
        resourceType={info.private_type}
        loadData={loadData}
        onOk={handleOk}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default connect(({ global }) => ({
  loading: global.loading,
}))(
  WithLoading(ResourceInfo, { skeletonNum: 1, skeletonProps: { 1: { paragraph: { rows: 10 } } } }),
);
