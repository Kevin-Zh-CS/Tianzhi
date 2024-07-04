import React from 'react';
import styles from '@/pages/Manage/Outer/component/OuterLeftDetail/index.less';
import { Descriptions } from 'quanta-design';
import './index.less';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import CodeEditor from '@/components/CodeEditor';
import ParamTable from '@/pages/Manage/component/ParamTable';

const { Panel } = Collapse;

export default function ModelDetail(props) {
  const { info = {} } = props;
  const methods = info.args ? JSON.parse(info.args) : [];

  return (
    <Descriptions className={styles.outerLeft}>
      <Descriptions.Item label="参数信息" className={styles.fontColor}></Descriptions.Item>
      <Descriptions.Item>
        <Collapse
          defaultActiveKey={['0']}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        >
          {methods.map((item, i) => (
            <Panel key={i.toString()} header={item.name} className={styles.luaPanel}>
              <div className={styles.parameters}>
                <div className={styles.intro}>使用说明</div>
                <div className={styles.sub_intro}>{item.desc || '-'}</div>
                <div className={styles.intro}>输入参数</div>
                <div className={styles.paramTable} style={{ marginBottom: 12 }}>
                  <ParamTable list={item.inputs || []} />
                </div>
                <div className={styles.intro}>输出参数</div>
                <div className={styles.paramTable} style={{ marginBottom: 12 }}>
                  <ParamTable list={item.outputs || []} />
                </div>
                <div className={styles.intro}>请求示例</div>
                <div className={styles.paramTable}>
                  <CodeEditor
                    mode="json"
                    value={
                      info.request_example && info.request_example[i] ? info.request_example[i] : ''
                    }
                    placeholder="这是请求示例"
                    readOnly
                  />
                </div>
              </div>
            </Panel>
          ))}
        </Collapse>
      </Descriptions.Item>
    </Descriptions>
  );
}
