import React from 'react';
import { Descriptions } from 'quanta-design';
import styles from './index.less';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import CodeEditor from '@/components/CodeEditor';
import ParamTable from '@/pages/Manage/component/ParamTable';

const { Panel } = Collapse;

export default function InterfaceDetail(props) {
  const { info = {} } = props;
  const methods = info.args ? JSON.parse(info.args) : {};

  return (
    <Descriptions style={{ marginLeft: -12 }}>
      <Descriptions.Item>
        <div className={styles.line}></div>
      </Descriptions.Item>
      <Descriptions.Item label="请求方式" style={{ paddingBottom: 8 }}>
        {info.order_type ? 'GET' : 'POST'}
      </Descriptions.Item>
      <Descriptions.Item label={<div style={{ paddingBottom: 8, marginTop: 12 }}>参数信息</div>}>
        <Collapse
          defaultActiveKey={['0']}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        >
          <Panel key="0" header="请求参数（Headers）">
            <div className={styles.parameters}>
              <div className={styles.intro}>使用说明</div>
              <div className={styles.sub_intro}>
                {(methods.headers && methods.headers.desc) || '-'}
              </div>
              <div className={styles.intro}>输入参数</div>
              <div className={styles.paramTable}>
                <ParamTable list={methods.headers?.headers || []} />
              </div>
            </div>
          </Panel>
          <div className={styles.myspace}></div>

          <Panel key="1" header="请求参数（Query）">
            <div className={styles.parameters}>
              <div className={styles.intro}>使用说明</div>
              <div className={styles.sub_intro}>
                {(methods.headers && methods.headers.desc) || '-'}
              </div>
              <div className={styles.intro}>输入参数</div>
              <div className={styles.paramTable}>
                <ParamTable list={methods.queries?.query_strings || []} />
              </div>
            </div>
          </Panel>
          <div className={styles.myspace}></div>

          <Panel key="3" header="请求参数（Body）">
            <div className={styles.parameters}>
              <div className={styles.intro}>使用说明</div>
              <div className={styles.sub_intro}>{(methods.body && methods.body.desc) || '-'}</div>
              <div className={styles.paramTable}>
                <div className={styles.codeWrap}>
                  <CodeEditor value={(methods.body && methods.body.body) || '-'} readOnly />
                </div>
              </div>
            </div>
          </Panel>
        </Collapse>
      </Descriptions.Item>

      <Descriptions.Item label="输出参数" style={{ paddingBottom: 8, paddingTop: 25 }}>
        <div className={styles.parameters} style={{ marginTop: -13 }}>
          <div className={styles.paramTable}>
            <ParamTable list={methods.rets?.req_response || []} />
          </div>
        </div>
      </Descriptions.Item>
      <Descriptions.Item label="请求示例" style={{ paddingBottom: 8 }}>
        <div className={styles.paramTable} style={{ marginTop: 0 }}>
          <CodeEditor mode="json" value={methods.example || ''} placeholder="这是请求示例" />
        </div>
      </Descriptions.Item>
    </Descriptions>
  );
}
