import React, { useState, useEffect } from 'react';
import styles from './index.less';
import ItemTitle from '@/components/ItemTitle';
import {
  Button,
  Col,
  Empty,
  Form,
  IconBase,
  Input,
  Row,
  Select,
  Tooltip,
  Alert,
  message,
} from 'quanta-design';
import FileShow from '@/pages/Manage/Outer/component/FileShow';
import { fileIconMap, fileTypeMap, getFileType, goDownload } from '@/pages/Manage/Outer/config';
import {
  downloadSingle,
  getFileUrl,
  invokeModel,
  invokeInterface,
  downloadRemote,
  remoteFileUrl,
} from '@/services/outer';
import { Collapse } from 'antd';
import { PERMISSION } from '@/utils/enums';
import { CaretRightOutlined } from '@ant-design/icons';
import { ReactComponent as EmptyIcon } from '@/icons/empty-image.svg';
import CodeEditor from '@/components/CodeEditor';
import { isJSON } from '@/utils/helper';

const { Panel } = Collapse;

function OuterRightDetail(props) {
  const {
    type,
    info,
    content,
    needTransfer,
    setTransfer,
    namespace,
    app_key,
    location,
    auth = [],
    noAuth,
    onPre,
    loadData,
  } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [invokeResult, setInvokeResult] = useState('点击"调用"计算调用结果');
  const [invokeLog, setInvokeLog] = useState('点击"调用"生成调用日志');
  const [invokeResult1, setInvokeResult1] = useState('点击"调用"计算调用结果');
  const [argsList, setArgsList] = useState([]);
  const [headerArgs, setHeaderArgs] = useState({});
  const [preview, setPreview] = useState(false);
  const [url, setUrl] = useState('');
  const canUse = info.is_valid; // is_expiration 0:未过期  1:过期
  const canDownload = namespace ? false : canUse;
  // eslint-disable-next-line
  const methods = info.args ? JSON.parse(info.args) : type === 2 ? [] : {};
  const [codeValue, setCodeValue] = useState(methods?.body?.body || '{}');
  const fileFormats = [1, 2, 3, 4, 8];
  useEffect(() => {
    if (methods && methods.body) {
      setCodeValue(methods?.body?.body || '{}');
    }
  }, [info.args]);

  const emptyImg = (
    <IconBase width="72" viewBox="0 0 72 72" height="72" icon={EmptyIcon} fill="#000" />
  );
  const formItemLayout = {
    labelCol: { style: { width: 86, textAlign: 'left' } },
    wrapperCol: {},
  };
  const emptyBox = (
    <Empty
      className={styles.emptyBox}
      description={<div className={styles.fontColor1}>暂无参数</div>}
      image={emptyImg}
    />
  );

  // 文件的下载
  const download = async () => {
    if (namespace) {
      downloadSingle({ app_key, namespace }).then(res => {
        goDownload(res);
        if (loadData) loadData();
      });
    } else {
      downloadRemote({ app_key, location }).then(res => {
        goDownload(res);
        if (loadData) loadData();
      });
    }
  };

  const handleInputParams = (e, idx, type1) => {
    if (type1 === 'query' || type1 === 'model') {
      argsList[idx] = e.target.value;
      setArgsList(argsList);
    } else if (type1 === 'headers') {
      headerArgs[methods.headers.headers[idx].name] = e.target.value;
      setHeaderArgs(headerArgs);
    }
  };

  // 模型调用的函数
  const handleInvokeModel = () => {
    invokeModel({
      location: info.node_id,
      app_key: info.app_key,
      func_name: methods[selectedIndex]?.name || '',
      args: argsList,
    })
      .then(res => {
        if (isJSON(res)) {
          setInvokeResult(JSON.stringify(JSON.parse(res), null, 2));
        } else {
          setInvokeResult(res);
        }

        setInvokeLog('调用成功');
        if (loadData) loadData();
      })
      .catch(msg => {
        setInvokeLog(msg);
        setInvokeResult('点击"调用"计算调用结果');
      });
  };

  // 接口调用的函数
  const handleInvokeInterface = () => {
    const usefulList = argsList.filter(item => !!item);
    if (
      methods?.queries?.query_strings?.length &&
      methods?.queries?.query_strings?.length !== usefulList.length
    ) {
      message.error('请填写所有的请求参数（Query）配置');
      return;
    }
    invokeInterface({
      location: info.node_id,
      app_key: info.app_key,
      func_name: 'main',
      args: argsList,
      headers: headerArgs,
      body: codeValue === '' ? methods.body.body : codeValue,
    })
      .then(res => {
        setInvokeResult1(JSON.stringify(res, null, 2));
        if (loadData) loadData();
      })
      .catch(msg => {
        setInvokeResult1(msg);
      });
  };

  const extra = (
    <div>
      {noAuth || (namespace && auth.includes(PERMISSION.usage)) ? (
        <Button disabled={canDownload} onClick={download}>
          下载
        </Button>
      ) : null}
      <Button disabled={canUse} onClick={setTransfer} type="primary" className={styles.btn}>
        转存
      </Button>
    </div>
  );

  const handlePre = async () => {
    if (info.file_format === 8) {
      onPre();
    } else {
      let fileUrl = '';
      if (namespace) {
        fileUrl = getFileUrl({ app_key: info.app_key, namespace });
      } else {
        fileUrl = remoteFileUrl({ app_key: info.app_key, location: info.node_id });
      }
      setUrl(fileUrl);
    }
    setPreview(true);
  };

  return (
    <div className={styles.rightContent}>
      {/* 文件管理详情--右侧 */}
      {type === 0 && (
        <>
          <ItemTitle
            title="原始数据"
            extra={
              needTransfer
                ? extra
                : (auth.includes(PERMISSION.usage) || noAuth) && (
                    <Button disabled={canDownload} onClick={download} type="primary">
                      下载
                    </Button>
                  )
            }
          />
          <div className={styles.nameWrap}>{info.data_title}</div>
          <div className={styles.fileShow}>
            <Alert
              type="info"
              message="温馨提示：文件预览将消耗次数，可直接下载后查看或转存后不限次下载。"
            />
            {preview ? (
              <FileShow
                type={getFileType(fileTypeMap[info.file_format || 0])}
                icon={fileIconMap[info.format || 0]}
                data={info}
                handleDownload={download}
                content={content}
                src={url}
                onLoad={loadData}
              />
            ) : fileFormats.includes(info.file_format) ? (
              <FileShow
                type={getFileType(fileTypeMap[0])}
                icon={fileIconMap[info.file_format || 0]}
                data={info}
                content={content}
                onPreview={handlePre}
                tip="当前格式支持预览，文件预览将消耗使用次数。"
              />
            ) : (
              <FileShow
                type={getFileType(fileTypeMap[info.file_format || 0])}
                icon={fileIconMap[info.file_format || 0]}
                data={info}
                content={content}
              />
            )}
          </div>
        </>
      )}

      {/* 模型管理详情--右侧 */}
      {type === 2 && (
        <Form name="model">
          <ItemTitle
            title="调试结果"
            extra={
              needTransfer ? (
                <Button disabled={canUse} onClick={setTransfer} type="primary">
                  转存
                </Button>
              ) : null
            }
          />
          <div className={styles.method}>
            <Form.Item label="调用方法" {...formItemLayout}>
              <Select
                placeholder="请选择"
                style={{ width: 200 }}
                value={selectedIndex}
                onChange={e => setSelectedIndex(e)}
              >
                {(methods || []).map((item, index) => (
                  <Select.Option key={item.name} value={index}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <span className={styles.fontColor}>输入参数</span>

            <div className={styles.parameters}>
              <div className={styles.paramTable}>
                <Row align="middle" className={styles.tableThead}>
                  <Col span={5}>名称</Col>
                  <Col span={5}>类型</Col>
                  <Col span={7}>描述</Col>
                  <Col span={7}>参数值</Col>
                </Row>
                {methods[selectedIndex]?.inputs && methods[selectedIndex].inputs.length > 0
                  ? methods[selectedIndex].inputs.map((li, index) => (
                      <Row align="middle" className={styles.tableTr}>
                        <Col span={5}>{li.name}</Col>
                        <Col span={5}>{li.type}</Col>
                        <Col span={7}>{li.desc}</Col>
                        <Col span={7}>
                          <Input
                            placeholder="请输入参数值"
                            onChange={e => {
                              handleInputParams(e, index, 'model');
                            }}
                          />
                        </Col>
                      </Row>
                    ))
                  : emptyBox}
              </div>
            </div>
            {noAuth || (namespace && auth.includes(PERMISSION.usage)) ? (
              <Tooltip placement="bottomRight" title={canUse ? '该数据已失效，不能调用！' : ''}>
                <div className={styles.modelInvoke}>
                  <Button type="primary" disabled={canUse} onClick={handleInvokeModel}>
                    调用
                  </Button>
                </div>
              </Tooltip>
            ) : null}
            <div className={styles.invokeResult}>调试结果</div>
            <div className={styles.output}>
              <pre className={invokeResult === '点击"调用"计算调用结果' ? styles.disabled : ''}>
                {invokeResult}
              </pre>
            </div>
            <div className={styles.invokeResult}>调试日志</div>
            <div className={styles.output}>
              <pre className={invokeLog === '点击"调用"生成调用日志' ? styles.disabled : ''}>
                {invokeLog}
              </pre>
            </div>
          </div>
        </Form>
      )}

      {/* 接口管理详情--右侧 */}
      {type === 1 && (
        <Form>
          <ItemTitle
            title="调试结果"
            extra={
              needTransfer ? (
                <Button disabled={canUse} onClick={setTransfer} type="primary">
                  转存
                </Button>
              ) : null
            }
          />
          <div className={styles.marginLeft}>
            <Collapse
              defaultActiveKey={['0']}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            >
              <Panel key="0" header="请求参数（Headers）">
                {methods.headers?.headers?.length > 0 ? (
                  <div className={styles.parameters}>
                    <div className={styles.paramTable}>
                      <div>
                        <span className={styles.fontColor1}>输入参数</span>
                        <Row align="middle" className={styles.tableThead}>
                          <Col span={5}>名称</Col>
                          <Col span={5}>类型</Col>
                          <Col span={7}>描述</Col>
                          <Col span={7}>参数值</Col>
                        </Row>
                      </div>
                      {(methods?.headers?.headers || []).map((li, index) => (
                        <div>
                          <Row align="middle" className={styles.tableTr}>
                            <Col span={5}>{li.name || '-'}</Col>
                            <Col span={5}>{li.type || '-'}</Col>
                            <Col span={7}>{li.desc || '-'}</Col>
                            <Col span={7}>
                              <Input
                                placeholder="请输入参数值"
                                onChange={e => handleInputParams(e, index, 'headers')}
                              />
                            </Col>
                          </Row>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  emptyBox
                )}
              </Panel>
              <div className={styles.myspace}></div>

              <Panel key="1" header="请求参数（Query）">
                {methods.queries?.query_strings?.length > 0 ? (
                  <div className={styles.parameters}>
                    <div className={styles.paramTable}>
                      <div>
                        <span style={{ color: '#595959' }}>输入参数</span>
                        <Row align="middle" className={styles.tableThead}>
                          <Col span={5}>名称</Col>
                          <Col span={5}>类型</Col>
                          <Col span={7}>描述</Col>
                          <Col span={7}>参数值</Col>
                        </Row>
                      </div>
                      {methods.queries.query_strings.map((li, index) => (
                        <div>
                          <Row align="middle" key="" className={styles.tableTr}>
                            <Col span={5}>{li.name || '-'}</Col>
                            <Col span={5}>{li.type || '-'}</Col>
                            <Col span={7}>{li.desc || '-'}</Col>
                            <Col span={7}>
                              <Input
                                placeholder="请输入参数值"
                                onChange={e => handleInputParams(e, index, 'query')}
                              />
                            </Col>
                          </Row>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  emptyBox
                )}
              </Panel>
              <div className={styles.myspace}></div>

              <Panel key="2" header="请求参数（Body）">
                <div className={styles.paramTable} style={{ marginTop: 0 }}>
                  <CodeEditor
                    mode="json"
                    value={codeValue}
                    placeholder={methods?.body?.body || '{}'}
                    onChange={v => setCodeValue(v)}
                  />
                  {/* <CodeEditor value={(methods.body && methods.body.body) || '-'} readOnly /> */}
                </div>
              </Panel>
              <div className={styles.myspace}></div>

              <div className={styles.interfaceInvoke}>
                {noAuth || (namespace && auth.includes(PERMISSION.usage)) ? (
                  <Tooltip placement="bottomRight" title={canUse ? '该数据已失效，不能调用！' : ''}>
                    <div className={styles.invoke}>
                      <Button type="primary" disabled={canUse} onClick={handleInvokeInterface}>
                        调用
                      </Button>
                    </div>
                  </Tooltip>
                ) : null}
                <div className={styles.invokeResult}>调试结果</div>
                <div className={styles.output}>
                  <pre
                    className={invokeResult1 === '点击"调用"计算调用结果' ? styles.disabled : ''}
                  >
                    {invokeResult1}
                  </pre>
                </div>
              </div>
            </Collapse>
          </div>
        </Form>
      )}
    </div>
  );
}

export default OuterRightDetail;
