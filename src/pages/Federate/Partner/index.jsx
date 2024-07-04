import React, { useEffect, useState } from 'react';
import { router } from 'umi';
import { connect } from 'dva';
// import { Table, Form, Input, DatePicker, Button, Select, Tabs } from 'quanta-design';
import { Table, Tabs } from 'quanta-design';
import { formatTime } from '@/utils/helper';
import { DATA_MODEL_STATE, DATA_STATE_LIST_TAG, MODEL_STATE_TAG } from '@/utils/enums';
import CheckList from '../CheckList';
import Page from '@/components/Page';
import styles from './index.less';
// import moment from 'moment';
// import { getSearchList } from '@/services/resource';

// const { Item } = Form;
// const { RangePicker } = DatePicker;
// const { Option } = Select;

function Partner(props) {
  const { dispatch, taskList, taskCount, location } = props;
  const { type = '2' } = location.query;
  const [currentPage, setCurrentPage] = useState(1);
  const [key, setKey] = useState(2);
  // const [orgList, setOrgList] = useState([]);
  // const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(false);

  const getList = async (e = {}) => {
    const { current: page = 1, pageSize: size = 10, ...rest } = e;
    setLoading(true);
    await dispatch({
      type: 'partner/taskList',
      payload: {
        page,
        size,
        is_asc: order === 'ascend',
        participate_type: e.key,
        ...rest,
      },
    });
    setLoading(false);
    setCurrentPage(page);
  };

  // const initData = async () => {
  //   const data = await getSearchList();
  //   setOrgList(data);
  // };

  const handleClick = _key => {
    router.push(`/federate/partner?type=${_key}`);
    getList({ key: _key });
    setKey(_key);
  };

  useEffect(() => {
    handleClick(type);
    // initData();
  }, []);

  const columnShare = [
    {
      title: '任务名称',
      dataIndex: 'task_name',
      key: 'task_name',
    },
    {
      title: '所需数据名称',
      dataIndex: 'needed_data_name',
      key: 'needed_data_name',
    },
    {
      title: '发起方',
      dataIndex: 'initiator_org_name',
      key: 'initiator_org_name',
    },
    {
      title: '子模型状态',
      dataIndex: 'data_status',
      key: 'data_status',
      render: val => MODEL_STATE_TAG[val],
    },
    {
      title: '提交时间',
      dataIndex: 'apply_approval_time',
      key: 'apply_approval_time',
      render: val => formatTime(val),
      // sortOrder: order,
      // sorter: true,
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
                `/federate/partner/detail?type=${type}&dataId=${record.data_id}&taskId=${record.task_id}`,
              )
            }
          >
            详情
          </a>
          {record.data_status === DATA_MODEL_STATE.MODEL_WAIT_APPROVE && (
            <a
              onClick={() =>
                router.push(
                  `/federate/partner/editor?type=${type}&dataId=${record.data_id}&taskId=${record.task_id}`,
                )
              }
              style={{ marginLeft: 24 }}
            >
              立即审核
            </a>
          )}
        </>
      ),
    },
  ];
  const columnInvite = [
    {
      title: '任务名称',
      dataIndex: 'task_name',
      key: 'task_name',
    },
    {
      title: '所需数据名称',
      dataIndex: 'needed_data_name',
      key: 'needed_data_name',
    },
    {
      title: '参与状态',
      dataIndex: 'data_status',
      key: 'data_status',
      render: val => DATA_STATE_LIST_TAG[val],
    },
    {
      title: '发起方',
      dataIndex: 'initiator_org_name',
      key: 'initiator_org_name',
    },
    {
      title: '子模型状态',
      dataIndex: 'data_status',
      key: 'data_status',
      render: val => (val >= 6 && val <= 8 ? MODEL_STATE_TAG[val] : '-'),
    },
    {
      title: '邀请时间',
      dataIndex: 'invite_time',
      render: val => formatTime(val),
      // sortOrder: order,
      // sorter: true,
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
                `/federate/partner/detail?type=${type}&dataId=${record.data_id}&taskId=${record.task_id}`,
              )
            }
          >
            详情
          </a>
          {record.data_status === DATA_MODEL_STATE.DATA_PASS && (
            <a
              style={{ marginLeft: 24 }}
              onClick={() =>
                router.push(`/federate/partner/addData?dataId=${record.data_id}&type=${type}`)
              }
            >
              添加数据
            </a>
          )}
        </>
      ),
    },
  ];

  const typeMenu = (
    <Tabs onChange={handleClick} className={styles.typeBox} activeKey={key}>
      <Tabs.TabPane tab="邀请参与" key="2"></Tabs.TabPane>
      <Tabs.TabPane tab="共享参与" key="1"></Tabs.TabPane>
    </Tabs>
  );
  // const reset = () => {
  //   form.resetFields();
  //   setOrder(false);
  //   getList({ key: type, current: 1, pageSize: 10 });
  // };
  //
  // const handleSearch = async () => {
  //   const filterList = await form.getFieldValue();
  //   const keys = Object.keys(filterList);
  //   if (keys.length > 0) {
  //     setFilterVisible(true);
  //   }
  //   const dateFormat = 'YYYY-MM-DD';
  //   const filter = {
  //     ...filterList,
  //     begin_time: filterList.time
  //       ? moment(moment(filterList.time[0]).format(dateFormat)).valueOf() / 1000
  //       : undefined,
  //     end_time: filterList.time
  //       ? moment(
  //           moment(filterList.time[1])
  //             .add(1, 'days')
  //             .format(dateFormat),
  //         ).valueOf() / 1000
  //       : undefined,
  //   };
  //   delete filter.time;
  //   getList({ key: type, current: 1, pageSize: 10, ...filter });
  // };

  const componentLoaded = (
    <Page title="我参与的" noContentLayout>
      <div>{typeMenu}</div>
      {/* <div className={`${styles.fiterWrap} container-card`}>
        <Form form={form} layout="inline" requiredMark={false} colon={false}>
          <Item name="task_name" label="任务名称">
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Item>
          <Item name="org_id" label="发起方">
            <Select style={{ width: 200 }} placeholder="请选择">
              {orgList.map(item => (
                <Option key={item.org_id}>{item.org_name}</Option>
              ))}
            </Select>
          </Item>
          <Item name="time" label="邀请时间">
            <RangePicker style={{ width: 320 }} />
          </Item>
          <div className={styles.btnContainer}>
            <Button onClick={reset}>重置</Button>
            <Button style={{ marginLeft: 8 }} type="primary" onClick={handleSearch}>
              查询
            </Button>
          </div>
        </Form>
      </div> */}
      <div className="container-card" style={{ marginTop: '12px' }}>
        <Table
          columns={type === '2' ? columnInvite : columnShare}
          dataSource={taskList}
          onChange={({ current, pageSize }, filters, sorter) => {
            setOrder(sorter.order);
            getList({ current, pageSize, key: type });
          }}
          emptyTableText={
            <div className={styles.emptyData}>
              {/* {taskList.length === 0 && !filterVisible */}
              {/*  ? '暂无数据，快去上传/新建数据吧～' */}
              {/*  : '暂无匹配数据'} */}
              暂无数据，快去上传/新建数据吧～
            </div>
          }
          pagination={{
            total: taskCount,
            current: currentPage,
          }}
          loading={{
            spinning: loading,
          }}
        />
      </div>
    </Page>
  );

  return (
    <>
      <CheckList
        title="我参与的"
        extraTitle="参与任务说明"
        message="我参与的任务分为两种情况：一、共享数据（文件除外）被加入隐私计算，其子模型需要数据提供方审核；二、被邀请参与隐私计算，通过导入的方式添加数据；"
        hint="你还没有参与隐私计算任务，等待他人创建并邀请吧～"
        list={taskList}
        component={componentLoaded}
        typeMenu={typeMenu}
      />
    </>
  );
}

export default connect(({ partner }) => ({
  taskList: partner.taskList,
  taskCount: partner.taskCount,
}))(Partner);
