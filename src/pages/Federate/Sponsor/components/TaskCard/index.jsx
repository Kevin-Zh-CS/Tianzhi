import React from 'react';
import classnames from 'classnames';
import { Card, IconBase, Tooltip, Dropdown, Menu, message, Tag } from 'quanta-design';
import styles from './index.less';
import { router } from 'umi';
import { connect } from 'dva';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import { ReactComponent as EditIcon } from '@/icons/edit.svg';
import Company1 from '@/assets/federate/company1_logo.png';
import Company2 from '@/assets/federate/company2_logo.png';
import Company3 from '@/assets/federate/company3_logo.png';
import Company4 from '@/assets/federate/company4_logo.png';
import { TASK_STATE_TAG, PERMISSION } from '@/utils/enums';
import { taskDelete } from '@/services/sponsor';

const logoList = [Company1, Company2, Company3, Company4];
const OrgLogo = ({ name, index, src }) => (
  <Tooltip title={`${index ? '参与方' : '发起方'}：${name}`}>
    <img alt="" width={24} height={24} style={{ left: 15 * index }} src={src}></img>
  </Tooltip>
);

function TaskCard(props) {
  const {
    task_info: taskInfo,
    perm_category,
    partner_list: orgList = [],
    loadData,
    onModify,
  } = props;
  const {
    task_id: taskId = '',
    name = '',
    desc = '',
    task_status: status = 0,
    has_data: notAllowedDeleted = true,
    visibility,
  } = taskInfo;

  const checkedList = (perm_category?.perm_settings || [])
    .filter(li => li.checked === 1 || li.checked === 2)
    .map(item => item.id);

  const handleDeleteTask = async e => {
    e.domEvent.stopPropagation();
    await taskDelete(taskId);
    message.success('任务删除成功！');
    loadData();
  };

  const handleModify = e => {
    e.stopPropagation();
    if (!checkedList.includes(PERMISSION.edit)) return;
    onModify();
  };

  return (
    <Card
      bordered={false}
      className={`${styles.wrap} hover-style`}
      onClick={() =>
        router.push({
          pathname: '/federate/sponsor/task',
          query: { taskId },
        })
      }
      actions={[
        <span
          className={classnames(
            styles.actionOpt,
            !checkedList.includes(PERMISSION.edit) ? 'disabled-style' : '',
          )}
          onClick={handleModify}
        >
          <IconBase className={styles.icon} icon={EditIcon} fill="currentColor" />
          <span>编辑</span>
        </span>,
        notAllowedDeleted ? (
          <Tooltip title="已添加数据的任务不能删除">
            <span
              className={`${styles.actionOpt} disabled-style`}
              onClick={e => e.stopPropagation()}
            >
              <IconBase className={styles.icon} icon={MoreIcon} fill="currentColor" />
              更多
            </span>
          </Tooltip>
        ) : (
          <Dropdown
            overlay={
              <Menu style={{ width: 120 }}>
                <Menu.Item
                  onClick={handleDeleteTask}
                  disabled={!checkedList.includes(PERMISSION.del)}
                >
                  删除任务
                </Menu.Item>
              </Menu>
            }
          >
            <span className={styles.actionOpt} onClick={e => e.stopPropagation()}>
              <IconBase className={styles.icon} icon={MoreIcon} fill="currentColor" />
              更多
            </span>
          </Dropdown>
        ),
      ]}
    >
      <div className={styles.titleWrap}>
        <div className={styles.titleFirst}>
          <Tooltip title={name}>
            <span className={styles.titlePrimary}>{name}</span>
          </Tooltip>
          {/* 先隐藏这个标签 */}
          {/* {TASK_VISIBILITY_TAG[visibility % TASK_VISIBILITY_TAG.length]} */}
          {visibility === 1 ? (
            <Tag color="warning" bordered>
              部分可见
            </Tag>
          ) : (
            <Tag color="processing" bordered>
              内部公开
            </Tag>
          )}
        </div>
        <Tooltip title={desc}>
          <div className={styles.titleSecond}>{desc}</div>
        </Tooltip>
      </div>
      <div className={styles.footerWrap}>
        <div className={styles.logoShow}>
          {orgList.map((item, index) => (
            <OrgLogo
              key={item.org_id}
              name={item.org_name}
              index={index}
              src={logoList[index % logoList.length]}
            />
          ))}
        </div>
        <span>{TASK_STATE_TAG[status % TASK_STATE_TAG.length]}</span>
      </div>
    </Card>
  );
}

export default connect()(TaskCard);
