import React, { useState, useEffect } from 'react';
import { Alert, Tabs, Input, Button, Icons, Select } from 'quanta-design';
import recordBackground from '@/assets/blacklist/recordBackground.png';
import { connect } from 'dva';
import { Space } from 'antd';
import styles from './index.less';
import { SingleLabel, BatchLabel } from '../TypeLabel';
import BlackTable from '../BlackTable';

const FilterItem = props => {
  const {
    other,
    visible,
    getRecordList,
    user,
    setUser,
    type,
    setType,
    setCurrent,
    setSortOrder,
  } = props;

  const handleClear = () => {
    getRecordList(Number(other));
    setUser('');
    setType(null);
    setCurrent(1);
    setSortOrder(false);
  };

  const handleFilter = () => {
    getRecordList(Number(other), 1, 10, user, user, type);
  };

  useEffect(() => {
    if (!visible) {
      handleClear();
    }
  }, [visible]);

  return (
    <div className={styles.filter}>
      <Space size={18}>
        <Space size={12}>
          <span>{Number(other) ? '查询操作机构' : '查询操作人'}</span>
          <Input
            value={user}
            onChange={e => setUser(e.target.value)}
            className={styles.input}
            placeholder="请输入"
          />
        </Space>
        <Space size={12}>
          <span>查询类型</span>
          <Select
            value={type}
            className={styles.select}
            onChange={e => setType(e)}
            placeholder="请选择"
            dropdownClassName="blacklistDropdown"
          >
            <Select.Option value="0">单条查询</Select.Option>
            <Select.Option value="1">批量查询</Select.Option>
          </Select>
        </Space>
      </Space>
      <Space>
        <Button className={styles.button} onClick={handleClear}>
          重置
        </Button>
        <Button type="primary" onClick={handleFilter}>
          确定
        </Button>
      </Space>
    </div>
  );
};

const TableItem = props => {
  const {
    other,
    columns,
    dataSource,
    total,
    visible,
    getRecordList,
    setSortOrder,
    loading,
  } = props;
  const [showData, setShowData] = useState(dataSource);
  const [user, setUser] = useState('');
  const [type, setType] = useState(null);
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    setCurrent(1);
  }, [other]);

  useEffect(() => {
    setShowData(dataSource);
  }, [dataSource]);

  const onTableChange = (pagination, filters, sorter) => {
    setSortOrder(sorter.order);
    setCurrent(pagination.current);
    getRecordList(
      Number(other),
      pagination.current,
      10,
      user,
      user,
      type,
      sorter.order !== 'ascend',
    );
  };

  return (
    <>
      <FilterItem
        other={other}
        setShowData={setShowData}
        visible={visible}
        getRecordList={getRecordList}
        user={user}
        setUser={setUser}
        type={type}
        setType={setType}
        setCurrent={setCurrent}
        setSortOrder={setSortOrder}
      />
      <BlackTable
        columns={columns}
        dataSource={showData}
        onChange={onTableChange}
        pagination={{
          total,
          current,
          simple: true,
          onChange: e => {
            getRecordList(Number(other), e, 10, user, user, type);
          },
        }}
        loading={{
          spinning: loading,
        }}
      />
    </>
  );
};

const { CloseIcon } = Icons;

