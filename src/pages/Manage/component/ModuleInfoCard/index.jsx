import React from 'react';
import { IconBase } from 'quanta-design';
import { ReactComponent as FileManageIcon } from '@/icons/file_manage.svg';
import { ReactComponent as DatabaseManageIcon } from '@/icons/database_manage.svg';
import { ReactComponent as DataOriginManageIcon } from '@/icons/data_origin_manage.svg';
import { ReactComponent as InterfaceManageIcon } from '@/icons/interface_manage.svg';
import { ReactComponent as DataImportIcon } from '@/icons/data_import.svg';
import { ReactComponent as ModalManageIcon } from '@/icons/modal_manage.svg';
import styles from './index.less';

function InnerRepositoryCard(props) {
  const typeMap = ['file', 'interface', 'modal', 'origin', 'database', 'import', 'message'];
  const { type = 0, pub_num = 0, unpub_num = 0, total = 0 } = props;
  const moduleMap = {
    file: {
      field: [
        { label: '文件已发布：', value: pub_num },
        { label: '文件未发布：', value: unpub_num },
      ],
      color: '#66ADE8',
      icon: FileManageIcon,
    },
    modal: {
      field: [
        { label: '模型已发布：', value: pub_num },
        { label: '模型未发布：', value: unpub_num },
      ],
      color: '#FFCE84',
      icon: ModalManageIcon,
    },
    interface: {
      field: [
        { label: '接口已发布：', value: pub_num },
        { label: '接口未发布：', value: unpub_num },
      ],
      color: '#EF898E',
      icon: InterfaceManageIcon,
    },
    database: {
      field: [{ label: '数据库已连接：', value: total }],
      color: '#6BE0BF',
      icon: DatabaseManageIcon,
    },
    origin: {
      field: [
        { label: '数据源已发布：', value: pub_num },
        { label: '数据源未发布：', value: unpub_num },
      ],
      color: '#9EEAC5',
      icon: DataOriginManageIcon,
    },
    import: {
      field: [{ label: '数据导入：', value: total }],
      color: '#A581F1',
      icon: DataImportIcon,
    },
    message: {
      // 占位
      field: [],
      color: '',
      icon: '',
    },
  };

  return (
    <>
      {type === 6 ? null : (
        <div className={styles.wrap}>
          <div className={styles.iconWrap}>
            <div
              className={styles.iconBackground}
              style={{ background: moduleMap[typeMap[type]].color }}
            ></div>
            <IconBase icon={moduleMap[typeMap[type]].icon} fill="#fff" />
          </div>
          <div className={styles.contentWrap}>
            {moduleMap[typeMap[type]].field.map((item, index) => (
              <div key={item.label} style={{ marginTop: index > 0 ? 16 : 0 }}>
                <span>{item.label}</span>
                <span>{item.value}个</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default InnerRepositoryCard;
