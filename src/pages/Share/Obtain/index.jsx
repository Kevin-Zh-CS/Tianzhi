import React, { useState } from 'react';
import Page from '@/components/NewPage';
import { Tabs } from 'quanta-design';
import { useForm } from 'antd/lib/form/Form';
import ShareTable from '../components/ShareTable';

function Provide() {
  const [form] = useForm();
  const [keys, setKeys] = useState('0');
  const changeKey = key => {
    setKeys(key);
  };
  return (
    <Page title="数据获取">
      <Tabs onChange={changeKey}>
        <Tabs.TabPane tab="授权订单" key="0" style={{ paddingTop: -12 }}>
          <ShareTable
            isAuth
            isProvider={0}
            form={form}
            style={{ marginTop: 6 }}
            keyData="obtainAuth"
            keys={keys}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="积分订单" key="1">
          <ShareTable
            isProvider={0}
            form={form}
            style={{ marginTop: 6 }}
            keyData="obtainCredit"
            keys={keys}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="公开订单" key="2">
          <ShareTable
            isProvider={0}
            form={form}
            style={{ marginTop: 6 }}
            keyData="obtainPublish"
            keys={keys}
          />
        </Tabs.TabPane>
      </Tabs>
    </Page>
  );
}
export default Provide;
