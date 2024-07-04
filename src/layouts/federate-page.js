import React from 'react';
import { IconBase, Menu } from 'quanta-design';
import './index.less';
import { ReactComponent as SponsorIcon } from '@/icons/sponsor.svg';
import { ReactComponent as ParticipateIcon } from '@/icons/partner.svg';
import { ReactComponent as ApplicationIcon } from '@/icons/application.svg';
import router from 'umi/router';

function FederatePage(props) {
  const { location } = props;
  const isFederatePage = location.pathname.indexOf('/federate') !== -1;
  const isFederateSponsorSubmenuPage = location.pathname.indexOf('/federate/sponsor/') !== -1;
  let selectedKeys = location.pathname || '';
  if (location.pathname.indexOf('/federate/partner') !== -1) {
    selectedKeys = ['/federate/partner'];
  }
  const handleSelect = ({ key }) => {
    router.push({ pathname: key });
  };

  if (isFederatePage && !isFederateSponsorSubmenuPage) {
    return (
      <div className="quanta-sider-menu-item">
        <Menu mode="inline" onClick={handleSelect} selectedKeys={selectedKeys}>
          <Menu.Item
            key="/federate/application"
            icon={<IconBase icon={ApplicationIcon} fill="currentColor" />}
          >
            应用中心
          </Menu.Item>
          <Menu.Item
            key="/federate/sponsor"
            icon={<IconBase icon={SponsorIcon} fill="currentColor" />}
          >
            我发起的
          </Menu.Item>
          <Menu.Item
            key="/federate/partner"
            icon={<IconBase icon={ParticipateIcon} fill="currentColor" />}
          >
            <span style={{ marginRight: 12 }}>我参与的</span>
          </Menu.Item>
        </Menu>
      </div>
    );
  }
  return null;
}

export default FederatePage;
