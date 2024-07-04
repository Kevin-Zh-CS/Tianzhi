import React, { useState } from 'react';
import { Divider, Descriptions, Menu, Button, IconBase, Dropdown } from 'quanta-design';
import { formatTime } from '@/utils/helper';
import { router } from 'umi';
import { PROJECT_CARD_TAG, PROJECT_TYPE } from '../../../config';
import styles from './index.less';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import CreateProjectModal from '../../../componments/CreateProjectModal';
import { PROJECT_STATUS } from '@/utils/enums';

function ProjectInfo(props) {
  const {
    name = '',
    desc = '',
    type = 0,
    initiator_name = '',
    initiator_id = '',
    created_time = '',
    isDetail,
    isPartner,
    project_id,
    auth,
    participate_status,
  } = props;

  const [visible, setVisible] = useState(false);

  const handleEdit = () => {
    window.location.reload(true);
  };

  const goToProjectDetail = () => {
    router.push(`/qfl/partner/project-detail?projectId=${project_id}`);
  };

  return (
    <div className={styles.projectInfo}>
      <div className={type ? styles.verticalProjectInfoContent : styles.crossProjectInfoContent}>
        <div className={styles.projectTitle}>
          <div className={styles.tag}>
            <span className={styles.title}>{name}</span>
            {PROJECT_CARD_TAG[type]}
          </div>
          {isDetail || !auth.includes('qfl_modify_project') ? null : (
            <Dropdown
              placement="bottomRight"
              overlay={
                <Menu style={{ width: 120 }}>
                  <Menu.Item onClick={() => setVisible(true)}>修改项目信息</Menu.Item>
                </Menu>
              }
            >
              <Button onClick={() => {}} icon={<IconBase icon={MoreIcon} />} />
            </Dropdown>
          )}
          {isPartner && participate_status === PROJECT_STATUS.READY ? (
            <Button type="primary" onClick={goToProjectDetail}>
              查看项目详情
            </Button>
          ) : null}
        </div>
        <p className={styles.desc}>{desc}</p>
        <Divider className={styles.divide} />
        <Descriptions labelStyle={{ width: 90 }} column={2}>
          <Descriptions.Item label="项目发起方">{initiator_name}</Descriptions.Item>
          <Descriptions.Item label="发起方地址">{initiator_id}</Descriptions.Item>
          <Descriptions.Item label="项目类型">{PROJECT_TYPE[type]}</Descriptions.Item>
          <Descriptions.Item label="发起时间">{formatTime(created_time)}</Descriptions.Item>
        </Descriptions>
      </div>
      <CreateProjectModal
        getTaskList={handleEdit}
        visible={visible}
        info={props}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );
}

export default ProjectInfo;
