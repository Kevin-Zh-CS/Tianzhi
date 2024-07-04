import React, { useState } from 'react';
import { IconBase, Divider, Descriptions, Button, Dropdown, Menu } from 'quanta-design';
import { formatTime } from '@/utils/helper';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import { TASK_STATE_TAG, PERMISSION } from '@/utils/enums';
import { router } from 'umi';
import CreateTaskModal from '../components/CreateTaskModal';
import { generateRestfulUrl, getRestfulInfo } from '@/services/sponsor';
import styles from './index.less';

function TaskInfo(props) {
  const {
    task_id: taskId = '',
    name = '',
    desc = '',
    // initiator_name: sponsor = '',
    initiator_org_name: org = '',
    initiator_id: address = '',
    create_time: time = '',
    // task_hash: taskHash = '',
    task_status: status = 0,
    visibility = 0,
    members: partnerList = [],
    auth = [],
  } = props;
  const [visible, setVisible] = useState(false);
  // const [copyTooltip, setCopyTooltip] = useState(false);

  const goToMakeInterface = async () => {
    const data = await getRestfulInfo(taskId);
    if (data.url) {
      router.push(`/federate/sponsor/doc-detail?taskId=${taskId}`);
    } else {
      await generateRestfulUrl(taskId);
      router.push(`/federate/sponsor/make-interface?taskId=${taskId}`);
    }
  };

  return (
    <>
      <div className={styles.taskInfo}>
        <div className={styles.taskTitle}>
          <div className={styles.tag}>
            <span className={styles.title}>{name}</span>
            {TASK_STATE_TAG[status]}
          </div>
          {(auth.includes(PERMISSION.edit) ||
            (auth.includes(PERMISSION.query) && status === 3)) && (
            <Dropdown
              overlay={
                <Menu style={{ width: 120 }}>
                  {auth.includes(PERMISSION.edit) && (
                    <Menu.Item onClick={() => setVisible(true)}>修改任务信息</Menu.Item>
                  )}
                  {auth.includes(PERMISSION.query) && status === 3 && (
                    <Menu.Item onClick={goToMakeInterface}>生成接口</Menu.Item>
                  )}
                </Menu>
              }
            >
              <Button icon={<IconBase icon={MoreIcon} />} />
            </Dropdown>
          )}
        </div>
        <p style={{ color: '#888888', width: 800 }}>{desc}</p>
        <Divider style={{ margin: '16px 0' }} />
        <Descriptions labelStyle={{ width: 90 }} column={2}>
          <Descriptions.Item label="任务发起方">{org}</Descriptions.Item>
          <Descriptions.Item label="发起方地址">{address}</Descriptions.Item>
          <Descriptions.Item label="发起时间">{formatTime(time)}</Descriptions.Item>
        </Descriptions>
      </div>
      <CreateTaskModal
        visible={visible}
        taskId={taskId}
        taskName={name}
        taskDesc={desc}
        taskType={visibility}
        taskMember={partnerList}
        onCancel={() => setVisible(false)}
      />
    </>
  );
}

export default TaskInfo;
