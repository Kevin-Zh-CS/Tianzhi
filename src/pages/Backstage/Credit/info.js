import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import NewPage from '@/components/NewPage';
import styles from './index.less';
import {
  Tooltip,
  IconBase,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  Spin,
} from 'quanta-design';
import { ReactComponent as questionCircleIcon } from '@/assets/question_circle.svg';
import ItemTitle from '@/components/ItemTitle';
import SelectOrg from '@/components/SelectOrg';
// import { ReactComponent as downloadIcon } from '@/icons/download.svg';
import { creditLedgerBalanceList, creditLedgerList } from '@/services/blacklist';
import moment from 'moment';
import {
  getTotalBalance,
  LIQUIDATION_STATUS,
  SETTLE_STATUS_TAG,
  TX_TYPE,
} from '@/pages/Backstage/Credit/config';
import { getKeyFromList } from '@/pages/Manage/Inner/config';
import { formatTime, getValidCredit } from '@/utils/helper';
import { ReactComponent as Super } from '@/icons/super.svg';
import { ReactComponent as Member } from '@/icons/member.svg';

const { RangePicker } = DatePicker;
function CreditInfo(props) {
  const { orgInfo, dispatch } = props;
  const [form] = Form.useForm();
  const [filterVisible, setFilterVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(false);
  const [info, setInfo] = useState({});

  const loadData = async (page = 1, size = 10, is_time_desc = true) => {
    const params = { page, size, is_time_desc };
    setPSize(size);
    const filterList = await form.getFieldsValue();
    const arr = Object.values(filterList).filter(item => item === 0 || item);
    if (arr.length > 0) {
      setFilterVisible(true);
    } else {
      setFilterVisible(false);
    }
    const dateFormat = 'YYYY-MM-DD';
    const filter = {
      ...filterList,
      begin_time: filterList.time
        ? moment(moment(filterList.time[0]).format(dateFormat)).valueOf() / 1000
        : undefined,
      end_time: filterList.time
        ? moment(
            moment(filterList.time[1])
              .add(1, 'days')
              .format(dateFormat),
          ).valueOf() / 1000
        : undefined,
    };
    if (filter.time) delete filter.time;
    const dataList = await creditLedgerList({ ...params, ...filter });
    setTotal(dataList.total);
    setList(dataList.list);
    setCurrentPage(page);
  };

  const getInitOrgData = async () => {
    const params = {
      org_id: orgInfo.org_id,
      org_name: orgInfo.org_name,
      page: 1,
      size: 10,
    };
    const data = await creditLedgerBalanceList(params, dispatch);
    setInfo(data[0] || {});
  };

  const onFinish = async () => {
    loadData();
  };

  const reset = async () => {
    await form.resetFields();
    await loadData();
    setOrder(false);
  };

  const handleRefresh = async ({ current, pageSize }, filters, sorter) => {
    await loadData(current, pageSize, sorter.order === 'descend' || !sorter.order);
    setOrder(sorter.order);
  };

  // const handleExport = () => {};

  const handleInit = async () => {
    setLoading(true);
    try {
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgInfo && orgInfo.org_id) {
      getInitOrgData();
      handleInit();
    }
  }, [orgInfo]);

  const columns = [
    {
      title: '交易哈希',
      dataIndex: 'tx_hash',
      render: text =>
        text === '-' ? '-' : `${text.substr(0, 8)}...${text.substr(text.length - 8, text.length)}`,
    },
    {
      title: '关联用户',
      dataIndex: 'relate_user_name',
      render: (text, record) => (
        <div>
          {record.is_root ? (
            <IconBase icon={Super} fill="#0076D9" className={styles.iconItem} />
          ) : (
            <IconBase icon={Member} className={styles.iconItem} />
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: (
        <div>
          <span>交易类型</span>
          <Tooltip
            arrowPointAtCenter
            placement="topLeft"
            overlayStyle={{ maxWidth: 520 }}
            title={
              <>
                <div>数据收入：本机构所发布积分共享数据被购买后所获得的积分；</div>
                <div>数据支出：本机构购买其他机构的积分共享数据所支出的积分；</div>
                <div>积分结算：上一周期清算结束后，恢复积分差额使新周期初始可使用积分一致。</div>
              </>
            }
          >
            <IconBase
              style={{ marginLeft: 8 }}
              icon={questionCircleIcon}
              fontSize={20}
              fill="#888888"
            />
          </Tooltip>
        </div>
      ),
      dataIndex: 'tx_type',
      render: text => getKeyFromList(TX_TYPE, text),
    },
    {
      title: '交易积分',
      align: 'right',
      dataIndex: 'amount',
      render: text => (
        <div className={text >= 0 ? styles.success : styles.error}>
          {getTotalBalance(text || 0)}
        </div>
      ),
    },
    {
      title: '清算状态',
      align: 'center',
      dataIndex: 'liquidation_status',
      render: (text, record) => (record.tx_type === 2 ? '-' : SETTLE_STATUS_TAG[text]),
    },
    {
      title: '交易方',
      dataIndex: 'counterparty_org_name',
      render: text => text || '-',
    },
    {
      title: '关联订单号',
      dataIndex: 'relate_order_id',
      render: (text, record) => (record.tx_type === 2 ? '-' : text),
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
      <NewPage title="积分明细" noContentLayout>
        <div className={styles.infoHeader}>
          <div className={styles.infoHeaderBg}>
            <ItemTitle title="积分概览" />
            <div className={styles.infoHeaderContext}>
              <div className={styles.context}>
                <div className={styles.numberContext}>
                  <span className={styles.label}>
                    当前可用积分
                    <Tooltip
                      overlayStyle={{ width: 332 }}
                      arrowPointAtCenter
                      placement="topLeft"
                      title="可用积分即为本机构在周期内的积分使用额度，每一周期清算结束后系统将自动归还或扣除相应的差额。"
                    >
                      <IconBase
                        style={{ marginLeft: 8 }}
                        icon={questionCircleIcon}
                        fontSize={20}
                        fill="#888888"
                      />
                    </Tooltip>
                  </span>
                  <div className={styles.bottom}>
                    <span className={styles.number}>{getValidCredit(info.balance || 0)} Bx</span>
                    <div className={styles.extra}>
                      <div>
                        <span>本期总收入：</span>
                        <span className={styles.extraValue}>
                          {getValidCredit(info.total_revenue || 0)} Bx
                        </span>
                      </div>
                      <div className={styles.extraRight}>
                        <span>本期总支出：</span>
                        <span className={styles.extraValue}>
                          {getValidCredit(info.total_expenditure || 0)} Bx
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {!list.length && !filterVisible ? null : (
          <div className={styles.tableFilterWrap} style={{ marginTop: 12 }}>
            <Form
              form={form}
              layout="inline"
              onFinish={onFinish}
              requiredMark={false}
              colon={false}
            >
              <Form.Item name="user_addr" label="关联用户">
                <Input placeholder="请输入" style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="tx_type" label="交易类型">
                <Select placeholder="请选择" style={{ width: 200 }}>
                  {TX_TYPE.map(item => (
                    <Select.Option key={item.key}>{item.value}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="liquidation_status" label="清算状态">
                <Select placeholder="请选择" style={{ width: 200 }}>
                  {LIQUIDATION_STATUS.map(item => (
                    <Select.Option key={item.key}>{item.value}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="counterparty_org_id" label="交易方">
                <SelectOrg placeholder="请选择" style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="time" label="交易时间">
                <RangePicker style={{ width: 320 }} />
              </Form.Item>
              <div className={styles.btnContainer}>
                <Button onClick={reset}>重置</Button>
                <Button style={{ marginLeft: 8 }} type="primary" htmlType="submit">
                  查询
                </Button>
              </div>
            </Form>
          </div>
        )}
        <div className={styles.tableWrap}>
          {/* <div className={styles.button}> */}
          {/*  <Button */}
          {/*    icon={ */}
          {/*      <IconBase */}
          {/*        style={{ marginRight: 4 }} */}
          {/*        icon={downloadIcon} */}
          {/*        fontSize={20} */}
          {/*        fill="currentColor" */}
          {/*      /> */}
          {/*    } */}
          {/*    disabled={!list.length} */}
          {/*    onClick={handleExport} */}
          {/*  > */}
          {/*    导出明细 */}
          {/*  </Button> */}
          {/* </div> */}
          <Table
            columns={columns}
            dataSource={list}
            onChange={handleRefresh}
            showSorterTooltip={false}
            pagination={{ total, current: currentPage, pageSize: pSize }}
            emptyTableText={
              <div className={styles.emptyData}>{!filterVisible ? '暂无数据' : '暂无匹配数据'}</div>
            }
          />
        </div>
      </NewPage>
    </Spin>
  );
}

export default connect(({ organization, account }) => ({
  userInfo: account.info,
  orgInfo: organization.info,
}))(CreditInfo);
