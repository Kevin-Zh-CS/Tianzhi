import React, { useEffect, useState } from 'react';
import { Button, IconBase, message, Pagination, Tag } from 'quanta-design';
import styles from '@/pages/Share/Platform/index.less';
import NoData from '@/components/NewCheckRepository/noData';
import DataCard from '@/pages/Share/Platform/components/DataCard';
import { getDataAmounts } from '@/services/datasharing';
import { ReactComponent as DoubleArrowUp } from '@/icons/double_arrow_up.svg';
import { ReactComponent as DoubleArrowDown } from '@/icons/double_arrow_down.svg';
import { authList, statusList, typeList } from '@/utils/enums';
import { connect } from 'dva';

let count = -1;
function FilterCard(props) {
  const { orgList = [], dispatch, title, orgs, changeHotKey, dataBrief, topicEmuns } = props;
  const [auth, setAuth] = useState([]);
  const [authStatus, setAuthStatus] = useState([]);
  const [org, setOrg] = useState([]);
  const [dataType, setDataType] = useState([]);
  const [dataTopic, setDataTopic] = useState([]);
  const [visible, setVisible] = useState(false);
  const [dataTitle, setDataTitle] = useState('');
  const [selectAllData, setSelectAllData] = useState([]);
  const [amountList, setAmountList] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState(false);
  const { total, list = [] } = dataBrief;
  const dataList = list.map(obj => (
    <DataCard key={obj.key} {...obj} page={1} dispatch={dispatch} />
  ));

  const orgData = orgList.list
    ? orgList.list.map(item => ({
        key: item.org_id,
        value: item.org_name,
        type: 'org',
      }))
    : [];

  const initAmountData = async params => {
    const data = await getDataAmounts(params);
    setAmountList(data);
  };

  const handleClose = removedTag => {
    if (removedTag.type === 'type') {
      setDataType(dataType.filter(el => el.key !== removedTag.key));
      setSelectAllData(selectAllData.filter(el => el.key !== removedTag.key));
    } else if (removedTag.type === 'theme') {
      setDataTopic(dataTopic.filter(el => el.key !== removedTag.key));
      setSelectAllData(selectAllData.filter(el => el.key !== removedTag.key));
    } else if (removedTag.type === 'auth') {
      setAuth([]);
      setSelectAllData(selectAllData.filter(el => el.key !== removedTag.key));
    } else if (removedTag.type === 'status') {
      setAuthStatus([]);
      setSelectAllData(
        selectAllData.filter(li => li.type !== 'status' && li.type !== 'auth').concat(auth),
      );
    } else if (removedTag.type === 'org') {
      setOrg(org.filter(el => el.key !== removedTag.key));
      setSelectAllData(selectAllData.filter(el => el.key !== removedTag.key));
    }
  };

  const onChange = async (current = 1, is_asc = sort) => {
    const params = {
      title,
      page: current,
      topics: dataTopic.length ? dataTopic.map(item => item.key) : null,
      org_ids: org.length ? org.map(item => item.key) : null,
      data_types: dataType.length ? dataType.map(item => item.key) : null,
      auth_status: authStatus.length ? authStatus[0].key : null,
      order_type: auth.length ? auth[0].key : null,
    };
    dispatch({
      type: 'datasharing/searchData',
      payload: {
        ...params,
        is_asc,
      },
    });
    setCurrentPage(current);
    await initAmountData(params);
  };

  const handleClickFilter = (kind, item) => {
    switch (kind) {
      case 'org':
        if (item === '全部') {
          setOrg([]);
          setSelectAllData(selectAllData.filter(li => li.type !== 'org'));
        } else if (org.map(li => li.key).includes(item.key)) {
          // 如果在筛选条件中
          handleClose(item);
        } else {
          // 如果不在筛选条件中
          setOrg(org.concat(item));
          setSelectAllData(selectAllData.concat(item));
        }
        break;
      case 'auth':
        if (item === '全部') {
          setAuth([]);
          setAuthStatus([]);
          setSelectAllData(selectAllData.filter(li => li.type !== 'auth'));
        } else {
          if (item.key !== 1) {
            setAuthStatus([]);
          }
          setAuth([item]);
          setSelectAllData(
            selectAllData.filter(li => li.type !== 'status' && li.type !== 'auth').concat(item),
          );
        }
        break;
      case 'status':
        if (item === '全部') {
          setAuthStatus([]);
          setSelectAllData(
            selectAllData.filter(li => li.type !== 'status' && li.type !== 'auth').concat(auth),
          );
        } else {
          setAuthStatus([item]);
          setSelectAllData(
            selectAllData.filter(li => li.type !== 'status' && li.type !== 'auth').concat(item),
          );
        }
        break;
      case 'theme':
        if (item === '全部') {
          setDataTopic([]);
          setSelectAllData(selectAllData.filter(li => li.type !== 'theme'));
        } else if (dataTopic.map(li => li.key).includes(item.key)) {
          // 如果在筛选条件中
          handleClose(item);
        } else {
          // 如果不在筛选条件中
          setDataTopic(dataTopic.concat(item));
          setSelectAllData(selectAllData.concat(item));
        }
        break;
      case 'type':
        if (item === '全部') {
          setDataType([]);
          setSelectAllData(selectAllData.filter(li => li.type !== 'type'));
        } else if (dataType.map(li => li.key).includes(item.key)) {
          // 如果在筛选条件中
          handleClose(item);
        } else {
          // 如果不在筛选条件中
          setDataType(dataType.concat(item));
          setSelectAllData(selectAllData.concat(item));
        }
        break;
      default:
        message.error('error');
    }
  };

  const changeTable = e => {
    onChange(e);
  };

  const handleCloseTitle = () => {
    setDataTitle('');
    changeHotKey('');
  };

  const handleClear = () => {
    // 调用接口
    setOrg([]);
    setAuth([]);
    setDataType([]);
    setAuthStatus([]);
    setDataTopic([]);
    setSelectAllData([]);
    handleCloseTitle();
  };

  const handleSort = () => {
    setSort(!sort);
    onChange(1, !sort);
  };

  useEffect(() => {
    dispatch({ type: 'datasharing/orgList' });
    return () => {
      count = -1;
    };
  }, []);

  useEffect(() => {
    setDataTitle(title);
  }, [title]);

  useEffect(() => {
    setOrg(orgs);
    setSelectAllData(orgs);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    count++;
    if (count > 0) {
      onChange();
    }
  }, [auth, dataType, org, dataTopic, authStatus, title]);

  const getTotal = objKey => {
    if (objKey === 'order_type_amounts') {
      return amountList[objKey]
        ? amountList[objKey].reduce(
            (totalPrice, item) =>
              totalPrice +
              item.credit_amount +
              item.auth_amount +
              item.none_auth_amount +
              item.public_amount,
            0,
          )
        : 0;
    }
    if (objKey === 'status_amounts') {
      const amounts = amountList.order_type_amounts;
      return amounts ? amounts[1].auth_amount + amounts[1].none_auth_amount : 0;
    }
    if (objKey === 'data_topic_amounts') {
      return amountList.data_topic_amounts?.total || 0;
    }
    return amountList[objKey] && amountList[objKey].length
      ? amountList[objKey].reduce((totalPrice, item) => totalPrice + item.amount, 0)
      : 0;
  };

  const getItemAmount = (val, objKey, objId) => {
    if (objKey === 'order_type_amounts') {
      if (val.key === 0) {
        return amountList[objKey]?.filter(item => item[objId] === val.key)[0]?.credit_amount || 0;
      }

      if (val.key === 1) {
        return (
          amountList[objKey]?.filter(item => item[objId] === val.key)[0]?.auth_amount +
            amountList[objKey]?.filter(item => item[objId] === val.key)[0]?.none_auth_amount || 0
        );
      }

      if (val.key === 2) {
        return amountList[objKey]?.filter(item => item[objId] === val.key)[0]?.public_amount || 0;
      }
    }

    if (objKey === 'status_amounts') {
      const data = amountList.order_type_amounts?.filter(item => item.order_type === 1);
      if (val.key === 0) {
        return data[0]?.none_auth_amount || 0;
      }

      if (val.key === 1) {
        return data[0]?.auth_amount || 0;
      }
    }

    if (objKey === 'data_topic_amounts') {
      return (
        (amountList.data_topic_amounts &&
          amountList.data_topic_amounts.topics.length > 0 &&
          amountList.data_topic_amounts.topics.filter(item => item[objId] === val.key)[0]
            ?.amount) ||
        0
      );
    }
    return (
      (amountList[objKey] &&
        amountList[objKey].length &&
        amountList[objKey]?.filter(item => item[objId] === val.key)[0]?.amount) ||
      0
    );
  };

  const renderList = (dataLists, data, key, objKey, objId) => (
    <div className={styles.renderList} key={objKey + key}>
      <div
        className={`${styles.option} ${data.length ? '' : styles.selected}`}
        onClick={() => handleClickFilter(key, '全部')}
      >
        <span>全部</span>
        {getTotal(objKey) ? <span style={{ marginLeft: 5 }}>({getTotal(objKey)})</span> : null}
      </div>
      {(dataLists || []).map(val => (
        <div
          key={val.key}
          className={`${styles.option} ${
            data.map(item => item.key).includes(val.key) ? styles.selected : ''
          }`}
          onClick={() => handleClickFilter(key, val)}
        >
          <span className={styles.maxData}>{val.value}</span>
          {getItemAmount(val, objKey, objId) ? (
            <span className={styles.maxAmount}>({getItemAmount(val, objKey, objId)})</span>
          ) : null}
        </div>
      ))}
    </div>
  );

  const selectedList = (selectAllData || []).map(item => (
    <Tag
      bordered
      key={item.value}
      closable
      onClose={() => handleClose(item)}
      style={{ marginRight: 10 }}
    >
      {item.value}
    </Tag>
  ));

  return (
    <div>
      {selectAllData.length > 0 || dataTitle ? (
        <div className={`${styles.filterTerm} container-card`}>
          <span>筛选条件：</span>
          <div className={styles.tagContainer}>
            {dataTitle ? (
              <Tag bordered key="title" closable onClose={handleCloseTitle}>
                关键词：{dataTitle}
              </Tag>
            ) : null}
            {selectAllData.length > 0 ? selectedList : null}
            <Button onClick={handleClear} size="small">
              清除所有选项
            </Button>
          </div>
        </div>
      ) : null}
      <div className={`${styles.filterCard} container-card`}>
        <div className={styles.filterFirstCardItem}>
          <div className={styles.orgCardItem}>
            <div className={styles.title}>所属机构：</div>
            <div className={styles.orgValue}>
              <div className={styles.org}>
                <div className={visible ? styles.orgListMore : styles.orgList}>
                  <div
                    className={`${styles.option} ${org.length ? '' : styles.selected}`}
                    onClick={() => handleClickFilter('org', '全部')}
                  >
                    <span>全部</span>
                    {getTotal('org_amounts') ? (
                      <span style={{ marginLeft: 5 }}>({getTotal('org_amounts')})</span>
                    ) : null}
                  </div>
                  {(orgData || []).map(val => (
                    <div
                      key={val.key}
                      className={`${styles.option} ${
                        org.map(item => item.key).includes(val.key) ? styles.selected : ''
                      }`}
                      onClick={() => handleClickFilter('org', val)}
                    >
                      <span className={styles.maxData}>{val.value}</span>
                      {getItemAmount(val, 'org_amounts', 'org_id') ? (
                        <span className={styles.maxAmount}>
                          ({getItemAmount(val, 'org_amounts', 'org_id')})
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <span
              className={styles.orgMore}
              onClick={() => {
                setVisible(!visible);
              }}
            >
              <span>更多</span>
              <span>
                {visible ? (
                  <IconBase icon={DoubleArrowDown} width={18} height={18} />
                ) : (
                  <IconBase icon={DoubleArrowUp} width={18} height={18} />
                )}
              </span>
            </span>
          </div>
        </div>
        <div className={styles.filterCardItem}>
          <span className={styles.title}>数据类型：</span>
          {renderList(typeList, dataType, 'type', 'data_type_amounts', 'data_type')}
        </div>
        <div className={styles.filterCardItem}>
          <span className={styles.title}>数据主题：</span>
          {renderList(topicEmuns, dataTopic, 'theme', 'data_topic_amounts', 'topic_id')}
        </div>
        <div className={styles.filterCardItem}>
          <span className={styles.title}>共享类型：</span>
          {renderList(authList, auth, 'auth', 'order_type_amounts', 'order_type')}
          {auth?.length > 0 && auth[0].key === 1 && (
            <>
              <span className={styles.title} style={{ marginLeft: 20 }}>
                是否授权：
              </span>
              {renderList(statusList, authStatus, 'status', 'status_amounts', 'none_auth_amount')}
            </>
          )}
        </div>
      </div>
      <div className={`${styles.sort} container-card`}>
        <div className={styles.selectedSort}>
          <span>排序：</span>
          <div onClick={handleSort}>
            <span style={{ float: 'left', marginLeft: 38 }} className={styles.selected}>
              更新时间
            </span>
            <span
              className="quanta-table-column-sorter quanta-table-column-sorter-full"
              style={{ float: 'left' }}
            >
              <span className="quanta-table-column-sorter-inner">
                <span className="anticon anticon-caret-up quanta-table-column-sorter-up">
                  <svg
                    viewBox="0 0 1024 1024"
                    width="12px"
                    height="12px"
                    fill={sort ? '#0076D9' : '#888888'}
                  >
                    <path d="M858.9 689L530.5 308.2c-9.4-10.9-27.5-10.9-37 0L165.1 689c-12.2 14.2-1.2 35 18.5 35h656.8c19.7 0 30.7-20.8 18.5-35z" />
                  </svg>
                </span>
                <span className="anticon anticon-caret-down quanta-table-column-sorter-down">
                  <svg
                    viewBox="0 0 1024 1024"
                    width="12px"
                    height="12px"
                    fill={sort ? '#888888' : '#0076D9'}
                  >
                    <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z" />
                  </svg>
                </span>
              </span>
            </span>
          </div>
        </div>
        <span>为您找到 {total} 条结果</span>
      </div>
      {dataList.length > 0 ? (
        <>
          {dataList}
          {total ? (
            <Pagination
              showQuickJumper
              total={total}
              current={currentPage}
              onChange={changeTable}
              className={styles.pagination}
            />
          ) : null}
        </>
      ) : (
        <NoData hint="暂无匹配数据" style={{ margin: 0, background: 'rgba(0,0,0,0)' }} />
      )}
    </div>
  );
}

export default connect(({ datasharing, global }) => ({
  orgList: datasharing.orgList,
  dataBrief: datasharing.dataBrief,
  topicEmuns: global.topicEmuns,
}))(FilterCard);
