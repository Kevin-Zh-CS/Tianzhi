import React, { useEffect } from 'react';
import { Alert } from 'quanta-design';
import { connect } from 'dva';
import Page from '@/components/Page';
import router from 'umi/router';
import ResultStatusWithIcon from '@/components/ResultStatusWithIcon';
import styles from './index.less';

function Overview(props) {
  const { location, datasourceDetail, orgInfo, dispatch } = props;

  const primary = () => {
    switch (location.pathname) {
      case '/manage/inner/repository/model/publish/success':
        router.push('/manage/inner/repository/model/detail/published');
        break;
      case '/manage/inner/repository/interface/publish/success':
        router.push('/manage/inner/repository/interface/detail/published');
        break;
      case '/manage/inner/repository/origin/publish/success':
        router.push(
          `/manage/inner/repository/origin/detail/published?namespace=${location.query.namespace}&id=${datasourceDetail.did}`,
        );
        break;
      case '/manage/inner/repository/file/publish/success':
        router.push('/manage/inner/repository/file/detail/published');
        break;
      default:
        router.push('/');
        break;
    }
  };

  const common = () => {
    switch (location.pathname) {
      case '/manage/inner/repository/model/publish/success':
        router.push('/manage/inner/repository/model');
        break;
      case '/manage/inner/repository/interface/publish/success':
        router.push('/manage/inner/repository/interface');
        break;
      case '/manage/inner/repository/origin/publish/success':
        router.push(`/manage/inner/repository/origin?namespace=${location.query.namespace}`);
        break;
      case '/manage/inner/repository/file/publish/success':
        router.push('/manage/inner/repository/file');
        break;
      default:
        router.push('/');
        break;
    }
  };

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'datasource/datasourceDetail',
        payload: {
          namespace: location.query.namespace,
          id: location.query.id,
        },
      });
      dispatch({
        type: 'organization/info',
      });
    }
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
            message={
              <span>
                温馨提示：数据发布时仅发布数据元信息（如数据标题、数据描述等）至区块链，并可为某些机构设置默认的数据访问权限；原始数据不发布。
              </span>
            }
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
          <div className={styles.contentWrap}>
            <div className={styles.contentItem}>
              <div className={styles.label}>数据标题</div>
              <div className={styles.value}>{datasourceDetail.title}</div>
            </div>
            <div className={styles.contentItem}>
              <div className={styles.label}>数据哈希</div>
              <div className={styles.value}>{datasourceDetail.did}</div>
            </div>
            <div className={styles.contentItem}>
              <div className={styles.label}>数据类型</div>
              <div className={styles.value}>数据源</div>
            </div>
            <div className={styles.contentItem}>
              <div className={styles.label}>所属机构</div>
              <div className={styles.value}>{orgInfo.name}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default connect(({ datasource, organization }) => ({
  datasourceDetail: datasource.datasourceDetail,
  orgInfo: organization.info,
}))(Overview);
