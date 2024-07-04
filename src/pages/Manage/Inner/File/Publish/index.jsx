import React from 'react';
import {
  Alert,
  Button,
  Form,
  Select,
  Input,
  Radio,
  IconBase,
  Tooltip,
  Modal,
  Descriptions,
  message,
  Icons,
} from 'quanta-design';
import { Space } from 'antd';
import router from 'umi/router';
import Page from '@/components/Page';
import ItemTitle from '@/components/ItemTitle';
import { Byte2AllB } from '@/utils/helper';
import { Prompt } from 'react-router';
import classnames from 'classnames';
import { ReactComponent as questionCircleIcon } from '@/assets/question_circle.svg';
import FileShow from '@/pages/Manage/Inner/component/FileShow';
import AuthorizationListModal from '@/pages/Manage/Inner/component/AuthorizationListModal';
import { connect } from 'dva';
import {
  downloadSingle,
  fileInfo,
  getFileUrl,
  getFileView,
  handleAuthPublish,
  updateFile,
} from '@/services/resource';
import { fileTypeMap, getFileType, DATA_THEME, fileIconMap, goDownload } from '../config';
import { validatorPrice, validatorInput } from '@/pages/Manage/Inner/config';

import styles from './index.less';
import { ReactComponent as minusSquareIcon } from '@/icons/minus_square.svg';
import { ReactComponent as plusSquareIcon } from '@/icons/plus_square.svg';
import WithLoading from '@/components/WithLoading';

const { CloseIcon } = Icons;
class Publish extends React.Component {
  constructor() {
    super();
    this.state = {
      showFloat: false,
      authVisible: false,
      info: {},
      initPrice: 1,
      orgList: [],
      content: '',
    };
    this.isSave = true;
    this.formRef = React.createRef();
  }

  handlePrompt = location => {
    if (
      !this.isSave &&
      !location.pathname.startsWith('/manage/inner/repository/file/publish/success')
    ) {
      this.showModalSave(location);
      return false;
    }
    return true;
  };

  getInfo = async () => {
    const {
      location: { query },
      dispatch,
    } = this.props;
    const { dir, namespace } = query;
    const info = await fileInfo(namespace, dir, dispatch);
    const title = info.name ? info.name.substr(0, info.name.lastIndexOf('.')) : '';
    this.setState({ info, initPrice: info.pub_type || 1, orgList: info.auth_list });
    // eslint-disable-next-line
    this.formRef.current &&
      this.formRef.current.setFieldsValue({
        title: info.title ? info.title : title,
        desc: info.topics ? info.desc : undefined,
        topics: info.topics || [],
        pub_type: info.pub_type || 1,
        packages:
          info.packages && info.packages.length > 0
            ? info.packages.map(item => ({ ...item, credit: item.credit / 100 }))
            : [{}],
      });

    if (getFileType(fileTypeMap[info.format]) === 'text') {
      getFileView(namespace, dir).then(res => {
        const reader = new window.FileReader();
        reader.readAsText(res.data);
        reader.onload = e => {
          const { result } = e.target;
          const encodingRight = result.indexOf('�') > -1;
          if (encodingRight) {
            reader.readAsText(res.data, 'gbk');
          }
          this.setState({ content: result });
        };
      });
    }
  };

  componentDidMount() {
    this.getInfo();
  }

  showModalSave = location => {
    const {
      location: { query },
    } = this.props;
    Modal.info({
      title: '确认离开当前正在编辑的页面吗？',
      content: '若不保存，当前正在编辑的内容将丢失。',
      okText: '保存',
      cancelText: '不保存',
      style: { top: 240 },
      closable: true,
      closeIcon: <CloseIcon fill="#888" />,
      onOk: () => this.closeModalSave(location),
      onCancel: e => {
        if (!e.triggerCancel) {
          this.isSave = true;
          router.replace({
            pathname: location.pathname,
            query: { ...query, dir: location.query.dir },
          });
        }
        Modal.destroyAll();
      },
    });
  };

  closeModalSave = async location => {
    await this.handleSave();
    const {
      location: { query },
    } = this.props;
    router.replace({
      pathname: location.pathname,
      query: { ...query, dir: location.query.dir },
    });
  };

