import React, { useState } from 'react';
import { Button, Descriptions, message } from 'quanta-design';
import {
  getAuthData,
  DATA_THEME,
  DATA_PUBLISH_TYPE,
  PUBLISH_INIT_STATUS,
} from '@/pages/Manage/Inner/config';
import styles from './index.less';
import { Byte2AllB, getValidDuration, getValidQuantity, getValidCredit } from '@/utils/helper';
import AuthorizationListModal from '@/pages/Manage/Inner/component/AuthorizationListModal';
import { updateWhitelist } from '@/services/resource';
import ShareRecordModal from '@/pages/Manage/Inner/component/ShareRecordModal';
import RadioPriceCard from '@/components/RadioPriceCard';
import PriceListModal from '@/pages/Manage/component/PriceListModal';
import { APPROVE_CONTENT, PERMISSION, PRIVATE_TYPE_LIST } from '@/utils/enums';

function DataItem(props) {
  const { info, loadData, auth } = props;
  const [authVisible, setAuthVisible] = useState(false);
  const [recordVisible, setRecordVisible] = useState(false);
  const [priceVisible, setPriceVisible] = useState(false);
  const topicsStr = (info.topics || []).map(item => DATA_THEME[item].value);
  const auth_list = (info.auth_list || info.white_lists || []).map(
    item => item.name || item.org_name,
  );

  const handleChooseData = async data => {
    try {
      await updateWhitelist({
        did: info.id || info.file_id || info.did,
        whitelist: data.map(item => item.org_id),
      });
      message.success('授权名单修改成功！');
      loadData();
      setAuthVisible(false);
    } catch (e) {
      message.error('授权名单修改失败！');
    }
  };

  return (
    <div className={styles.contentWrap}>
      <Descriptions column={2}>
        <Descriptions.Item label="数据名称" span={2}>
          {info.title || info.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="数据哈希" span={2}>
          {info.data_hash || info.hash || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="数据类型" span={2}>
          {DATA_PUBLISH_TYPE[info.type]}
        </Descriptions.Item>
        {info.type === 'interface' ? (
          <>
            <Descriptions.Item label="接口地址" span={2}>
              {info.url || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="请求类型" span={2}>
              {info.req_method === 0 ? 'GET' : 'POST'}
            </Descriptions.Item>
          </>
        ) : null}
        {info.type === 'origin' ? null : (
          <Descriptions.Item label="数据大小" span={2}>
            {Byte2AllB(info.size || 0)}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="所属机构" span={2}>
          {info.org_name || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="数据描述" span={2}>
          {info.desc || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="数据主题" span={2}>
          <div className={styles.topicWrap}>
            {topicsStr.length === 0
              ? '-'
              : topicsStr.map(res => <div className={styles.topic}>{res}</div>)}
          </div>
        </Descriptions.Item>
        {info.type === 'file' ? null : (
          <Descriptions.Item label="使用限制" span={2}>
            {info.is_private === null ? '-' : PRIVATE_TYPE_LIST[info.is_private || 'false']}
          </Descriptions.Item>
        )}
        {/* 数据源 */}
        {info.type === 'origin' ? (
          <Descriptions.Item label="是否审核" span={info.need_approval ? 1 : 2}>
            {info.need_approval === null ? '-' : info.need_approval ? '是' : '否'}
          </Descriptions.Item>
        ) : null}
        {info.type === 'origin' && info.need_approval ? (
          <Descriptions.Item label="审核内容" span={1}>
            {APPROVE_CONTENT[info.approve_content]}
          </Descriptions.Item>
        ) : null}
        <Descriptions.Item label="共享类型" span={2}>
          {getAuthData(info.pub_type)}
        </Descriptions.Item>
        {/* eslint-disable-next-line */}
        {info.pub_type === 1 ? (
          <Descriptions.Item label="授权名单" span={2}>
            {info.isPublish && auth && auth.includes(PERMISSION.publish) ? (
              <Button
                size="small"
                type="primary"
                className={styles.editButton}
                onClick={() => setAuthVisible(true)}
                disabled={info.status === PUBLISH_INIT_STATUS.offline}
              >
                编辑授权名单
              </Button>
            ) : null}
            <div className={styles.companyWrap}>
              {auth_list.length > 0
                ? auth_list.map(res => <div className={styles.company}>{res}</div>)
                : '-'}
            </div>
          </Descriptions.Item>
        ) : info.pub_type === 2 ? (
          <Descriptions.Item label="套餐设置" span={2}>
            {info.isPublish && auth && auth.includes(PERMISSION.publish) ? (
              <Button
                size="small"
                type="primary"
                className={styles.editButton}
                onClick={() => setPriceVisible(true)}
                disabled={info.status === PUBLISH_INIT_STATUS.offline}
              >
                编辑套餐设置
              </Button>
            ) : null}
            <div className="radio-price-container">
              {info.packages?.length > 0
                ? info.packages.map(item => (
                    <RadioPriceCard
                      count={getValidDuration(item.duration)}
                      time={getValidQuantity(item.quantity)}
                      price={getValidCredit(item.credit)}
                    />
                  ))
                : '-'}
            </div>
          </Descriptions.Item>
        ) : null}
        {info.isPublish ? (
          <Descriptions.Item label="共享记录" span={2}>
            <Button size="small" type="primary" onClick={() => setRecordVisible(true)}>
              查看共享记录
            </Button>
          </Descriptions.Item>
        ) : null}
      </Descriptions>
      <AuthorizationListModal
        checkedList={info.white_lists || info.auth_list}
        visible={authVisible}
        onCancel={() => setAuthVisible(false)}
        onOk={handleChooseData}
      />
      <ShareRecordModal
        visible={recordVisible}
        dataId={info.id || info.file_id || info.did}
        onCancel={() => setRecordVisible(false)}
      />
      <PriceListModal
        defaultValue={info.packages || [{}]}
        visible={priceVisible}
        dataId={info.id || info.file_id || info.did}
        onCancel={() => setPriceVisible(false)}
        loadData={loadData}
      />
    </div>
  );
}

export default DataItem;
