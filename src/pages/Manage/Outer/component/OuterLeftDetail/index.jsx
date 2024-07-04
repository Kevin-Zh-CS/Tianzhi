import React, { useState, useEffect } from 'react';
import { Button, Descriptions, message, Tag } from 'quanta-design';
import { getFileView, remoteFileView } from '@/services/outer';
import Page from '@/components/Page';
import { connect } from 'dva';
import styles from './index.less';
import { DATA_TYPE, getTopicsStr, getTypeIndex } from '../../config';
import OuterRightDetail from '../OuterRightDetail';
import OriginDetail from './origin-detail';
import ModelDetail from './model-detail';
import InterfaceDetail from './interface-detail';
import ArchiveModal from '../ArchiveModal';
import { getRequestDetail, transfer } from '@/services/outer-data';
import { getAuthData } from '@/pages/Manage/Inner/config';
import AddUser from '@/pages/Manage/component/AddUser';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import RequestRecordModal from '@/pages/Manage/Outer/component/RequestRecordModal';
import { formatTime } from '@/utils/helper';
import { APPROVE_CONTENT, PRIVATE_TYPE } from '@/utils/enums';
import WithLoading from '@/components/WithLoading';

function OuterLeftDetail(props) {
  const [info, setInfo] = useState({});
  const [content, setContent] = useState('');
  const [visible, setVisible] = useState(false);
  const { namespace, type, id, needTransfer, order_id, noAuth, isAlert } = props;
  const [recordVisible, setRecordVisible] = useState(false);
  const canUse = info.is_valid;

  const auth = useAuth({ ns_id: namespace, resource_id: id });
  const getInfo = async () => {
    const data = await getRequestDetail(id);
    setInfo(data);
  };
  const handleBlob = async res => {
    const names = decodeURIComponent(
      res.response.headers
        .get('content-disposition')
        ?.split(';')[1]
        ?.split('=')[1],
    );
    const i = names.lastIndexOf('.');
    const format = names.substring(i);
    const data = await getRequestDetail(id);
    setInfo({ ...data, format: getTypeIndex(format) });
  };

  const handleResult = blob => {
    const reader = new window.FileReader();
    reader.readAsText(blob);
    reader.onload = e => {
      const { result } = e.target;
      const encodingRight = result.indexOf('�') > -1;
      if (encodingRight) {
        reader.readAsText(blob, 'gbk');
      }
      setContent(result);
    };
  };

  const handlePre = () => {
    if (info.data_type === 0) {
      if (namespace) {
        getFileView({ app_key: info.app_key, namespace })
          .then(res => {
            handleBlob(res);
            return res.data;
          })
          .then(blob => {
            handleResult(blob);
          });
      } else {
        remoteFileView({ app_key: info.app_key, location: info.node_id })
          .then(res => {
            handleBlob(res);
            return res.data;
          })
          .then(blob => {
            handleResult(blob);
          });
      }
    }
  };

  const handleOk = async values => {
    setVisible(false);
    await transfer({ target_namespace: values.ns_id, order_id });
    message.success('数据转存成功！');
    getInfo();
  };

  const handleTransfer = () => {
    setVisible(true);
  };

  const getValidTime = t => (t < 0 ? '永久' : formatTime(t));

  const getValidAmount = t => (t < 0 ? '不限' : `${t}次`);

  useEffect(() => {
    getInfo();
  }, [order_id]);
  // type===0:文件管理 ；type===2:模型管理 ；type===1:接口管理 ；type===3:数据源管理（只有左侧）
  const alert = (
    <div className={styles.requestItem}>
      <Descriptions column={3}>
        <Descriptions.Item label="数据状态">
          {info.is_valid ? <Tag color="default">已失效</Tag> : <Tag color="success">生效中</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="到期时间">{getValidTime(info.expired_time)}</Descriptions.Item>
        <Descriptions.Item label="剩余次数">
          {getValidAmount(info.remaining_amount)}
        </Descriptions.Item>
      </Descriptions>
      <div>
        <Button
          onClick={() => {
            setRecordVisible(true);
          }}
        >
          查看请求记录
        </Button>
      </div>
    </div>
  );
  return (
    <div>
      <Page
        title="数据详情"
        showBackIcon
        noContentLayout
        extra={
          <div className={styles.btnWrap}>
            {!noAuth && <AddUser namespace={namespace} resourceId={id} auth={auth} />}
          </div>
        }
        alert={isAlert ? alert : null}
      >
        <div className={styles.contentWrap}>
          <div className={type === 3 ? '' : styles.leftContent}>
            {/* 文件模块基本信息 */}
            <Descriptions
              title="数据元信息"
              extra={
                needTransfer && type === 3 ? (
                  <Button
                    disabled={canUse}
                    onClick={handleTransfer}
                    style={{ marginRight: 12 }}
                    type="primary"
                  >
                    转存
                  </Button>
                ) : null
              }
              column={2}
            >
              <Descriptions.Item label="数据标题" span={2}>
                {info.data_title || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="数据哈希" span={2}>
                {info.data_hash || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="数据类型" span={2}>
                {DATA_TYPE[info.data_type || 0].value}
              </Descriptions.Item>
              <Descriptions.Item label="所属机构" span={2}>
                {info.org_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="数据描述" span={2}>
                {info.data_desc || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="数据主题" span={2}>
                {getTopicsStr(info.data_topics) || '-'}
              </Descriptions.Item>

              <Descriptions.Item label="使用限制" span={2}>
                {PRIVATE_TYPE[info.use_limit || 0]}
              </Descriptions.Item>
              {type === 3 ? (
                <>
                  <Descriptions.Item label="是否审核" span={info.need_approval ? 1 : 2}>
                    {info.need_approval ? '是' : '否'}
                  </Descriptions.Item>
                  {info.need_approval ? (
                    <Descriptions.Item label="审核内容" span={1}>
                      {APPROVE_CONTENT[info.approve_content || 1]}
                    </Descriptions.Item>
                  ) : null}
                </>
              ) : null}
              <Descriptions.Item label="共享类型" span={2}>
                {getAuthData(info.pub_type)}
              </Descriptions.Item>
            </Descriptions>
            {type === 3 ? <OriginDetail info={info} /> : null}
            {type === 2 ? <ModelDetail info={info} /> : null}
            {type === 1 ? <InterfaceDetail info={info} /> : null}
          </div>
          {type !== 3 && (
            <OuterRightDetail
              auth={auth}
              className={styles.rightContent}
              type={type}
              namespace={namespace}
              id={id}
              onPre={handlePre}
              content={content}
              info={info}
              loadData={getInfo}
              needTransfer={needTransfer}
              setTransfer={() => setVisible(true)}
              app_key={info.app_key}
              location={info.node_id}
              noAuth={noAuth}
            />
          )}
        </div>
      </Page>
      <ArchiveModal
        id={info.order_id}
        visible={visible}
        setVisible={setVisible}
        onCancel={() => setVisible(false)}
        onOk={handleOk}
      />
      <RequestRecordModal
        data_id={info.data_id}
        order_id={info.order_id}
        visible={recordVisible}
        onCancel={() => setRecordVisible(false)}
      />
    </div>
  );
}

export default connect(({ global }) => ({
  loading: global.loading,
}))(WithLoading(OuterLeftDetail, { skeletonTemplate: 3 }));
