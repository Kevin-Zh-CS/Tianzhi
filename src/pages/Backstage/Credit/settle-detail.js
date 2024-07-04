import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import NewPage from '@/components/NewPage';
import styles from './index.less';
import { SETTLE_STATUS_TAG, warning, success, getTotalBalance, SETTLE_STATUS } from './config';
import { Divider, Descriptions, Table, Modal, message, Spin } from 'quanta-design';
import ItemTitle from '@/components/ItemTitle';
import { formatDate, formatTime, getValidCredit } from '@/utils/helper';
import { confirmLotsCredit, getCycleDetail } from '@/services/blacklist';

function SettleDetail(props) {
  const { location, orgInfo } = props;
  const {
    query: { id = '', index = '' },
  } = location;
  const [selectedRowKeysList, setSelectedRowKeysList] = useState([]);
  const [selectedRowsList, setSelectRowList] = useState([]);
  const [order, setOrder] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dataList, setDataList] = useState([]);
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const loadList = async (page = 1, size = 10, is_time_desc = true) => {
    setLoading(true);
    try {
      const data = await getCycleDetail({
        page,
        size,
        is_time_desc,
        liquid_cycle_id: id,
        org_id: orgInfo.org_id,
        liquid_cycle_index: index,
      });
      setDataList(data.liquidation_relate_orgs);
      setInfo(data.liquidation_info);
      setCurrentPage(page);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  const confirmLoadData = () => {
    setTimeout(async () => {
      try {
        await loadList(currentPage);
        setSelectedRowKeysList([]);
        setSelectRowList([]);
      } catch (e) {
        setLoading(false);
      }
    }, 6000);
  };

  useEffect(() => {
    if (orgInfo && orgInfo.org_id) {
      loadList();
    }
  }, [orgInfo]);

  const goToDetail = record => {
    router.push(
      `/backstage/credit/settle/org/detail?liquid_cycle_id=${id}&target_org_id=${record.target_org_id}&liquid_cycle_index=${index}`,
    );
  };

  const columns = [
    {
      title: '交易双方',
      dataIndex: 'target_org_name',
      render: (text, record) => `${record.org_name} - ${text}`,
    },
    {
      title: '清算状态',
      align: 'center',
      dataIndex: 'liquidation_status',
      render: text => SETTLE_STATUS_TAG[text] || '-',
    },
    {
      title: '总收入',
      align: 'right',
      dataIndex: 'revenue',
      render: text => <div>{getValidCredit(text)} Bx</div>,
    },
    {
      title: '总支出',
      align: 'right',
      dataIndex: 'expenditure',
      render: text => <div>{getValidCredit(text)} Bx</div>,
    },
    {
      title: '收支总计',
      align: 'right',
      dataIndex: 'total_amount',
      render: text => <div>{getTotalBalance(text)}</div>,
    },
    {
      title: '确认状态',
      align: 'center',
      dataIndex: 'is_target_confirmed',
      render: text => (text ? success : warning),
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      render: text => <div>{formatTime(text)}</div>,
      sorter: true,
      sortOrder: order,
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_, record) => (
        <span className="operate" onClick={() => goToDetail(record)}>
          {record.is_confirmed ? '查看详情' : '立即清算'}
        </span>
      ),
    },
  ];

  const handleChangeList = async ({ current, pageSize }, filters, sorter) => {
    await loadList(current, pageSize, sorter.order === 'descend' || !sorter.order);
    setOrder(sorter.order);
  };

  const handleOk = () => {
    if (selectedRowKeysList.length) {
      Modal.info({
        title: `确认批量提交当前已选${selectedRowKeysList.length}项清算条目？`,
        content: '提交后，已选中的清算条目将一并处理为本机构“已确认”的状态。',
        style: { top: 240 },
        onOk: async () => {
          // 调用接口params
          const list = selectedRowsList.map(item => ({
            liquid_cycle_index: index,
            org_id: item.org_id,
            target_org_id: item.target_org_id,
          }));
          const params = {
            list,
            liquid_cycle_id: id,
          };
          await confirmLotsCredit(params);
          message.success('机构间清算批量确认成功！');
          Modal.destroyAll();
          setLoading(true);
          confirmLoadData();
        },
        onCancel: () => {
          Modal.destroyAll();
        },
      });
    }
  };

  const handleRowChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeysList(selectedRowKeys);
    setSelectRowList(selectedRows);
  };

  const handleCancel = () => {
    setSelectedRowKeysList([]);
    setSelectRowList([]);
  };

  // const handleExport = () => {
  //   message.success('当前周期明细导出成功！');
  // };

  return (
    <Spin spinning={loading}>
      <NewPage title="清算周期详情" onBack={() => router.goBack()} noContentLayout>
        <div className={styles.settleHeader}>
          <div className={styles.settleHeaderBg}>
            <div className={styles.settleHeaderTop}>
              <div>
                <span className={styles.title}>{info.name}</span>
                <span className={styles.tag}>
                  {SETTLE_STATUS_TAG[info.liquidation_status || 0]}
                </span>
              </div>
              <div>
                <span className={styles.totalTxt}>本机构收支总计：</span>
                <span className={styles.totalPrice}>{getTotalBalance(info.total_amount || 0)}</span>
              </div>
            </div>

            <Divider />
            <Descriptions labelStyle={{ width: 90 }} column={2}>
              <Descriptions.Item label="清算发起方">{info.initiator_org_name}</Descriptions.Item>
              <Descriptions.Item label="周期区间">
                {formatDate(info.begin_time)} 至 {formatDate(info.end_time)}
              </Descriptions.Item>
              <Descriptions.Item label="发起时间">{formatTime(info.create_time)}</Descriptions.Item>
              <Descriptions.Item label="结束时间">
                {info.liquidation_status === SETTLE_STATUS.success
                  ? formatTime(info.finished_time)
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <ItemTitle
            title="清算总单"
            // extra={<Button onClick={handleExport}>导出明细</Button>}
          />
          <div className={styles.settleContainer}>
            {selectedRowKeysList.length ? (
              <div className={styles.selectRow}>
                <div>
                  <span>已选择 {selectedRowKeysList.length} 项</span>
                  <span className={styles.confirm} onClick={handleOk}>
                    批量确认
                  </span>
                </div>
                <span className={styles.cancel} onClick={handleCancel}>
                  取消选择
                </span>
              </div>
            ) : null}
            <Table
              columns={columns}
              dataSource={dataList}
              rowKey="target_org_id"
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys: selectedRowKeysList,
                getCheckboxProps: record => ({
                  disabled: record.is_confirmed,
                  // Column configuration not to be checked
                  // name: record.name,
                }),
                onChange: handleRowChange,
              }}
              onChange={handleChangeList}
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
}))(SettleDetail);
