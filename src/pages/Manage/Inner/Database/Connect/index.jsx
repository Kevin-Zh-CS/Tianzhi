import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Select, Input, message } from 'quanta-design';
import { connect } from 'dva';
import router from 'umi/router';
import Page from '@/components/Page';
import styles from './index.less';
import { createDatabase } from '@/services/database';

function Connect(props) {
  const { dispatch, location } = props;
  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: {},
  };
  const isDisabled = typeof location.query.dbHash !== 'undefined';
  const [form] = Form.useForm();
  const [type, setType] = useState('');

  const initData = () => {
    if (typeof location.query.dbHash !== 'undefined') {
      dispatch({
        type: 'database/databaseDetail',
        payload: {
          namespace: location.query.namespace,
          dbHash: location.query.dbHash,
        },
        callback: res => {
          form.setFieldsValue({ ...res, schema: res.schema || ' ' });
          setType(res.db_type);
        },
      });
    }
  };

  const createDatabases = async () => {
    const values = await form.validateFields();
    const params = {
      ...values,
      namespace: location.query.namespace,
      type: typeof location.query.dbHash !== 'undefined' ? 'update' : 'create',
    };
    if (typeof location.query.dbHash !== 'undefined') {
      params.db_hash = location.query.dbHash;
    }
    await createDatabase(params);
    message.success(params.type === 'create' ? '数据库连接成功！' : '数据库信息修改成功！');
    router.push(`/manage/inner/repository/database?namespace=${location.query.namespace}`);
  };

  const setPortData = value => {
    setType(value);
    if (value === 'mysql') {
      form.setFieldsValue({ port: 3306 });
    } else if (value === 'oracle') {
      form.setFieldsValue({ port: 1521 });
    } else if (value === 'mongo') {
      form.setFieldsValue({ port: 27017 });
    } else if (value === 'postgres') {
      form.setFieldsValue({ port: 5432 });
    }
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <div>
      <Page
        title="连接数据库"
        alert={
          <Alert
            type="info"
            message="温馨提示：数据发布时仅发布数据元信息（如数据名称、数据描述等）至区块链，并可为某些机构设置默认的数据访问权限；原始数据不发布。"
            showIcon
          />
        }
        showBackIcon
        noContentLayout
      >
        <div className={styles.contentWrap}>
          <Form
            colon={false}
            hideRequiredMark
            form={form}
            initialValues={{ db_type: 'mysql', port: 3306 }}
          >
            <Form.Item
              name="conn_name"
              label="连接名称"
              rules={[
                { required: true, message: '连接名称不能为空' },
                { max: 30, message: '连接名称不可超过30个字符，请重新输入' },
              ]}
              {...formItemLayout}
            >
              <Input style={{ width: 360 }} placeholder="请输入连接名称" />
            </Form.Item>
            <Form.Item name="db_type" label="数据库类型" {...formItemLayout}>
              <Select
                style={{ width: 360 }}
                placeholder="请选择"
                onChange={setPortData}
                disabled={isDisabled}
              >
                <Select.Option value="mysql">MySQL</Select.Option>
                <Select.Option value="mongo">MongoDB</Select.Option>
                <Select.Option value="postgres">PostgreSQL</Select.Option>
                <Select.Option value="oracle">Oracle</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="ip"
              label="IP地址"
              rules={[
                { required: true, message: 'IP地址不能为空' },
                {
                  pattern:
                    '^(?=(\\b|\\D))(((\\d{1,2})|(1\\d{1,2})|(2[0-4]\\d)|(25[0-5]))\\.){3}((\\d{1,2})|(1\\d{1,2})|(2[0-4]\\d)|(25[0-5]))(?=(\\b|\\D))$',
                  message: '请输入正确格式的IP地址',
                },
              ]}
              validateTrigger="onBlur"
              {...formItemLayout}
            >
              <Input style={{ width: 360 }} placeholder="请输入IP地址" disabled={isDisabled} />
            </Form.Item>
            <Form.Item
              name="port"
              label="端口"
              rules={[
                { required: true, message: '端口号不能为空' },
                {
                  validator: (rule, value, callback) => {
                    const reg = /^\+?[1-9]\d*$/;
                    if (value) {
                      if (!Number(value) || Number(value) < 0 || !reg.test(value)) {
                        callback('请输入正确格式的端口号');
                        return;
                      }
                      if (value > 65535) {
                        callback('请输入正确格式的端口号');
                        return;
                      }
                      callback();
                    }
                    callback();
                  },
                },
              ]}
              {...formItemLayout}
            >
              <Input style={{ width: 360 }} placeholder="请输入" disabled={isDisabled} />
            </Form.Item>
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '用户名不能为空' }]}
              {...formItemLayout}
            >
              <Input style={{ width: 360 }} placeholder="请输入数据库用户名" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '密码不能为空' }]}
              {...formItemLayout}
            >
              <Input style={{ width: 360 }} placeholder="请输入数据库密码" />
            </Form.Item>
            <Form.Item
              name="db_name"
              label="数据库名"
              rules={[{ required: true, message: '数据库名不能为空' }]}
              {...formItemLayout}
            >
              <Input style={{ width: 360 }} placeholder="请输入数据库名" disabled={isDisabled} />
            </Form.Item>
            {type === 'postgres' ? (
              <Form.Item
                name="schema"
                label="SCHEMA"
                rules={[{ max: 30, message: 'SCHEMA不可超过30个字符，请重新输入' }]}
                {...formItemLayout}
              >
                <Input style={{ width: 360 }} disabled={isDisabled} placeholder="请输入SCHEMA" />
              </Form.Item>
            ) : null}
            <div style={{ marginLeft: 117, paddingTop: 12 }}>
              <Button type="primary" onClick={createDatabases}>
                连接
              </Button>
              <Button
                style={{ marginLeft: 12 }}
                onClick={() => {
                  router.push(
                    `/manage/inner/repository/database?namespace=${location.query.namespace}`,
                  );
                }}
              >
                取消
              </Button>
            </div>
          </Form>
        </div>
      </Page>
    </div>
  );
}

export default connect(({ database }) => ({
  databaseList: database.databaseList,
}))(Connect);
