import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { connect } from 'dva';
import { formatTime } from '@/utils/helper';
import { PUBLISH_STATUS, PERMISSION } from '@/utils/enums';
import {
  Input,
  Button,
  Table,
  Form,
  DatePicker,
  IconBase,
  Select,
  Tag,
  Icons,
  Alert,
  message,
  Popconfirm,
} from 'quanta-design';
import Page from '@/components/NewPage';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import router from 'umi/router';
import Step from '../../component/Step';
import styles from './index.less';
import moment from 'moment';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import { databaseTypeMap } from '@/pages/Manage/Inner/config';
import { PUBLISH_INIT_STATUS } from '@/pages/Manage/Inner/Model/config';

const { RangePicker } = DatePicker;
const { PlusIcon } = Icons;
const tagColor = ['warning', 'success', 'default'];
const stepData = [
  {
    title: '选择数据库',
    content: '发起设置数据源信息的请求，选择已连接数据库',
  },
  {
    title: '选择数据库表字段',
    content: '打开已连接的数据库，选择需要发布的数据库字段',
  },
  {
    title: '发布库表元信息',
    content: '将数据元信息发布至数据共享平台，进行数据共享',
  },
];

const stepCurrent = 1;
const { QuestionCircleIcon } = Icons;

function OriginManage(props) {
  const [showAlert, setShowAlert] = useState(true);
  const { datasourceList, location, dispatch, loading } = props;
  const [currentPage, setCurrentPage] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [filterVisible, setFilterVisible] = useState(false);
  const [order, setOrder] = useState(false);
  const [form] = Form.useForm();

  const auth = useAuth({ ns_id: location.query.namespace });

  const loadData = async (params = { page: 1, size: 10 }) => {
    const data = await form.getFieldsValue();
    setPSize(params.size);
    const { status, dataName, time } = data;
    const res = await dispatch({
      type: 'datasource/datasourceList',
      payload: {
        ...params,
        status,
        namespace: location.query.namespace,
        name: dataName ? encodeURIComponent(dataName) : '',
        beginTime:
          typeof time !== 'undefined'
            ? moment(moment(time[0]).format('YYYY-MM-DD')).valueOf() / 1000
            : '',
        endTime:
          typeof time !== 'undefined'
            ? moment(
                moment(time[1])
                  .add(1, 'days')
                  .format('YYYY-MM-DD'),
              ).valueOf() / 1000
            : '',
      },
    });
    setCurrentPage(params.page);
    const arr = Object.values(data).filter(item => item || item === 0);
    let _showAlert;
    if (arr.length > 0) {
      _showAlert = false;
    } else {
      _showAlert = res.total === 0;
    }
    return _showAlert;
  };

  const handleRefresh = async (e = {}, _, sorter = {}) => {
    const { current = 1, pageSize = 10 } = e;
    setCurrentPage(current);
    const filterList = await form.validateFields();
    const arr = Object.values(filterList).filter(item => item || item === 0);
    if (arr.length > 0) {
      setFilterVisible(true);
    } else {
      setFilterVisible(false);
    }
    setOrder(sorter.order);
    const _showAlert = await loadData({
      page: current,
      size: pageSize,
      isAsc: sorter.order === 'ascend',
    });
    return _showAlert;
  };

  useEffect(() => {
    handleRefresh().then(_showAlert => setShowAlert(_showAlert));
  }, []);

  const reset = async () => {
    form.resetFields();
    const _showAlert = await loadData();
    setShowAlert(_showAlert);
    setOrder(false);
  };

  const deleteData = record => {
    const hash = record.did;
    dispatch({
      type: 'datasource/deleteDatasource',
      payload: {
        namespace: location.query.namespace,
        hash,
      },
    })
      .then(() => {
        message.success('数据删除成功！');
        loadData();
      })
      .catch(() => {
        message.error('数据删除失败！');
      });
  };

  const goToDetail = record => {
    router.push(
      record.status === 0
        ? `/manage/inner/repository/origin/detail/unpublished?namespace=${location.query.namespace}&id=${record.did}`
        : `/manage/inner/repository/origin/detail/published?namespace=${location.query.namespace}&id=${record.did}`,
    );
  };

  const goToPublish = record => {
    router.push(
      `/manage/inner/repository/origin/publish?namespace=${location.query.namespace}&id=${record.did}`,
    );
  };

  const goToDatabase = () => {
    router.push(`/manage/inner/repository/database?namespace=${props.location.query.namespace}`);
  };

  const columns = [
    {
      title: '数据名称',
      dataIndex: 'name',
      render: (text, record) => (
        <div className={styles.logoIcon}>
          <i className={classNames('iconfont', databaseTypeMap[record.db_type])} />
          {text}
        </div>
      ),
    },
    {
      title: '数据哈希',
      dataIndex: 'data_hash',
    },
    {
      title: '发布状态',
      dataIndex: 'status',
      render: index => <Tag color={tagColor[index]}>{PUBLISH_STATUS[index]}</Tag>,
    },
    {
      title: '修改时间',
      dataIndex: 'update_time',
      sorter: true,
      sortOrder: order,
      render: date => formatTime(date),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) => (
        <>
          <span
            className="operate"
            onClick={() => {
              goToDetail(record);
            }}
          >
            详情
          </span>
          {auth.includes(PERMISSION.publish) && record.status === PUBLISH_INIT_STATUS.init && (
            <div className="operate" onClick={() => goToPublish(record)}>
              发布
            </div>
          )}
          {auth.includes(PERMISSION.del) && (
            <Popconfirm
              className="operate"
              title="你确定要删除该所选数据吗?"
              icon={<QuestionCircleIcon fill="#0076D9" />}
              onConfirm={() => deleteData(record)}
            >
              <span>删除</span>
            </Popconfirm>
          )}
        </>
      ),
    },
  ];

  const extra = (
    <div
      className="alert-trigger-wrap"
      onClick={() => {
        setShowAlert(!showAlert);
      }}
    >
      数据源管理使用说明
      <IconBase className={showAlert ? 'up' : 'down'} icon={ArrowsDown} fill="#888888" />
    </div>
  );

  const alert = (
    <>
      <Alert
        showIcon
        type="info"
        message="数据源管理的功能定义：数据源管理是对数据库中选中对库表发布进行统一管理，前提是需要连接数据库。"
      />
      <Step stepData={stepData} current={stepCurrent} />
    </>
  );

  return (
    <div>
      <Page title="数据源管理" extra={extra} alert={showAlert ? alert : null} noContentLayout>
        {datasourceList.total === 0 && !filterVisible ? null : (
          <div className={styles.tableFilterWrap} style={{ marginTop: showAlert ? '12px' : '' }}>
            <Form layout="inline" requiredMark={false} colon={false} form={form}>
              <Form.Item name="dataName" label="数据名称">
                <Input placeholder="请输入" style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="status" label="发布状态">
                <Select placeholder="请选择" style={{ width: 200 }}>
                  <Select.Option value="1">已发布</Select.Option>
                  <Select.Option value="0">未发布</Select.Option>
                  <Select.Option value="2">已下架</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="time" label="修改时间">
                <RangePicker style={{ width: 320 }} />
              </Form.Item>
              <div className={styles.btnContainer}>
                <Button onClick={reset}>重置</Button>
                <Button type="primary" style={{ marginLeft: 8 }} onClick={handleRefresh}>
                  查询
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Page>
      <div style={{ marginTop: 12, padding: '0 20px' }}>
        <Alert
          type="info"
          message="温馨提示：不能直接发布数据源，请先连接数据库，在数据库中选择库表发布再进行发布。"
          showIcon
        />
      </div>
      <div className={styles.contentWrap}>
        {auth.includes(PERMISSION.publish) && (
          <div style={{ marginBottom: 14 }}>
            <Button type="primary" icon={<PlusIcon fill="#fff" />} onClick={goToDatabase}>
              发布数据源
            </Button>
          </div>
        )}
        <Table
          columns={columns}
          showSorterTooltip={false}
          dataSource={datasourceList.list}
          onChange={handleRefresh}
          pagination={{
            pageSize: pSize,
            total: datasourceList.total,
            current: currentPage,
          }}
          emptyTableText={
            <div className={styles.emptyData}>
              {!filterVisible ? '暂无数据，快去发布数据源吧～' : '暂无匹配数据'}
            </div>
          }
          loading={{
            spinning: loading,
          }}
        />
      </div>
    </div>
  );
}

export default connect(({ datasource, loading }) => ({
  datasourceList: datasource.datasourceList,
  loading: loading.effects['datasource/datasourceList'],
}))(OriginManage);
