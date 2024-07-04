import React, { useEffect, useState } from 'react';
import { DatePicker, Form, Input, Select, Table } from 'quanta-design';
import {
  ORDER_STATE,
  DATA_TYPE_TEXT,
  DATA_TYPE,
  MODEL_STATUS_TYPE,
  ORDER_STATE_TYPE,
} from '@/utils/enums';
import ButtonGroup from '@/components/ButtonGroup';
import { formatTime } from '@/utils/helper';
import { getSearchList } from '@/services/resource';
import { router } from 'umi';
import { connect } from 'dva';
import { Tooltip, Typography } from 'antd';
import moment from 'moment';
import styles from './index.less';

const { Paragraph } = Typography;
const { RangePicker } = DatePicker;

function ShareTable(props) {
  const {
    isProvider,
    keyData,
    authOrderBySupplier = {},
    creditOrderBySupplier = {},
    authOrderByApplicant = {},
    creditOrderByApplicant = {},
    providePublishList = {},
    obtainPublishList = {},
    dispatch,
    form,
    keys,
    loading,
    isAuth = false,
    ...restProps
  } = props;
  let dataSource = [];
  let orderNum;
  const [filterVisible, setFilterVisible] = useState(false);
  const [orgList, setOrgList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pSize, setPSize] = useState(10);

  const empty = (
    <div className={styles.emptyData}>{!filterVisible ? '暂无数据' : '暂无匹配数据'}</div>
  );

  const loadData = (params = {}) => {
    if (keyData === 'obtainAuth') {
      dispatch({
        type: 'datasharing/authOrderByApplicant',
        payload: { ...params },
      });
    }
    if (keyData === 'obtainCredit') {
      dispatch({
        type: 'datasharing/creditOrderByApplicant',
        payload: { ...params },
      });
    }
    if (keyData === 'provideAuth') {
      dispatch({
        type: 'datasharing/authOrderBySupplier',
        payload: { ...params },
      });
    }
    if (keyData === 'provideCredit') {
      dispatch({
        type: 'datasharing/creditOrderBySupplier',
        payload: { ...params },
      });
    }

    if (keyData === 'obtainPublish') {
      dispatch({
        type: 'datasharing/handleObainPublishData',
        payload: { ...params },
      });
    }
    if (keyData === 'providePublish') {
      dispatch({
        type: 'datasharing/handleProvidePublishData',
        payload: { ...params },
      });
    }
  };

  const onSearch = async (param = {}) => {
    const data = await form.getFieldsValue();
    const arr = Object.values(data).filter(item => item || item === 0);
    setPSize(param.size);
    const { time } = data;
    const params = {
      ...param,
      ...data,
      page: param.page || 1,
      size: param.size || 10,
      beginTime:
        time !== undefined ? moment(moment(time[0]).format('YYYY-MM-DD')).valueOf() / 1000 : null,
      endTime:
        time !== undefined
          ? moment(
              moment(time[1])
                .add(1, 'days')
                .format('YYYY-MM-DD'),
            ).valueOf() / 1000
          : null,
    };
    delete params.time;
    if (arr.length > 0) {
      setFilterVisible(true);
    } else {
      setFilterVisible(false);
    }
    loadData(params);
    setCurrentPage(param.page || 1);
  };

  const handleRefresh = async ({ current, pageSize }) => {
    onSearch({ page: current, size: pageSize });
  };

  const onReset = () => {
    form.resetFields();
    onSearch();
  };

  useEffect(() => {
    onReset();
  }, [keys]);

  const initData = async () => {
    if (orgList.length === 0) {
      const list = await getSearchList();
      setOrgList(list);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  if (keyData === 'obtainAuth') {
    dataSource = authOrderByApplicant.list;
    orderNum = authOrderByApplicant.total;
  }
  if (keyData === 'obtainCredit') {
    dataSource = creditOrderByApplicant.list;
    orderNum = creditOrderByApplicant.total;
  }
  if (keyData === 'provideAuth') {
    dataSource = authOrderBySupplier.list;
    orderNum = authOrderBySupplier.total;
  }
  if (keyData === 'provideCredit') {
    dataSource = creditOrderBySupplier.list;
    orderNum = creditOrderBySupplier.total;
  }

  if (keyData === 'obtainPublish') {
    dataSource = obtainPublishList.list;
    orderNum = obtainPublishList.total;
  }
  if (keyData === 'providePublish') {
    dataSource = providePublishList.list;
    orderNum = providePublishList.total;
  }

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'order_id',
      key: 'order_id',
      render: text => (
        <div style={{ width: 248 }}>
          <Tooltip title={text}>
            <Paragraph ellipsis={{ rows: 1, expandable: false }}>{text}</Paragraph>
          </Tooltip>
        </div>
      ),
    },
    {
      title: '数据标题',
      dataIndex: 'data_name',
      key: 'data_name',
      render: text => (
        <Tooltip title={text} placement="top">
          <div style={{ cursor: 'default' }} className={styles.hashItem}>
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: '数据类型',
      dataIndex: 'data_type',
      key: 'data_type',
      render: val => DATA_TYPE_TEXT[val],
    },
    {
      title: isProvider ? '下单机构' : '所属机构',
      dataIndex: 'org_name',
      key: 'org_name',
    },
    {
      title: '订单状态',
      dataIndex: 'od_status',
      key: 'od_status',
      render: val => ORDER_STATE[val],
    },
    {
      title: '下单时间',
      dataIndex: 'created_time',
      key: 'created_time',
      render: val => formatTime(val),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) => (
        <a
          onClick={() =>
            router.push(
              `/share/${isProvider ? 'provide' : 'obtain'}/detail?orderId=${
                record.order_id
              }&isProvider=${isProvider}`,
            )
          }
        >
          查看详情
        </a>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.tableFilterWrap}>
        <Form form={form} requiredMark={false} colon={false} layout="inline">
          <Form.Item label="数据标题" name="dataName">
            <Input placeholder="请输入" style={{ width: 190 }} />
          </Form.Item>
          <Form.Item label="数据类型" name="dataType">
            <Select placeholder="请选择" style={{ width: 200 }}>
              {DATA_TYPE.map(item => (
                <Select.Option key={item.key} value={item.key}>
                  {item.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label={isProvider ? '下单机构' : '所属机构'} name="orgName">
            <Select placeholder="请选择" style={{ width: 200 }}>
              {orgList.map(item => (
                <Select.Option key={item.org_id} value={item.org_id}>
                  {item.org_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {keyData !== 'providePublish' && keyData !== 'obtainPublish' && (
            <Form.Item label="订单状态" name="odStatus">
              <Select placeholder="请选择" style={{ width: 200 }}>
                {isAuth
                  ? MODEL_STATUS_TYPE.map(item => (
                      <Select.Option key={item.key} value={item.key}>
                        {item.value}
                      </Select.Option>
                    ))
                  : ORDER_STATE_TYPE.map(item => (
                      <Select.Option key={item.key} value={item.key}>
                        {item.value}
                      </Select.Option>
                    ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item label="下单时间" name="time">
            <RangePicker style={{ width: 320 }} />
          </Form.Item>
          <div style={{ marginLeft: 'auto' }}>
            <ButtonGroup left="重置" right="查询" onClickL={onReset} onClickR={onSearch} />
          </div>
        </Form>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        onChange={handleRefresh}
        pagination={{ total: orderNum, current: currentPage, pageSize: pSize }}
        {...restProps}
        emptyTableText={empty}
        loading={{
          spinning: loading,
        }}
      />
    </div>
  );
}
export default connect(({ datasharing, loading }) => ({
  authOrderBySupplier: datasharing.authOrderBySupplier,
  creditOrderBySupplier: datasharing.creditOrderBySupplier,
  authOrderByApplicant: datasharing.authOrderByApplicant,
  creditOrderByApplicant: datasharing.creditOrderByApplicant,
  obtainPublishList: datasharing.obtainPublishList,
  providePublishList: datasharing.providePublishList,
  loading: loading.global,
}))(ShareTable);
