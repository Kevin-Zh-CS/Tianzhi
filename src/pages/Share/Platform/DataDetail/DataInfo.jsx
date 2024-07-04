import React, { useState } from 'react';
import { Tag, IconBase, Button, Tooltip, Descriptions } from 'quanta-design';
import { router } from 'umi';
import { connect } from 'dva';
import { DATA_THEME, ORDER_TYPE } from '@/utils/enums.js';
import { ReactComponent as WarningIcon } from '@/icons/warning.svg';
import {
  formatTime,
  getValidCredit,
  getValidDuration,
  getValidQuantity,
  toFixPrice,
} from '@/utils/helper';
import { ReactComponent as fileIcon } from '@/icons/file.svg';
import styles from './index.less';
import { getFileIcon } from '@/utils/icons';
import { getStatusText, getStatusTxt } from '@/pages/Share/Platform/config';
import RadioPriceCard from '@/components/RadioPriceCard';

function DataInfo(props) {
  const { dataDetail = {}, info } = props;
  const [activeItem, setActiveItem] = useState(0);

  const handleGet = () => {
    if (!dataDetail.order_type) {
      // activeItem
      const { packages } = dataDetail;
      router.push(
        `/share/platform/confirmorder?dataId=${dataDetail.data_id}&duration=${packages[activeItem].duration}&price=${packages[activeItem].credit}&quantity=${packages[activeItem].quantity}&idx=${activeItem}`,
      );
    } else {
      router.push(`/share/platform/confirmorder?dataId=${dataDetail.data_id}`);
    }
  };

  return (
    <div className={`${styles.dataInfo} container-card`}>
      <div>
        <div className={styles.titleContent}>
          <div className={styles.title}>
            <IconBase
              icon={dataDetail.data_type ? getFileIcon(dataDetail.data_type) : fileIcon}
              width={40}
              height={40}
            />
            <span className={styles.titleTxt}>{dataDetail.data_name}</span>
          </div>
          <div className={styles.time}>更新时间：{formatTime(dataDetail.update_time)}</div>
        </div>
        <div className={styles.infoContent}>
          <div className={styles.subject}>
            {(dataDetail.data_topics || []).map(item => (
              <Tag style={{ marginRight: 4 }} bordered color="processing">
                {DATA_THEME[item].value}
              </Tag>
            ))}
          </div>
          <p className={styles.desc}>{dataDetail.data_desc}</p>
        </div>
        {dataDetail.order_type === ORDER_TYPE.credit ? (
          <Descriptions>
            <Descriptions.Item label="价格">
              <div className={styles.status}>
                <span className={styles.priceText}>
                  {toFixPrice(dataDetail?.packages ? dataDetail?.packages[activeItem]?.credit : 0)}{' '}
                  Bx
                </span>
                <div style={{ display: 'flex', marginTop: 8 }}>
                  <IconBase
                    icon={WarningIcon}
                    fill="#0076D9"
                    style={{ verticalAlign: 'text-top' }}
                  />
                  <span style={{ marginLeft: 4, fontSize: 12, color: '#595959' }}>
                    该数据需用积分购买，购买成功后才能使用。
                  </span>
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="套餐">
              <div>
                {dataDetail.packages?.length > 0
                  ? dataDetail.packages.map((item, index) => (
                      <RadioPriceCard
                        onClick={() => {
                          setActiveItem(index);
                        }}
                        count={getValidDuration(item.duration)}
                        time={getValidQuantity(item.quantity)}
                        price={getValidCredit(item.credit)}
                        active={activeItem === index}
                      />
                    ))
                  : '-'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div className={styles.infoContent}>
            <div className={styles.status}>
              <div className={styles.statusText}>{getStatusTxt(dataDetail)}</div>
              <div style={{ display: 'flex' }}>
                <IconBase icon={WarningIcon} fill="#0076D9" style={{ verticalAlign: 'text-top' }} />
                <span className={styles.statusTip}>{getStatusText(dataDetail, info)}</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.infoContent}>
          <Tooltip
            placement="top"
            title={
              dataDetail.is_same_org
                ? '该数据为本机构发布的数据，请联系所在机构管理员获取权限。'
                : ''
            }
          >
            <Button
              style={{ marginTop: 16 }}
              onClick={handleGet}
              type="primary"
              disabled={dataDetail.is_same_org}
            >
              立即获取
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export default connect(({ account }) => ({
  info: account.info,
}))(DataInfo);
