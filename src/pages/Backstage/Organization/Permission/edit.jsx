import React, { useEffect, useState } from 'react';
import { Form, Input, Checkbox, Button, message, Divider, Alert, Modal } from 'quanta-design';
import Page from '@/components/NewPage';
import styles from './index.less';
import { connect } from 'dva';
import router from 'umi/router';
import ItemTitle from '@/components/ItemTitle';
import { getPermSetting, updateRole, getRoleSettingList } from '@/services/organization';
import WithLoading from '@/components/WithLoading';

// "checked": 1, // 0:没有选中, 1:已经选中, 2:选中，但不可修改的
function PermissionEdit(props) {
  const { location, dispatch } = props;
  const {
    query: { id, role_name },
  } = location;
  const [indeterminate, setIndeterminate] = useState(true);
  const [checkAll, setCheckAll] = useState(false);
  const [checkedValues, setCheckedValues] = useState([]);
  const [permissionList, setPermissionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { style: { width: 80, textAlign: 'left', marginLeft: 20 } },
    wrapperCol: {},
  };
  const onChange = list => {
    setCheckedValues(list);
    if (list.length === permissionList.length) {
      setIndeterminate(false);
      setCheckAll(true);
    } else {
      setIndeterminate(true);
      setCheckAll(false);
    }
  };

  const handleInit = async () => {
    // getRoleSettingList
    const params = { role_id: id, role_name };
    const [data, list] = await Promise.all([
      getPermSetting(params, dispatch),
      getRoleSettingList(dispatch),
    ]);
    const checked = data.filter(li => li.checked === 1 || li.checked === 2).map(item => item.id);
    const displayData = data.map(item => ({
      ...item,
      desc: item.operations?.map(li => li.display_name).join(' '),
    }));
    const filterList = await list.filter(item => item.role_name === role_name);
    setCheckedValues(checked);
    setPermissionList(displayData);
    if (checked.length === data.length) {
      setCheckAll(true);
      setIndeterminate(false);
    } else {
      setIndeterminate(true);
    }
    form.setFieldsValue({
      display_name: filterList[0].display_name,
    });
  };

  const onCheckAllChange = e => {
    setCheckAll(e.target.checked);
    if (e.target.checked) {
      setIndeterminate(false);
      const allData = permissionList.map(li => li.id);
      setCheckedValues(allData);
    } else {
      // handleInit();
      const noData = permissionList.filter(item => item.checked === 2).map(li => li.id);
      if (noData.length) {
        setIndeterminate(true);
      }
      setCheckedValues(noData);
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      settings: checkedValues,
    });
  }, [checkedValues]);

  const confirm = async () => {
    const values = await form.validateFields();
    const { settings, display_name } = values;
    Modal.info({
      title: `确认修改当前角色的权限吗？`,
      content: '确认后，修改的权限配置将立即生效，其他角色的权限配置也会按规则变动。',
      style: { top: 240 },
      onOk: async () => {
        try {
          const list = permissionList.map(li => ({
            id: li.id,
            category_name: li.category_name,
            display_name: li.display_name,
            checked: settings.includes(li.id) ? (li.checked === 2 ? 2 : 1) : 0,
          }));
          setLoading(true);
          await updateRole({ display_name, role_name, role_id: id, perm_settings: list });
          dispatch({
            type: 'account/getAllAuthList',
            payload: dispatch,
          });
          message.success('权限配置修改成功！');
          router.goBack();
        } finally {
          setLoading(false);
          Modal.destroyAll();
        }
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  useEffect(() => {
    if (id) {
      handleInit();
    }
  }, [id]);

  return (
    <Page
      alert={
        <Alert
          type="info"
          showIcon
          message="温馨提示：角色权限配置时，高级角色中配置的权限，与之较低级角色中的相应权限会随之取消；低级角色中已配置的权限，与之较高级角色配置中会随之增加。"
        />
      }
      title="修改权限配置"
      noContentLayout
      showBackIcon
    >
      <div className={styles.detailPage}>
        <ItemTitle title="基本信息" />
        <Form form={form} hideRequiredMark>
          <Form.Item
            name="display_name"
            label="角色名称"
            rules={[
              { required: true, message: '请输入角色名称' },
              { max: 30, message: '请输入30字以内角色名称' },
            ]}
            {...formItemLayout}
          >
            <Input style={{ width: 360 }} placeholder="请输入角色名称" />
          </Form.Item>
          <div style={{ padding: '0 12px', width: 960 }}>
            <Divider style={{ marginBottom: 20, marginTop: -8, borderTop: '1px dashed #E7E7E7' }} />
          </div>
          <ItemTitle title="权限配置" />
          <div className={styles.configItem}>
            <Form.Item
              name="settings"
              label="权限配置"
              {...formItemLayout}
              rules={[{ required: true, message: '请选择权限配置' }]}
            >
              <Checkbox
                indeterminate={indeterminate}
                onChange={onCheckAllChange}
                checked={checkAll}
              >
                全选
              </Checkbox>
              <Checkbox.Group
                style={{ marginTop: 8, width: '100%' }}
                value={checkedValues}
                onChange={onChange}
              >
                {permissionList.map(item => (
                  <div className={styles.checkboxItem}>
                    <Checkbox value={item.id} disabled={item.checked === 2}>
                      {item.display_name}
                    </Checkbox>
                    <div className={styles.checkboxItemTxt}>{item.desc}</div>
                  </div>
                ))}
              </Checkbox.Group>
            </Form.Item>
          </div>
          <Form.Item label="&nbsp;" {...formItemLayout}>
            <Button type="primary" loading={loading} onClick={confirm}>
              确定
            </Button>
            <Button
              style={{ marginLeft: 12 }}
              onClick={() => {
                router.goBack();
              }}
            >
              取消
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Page>
  );
}

export default connect(({ account, global }) => ({
  userInfo: account.info,
  loading: global.loading,
}))(WithLoading(PermissionEdit));