function BlackListModal(props) {
  const {
    visible,
    handleOpenRecord,
    dispatch,
    localRecordList,
    otherRecordList,
    localRecordCount,
    otherRecordCount,
  } = props;
  const [other, setOther] = useState('0');
  const [localSortOrder, setLocalSortOrder] = useState(false);
  const [otherSortOrder, setOtherSortOrder] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExport = item => {
    const fileName = item.file_name;
    dispatch({
      type: 'blacklist/download',
      payload: item.record_id,
      callback: blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        link.remove();
      },
    });
  };

  const columns1 = [
    // {
    //   title: '操作哈希',
    //   dataIndex: 'block_hash',
    //   key: 'block_hash',
    //   render: text => <div className={styles.hash}>{text}</div>,
    // },
    {
      title: '查询操作人',
      dataIndex: 'caller_name',
      key: 'caller_name',
    },
    {
      title: '查询对象',
      dataIndex: 'query_id',
      key: 'query_id',
      render: (_, record) => (record.is_batch === '1' ? record.file_name : record.query_id),
    },
    {
      title: '查询类型',
      dataIndex: 'is_batch',
      key: 'is_batch',
      render: text => (text === '1' ? <BatchLabel /> : <SingleLabel />),
    },
    {
      title: '查询时间',
      dataIndex: 'created_time',
      key: 'created_time',
      sorter: () => {},
      sortOrder: localSortOrder,
    },
    {
      title: '查询结果',
      dataIndex: 'query_result',
      key: 'query_result',
      render: (text, record) =>
        record.is_batch === '1' ? (
          <a onClick={() => handleExport(record)}>导出查询结果</a>
        ) : (
          <span>{text}</span>
        ),
    },
  ];
  const columns2 = [
    // {
    //   title: '操作哈希',
    //   dataIndex: 'block_hash',
    //   key: 'block_hash',
    //   render: text => <div className={styles.hash}>{text}</div>,
    // },
    {
      title: '查询操作机构',
      dataIndex: 'org_name',
      key: 'org_name',
    },
    {
      title: '查询类型',
      dataIndex: 'is_batch',
      key: 'is_batch',
      render: text => (text === '1' ? <BatchLabel /> : <SingleLabel />),
    },
    {
      title: '查询时间',
      dataIndex: 'created_time',
      key: 'created_time',
      sorter: () => {},
      sortOrder: otherSortOrder,
    },
  ];

  const getRecordList = async (
    others = 0,
    page = 1,
    size = 10,
    caller = '',
    org = '',
    type = -1,
    sort = true,
  ) => {
    const _type = type ?? -1;
    setLoading(true);
    if (dispatch) {
      if (others) {
        await dispatch({
          type: 'blacklist/otherRecord',
          payload: {
            sort,
            page,
            size,
            org,
            type: _type,
          },
        });
        await dispatch({
          type: 'blacklist/otherRecordCount',
          payload: {
            org,
            type: _type,
          },
        });
      } else {
        await dispatch({
          type: 'blacklist/localRecord',
          payload: {
            sort,
            page,
            size,
            caller,
            type: _type,
          },
        });
        await dispatch({
          type: 'blacklist/localRecordCount',
          payload: {
            caller,
            type: _type,
          },
        });
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      getRecordList();
    }
  }, [visible]);

  const handleChange = e => {
    setLocalSortOrder(false);
    setOtherSortOrder(false);
    setOther(e);
    getRecordList(Number(e));
  };

  const handleClose = () => {
    setOther('0');
    handleOpenRecord();
  };

  return (
    <>
      {visible ? (
        <div className={styles.mask}>
          <div className={styles.blackModal}>
            <img alt="" src={recordBackground} className={styles.back} />
            <div className={styles.titleItem}>
              <span className={styles.title}>查询记录</span>
              <CloseIcon
                className={`${styles.closeIcon} hover-style`}
                style={{ fill: 'currentColor' }}
                onClick={handleClose}
              />
            </div>
            <Alert type="info" showIcon message="温馨提示：其他机构查询记录不记录具体查询内容。" />
            <Tabs activeKey={other} onChange={handleChange}>
              <Tabs.TabPane tab="本机构查询记录" key="0">
                <TableItem
                  other={other}
                  columns={columns1}
                  dataSource={localRecordList}
                  total={localRecordCount}
                  visible={visible}
                  getRecordList={getRecordList}
                  setSortOrder={setLocalSortOrder}
                  loading={loading}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="其他机构查询记录" key="1">
                <TableItem
                  other={other}
                  columns={columns2}
                  dataSource={otherRecordList}
                  total={otherRecordCount}
                  visible={visible}
                  getRecordList={getRecordList}
                  setSortOrder={setOtherSortOrder}
                  loading={loading}
                />
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default connect(({ blacklist }) => ({
  localRecordList: blacklist.localRecordList,
  otherRecordList: blacklist.otherRecordList,
  localRecordCount: blacklist.localRecordCount,
  otherRecordCount: blacklist.otherRecordCount,
}))(BlackListModal);
