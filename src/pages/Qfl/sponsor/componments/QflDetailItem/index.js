import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Form, IconBase, Pagination, Tooltip } from 'quanta-design';
import { Table } from 'antd';
import { ReactComponent as questionCircleIcon } from '@/assets/question_circle.svg';
import { getLocalDataDetail, parserInfoContent } from '@/services/qfl';
import styles from '../../project/componments/index.less';

function QflDetailItem(props) {
  const { info } = props;
  const [currentPage, setCurrent] = useState(1);
  const [dataInfo, setDataInfo] = useState({});
  const [dataRowList, setDataRowList] = useState({});
  const columns = [];

  const { args = [] } = dataInfo;
  if (args && args.length) {
    args.forEach(res => {
      columns.push({
        key: res.name,
        dataIndex: res.name,
        title: res.name,
        render: txt => <div className={styles.column}>{txt}</div>,
      });
    });
  }
  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: {},
  };

  const initInfo = async () => {
    const data = await getLocalDataDetail(info.data_id);
    setDataInfo(data);
  };

  const initList = async (page = 1, size = 10) => {
    const list = await parserInfoContent({ data_id: info.dataId, page, size, is_asc: true });
    setDataRowList(list);
  };
  useEffect(() => {
    if (info.data_id) {
      initInfo();
      initList();
    }
  }, [info]);

  const changePage = e => {
    const { current = 1, pageSize = 10 } = e;
    initList(current, pageSize);
    setCurrent(current);
  };
  return (
    <div className={styles.contentWrap}>
      <Form colon={false} hideRequiredMark className={styles.detailPage}>
        <Form.Item label="数据名称" {...formItemLayout}>
          {dataInfo.name}
        </Form.Item>
        <Form.Item label="数据描述" {...formItemLayout}>
          {dataInfo.desc}
        </Form.Item>
        <Form.Item
          label={
            <div style={{ display: 'flex' }}>
              <span style={{ marginRight: 10 }}>数据内容</span>
              <Tooltip
                arrowPointAtCenter
                placement="bottomLeft"
                title="数据内容：数据内容即导入或关联的数据详情，首次导入或
                    关联时支持增删改查。提交后修改若已关联任务，则不能修
                    改数据内容；若无关联任务，则可以修改数据内容。"
              >
                <IconBase icon={questionCircleIcon} fontSize={20} fill="#888888" />
              </Tooltip>
            </div>
          }
          {...formItemLayout}
        >
          <Table
            columns={columns}
            dataSource={dataRowList.records}
            emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
            onChange={changePage}
            pagination={false}
          />
          <Pagination
            className={styles.pagination}
            total={dataRowList.total}
            current={currentPage}
            onChange={changePage}
            showSizeChanger
            showQuickJumper
          />
        </Form.Item>
      </Form>
    </div>
  );
}

export default connect()(QflDetailItem);
