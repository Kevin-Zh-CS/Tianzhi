import React, { useEffect, useState } from 'react';
import { router } from 'umi';
import { connect } from 'dva';
import { Table, Form, Input, DatePicker, Button, Alert, IconBase, Spin } from 'quanta-design';
import { formatTime } from '@/utils/helper';
import { PROJECT_PARTNER_STATUS_TAG, PROJECT_STATUS } from '@/utils/enums';
import NewPage from '@/components/NewPage';
import styles from './index.less';
import moment from 'moment';
import { getParticipantList } from '@/services/qfl-partner';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import noRepositoryImg from '@/assets/no_repository.png';

const { Item } = Form;
const { RangePicker } = DatePicker;

function Partner() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterVisible, setFilterVisible] = useState(false);
  const [dataList, setDataList] = useState({});
  const [showAlert, setShowAlert] = useState(true);
  const [pSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const getList = async (page = 1, size = 10, is_asc = false) => {
    const filterList = await form.getFieldValue();
    setLoading(true);
    const keys = Object.keys(filterList);
    if (keys.length > 0) {
      setFilterVisible(true);
    }
    const dateFormat = 'YYYY-MM-DD';
    const params = {
      page,
      size,
      is_asc,
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
    delete params.time;
    try {
      const data = await getParticipantList(params);
      setDataList(data);
      setCurrentPage(page);
      setPageSize(size);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getList();
  }, []);

  const columnInvite = [
    {
      title: '项目名称',
      dataIndex: 'project_name',
      key: 'project_name',
    },
    {
      title: '所需数据名称',
      dataIndex: 'data_name',
      key: 'data_name',
    },
    {
      title: '参与状态',
      dataIndex: 'participate_status',
      key: 'participate_status',
      render: val => PROJECT_PARTNER_STATUS_TAG[val],
    },
    {
      title: '发起方',
      dataIndex: 'initiator_org_name',
      key: 'initiator_org_name',
    },
    {
      title: '邀请时间',
      dataIndex: 'invite_time',
      render: val => formatTime(val),
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) => (
        <>
          <a
            onClick={() =>
              router.push(
                `/qfl/partner/detail?dataId=${record.initiator_data_id}&projectId=${record.project_id}`,
              )
            }
          >
            详情
          </a>
          {record.participate_status === PROJECT_STATUS.WAIT_PARTICIPANT_CONFIGURE && (
            <a
              style={{ marginLeft: 24 }}
              onClick={() =>
                router.push(
                  `/qfl/partner/addData?dataId=${record.initiator_data_id}&projectId=${record.project_id}`,
                )
              }
            >
              添加数据
            </a>
          )}
        </>
      ),
    },
  ];

  const reset = () => {
    form.resetFields();
    setPageSize(10);
    getList();
  };

  const handleChange = async ({ current, pageSize }, filters, sorter) => {
    setPageSize(pageSize);
    getList(current, pageSize, sorter.order === 'ascend');
  };

  const handleQuery = () => {
    getList();
  };

  const alert = (
    <Alert
      style={{ marginBottom: 12 }}
      type="info"
      message="参与项目功能说明：参与项目为项目发起方以邀请方式邀请我方加入的项目。"
      showIcon
    />
  );

  return (
    <NewPage
      extra={
        <div className="alert-trigger-wrap" onClick={() => setShowAlert(!showAlert)}>
          参与项目说明
          <IconBase className={showAlert ? 'up' : 'down'} icon={ArrowsDown} fill="#888888" />
        </div>
      }
      alert={showAlert ? alert : null}
      title="我参与的"
      noContentLayout
    >
      <Spin spinning={loading}>
        <div className={`${styles.fiterWrap} container-card`}>
          <Form form={form} layout="inline" requiredMark={false} colon={false}>
            <Item name="project_name" label="项目名称">
              <Input placeholder="请输入" style={{ width: 200 }} />
            </Item>
            <Item name="initiator_org_name" label="发起方">
              <Input placeholder="请输入" style={{ width: 200 }} />
            </Item>
            <Item name="time" label="邀请时间">
              <RangePicker style={{ width: 320 }} />
            </Item>
            <div className={styles.btnContainer}>
              <Button onClick={reset}>重置</Button>
              <Button
                style={{ marginLeft: 8 }}
                type="primary"
                onClick={handleQuery}
                onEnter={handleQuery}
              >
                查询
              </Button>
            </div>
          </Form>
        </div>
        <div className={`${styles.partnerWrap} container-card`} style={{ marginTop: '12px' }}>
          <Table
            columns={columnInvite}
            dataSource={dataList.project_list || []}
            onChange={handleChange}
            prefixCls={null}
            emptyTableText={
              <div>
                <img alt="" src={noRepositoryImg} width={200} height={200} />
                <div className={styles.emptyData}>
                  {dataList.project_list && dataList.project_list.length === 0 && !filterVisible
                    ? '你还没有参与联邦学习项目，等待他人创建并邀请吧～'
                    : '暂无匹配数据'}
                </div>
              </div>
            }
            pagination={{
              total: dataList.total,
              current: currentPage,
              pageSize: pSize,
            }}
          />
        </div>
      </Spin>
    </NewPage>
  );
}

export default connect(({ partner }) => ({
  taskList: partner.taskList,
  taskCount: partner.taskCount,
}))(Partner);
