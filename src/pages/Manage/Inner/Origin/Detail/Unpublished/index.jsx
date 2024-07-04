import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Alert, Button, IconBase, Pagination, Table } from 'quanta-design';
import router from 'umi/router';
import Page from '@/components/Page';
import { ReactComponent as UserGroupIcon } from '@/icons/user_group.svg';
import { ReactComponent as ShareIcon } from '@/icons/share.svg';
import styles from './index.less';
import { share } from '@/utils/helper';
import { getTableList } from '@/services/resource';
import ParamTable from '@/pages/Manage/component/ParamTable';
import DataItem from '@/pages/Manage/component/DataItem';
import WithLoading from '@/components/WithLoading';
import useAuth from '@/pages/Manage/Inner/component/useAuth';

function ModalDetail(props) {
  const { location, dispatch, datasourceDetail, tableDetailListMongo, style } = props;
  const { namespace, id } = location.query;
  const args = datasourceDetail.args ? JSON.parse(datasourceDetail.args) : null;
  const [tableDetailList, setTableDetailList] = useState({});
  const columns = [];
  (args?.fields || []).map(v => {
    columns.push({ key: v.name, dataIndex: v.name, title: v.name });
    return false;
  });

  const auth = useAuth({ ns_id: namespace, resource_id: id });
  const getList = async (current = 1, size = 5) => {
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
      });
    }
  };

  const changePage = current => {
    getList(current);
  };

  useEffect(() => {
    dispatch({
      type: 'datasource/datasourceDetail',
      payload: {
        namespace,
        id,
      },
    });
  }, []);

  useEffect(() => {
    if (datasourceDetail.did === id) {
      getList();
    }
  }, [datasourceDetail.hash]);

  return (
    <div>
      <Page
        title="数据详情"
        alert={
          <Alert
            type="info"
            message="温馨提示：数据发布时仅发布数据元信息（如数据名称、数据描述等）至区块链，并可为某些机构设置默认的数据访问权限；原始数据不发布。"
            showIcon
            // closable
          />
        }
        status={
          <>
            <Button icon={<IconBase icon={ShareIcon} fill="#888888" />} onClick={share} />
            <Button
              style={{ display: 'none' }}
              icon={<IconBase icon={UserGroupIcon} fill="#888888" />}
            />
            <Button
              type="primary"
              onClick={() => {
                router.push(
                  `/manage/inner/repository/origin/publish?namespace=${namespace}&id=${id}`,
                );
              }}
            >
              发布
            </Button>
          </>
        }
        showBackIcon
        noContentLayout
        className={styles.unpublishedPage}
      >
        <div className={styles.contentWrap} style={style}>
          <DataItem info={{ ...datasourceDetail, type: 'origin' }} auth={auth} />
          <div style={{ display: 'flex', marginBottom: 20 }}>
            <div style={{ paddingLeft: '12px', color: '#888888', flex: ' 0 0 86px' }}>数据参数</div>
            <div style={{ width: 844 }}>
              <div className={styles.parameters}>
                <div className={styles.paramTable}>
                  <ParamTable list={args?.fields || []} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ paddingLeft: '12px', color: '#888888', flex: ' 0 0 86px' }}>数据内容</div>
            <div style={{ width: 844 }}>
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
                  pageSize={5}
                  onChange={changePage}
                />
              </div>
            </div>
          </div>
        </div>
      </Page>
    </div>
  );
}

export default connect(({ datasource, database, loading }) => ({
  datasourceDetail: datasource.datasourceDetail,
  tableDetailListMongo: database.tableDetailList,
  loading: loading.effects['datasource/datasourceDetail'],
}))(WithLoading(ModalDetail, { skeletonTemplate: 1 }));
