import React from 'react';
import { IconBase, Menu } from 'quanta-design';
import './index.less';
import router from 'umi/router';
import { ReactComponent as SponsorIcon } from '@/icons/sponsor.svg';
import { ReactComponent as ParticipateIcon } from '@/icons/partner.svg';
import { ReactComponent as ModelIcon } from '@/icons/model_icon.svg';

function QflPage(props) {
  const { location } = props;
  const isQflPage = location.pathname.indexOf('/qfl') !== -1;
  const isFederateSponsorSubmenuPage = location.pathname.indexOf('/qfl/sponsor/project/') !== -1;
  let selectedKeys = location.pathname || '';
  if (location.pathname.indexOf('/qfl/local-data') !== -1) {
    selectedKeys = ['/qfl/local-data'];
  }
  if (location.pathname.indexOf('/qfl/partner') !== -1) {
    selectedKeys = ['/qfl/partner'];
  }
  if (location.pathname.indexOf('/qfl/modal-manage') !== -1) {
    selectedKeys = ['/qfl/modal-manage'];
  }
  const handleSelect = ({ key }) => {
    router.push({ pathname: key });
  };

  if (isQflPage && !isFederateSponsorSubmenuPage) {
    return (
      <div className="quanta-sider-menu-item">
        <Menu mode="inline" onClick={handleSelect} selectedKeys={selectedKeys}>
          <Menu.Item
            key="/qfl/sponsor/repository"
            icon={<IconBase icon={SponsorIcon} fill="currentColor" />}
          >
            我发起的
          </Menu.Item>
          <Menu.Item
            key="/qfl/partner"
            icon={<IconBase icon={ParticipateIcon} fill="currentColor" />}
          >
            我参与的
          </Menu.Item>
          {/* <Menu.Item */}
          {/*  key="/qfl/local-data" */}
          {/*  icon={<IconBase icon={ApplicationIcon} fill="currentColor" />} */}
          {/* > */}
          {/*  本地数据 */}
          {/* </Menu.Item> */}
          <Menu.Item
            key="/qfl/modal-manage"
            icon={<IconBase icon={ModelIcon} fill="currentColor" />}
          >
            模型管理
          </Menu.Item>
        </Menu>
      </div>
    );
  }
  return null;
}

export default QflPage;