  handleSave = async () => {
    const {
      location: { query },
      dispatch,
    } = this.props;
    const { namespace } = query;
    this.isSave = true;
    const { info, initPrice } = this.state;
    const values = this.formRef.current.getFieldsValue();
    const params = { ...values, file_id: info.file_id, pub_type: initPrice };
    if (initPrice === 2) {
      params.packages = values.packages.map(item => ({ ...item, credit: item.credit * 100 }));
    }
    await updateFile(namespace, params, dispatch);
    message.success('编辑内容保存成功！');
  };

  download = async () => {
    const {
      location: { query },
    } = this.props;
    const { dir, namespace } = query;
    downloadSingle(namespace, { dir }).then(res => {
      if (res.status === 200) {
        goDownload(res);
      }
    });
  };

  handlePublish = async () => {
    const {
      location: { query },
      dispatch,
    } = this.props;
    const { info, initPrice } = this.state;
    const { namespace, dir } = query;
    const values = await this.formRef.current.validateFields();
    const params = { ...values, file_id: info.file_id };
    if (initPrice === 2) {
      params.packages = values.packages.map(item => ({ ...item, credit: item.credit * 100 }));
    }
    await handleAuthPublish(namespace, params, dispatch);
    message.success('数据发布成功！');
    router.replace(
      // eslint-disable-next-line
      `/manage/inner/repository/file/publish/success?namespace=${namespace}&id=${
        info.file_id
      }&dir=${window.encodeURIComponent(dir)}`,
    );
  };

  onChangePrice = e => {
    this.setState({ initPrice: e.target.value });
  };

  handleChooseData = data => {
    this.setState({ orgList: data, authVisible: false }, () => {
      this.formRef.current.setFieldsValue({ white_list: data.map(item => item.org_id) });
    });
  };

  handleChooseDataCancel = () => {
    this.setState({ authVisible: false });
  };

  goBack = () => {
    const {
      location: { query },
    } = this.props;
    const { namespace, dir } = query;
    const _dir =
      dir
        .split('/')
        .slice(0, -1)
        .join('/') || '/';
    router.replace(
      `/manage/inner/repository/file?namespace=${namespace}&dir=${window.encodeURIComponent(_dir)}`,
    );
  };

  handleFormChange = () => {
    if (this.isSave) this.isSave = false;
  };

