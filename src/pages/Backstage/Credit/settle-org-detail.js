import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import NewPage from '@/components/NewPage';
import styles from './index.less';
import { Button, Table, Modal, message, Spin } from 'quanta-design';
import ItemTitle from '@/components/ItemTitle';
import expenditureIcon from '@/assets/blacklist/expenditure.png';
import revenueIcon from '@/assets/blacklist/revenue.png';
import { SETTLE_STATUS_TAG, TX_TYPE, getTotalBalance, warningIcon, successIcon } from './config';
import { formatTime, getValidCredit } from '@/utils/helper';
import { confirmLotsCredit, queryCycleList } from '@/services/blacklist';
import { getKeyFromList } from '@/pages/Manage/Inner/config';

function SettleOrgDetail(props) {
  const { location, orgInfo } = props;
  const {
    query: { liquid_cycle_id, target_org_id, liquid_cycle_index },
  } = location;
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState({});
  const [order, setOrder] = useState(false);
  const loadData = async (page = 1, size = 10, is_time_desc = true) => {
    const params = {
      page,
      size,
      is_time_desc,
      org_id: orgInfo.org_id,
      liquid_cycle_id,
      target_org_id,
    };
    try {
      setLoading(true);
      const data = await queryCycleList(params);
      setTotal(data.total);
      setList(data.list);
      setInfo(data.liquidation_info);
      setCurrentPage(page);
    } finally {
      setLoading(false);
    }
  };

  const confirmLoadData = () => {
    setTimeout(async () => {
      try {
        const data = await queryCycleList({
          page: 1,
          size: 10,
          is_time_desc: true,
          org_id: orgInfo.org_id,
          liquid_cycle_id,
          target_org_id,
        });
        if (!data.liquidation_info.is_confirmed) {
          confirmLoadData();
        } else {
          setList(data.list);
          setInfo(data.liquidation_info);
          setCurrentPage(1);
          setTotal(data.total);
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    }, 3000);
  };

  const handleRefresh = async ({ current, pageSize }, filters, sorter) => {
    await loadData(current, pageSize, sorter.order === 'descend' || !sorter.order);
    setOrder(sorter.order);
  };

  // const handleExport = () => {
  //   // 处理导出逻辑
  //   message.success('当前机构间明细导出成功！');
  // };

  const confirmSettle = () => {
    Modal.info({
      title: '确认当前机构间的清算吗？',
      content: '确认后，待关联双方都确认，即结束当前机构间的清算。',
      style: { top: 240 },
      onOk: async () => {
        const params = {
          liquid_cycle_id,
          list: [
            {
              liquid_cycle_index,
              org_id: orgInfo.org_id,
              target_org_id,
            },
          ],
        };
        await confirmLotsCredit(params);
        message.success('机构间清算确认成功！');
        Modal.destroyAll();
        setLoading(true);
        confirmLoadData();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  useEffect(() => {
    if (orgInfo && orgInfo.org_id) {
      loadData();
    }
  }, [orgInfo]);

  const columns = [
    {
      title: '交易哈希',
      dataIndex: 'tx_hash',
      render: text => `${text.substr(0, 8)}...${text.substr(text.length - 8, text.length)}`,
    },
    {
      title: '交易类型',
      align: 'center',
      dataIndex: 'tx_type',
      render: text => getKeyFromList(TX_TYPE, text),
    },
    {
      title: '交易积分',
      align: 'right',
      dataIndex: 'amount',
      render: text => <div>{getTotalBalance(text)}</div>,
    },
    {
      title: '关联订单号',
      align: 'left',
      dataIndex: 'related_order_id',
    },
    {
      title: '交易时间',
      dataIndex: 'tx_time',
      render: text => <div>{formatTime(text)}</div>,
      sorter: true,
      sortOrder: order,
    },
  ];

  return (
    <Spin spinning={loading}>
      <NewPage
        title="机构间清算明细"
        extra={
          <>
            {/* <Button onClick={handleExport}>导出明细</Button> */}
            {info.is_confirmed ? null : (
              <Button style={{ marginLeft: 12 }} type="primary" onClick={confirmSettle}>
                确认清算
              </Button>
            )}
          </>
        }
        onBack={() => router.goBack()}
        noContentLayout
      >
        <div className={`container-card ${styles.orgDetail}`}>
          <ItemTitle
            title="积分概览"
            extra={
              <div className={styles.itemTitleExtra}>
                <div>
                  <span className={styles.label}>本机构：</span>
                  <span>{info.is_confirmed ? successIcon : warningIcon}</span>
                </div>
                <div>
                  <span className={styles.label}>对方机构：</span>
                  <span>{info.is_target_confirmed ? successIcon : warningIcon}</span>
                </div>
              </div>
            }
          />
          <div style={{ padding: '0 12px' }}>
            <div className={styles.settleOrgTop}>
              <div>
                <span className={styles.normalTitle}>
                  {info.org_name} - {info.target_org_name}
                </span>
                <span className={styles.tag}>
                  {SETTLE_STATUS_TAG[info.liquidation_status || 0]}
                </span>
              </div>
              <div>
                <span className={styles.totalTxt}>本机构收支总计：</span>
                <span className={styles.normalPrice}>{getTotalBalance(info.total_amount)}</span>
              </div>
            </div>

            <div className={styles.settleStat}>
              <div className={`${styles.settleStatItem} ${styles.warningItem}`}>
                <img src={revenueIcon} alt="" />
                <span className={styles.totalLabel}>
                  总支出 {info.expenditure_tx_amount} 笔，合计：
                </span>
                <span className={styles.totalValue}>{getValidCredit(info.expenditure)} Bx</span>
              </div>
              <div className={`${styles.settleStatItem} ${styles.successItem}`}>
                <img src={expenditureIcon} alt="" />
                <span className={styles.totalLabel}>
                  总收入 {info.revenue_tx_amount} 笔，合计：
                </span>
                <span className={styles.totalValue}>{getValidCredit(info.revenue)} Bx</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <ItemTitle title="清算明细" />
          <div style={{ padding: '0 12px' }}>
            <Table
              columns={columns}
              dataSource={list}
              onChange={handleRefresh}
              pagination={{ total, current: currentPage }}
              emptyTableText={<div className={styles.emptyData}>暂无数据</div>}
            />
          </div>
        </div>
      </NewPage>
    </Spin>
  );
}

export default connect(({ organization, account }) => ({
  userInfo: account.info,
  orgInfo: organization.info,
}))(SettleOrgDetail);
