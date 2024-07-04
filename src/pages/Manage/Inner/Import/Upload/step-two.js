import React, { useEffect, useState } from 'react';
import { router } from 'umi';
import { Button, Form, Select, Row, Col, message, Spin, Pagination, Modal } from 'quanta-design';
import { Table } from 'antd';
import successNoteIcon from '@/icons/success_note.png';
import styles from './index.less';
import MissingValueModal from '@/pages/Manage/Inner/Import/MissingValueModal';
import {
  getArgsList,
  handleModifyColumn,
  confirmData,
  getMissingContent,
  handleDeleteMissing,
  getContentList,
} from '@/services/importer';
import { tableDetailList } from '@/services/database';

function StepTwo(props) {
  const { data_id, isImport, onBefore, namespace, ...extra } = props;
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrent] = useState(1);
  const [successVisible, setSuccessVisible] = useState(false);
  const [contents, setContents] = useState({});
  const [missingList, setMissingList] = useState({});
  const [argsList, setArgsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const columns = [];
  const arr = Object.keys(contents);
  if (arr.length > 0 && contents.records.length > 0) {
    Object.keys(contents.records[0]).forEach(res => {
      columns.push({
        key: res,
        dataIndex: res,
        title: res,
        render: txt => <div style={{ minWidth: 40 }}>{txt}</div>,
      });
    });
  }

  const initContent = async (page = 1, size = 10) => {
    let data = {};
    if (isImport === 'false') {
      const params = {
        dbHash: extra.database,
        tableName: extra.table_name,
        fields: extra.col_names,
        size,
        page,
      };
      data = await tableDetailList({ namespace, ...params });
    } else {
      const params = { data_id, page, size };
      data = await getContentList(namespace, params);
    }
    setContents(data);
  };

  const findMissing = async (page = 1, size = 5) => {
    const list = await getMissingContent(namespace, { data_id, page, size });
    setMissingList(list);
    if (list.total) {
      setVisible(true);
    } else {
      setSuccessVisible(true);
    }
  };

  const handleConfirmData = async () => {
    const data = await confirmData({ namespace, dataId: data_id });
    if (data?.code === 0) {
      message.success('数据导入成功！');
      router.push(`/manage/inner/repository/import?namespace=${namespace}`);
    } else if (data?.code === 12112) {
      message.error('检测到缺失值！');
      await findMissing();
    } else {
      message.error(data.message || '网络错误');
    }
  };

  const changePage = (current, pageSize) => {
    setCurrent(current);
    initContent(current, pageSize);
  };

  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: {},
  };

  const deleteMissing = async () => {
    setLoading(true);
    try {
      const params = {
        data_id,
        select_all_missing: true,
        target_row_list: [],
      };
      await handleDeleteMissing(namespace, params);
      message.success('缺失值删除成功！');
      setVisible(false);
      await initContent();
    } finally {
      setLoading(false);
    }
  };

  const handleArgsList = async () => {
    const data = await getArgsList(namespace, data_id);
    setArgsList(data);
  };

  useEffect(() => {
    if (data_id) {
      handleArgsList();
      initContent();
    }
  }, [data_id]);

  const modifyColumn = async (e, item) => {
    const params = {
      id: data_id,
      name: item.name,
      newType: e,
    };
    await handleModifyColumn(namespace, params);
    await handleArgsList();
  };

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '40px 12px' }}>
        <Form colon={false} hideRequiredMark>
          <Form.Item name="dataParameters" label="参数信息" {...formItemLayout}>
            <div className={styles.funcItemWrap}>
              <div className={styles.paramTable}>
                <Row align="middle" className={styles.tableThead}>
                  <Col span={6}>名称</Col>
                  <Col span={5}>类型</Col>
                </Row>
                {argsList.map(item => (
                  <Row align="middle" className={styles.tableTr}>
                    <Col span={6}>{item.name}</Col>
                    <Col span={6}>
                      <Select
                        placeholder="请选择"
                        value={item.type || '0'}
                        disabled={isImport === 'false'}
                        className={item.name}
                        onChange={e => {
                          modifyColumn(e, item);
                        }}
                      >
                        <Select.Option value="0">string</Select.Option>
                        <Select.Option value="1">integer</Select.Option>
                        <Select.Option value="2">float</Select.Option>
                      </Select>
                    </Col>
                  </Row>
                ))}
              </div>
            </div>
          </Form.Item>
          <Form.Item label="数据内容" {...formItemLayout}>
            {isImport !== 'false' && (
              <Button type="primary" className={styles.button} onClick={findMissing}>
                缺失值识别
              </Button>
            )}
            <div className="overflowTable preprocessTable">
              <Table
                columns={columns}
                dataSource={contents.records || []}
                emptyTableText={<div style={{ color: '#888888' }}>暂无数据～</div>}
                pagination={false}
              />
            </div>
            <div className="overflowPagination">
              <Pagination
                showQuickJumper
                total={contents.total}
                current={currentPage}
                onChange={changePage}
              />
            </div>
          </Form.Item>
          <div style={{ marginLeft: 117 }}>
            <Button type="primary" onClick={handleConfirmData}>
              确定
            </Button>
            <Button style={{ marginLeft: 12 }} onClick={onBefore}>
              上一步
            </Button>
          </div>
        </Form>
      </div>
      <MissingValueModal
        visible={visible}
        setVisible={setVisible}
        namespace={namespace}
        dataId={data_id}
        total={contents.total}
        missingContent={missingList}
        onDelete={deleteMissing}
        onChange={findMissing}
      />
      <Modal visible={successVisible} footer={null} closable={false}>
        <div className={styles.success}>
          <img alt="" src={successNoteIcon} width={72} height={72}></img>
          <div className={styles.text1}>缺失值识别成功!</div>
          <div setle={{ color: '#595959', fontSize: 14, fontWeight: 400 }}>
            当前导入数据中未识别出缺失值。
          </div>
          <Button className={styles.know} onClick={() => setSuccessVisible(false)}>
            我知道了
          </Button>
        </div>
      </Modal>
    </Spin>
  );
}

export default StepTwo;
