import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Alert, Button, message, IconBase, Dropdown, Menu, Table, Pagination } from 'quanta-design';
import ItemTitle from '@/components/ItemTitle';
import Page from '@/components/Page';
import OfflineModal from '@/pages/Manage/Inner/component/OfflineModal';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import { setOffline, getTableList } from '@/services/resource';
import router from 'umi/router';
import { ReactComponent as ShareIcon } from '@/icons/share.svg';
import { share } from '@/utils/helper';
import { PUBLISH_INIT_STATUS } from '@/pages/Manage/Inner/Model/config';
import classnames from 'classnames';
import styles from './index.less';
import ParamTable from '@/pages/Manage/component/ParamTable';
import DataItem from '@/pages/Manage/component/DataItem';
import DataChainItem from '@/pages/Manage/component/DataChainItem';
import WithLoading from '@/components/WithLoading';
import useAuth from '@/pages/Manage/Inner/component/useAuth';

function ModalDetail(props) {
  const {
    id,
    namespace,
    dispatch,
    datasourceDetail,
    dataDetail,
    tableDetailListMongo,
    style,
  } = props;
  const [offlineModalVisible, setOfflineModalVisible] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  const [tableDetailList, setTableDetailList] = useState({});
  const args = dataDetail.args ? JSON.parse(dataDetail.args) : null;
  const columns = [];
  (args?.fields || []).map(v => {
    columns.push({ key: v.name, dataIndex: v.name, title: v.name });
    return false;
  });

  const auth = useAuth({ ns_id: namespace, resource_id: id });
  const loadData = () => {
    dispatch({
      type: 'datasource/datasourceDetail',
      payload: {
        namespace,
        id,
      },
    });
  };

  const handleOk = async () => {
    await setOffline(id);
    setOfflineModalVisible(false);
    message.success('数据下架成功！');
    loadData();
  };

  useEffect(() => {
    dispatch({
      type: 'datasharing/dataDetail',
      payload: {
        dataId: id,
      },
    });

    loadData();
  }, [offlineModalVisible]);

  const goBack = () => {
    if (props.needGoback) {
      router.goBack();
    } else {
      router.replace(`/manage/inner/repository/origin?namespace=${namespace}`);
    }
  };

  const getList = async (current = 1, size = 10) => {
    if (datasourceDetail.db_type !== 'mongo') {
      const data = await getTableList(namespace, {
        namespace,
        table_name: datasourceDetail.table_name,
        db_hash: datasourceDetail.hash,
        args: datasourceDetail.args,
        page: current,
        size,
      });
      setTableDetailList({
        currentPage: current,
        records: data.records,
        total: data.total,
      });
      setShowFloat(true);
    } else {
      dispatch({
        type: 'database/mongoList',
        payload: {
          namespace,
          dbHash: datasourceDetail.hash,
          tableName: datasourceDetail.table_name,
          page: current,
          size,
        },
        callback: () => setShowFloat(true),
      });
    }
  };

  const changePage = current => {
    getList(current);
  };

  const menu = (
    <Menu>
      <Menu.Item>
        <a onClick={() => setOfflineModalVisible(true)} disabled={datasourceDetail.is_offline}>
          下架数据
        </a>
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      <Page
        title="发布详情"
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
        backFunction={goBack}
        status={
          <>
            <Button icon={<IconBase icon={ShareIcon} fill="#888888" />} onClick={share} />
            {datasourceDetail.status === PUBLISH_INIT_STATUS.offline ? null : (
              <Dropdown overlay={menu} placement="bottomRight">
                <div className={styles.dropdownTooltip}>
                  <IconBase style={{ verticalAlign: 'middle' }} icon={MoreIcon} />
                </div>
              </Dropdown>
            )}
          </>
        }
        showBackIcon
        noContentLayout
        className={styles.publishedPage}
      >
        <div style={{ position: 'relative', style }}>
          <div className={classnames(styles.floatModal, showFloat ? '' : styles.hidden)}>
            <div
              className={styles.btn}
              onClick={() => {
                setShowFloat(false);
              }}
            >
              <div className={styles.horizontal} />
            </div>
            <div className={styles.title}>
              <span>{datasourceDetail.title}</span>
            </div>
            <div className={styles.table}>
              <div className="overflowTable pageTable" style={{ width: '100%' }}>
                <Table
                  columns={columns}
                  dataSource={
                    datasourceDetail.db_type !== 'mongo'
                      ? tableDetailList.records
                      : tableDetailListMongo.records
                  }
                  emptyTableText={<div style={{ color: '#888888' }}>暂无数据～</div>}
                  pagination={false}
                />
              </div>
              <div className="overflowPagination">
                <Pagination
                  simple
                  showSizeChanger
                  showQuickJumper
                  total={
                    datasourceDetail.db_type !== 'mongo'
                      ? tableDetailList.total
                      : tableDetailListMongo.total
                  }
                  current={
                    datasourceDetail.db_type !== 'mongo'
                      ? tableDetailList.currentPage
                      : tableDetailListMongo.currentPage
                  }
                  pageSize={10}
                  onChange={changePage}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.contentWrap}>
          <ItemTitle
            title="数据元信息"
            extra={
              <Button
                onClick={() => {
                  getList();
                }}
              >
                查看原始数据
              </Button>
            }
          />
          <DataItem
            auth={auth}
            info={{ ...datasourceDetail, type: 'origin', isPublish: true }}
            loadData={loadData}
          />
          <div style={{ display: 'flex' }}>
            <div style={{ paddingLeft: '12px', color: '#888888', flex: ' 0 0 86px' }}>数据参数</div>
            <div style={{ width: 844 }}>
              <div className={styles.parameters}>
                <ParamTable list={args?.fields || []} />
              </div>
            </div>
          </div>
          <div className={styles.divider} />
          <DataChainItem info={{ ...dataDetail, type: 'origin' }} />
        </div>
      </Page>
      <OfflineModal
        isModalVisible={offlineModalVisible}
        onOk={handleOk}
        handleCancel={() => setOfflineModalVisible(false)}
        id={id}
      />
    </div>
  );
}

export default connect(({ datasource, datasharing, database, loading }) => ({
  datasourceDetail: datasource.datasourceDetail,
  dataDetail: datasharing.dataDetail,
  tableDetailListMongo: database.tableDetailList,
  loading: loading.effects['datasource/datasourceDetail'],
}))(WithLoading(ModalDetail, { skeletonTemplate: 1 }));
