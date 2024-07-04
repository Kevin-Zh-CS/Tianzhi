import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import { Form, Input, Button, message } from 'quanta-design';
import { login } from '@/services/account';
import { ReactComponent as BitxMeshLogo } from '@/assets/bitxmesh_logo_white.svg';
import background from '@/assets/login_bg.png';
import styles from './index.less';

function Login({ dispatch = null }) {
  const [orgName, setOrgName] = useState('');
  const recent = new Date().getFullYear();
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch({
      type: 'organization/info',
      callback: res => setOrgName(res?.name),
    });
  }, []);

  const submit = async () => {
    const formValues = await form.validateFields();
    const res = await login({ ...formValues });
    dispatch({
      type: 'account/info',
    });
    localStorage.setItem('token', res.token);
    localStorage.setItem('expire', res.expire);
    router.push('/share');
  };
  const handleBlur = name => {
    const value = form.getFieldValue([name]);
    form.setFields([
      {
        name,
        value,
        errors: '',
      },
    ]);
  };

  return (
    <div className={styles.loginPage} style={{ backgroundImage: `url('${background}')` }}>
      <div className={styles.header}>
        <BitxMeshLogo />
        <a style={{ display: 'none' }}>帮助文档</a>
      </div>
      <div className={styles.slogan}>
        <span className={styles.title}>数趣横生</span>
        <span className={styles.desc}>打通数据孤岛，释放数据价值</span>
      </div>
      <div className={`${styles.loginCard} container-card`}>
        <span className={styles.title}>欢迎来到 BitXMesh！</span>
        <span className={styles.desc}>{orgName}</span>
        <Form form={form}>
          <Form.Item
            name="tel"
            validateFirst
            validateTrigger="onBlur"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^[1][0-9]{10}$/, message: '手机号格式不正确，请重新输入' },
            ]}
          >
            <Input
              onFocus={() => handleBlur('tel')}
              onPressEnter={submit}
              placeholder="请输入手机号"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="pwd"
            validateFirst
            validateTrigger="onBlur"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              onFocus={() => handleBlur('pwd')}
              onPressEnter={submit}
              placeholder="请输入密码"
              size="large"
              style={{ marginTop: 12 }}
            />
          </Form.Item>
        </Form>
        <Button onClick={submit} style={{ marginTop: 12 }} type="primary" size="large">
          登录
        </Button>
        <a onClick={() => message.info('请联系本机构超级管理员重置密码！')}>忘记密码</a>
      </div>
      <div className={styles.footer}>
        Copyright &copy; 2019-{recent} DataMesh Labs. All Rights Reserved. 趣链科技数据网格实验室
        版权所有
      </div>
    </div>
  );
}

export default connect()(Login);
