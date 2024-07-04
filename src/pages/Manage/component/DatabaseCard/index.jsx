import React from 'react';
import classNames from 'classnames';
import { IconBase, Menu, Icons, Dropdown, message, Tooltip, Modal } from 'quanta-design';
import { Button } from 'antd';
import { router } from 'umi';
import { connect } from 'dva';
import { ReactComponent as EditIcon } from '@/icons/edit.svg';
import databasePng from '@/assets/database.png';
import styles from './index.less';
import { databaseTypeMap } from '@/pages/Manage/Inner/config';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import { PERMISSION } from '@/utils/enums';
import { getRoleAuth } from '@/utils/helper';
import { deleteDatabase } from '@/services/database';

const { PlusIcon } = Icons;

function DatabaseCard(props) {
  const { database, namespace, isCreate = false, authAll } = props;

  const handleDelete = () => {
    Modal.info({
      title: `确认删除${database.conn_name}数据库连接吗？`,
      content: '删除连接后，该数据库连接将不能使用。',
      onOk: async () => {
        await deleteDatabase({
          namespace,
          dbHash: database.hash,
        });
        message.success('数据库删除成功！');
        window.location.reload();
        Modal.destroyAll();
      },
    });
  };

  const menu = (
    <Menu>
      <Menu.Item
        value="delete"
        onClick={handleDelete}
        disabled={
          (database && database.ds_number > 0) ||
          (database && !getRoleAuth(authAll, database.role).includes(PERMISSION.del))
        }
      >
        <Tooltip
          title={database && database.ds_number > 0 && '当前数据库已有关联发布的数据，不支持删除！'}
        >
          删除连接
        </Tooltip>
      </Menu.Item>
    </Menu>
  );

  const goToDetail = () => {
    router.push(
      `/manage/inner/repository/database/detail?namespace=${namespace}&dbHash=${database.hash}`,
    );
  };

  const goToEdit = () => {
    if (getRoleAuth(authAll, database.role).includes(PERMISSION.edit)) {
      router.push(
        `/manage/inner/repository/database/connect?namespace=${namespace}&dbHash=${database.hash}`,
      );
    }
  };

  return (
    <>
      {isCreate ? (
        <div className={styles.create}>
          <img src={databasePng} width={94} height={82} alt="database img" />
          <Button
            style={{ marginTop: 18, width: 132 }}
            type="primary"
            icon={<PlusIcon fill="#fff" />}
            onClick={() => {
              router.push(`/manage/inner/repository/database/connect?namespace=${namespace}`);
            }}
          >
            连接数据库
          </Button>
        </div>
      ) : (
        <div className={styles.wrap}>
          <div className={styles.content} onClick={goToDetail}>
            <div className={styles.logoIcon}>
              <i className={classNames('iconfont', databaseTypeMap[database.db_type])} />
            </div>
            <div className={styles.titleWrap}>
              <div>
                <Tooltip title={database.conn_name}>
                  <div className={styles.title}>{database.conn_name}</div>
                </Tooltip>
              </div>
              <div className={styles.descWrap}>
                <div className={styles.label}>用户名：</div>
                <div className={styles.value}>{database.username}</div>
              </div>
              <div className={styles.descWrap}>
                <div className={styles.label}>IP 端口：</div>
                <div className={styles.value}>
                  {database.ip}:{database.port}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.footerWrap}>
            <div className={styles.footerOpt}>
              <span
                className={classNames(
                  styles.actionOpt,
                  !getRoleAuth(authAll, database.role).includes(PERMISSION.edit)
                    ? 'disabled-style'
                    : '',
                )}
                onClick={goToEdit}
              >
                <IconBase className={styles.icon} icon={EditIcon} fill="currentColor" />
                <span>编辑</span>
              </span>
            </div>
            <div className={styles.footerOpt}>
              <Dropdown overlay={menu} overlayStyle={{ minWidth: 120 }} placement="bottomLeft">
                <span className={styles.actionOpt} onClick={e => e.stopPropagation()}>
                  <IconBase className={styles.icon} icon={MoreIcon} fill="currentColor" />
                  更多
                </span>
              </Dropdown>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default connect(({ database, account }) => ({
  databaseList: database.databaseList,
  authAll: account.authAll,
}))(DatabaseCard);