  render() {
    const { showFloat, authVisible, info, initPrice, orgList, content } = this.state;
    const {
      location: { query },
    } = this.props;
    const { dir, namespace } = query;

    const formItemLayout = {
      labelCol: { style: { width: 105, textAlign: 'left', marginLeft: 12 } },
      wrapperCol: {},
    };
    return (
      <div>
        <Prompt message={this.handlePrompt} />
        <Page
          title="发布数据"
          alert={
            <Alert
              type="info"
              message=" 温馨提示：数据发布时仅发布数据元信息（如数据标题、数据描述等）至区块链，并可为某些机构设置默认的数据访问权限；原始数据不发布。"
              showIcon
            />
          }
          backFunction={this.goBack}
          showBackIcon
          noContentLayout
        >
          <div style={{ position: 'relative' }}>
            <div className={classnames(styles.floatModal, showFloat ? '' : styles.hidden)}>
              <div
                className={styles.btn}
                onClick={() => {
                  this.setState({ showFloat: false });
                }}
              >
                <div className={styles.horizontal} />
              </div>
              <div className={styles.title}>
                <span>原始数据</span>
              </div>
              <div className={styles.nameWrap}>
                <span>{info.name}</span>
                <Button size="small" type="primary" onClick={this.download}>
                  下载
                </Button>
              </div>
              <div className={styles.fileWrap}>
                <FileShow
                  type={getFileType(fileTypeMap[info.format || 0])}
                  icon={fileIconMap[info.format || 0]}
                  data={info}
                  content={content}
                  src={getFileUrl(namespace, dir)}
                  handleDownload={this.download}
                />
              </div>
            </div>
          </div>
          <div className={styles.contentWrap}>
            <ItemTitle
              title="数据元信息"
              extra={
                <Button
                  onClick={() => {
                    this.setState({ showFloat: true });
                  }}
                >
                  查看原始数据
                </Button>
              }
            />
            <Form
              onFieldsChange={this.handleFormChange}
              colon={false}
              ref={this.formRef}
              hideRequiredMark
            >
              <Descriptions>
                <Descriptions.Item label="数据哈希">{info.hash || '-'}</Descriptions.Item>
                <Descriptions.Item label="数据类型">文件</Descriptions.Item>
                <Descriptions.Item label="数据大小">{Byte2AllB(info.size || 0)}</Descriptions.Item>
                <Descriptions.Item label="所属机构">{info.org_name || '-'}</Descriptions.Item>
              </Descriptions>
              <Form.Item
                name="title"
                label="数据标题"
                rules={[
                  { required: true, message: '请输入数据标题' },
                  { max: 30, message: '数据标题不可超过30个字符，请重新输入' },
                ]}
                {...formItemLayout}
              >
                <Input style={{ width: 360 }} placeholder="请输入" />
              </Form.Item>
              <Form.Item
                name="desc"
                label="数据描述"
                rules={[
                  { required: true, message: '请输入数据描述' },
                  { max: 100, message: '数据描述不可超过100个字符，请重新输入' },
                ]}
                {...formItemLayout}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="请输入100字以内的数据描述"
                  style={{ width: 360 }}
                />
              </Form.Item>
              <Form.Item
                name="topics"
                label="数据主题"
                {...formItemLayout}
                rules={[{ required: true, message: '请选择数据主题' }]}
              >
                <Select style={{ width: 360 }} placeholder="请选择" mode="multiple">
                  {DATA_THEME.map(item => (
                    <Select.Option key={item.key} value={item.key}>
                      {item.value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="pub_type"
                label={
                  <div style={{ display: 'flex' }}>
                    <span style={{ marginRight: 10 }}>共享类型</span>
                    <Tooltip
                      style={{ width: 332 }}
                      arrowPointAtCenter
                      placement="topLeft"
                      title={
                        <div>
                          <div>
                            授权共享： 即通过授权的方式进行数据获取，授权
                            名单内的机构可以直接获取数据，无需审核；其余
                            需要进行申请，审核通过后才可以获取数据。
                          </div>
                          <div>积分共享： 即通过积分购买的形式进行数据获取。</div>
                          <div>公开共享：即可以直接获取数据。</div>
                        </div>
                      }
                    >
                      <IconBase icon={questionCircleIcon} fontSize={20} fill="#888888" />
                    </Tooltip>
                  </div>
                }
                {...formItemLayout}
              >
                <Radio.Group onChange={this.onChangePrice} value={initPrice}>
                  <Radio value={1}>授权共享</Radio>
                  <Radio value={2}>积分共享</Radio>
                  <Radio value={3}>公开共享</Radio>
                </Radio.Group>
              </Form.Item>
              {/* eslint-disable-next-line */}
              {initPrice === 2 ? (
                <Form.List name="packages" initialValue={[{}]}>
                  {(fields, { add, remove }) => (
                    <>
                      <Form.Item
                        label={
                          <div style={{ display: 'flex' }}>
                            <span style={{ marginRight: 10 }}>套餐设置</span>
                            <Tooltip
                              arrowPointAtCenter
                              placement="topLeft"
                              title="套餐设置：用户购买某一套餐后，可在指定有效时间和有效次数内使用数据。"
                            >
                              <IconBase icon={questionCircleIcon} fontSize={20} fill="#888888" />
                            </Tooltip>
                          </div>
                        }
                        {...formItemLayout}
                      >
                        <div style={{ width: 620 }}>
                          <Alert
                            type="info"
                            message={
                              <>
                                <div>套餐设置规则</div>
                                <div>
                                  <div>
                                    1.有效时间设置为0，即永久有效；有效次数设置为0，即无限次数；
                                  </div>
                                  <div>2.同一数据积分发布时，至少有1组套餐，至多有10组套餐。</div>
                                </div>
                              </>
                            }
                            showIcon
                          />
                        </div>
                        <div className="price-container">
                          <div className="plusItem">
                            <Tooltip
                              arrowPointAtCenter
                              placement="topLeft"
                              title={fields.length === 10 ? '至多设置10组套餐！' : ''}
                            >
                              <IconBase
                                icon={plusSquareIcon}
                                onClick={() => {
                                  if (fields.length === 10) return;
                                  add();
                                }}
                                fill={fields.length === 10 ? '#b7b7b7' : '#888'}
                              />
                            </Tooltip>
                          </div>
                          <div className="priceItem">有效时间</div>
                          <div className="priceItem">有效次数</div>
                          <div>积分价格</div>
                        </div>
                        {fields.map(({ key, name, fieldKey, ...restField }) => (
                          <Space key={key} className="space-container" align="baseline">
                            <div className="plusItem">
                              <Tooltip
                                arrowPointAtCenter
                                placement="topLeft"
                                title={fields.length === 1 ? '请至少设置1组套餐！' : ''}
                              >
                                <IconBase
                                  icon={minusSquareIcon}
                                  onClick={() => {
                                    if (fields.length === 1) return;
                                    remove(name);
                                  }}
                                  fill={fields.length === 1 ? '#b7b7b7' : '#888'}
                                />
                              </Tooltip>
                            </div>
                            <Form.Item
                              {...restField}
                              name={[name, 'duration']}
                              fieldKey={[fieldKey, 'duration']}
                              rules={[
                                { required: true, message: '请输入有效时间' },
                                { validator: validatorPrice },
                              ]}
                            >
                              <Input
                                style={{ width: 186 }}
                                placeholder="请输入有效时间"
                                suffix="天"
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'quantity']}
                              fieldKey={[fieldKey, 'quantity']}
                              rules={[
                                { required: true, message: '请输入有效次数' },
                                { validator: validatorPrice },
                              ]}
                            >
                              <Input
                                style={{ width: 186 }}
                                placeholder="请输入有效次数"
                                suffix="次"
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'credit']}
                              fieldKey={[fieldKey, 'credit']}
                              rules={[
                                { required: true, message: '请输入积分' },
                                { validator: validatorInput },
                              ]}
                            >
                              <Input style={{ width: 186 }} placeholder="请输入积分" suffix="Bx" />
                            </Form.Item>
                          </Space>
                        ))}
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              ) : initPrice === 1 ? (
                <Form.Item
                  name="white_list"
                  label={
                    <div style={{ display: 'flex' }}>
                      <span style={{ marginRight: 10 }}>授权名单</span>
                      <Tooltip
                        arrowPointAtCenter
                        placement="topLeft"
                        title="授权名单中勾选的机构在数据共享平台中可以直接
                      获取数据、无需审核，授权有效期为永久有效。"
                      >
                        <IconBase icon={questionCircleIcon} fontSize={20} fill="#888888" />
                      </Tooltip>
                    </div>
                  }
                  {...formItemLayout}
                >
                  <Button
                    size="small"
                    type="primary"
                    style={{ marginTop: 5 }}
                    onClick={() => this.setState({ authVisible: true })}
                  >
                    选择授权名单
                  </Button>
                  <div className={styles.companyWrap}>
                    {(orgList || []).map(item => (
                      <div key={item.id || item.org_id} className={styles.company}>
                        {item.org_name || item.name}
                      </div>
                    ))}
                  </div>
                </Form.Item>
              ) : null}
              <div style={{ marginLeft: 117, paddingTop: 12 }}>
                <Button type="primary" onClick={this.handlePublish}>
                  发布
                </Button>
                <Button onClick={this.handleSave} style={{ marginLeft: 12 }}>
                  保存
                </Button>
              </div>
            </Form>
          </div>
        </Page>
        <AuthorizationListModal
          checkedList={orgList}
          visible={authVisible}
          onOk={this.handleChooseData}
          onCancel={this.handleChooseDataCancel}
        />
      </div>
    );
  }
}

export default connect(({ loading, global }) => ({
  loading: loading.global || global.loading,
}))(WithLoading(Publish));
