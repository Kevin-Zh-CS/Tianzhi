import React, { useState, useEffect } from 'react';
import { IconBase, Icons, Dropdown, Menu, Tooltip, Card, message } from 'quanta-design';
import { Button } from 'antd';
import { router } from 'umi';
import { ReactComponent as EditIcon } from '@/icons/edit.svg';
import CreateRepositoryPng from '@/assets/create_repository.png';
import CreateRepositoryModal from '../CreateRepositoryModal';
import styles from './index.less';
import Rate from './Rate';
import { PERMISSION } from '@/utils/enums';
import classnames from 'classnames';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import { outerResourceDelete } from '@/services/outer';

const { PlusIcon } = Icons;
function OuterRepositoryCard(props) {
  const { isCreate = false, resource, loadNewData } = props;
  const checkedList = (resource?.perm_category?.perm_settings || [])
    .filter(li => li.checked === 1 || li.checked === 2)
    .map(item => item.id);
  const [visible, setVisible] = useState(false);
  const [visible1, setVisible1] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (resource) {
      let t = 0;
      resource.list.map(item => {
        t += item.acquired_num;
        return item;
      });
      setTotal(t);
    }
  }, [resource]);

  // 删除
  const deleteResource = async id => {
    await outerResourceDelete({ ns_id: id });
    message.success('删除成功!');
    loadNewData();
  };

  const handleCreatClick = () => {
    setVisible(true);
  };

  const handleUpdateClick = () => {
    if (checkedList.includes(PERMISSION.edit)) {
      setVisible1(true);
    }
  };

  const handleTitleClick = () => {
    router.push(`/manage/outer/repository/detail?namespace=${resource.ns_id}`);
  };

  const handleCreatOk = () => {
    setVisible(false);
    router.push('/manage/outer/repository');
  };

  const handleCreatCancel = () => {
    setVisible(false);
  };

  const handleUpdate = () => {
    setVisible1(false);
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
            onClick={handleCreatClick}
          >
            新建资源库
          </Button>
          <CreateRepositoryModal
            visible={visible}
            onOk={handleCreatOk}
            loadNewData={loadNewData}
            onCancel={handleCreatCancel}
          />
        </div>
      ) : (
        <>
          <Card
            bordered={false}
            className={`${styles.wrap} hover-style`}
            actions={[
              <span
                className={classnames(
                  styles.actionOpt,
                  !checkedList.includes(PERMISSION.edit) ? 'disabled-style' : '',
                )}
                onClick={handleUpdateClick}
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
                        onClick={() => {
                          deleteResource(resource.ns_id);
                        }}
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
            <div onClick={handleTitleClick}>
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
              <Rate infoList={resource.list || []} />
            </div>
          </Card>
          <CreateRepositoryModal
            resource={resource}
            isNew={false}
            visible={visible1}
            namespace={resource.ns_id}
            resourceName={resource.ns_name}
            resourceDesc={resource.ns_desc}
            // resourceType={resource.private_type}
            loadData={loadNewData}
            onOk={handleUpdate}
            onCancel={handleUpdate}
          />
        </>
      )}
    </>
  );
}

export default OuterRepositoryCard;
