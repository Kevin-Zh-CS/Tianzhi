import React, { useState, useEffect } from 'react';
import { Table, Select, Form } from 'quanta-design';
import ItemTitle from '@/components/ItemTitle';
import ButtonGroup from '@/components/ButtonGroup';
import DataInvitationDesc from '../components/DataInvitationDesc';
import styles from '@/pages/Federate/Partner/components/index.less';
import { dataInviteConfirm, dataInviteCreate } from '@/services/partner';
import { dataRowList, getImporterDataInfo } from '@/services/importer';

function Step2(props) {
  const { location, onOk, onCancel, dataInfo, value = {} } = props;
  const { dataId: taskDataId, taskId } = location.query;
  const { isPrivate } = value;
  const [namespace, dataId] = value.data;
  const [dataDetail, setDataDetail] = useState({});
  const [targetList, setTargetList] = useState([]);
  const { need_data_meta: dataFormat } = dataInfo;
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'left' } },
    wrapperCol: {},
  };

  const initData = async () => {
    const detail = await getImporterDataInfo({ dataId, namespace });
    const list = await dataRowList({
      namespace,
      dataId,
      fields: [],
      page: 1,
      size: 100,
    });
    const tmp = Object.keys(list.records[0]);
    detail.columns = tmp.map(obj => {
      const item = {
        title: obj,
        dataIndex: obj,
        key: obj,
        render: txt => <div className={styles.column}>{txt}</div>,
      };
      return item;
    });
    setDataDetail({ ...detail, list: list.records });
  };

  useEffect(() => {
    if (value) {
      initData();
    }
  }, [value]);

  useEffect(() => {
    if (dataFormat) {
      setTargetList(
        dataFormat.map(obj => {
          const item = {
            name: obj.name,
            type: obj.type,
          };
          return item;
        }),
      );
    }
  }, [dataFormat]);

  const onSubmit = async () => {
    const mapRule = await form.validateFields();
    const params = {
      data_id: dataId,
      id: taskDataId,
      example_ret: dataDetail.list || [],
      field_mapping_rule: mapRule,
      // ns_id: namespace,
      need_approval: value.need_approval,
      is_private: Boolean(isPrivate),
    };
    if (value.need_approval) {
      params.approve_content = value.approve_content;
    }
    await dataInviteCreate(params);
    await dataInviteConfirm({ dataId: taskDataId });
    onOk({ taskDataId, taskId });
  };

  return (
    <>
      <DataInvitationDesc dataInfo={dataDetail} />
      <ItemTitle>字段映射</ItemTitle>
      <Form form={form} colon={false} hideRequiredMark>
        <Form.Item label="关联字段" {...formItemLayout}>
          <Table
            columns={[
              {
                title: '目标字段名称',
                dataIndex: 'target',
                key: 'target',
                width: '40%',
                render: (_, record) => `${record.name}(${record.type})`,
              },
              {
                title: '源字段名称',
                dataIndex: 'origin',
                key: 'origin',
                render: (_, record) => (
                  <Form.Item
                    name={record.name}
                    rules={[{ required: true, message: '请选择数据' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Select placeholder="请选择">
                      {dataDetail?.columns?.map(obj => (
                        <Select.Option key={obj.key}>{obj.title}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                ),
              },
            ]}
            dataSource={targetList}
            pagination={false}
          ></Table>
        </Form.Item>
      </Form>
      <ButtonGroup
        change
        left="确认添加"
        onClickL={onSubmit}
        right="上一步"
        onClickR={onCancel}
        style={{ marginLeft: 105 }}
      />
    </>
  );
}

export default Step2;
