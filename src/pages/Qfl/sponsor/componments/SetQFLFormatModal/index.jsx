import React, { useEffect } from 'react';
import { Modal, Form, Input, IconBase, Select, Tooltip, Alert } from 'quanta-design';
import HintText from '@/components/HintText';
import { ReactComponent as plusSquareIcon } from '@/icons/plus_square.svg';
import { ReactComponent as minusSquareIcon } from '@/icons/minus_square.svg';
import { PROJECT_TYPE_LIST } from '@/pages/Qfl/config';
import styles from './index.less';
import { Space } from 'antd';

function SetQFLFormatModal(props) {
  const { visible, setFormatContext, onCancel, formatContext, type } = props;
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { style: { width: 86, textAlign: 'left', marginRight: 12 } },
    wrapperCol: {},
  };

  const onOk = async () => {
    const formValues = await form.validateFields();
    if (type === PROJECT_TYPE_LIST.portrait) {
      formValues.dataMeta.forEach((item, i) => {
        if (i === 0) {
          item.desc = 'ID 对齐字段';
        }
      });
    }
    setFormatContext(formValues);
    onCancel();
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ...formatContext,
        // eslint-disable-next-line
        dataMeta: formatContext.dataMeta
          ? formatContext.dataMeta
          : type === PROJECT_TYPE_LIST.portrait
          ? [{}]
          : [],
      });
    }
  }, [visible]);

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      title="设置数据格式"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={984}
    >
      <HintText style={{ marginBottom: 28 }}>
        <div>通过设置数据格式，让对接人导入指定格式的数据。</div>
      </HintText>
      <Form form={form} colon={false} preserve={false} hideRequiredMark>
        <Form.Item
          name="dataName"
          label="所需数据名称"
          {...formItemLayout}
          rules={[
            { required: true, message: '请输入所需数据名称' },
            { max: 30, message: '所需数据名称不可超过30个字符，请重新输入' },
          ]}
        >
          <Input style={{ width: 360 }} placeholder="请输入所属数据名称" />
        </Form.Item>
        <Form.Item
          name="dataDesc"
          label="格式说明"
          {...formItemLayout}
          rules={[
            { required: true, message: '请输入格式说明' },
            { max: 100, message: '格式说明不可超过100个字符，请重新输入' },
          ]}
        >
          <Input.TextArea
            style={{ width: 360 }}
            rows={4}
            placeholder="请输入100字以内的数据格式说明"
          />
        </Form.Item>

        <div className={styles.tableList}>
          <Form.List name="dataMeta">
            {(fields, { add, remove }) => (
              <>
                <Form.Item label="数据说明" {...formItemLayout}>
                  <Alert
                    type="info"
                    message="温馨提示：若项目类型为纵向联邦，则数据说明的第一行字段将作为ID对齐所用字段，为执行数据预处理做准备。"
                    showIcon
                  />
                  <div className={styles.tableHeader}>
                    <div className={styles.plusItem}>
                      <IconBase
                        icon={plusSquareIcon}
                        onClick={() => {
                          add();
                        }}
                      />
                    </div>
                    <div className={styles.tableTr}>名称</div>
                    <div className={styles.tableTr}>类型</div>
                    <div className={styles.tableTr}>示例值</div>
                    <div className={styles.tableTr}>描述</div>
                  </div>
                  {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                    <Space
                      key={key}
                      className={styles.tableBody}
                      style={{ marginRight: 0 }}
                      align="baseline"
                    >
                      <div className={styles.plusItem}>
                        {type === PROJECT_TYPE_LIST.portrait && fields.length === 1 ? (
                          <Tooltip
                            arrowPointAtCenter
                            placement="topLeft"
                            title="至少保留一条数据说明！"
                          >
                            <IconBase
                              icon={minusSquareIcon}
                              onClick={() => {
                                if (fields.length === 1) return;
                                remove(name);
                              }}
                              fill="#b7b7b7"
                            />
                          </Tooltip>
                        ) : (
                          <IconBase
                            icon={minusSquareIcon}
                            onClick={() => {
                              remove(name);
                            }}
                          />
                        )}
                      </div>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        fieldKey={[fieldKey, 'name']}
                        rules={[
                          { required: true, message: '请输入名称' },
                          { max: 30, message: '名称不可超过30个字符，请重新输入' },
                        ]}
                      >
                        <Input className={styles.tableInput} placeholder="请输入名称" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        fieldKey={[fieldKey, 'type']}
                        rules={[{ required: true, message: '请选择类型' }]}
                      >
                        <Select placeholder="请选择类型" style={{ width: 170 }}>
                          <Select.Option key="string">String</Select.Option>
                          <Select.Option key="int">Int</Select.Option>
                          <Select.Option key="float">Float</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'example']}
                        fieldKey={[fieldKey, 'example']}
                        rules={[
                          {
                            required: true,
                            message: '请输入示例值',
                          },
                        ]}
                      >
                        <Input className={styles.tableInput} placeholder="请输入示例值" />
                      </Form.Item>
                      {type === PROJECT_TYPE_LIST.portrait && index === 0 ? (
                        <Form.Item {...restField}>ID 对齐字段</Form.Item>
                      ) : (
                        <Form.Item
                          {...restField}
                          name={[name, 'desc']}
                          fieldKey={[fieldKey, 'desc']}
                          rules={[
                            {
                              required: true,
                              message: '请输入描述',
                            },
                            { max: 30, message: '描述不可超过30个字符，请重新输入' },
                          ]}
                        >
                          <Input className={styles.tableInput} placeholder="请输入描述" />
                        </Form.Item>
                      )}
                    </Space>
                  ))}
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>
      </Form>
    </Modal>
  );
}

export default SetQFLFormatModal;
