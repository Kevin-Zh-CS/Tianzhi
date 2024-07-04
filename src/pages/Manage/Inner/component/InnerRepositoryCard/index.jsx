import React, { useState, useEffect } from 'react';
import { IconBase, Icons, Dropdown, Menu, Tooltip, message, Card } from 'quanta-design';
import { Button } from 'antd';
import { router } from 'umi';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import { ReactComponent as EditIcon } from '@/icons/edit.svg';
import CreateRepositoryPng from '@/assets/create_repository.png';
import Rate from './Rate';
import CreateRepositoryModal from '../CreateRepositoryModal';
import styles from './index.less';
import classnames from 'classnames';
import { resourceDelete } from '@/services/resource';
import { PERMISSION } from '@/utils/enums';

const { PlusIcon } = Icons;

function InnerRepositoryCard(props) {
  const { isCreate = false, resource, dispatch = null } = props;
  const checkedList = (resource?.perm_category?.perm_settings || [])
    .filter(li => li.checked === 1 || li.checked === 2)
    .map(item => item.id);
  const [visible, setVisible] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (resource) {
      let t = 0;
      resource.resource_info_list.map(item => {
        t += item.total;
        return item;
      });
      setTotal(t);
    }
  }, [resource]);

  const addCard = () => {
    setIsNew(true);
    setVisible(true);
  };

  const editCard = () => {
    if (checkedList.includes(PERMISSION.edit)) {
      setIsNew(false);
      setVisible(true);
    }
  };

  const handleDelete = async () => {
    await resourceDelete({ namespace: resource.ns_id });
    message.success('删除成功!');
    dispatch({
      type: 'resource/resourceList',
    });
  };

  return (
    <>
      {isCreate ? (
        <div className={styles.create}>
          <img src={CreateRepositoryPng} width={108.42} height={113} alt="Repository img" />
          <Button
            style={{ marginTop: 18, width: 132 }}
            type="primary"
            icon={<PlusIcon fill="#fff" />}
            onClick={addCard}
          >
            新建资源库
          </Button>
        </div>
      ) : (
        <Card
          bordered={false}
          className={`${styles.wrap} hover-style`}
          actions={[
            <span
              className={classnames(
                styles.actionOpt,
                !checkedList.includes(PERMISSION.edit) ? 'disabled-style' : '',
              )}
              onClick={editCard}
            >
              <IconBase className={styles.icon} icon={EditIcon} fill="currentColor" />
              <span>编辑</span>
            </span>,
            total ? (
              <Tooltip title="资源库中已有数据，不支持删除">
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
                      onClick={handleDelete}
                      disabled={total || !checkedList.includes(PERMISSION.del)}
                    >
                      删除
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
          <div
            onClick={() =>
              router.push(`/manage/inner/repository/detail?namespace=${resource.ns_id}`)
            }
          >
            <div>
              <div className={styles.titleFirst}>
                <Tooltip title={resource.ns_name}>
                  <span className={styles.titlePrimary}>{resource.ns_name}</span>
                </Tooltip>
              </div>
              <Tooltip title={resource.ns_desc}>
                <div className={styles.titleSecond}>{resource.ns_desc}</div>
              </Tooltip>
            </div>
            <Rate infoList={resource.resource_info_list} total={total} />
          </div>
        </Card>
      )}

      <CreateRepositoryModal
        resource={resource}
        isNew={isNew}
        visible={visible}
        onOk={() => {
          setVisible(false);
          router.push('/manage/inner/repository');
        }}
        onCancel={() => setVisible(false)}
      />
    </>
  );
}

export default InnerRepositoryCard;
