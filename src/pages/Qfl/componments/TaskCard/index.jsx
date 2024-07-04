import React, { useState } from 'react';
import { Card, IconBase, Tooltip, Dropdown, Menu, message } from 'quanta-design';
import styles from './index.less';
import { router } from 'umi';
import { connect } from 'dva';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import { ReactComponent as EditIcon } from '@/icons/edit.svg';
import Company1 from '@/assets/federate/company1_logo.png';
import Company2 from '@/assets/federate/company2_logo.png';
import Company3 from '@/assets/federate/company3_logo.png';
import Company4 from '@/assets/federate/company4_logo.png';
import { PROJECT_CARD_TAG } from '../../config';
import { deleteProject } from '@/services/qfl';
import CreateProjectModal from '@/pages/Qfl/componments/CreateProjectModal';
import { MANAGE_ROLE } from '@/constant/public';
import classnames from 'classnames';

const logoList = [Company1, Company2, Company3, Company4];
const OrgLogo = ({ name, index, src }) => (
  <Tooltip title={name}>
    <img alt="" width={24} height={24} style={{ left: 15 * index }} src={src}></img>
  </Tooltip>
);

function TaskCard(props) {
  const { partner_list = [], project_info = {}, loadData, role } = props;
  const { project_id, name = '', desc = '', associate_task_num, type = 0 } = project_info;
  const [visible, setVisible] = useState(false);

  const handleDeleteTask = async e => {
    e.domEvent.stopPropagation();
    await deleteProject(project_id);
    message.success('项目删除成功！');
    loadData();
  };

  const handleEdit = () => {
    loadData();
  };

  const handleModify = e => {
    if (role !== MANAGE_ROLE.all) return;
    e.stopPropagation();
    setVisible(true);
  };

  return (
    <>
      <Card
        bordered={false}
        className={`${styles.wrap} hover-style`}
        bodyStyle={{ padding: 0 }}
        actions={[
          <span
            className={classnames(
              styles.actionOpt,
              role !== MANAGE_ROLE.all ? 'disabled-style' : '',
            )}
            onClick={handleModify}
          >
            <IconBase className={styles.icon} icon={EditIcon} fill="currentColor" />
            <span>编辑</span>
          </span>,
          associate_task_num ? (
            <Tooltip title="已添加数据的项目不能删除">
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
                  <Menu.Item disabled={role !== MANAGE_ROLE.all} onClick={handleDeleteTask}>
                    删除项目
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
        <div className={type ? styles.cross : styles.vertical}>
          <div className={styles.footerWrap}>
            <div className={styles.logoShow}>
              {partner_list.map((item, index) => (
                <OrgLogo
                  key={item.org_id}
                  name={item.org_name}
                  index={index}
                  src={logoList[index % logoList.length]}
                />
              ))}
            </div>
          </div>
        </div>
        <div
          onClick={() =>
            router.push({
              pathname: '/qfl/sponsor/project/detail',
              query: { projectId: project_id },
            })
          }
        >
          <div className={styles.titleWrap}>
            <div className={styles.titleFirst}>
              <Tooltip title={name}>
                <span className={styles.titlePrimary}>{name}</span>
              </Tooltip>
              {PROJECT_CARD_TAG[type]}
            </div>
            <Tooltip title={desc}>
              <div className={styles.titleSecond}>{desc}</div>
            </Tooltip>
          </div>
        </div>
      </Card>
      <CreateProjectModal
        getTaskList={handleEdit}
        visible={visible}
        info={project_info}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </>
  );
}

export default connect()(TaskCard);
