import React, { useEffect, useState } from 'react';
import { Alert } from 'quanta-design';
import Page from '@/components/Page';
import router from 'umi/router';
import ResultStatusWithIcon from '@/components/ResultStatusWithIcon';
import styles from './index.less';
import { modeInfo } from '@/services/resource-model';

function Success(props) {
  const {
    location: { query },
  } = props;
  const { namespace, id } = query;
  const [info, setInfo] = useState({});

  const primary = () => {
    router.replace(
      `/manage/inner/repository/model/detail/published?namespace=${namespace}&id=${id}`,
    );
  };

  const common = () => {
    router.replace(`/manage/inner/repository/model?namespace=${namespace}`);
  };

  const getInfo = async () => {
    const data = await modeInfo(namespace, id);
    setInfo(data);
  };

  useEffect(() => {
    getInfo();
  }, []);

  return (
    <>
      <Page
        title="发布数据"
        noContentLayout
        showBackIcon
        backFunction={common}
        alert={
          <Alert
            type="info"
            message="温馨提示：数据发布时仅发布数据元信息（如数据标题、数据描述等）至区块链，并可为某些机构设置默认的数据访问权限；原始数据不发布。"
            showIcon
          />
        }
      ></Page>
      <div className={styles.statusWrap}>
        <ResultStatusWithIcon
          status="success"
          title="数据发布成功"
          desc="已将数据元信息发布到区块链上。"
          withButton
          buttonStatus={{
            primary: {
              title: '查看详情',
              callbackFunc: primary,
            },
            common: {
              title: '继续发布',
              callbackFunc: common,
            },
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <div className={styles.successWrap}>
            <div className={styles.contentItem}>
              <div className={styles.label}>数据标题</div>
              <div className={styles.value}>{info.title}</div>
            </div>
            <div className={styles.contentItem}>
              <div className={styles.label}>数据哈希</div>
              <div className={styles.value}>{info.hash}</div>
            </div>
            <div className={styles.contentItem}>
              <div className={styles.label}>数据类型</div>
              <div className={styles.value}>模型</div>
            </div>
            <div className={styles.contentItem}>
              <div className={styles.label}>所属机构</div>
              <div className={styles.value}>{info.org_name}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Success;
