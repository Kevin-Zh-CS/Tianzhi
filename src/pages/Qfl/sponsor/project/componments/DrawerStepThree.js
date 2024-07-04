import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Icons,
  Input,
  Select,
  Radio,
  message,
  Alert,
  Row,
  Col,
  Spin,
} from 'quanta-design';
import { Drawer, Space } from 'antd';
import '../index.less';
import {
  createModel,
  getFeListFeature,
  getModelApproach,
  // getNodeResources,
  restartStepFourJob,
} from '@/services/qfl-sponsor';
import { stepFourEnums, formItemLayout, getStepTwoFlatList } from '@/pages/Qfl/config';
import HighConfigModal from './HighConfigModal';
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import RadioCard from '@/pages/Federate/components/RadioCard';
import { ReactComponent as DataPlatformIcon } from '@/icons/data_h.svg';
import { ReactComponent as InvitationIcon } from '@/icons/data_z.svg';
import styles from '@/pages/Qfl/sponsor/project/componments/index.less';
// import { MB2GB } from '@/utils/helper';

const { CloseIcon } = Icons;
const { Item } = Form;
const { Option } = Select;
const DrawerStepThree = props => {
  const {
    visible,
    onCancel,
    projectId,
    len,
    onloadData,
    prevJobId,
    dataList,
    type,
    isEdit,
    activeItem,
    auth,
    isPartner,
  } = props;
  const [highVisible, setHighVisible] = useState(false);
  const [highConfig, setHighConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [approachList, setApproachList] = useState([]);
  const [optimizerList, setOptimizerList] = useState([]);
  const [earlyStopList, setEarlyStopList] = useState([]);
  const [approachData, setApproachData] = useState(undefined);
  const [selectHighList, setSelectHighList] = useState([]);
  const [selectAllData, setSelectAllData] = useState({});
  const [random, setRandom] = useState(false);
  const [selectLabelList, setSelectLabelList] = useState({});
  const [labelList, setLabelList] = useState([]);
  const [multiClassList, setMultiClassList] = useState([]);
  const [multiData, setMultiData] = useState('binary');
  // const [resourceInfo, setResourceInfo] = useState({});
  const [load, setLoad] = useState(false);

  // 实现两端固定，中间3个点可拖动，需将中间三个点的值可控，两端的值用value写死
  const [sValue1, setSValue1] = useState(80);
  const [sValue2, setSValue2] = useState(90);

  const [form] = Form.useForm();

  const getLabelMapList = async () => {
    if (isPartner) return [];
    const params = {
      project_id: projectId,
      prev_job_id: prevJobId,
    };
    const mapList = await getFeListFeature(params);

    setSelectLabelList(mapList);
    return mapList;
  };

  const initLabelMap = async () => {
    const flatList = getStepTwoFlatList(dataList, type);
    const { job_config } = activeItem;
    setLabelList(flatList);
    try {
      setLoad(true);
      if (job_config && job_config.select_feature) {
        const { select_feature } = job_config;
        const values = Object.values(select_feature || {});
        const keys = Object.keys(select_feature || {});
        const lists = values.map((item, index) => ({ feature_name: item, data_id: keys[index] }));

        form.setFieldsValue({
          select_feature: lists,
        });
        getLabelMapList(flatList);
      } else {
        const list = await getLabelMapList(flatList);
        const dList = flatList.map(item => ({
          data_id: item.data_id,
          feature_name: list[item.data_id].map(li => li.name),
        }));
        form.setFieldsValue({ select_feature: dList || [] });
      }
      setLoad(false);
    } catch (e) {
      form.setFieldsValue({ select_feature: [] });
      setLoad(false);
    }
  };

  // useEffect(() => {
  //   if (visible && dataList) {
  //     initLabelMap();
  //   }
  // }, [visible, dataList]);

  const getList = (data, key) => (data || []).filter(item => item.param_name === key);
  // const getResource = async () => {
  //   const res = await getNodeResources();
  //   setResourceInfo(res);
  // };

  const initData = list => {
    const optimizer = getList(list, 'optimizer');
    const earlyStop = getList(list, 'early_stop');
    const multiClass = getList(list, 'task_type');
    setOptimizerList(optimizer[0].options);
    setEarlyStopList(earlyStop[0].options);
    if (multiClass && multiClass.length) {
      setMultiClassList(multiClass[0].options);
    }
  };

  const loadData = async () => {
    const res = await getModelApproach(type);
    const { common_param_list, lr_param_list, linr_param_list } = res;
    setSelectAllData({ lr_param_list, linr_param_list });
    const approach = getList(common_param_list, 'approach');
    setApproachList(approach[0].options);
    const { job_config } = activeItem;
    if (len > 0) {
      if (job_config.common.approach === 'logistic-regression') {
        setSelectHighList(lr_param_list);
        initData(lr_param_list);
      } else if (job_config.common.approach === 'linear-regression') {
        setSelectHighList(linr_param_list);
        initData(linr_param_list);
      }
    } else {
      form.setFieldsValue({
        // 默认选择逻辑回归
        approach: undefined,
      });
    }
  };

  useEffect(() => {
    if (visible) {
      loadData();
      // getResource();
      const { job_config } = activeItem;

      if (len > 0) {
        form.setFieldsValue({
          ...activeItem,
          ...job_config,
          ...job_config.common,
          job_desc: activeItem.desc,
          has_random: true,
          job_name: !isEdit ? `安全建模${len + 1}` : activeItem.job_name,
          task_type: job_config.common.task_type || 'binary',
          // job_cpu_load_limit: activeItem.job_cpu_load_limit || 100,
          // job_memory_limit: activeItem.job_memory_limit || '',
          contribution: job_config.common.contribution || false,
        });
        // console.log(select_feature)
        setSValue1(Math.round(job_config.common.train_size * 100));
        setApproachData(job_config.common.approach);
        setMultiData(job_config.common.task_type);
        if (job_config.common.task_type && job_config.common.task_type === 'multi') {
          setSValue2(
            Math.round((job_config.common.train_size + job_config.common.validate_size) * 100),
          );
        } else {
          setSValue2(
            Math.round((job_config.common.train_size + job_config.common.test_size) * 100),
          );
        }
        setHighConfig(job_config.advanced);
      } else {
        form.setFieldsValue({
          job_name: `安全建模${len + 1}`,
        });
      }
      initLabelMap();
    }
  }, [visible]);

  const handleConfirm = async () => {
    const values = await form.validateFields();
    const {
      job_name,
      job_desc,
      select_feature,
      // job_memory_limit,
      // job_cpu_load_limit,
      ...extra
    } = values;
    const filter = {
      ...extra,
      train_size: sValue1 / 100,
      test_size: (sValue2 - sValue1) / 100,
      validate_size: (100 - sValue2) / 100,
    };

    if (values.max_iter) {
      filter.max_iter = Number(values.max_iter);
    }

    if (values.epochs) {
      filter.epochs = Number(values.epochs);
    }

    if (approachData === 'kmeans') {
      filter.k = Number(values.k);

      if (!values.random_stat) {
        filter.random_stat = 0;
      } else {
        filter.random_stat = Number(values.random_stat);
      }
    }

    if (approachData === 'logistic-regression' && multiData === 'multi') {
      filter.test_size = 0;
      filter.validate_size = (sValue2 - sValue1) / 100;
    }

    if (select_feature && Array.isArray(select_feature)) {
      const featureMap = {};
      select_feature.forEach((item, index) => {
        featureMap[labelList[index].data_id] = item.feature_name;
      });
      filter.select_feature = featureMap;
    }

    const allParams = {
      job_name, // 任务名称
      job_desc, // 任务描述
      // job_memory_limit,
      // job_cpu_load_limit,
      project_id: projectId, // 项目ID
      prev_job_id: prevJobId,
      params: {
        // 参数名称->参数值，都以英文标识显示，具体对照关系查看参数汇总表
        ...filter,
      },
    };

    if (approachData !== 'kmeans' && approachData !== 'dnn') {
      allParams.params = {
        ...filter,
        ...highConfig,
      };
    }

    try {
      setLoading(true);
      if (isEdit) {
        allParams.job_id = activeItem.job_id;
        await restartStepFourJob(allParams);
        message.success('任务重新运行成功！');
      } else {
        await createModel(allParams);
        message.success('任务创建成功！');
      }
      onloadData();
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  const handleHighConfig = () => {
    setHighVisible(true);
  };

  const handleHighOk = data => {
    setHighConfig(data);
    setHighVisible(false);
  };

  // 滑动滑块触发
  const onSliderChange = value => {
    if (value[0] >= 50) {
      setSValue1(value[0]);
      setSValue2(value[1]);
    }
  };

  const handleChangeApproach = val => {
    setApproachData(val);
    const { job_config } = activeItem;
    const common = job_config?.common || {};
    const { lr_param_list, linr_param_list } = selectAllData;
    if (val === 'kmeans') {
      setSValue2(100);
    } else if (val === 'logistic-regression') {
      setSelectHighList(lr_param_list);
      initData(lr_param_list);
      setMultiData(common.task_type || 'binary');
    } else if (val === 'linear-regression') {
      setSelectHighList(linr_param_list);
      initData(linr_param_list);
    } else {
      setSelectHighList(linr_param_list);
      initData(linr_param_list);
    }

    form.setFieldsValue({
      k: common.k || 5,
      tol: common.tol || 0.01,
      shuffle: true,
      optimizer: common.optimizer || 'sgd',
      learning_rate: common.learning_rate || 0.01,
      early_stop: common.early_stop || 'diff',
      max_iter: common.max_iter || 10,
      epochs: common.epochs || 10,
      has_random: false,
      random_stat: common.random_stat || 300,
      // job_cpu_load_limit: activeItem.job_cpu_load_limit || 100,
      contribution: false,
      task_type: common.task_type || 'binary',
    });
  };

  const validValue = (rule, v, callback) => {
    if (v && Number(v) < 0) {
      callback('请输入大于0的整数');
    } else if (v && !Number.isInteger(Number(v))) {
      callback('请输入大于0的整数');
    }
    callback();
  };

  const checkResult = () => {
    const url = `#/qfl/sponsor/project/detail/info?step=1&jobId=${prevJobId}&type=${type}&projectId=${projectId}`;
    window.open(url, 'about:blank');
  };

  const handleRandomChange = val => {
    setRandom(val);
    if (val) {
      const { job_config } = activeItem;
      const common = job_config?.common || {};
      form.setFieldsValue({
        random_stat: common.random_stat || 300,
      });
    }
  };

  const handleMultiChange = val => {
    setMultiData(val);
    if (val === 'multi') {
      setSValue2(100);
    }
  };

  const validIntValue = (rule, v, callback) => {
    if (v && Number(v) <= 0) {
      callback('请输入大于0且小于等于100的整数');
    } else if (v && !Number.isInteger(Number(v))) {
      callback('请输入大于0且小于等于100的整数');
    } else if (v && Number(v) > 100) {
      callback('请输入大于0且小于等于100的整数');
    }
    callback();
  };

  return (
    <Drawer
      className="drawerStep"
      title={null}
      placement="right"
      width={600}
      closable={false}
      visible={visible}
      footerStyle={{
        border: 0,
      }}
      footer={
        auth.includes('qfl_restart_task') ? (
          <div className="drawerFooter">
            <Button onClick={onCancel}>取消</Button>
            <Button loading={loading} type="primary" className="confirm" onClick={handleConfirm}>
              {isEdit ? '重新运行' : '确定'}
            </Button>
          </div>
        ) : null
      }
    >
      <Spin spinning={load}>
        <div className="drawerStepThree">
          <div className="title">
            <div>安全建模</div>
            <CloseIcon onClick={onCancel} />
          </div>
          <div className="subTitle">安全建模是多方数据迭代完成模型训练。</div>
          <div className={styles.stepThreeForm}>
            <Form colon={false} hideRequiredMark form={form}>
              <Item label="项目类型" {...formItemLayout}>
                {type === 0 ? (
                  <RadioCard
                    icon={DataPlatformIcon}
                    title="横向联邦"
                    desc="常运用于同行业共建联合模型"
                    active
                  />
                ) : (
                  <RadioCard
                    icon={InvitationIcon}
                    title="纵向联邦"
                    desc="常运用于跨行业数据提升的场景中"
                    active
                  />
                )}
              </Item>
              <Item
                label="任务名称"
                name="job_name"
                rules={[
                  { required: true, message: '请输入任务名称' },
                  { max: 30, message: '任务名称不可超过30个字符，请重新输入' },
                ]}
                {...formItemLayout}
              >
                <Input placeholder="请输入任务名称" />
              </Item>
              <Item
                name="job_desc"
                rules={[{ max: 100, message: '任务描述不可超过100个字符，请重新输入' }]}
                label="任务描述"
                {...formItemLayout}
              >
                <Input.TextArea rows={4} placeholder="请输入100字以内任务描述" />
              </Item>
              <Form.List name="select_feature">
                {fields => (
                  <>
                    <Form.Item label="选择特征" {...formItemLayout} className={styles.formList3}>
                      <div>
                        <Button size="small" onClick={checkResult}>
                          查看特征工程结果
                        </Button>
                      </div>
                      {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                        <Space
                          key={key}
                          className={styles.spaceContainer}
                          style={{ marginTop: index ? 20 : 10 }}
                          align="baseline"
                        >
                          <div>{labelList[key]?.data_name}</div>
                          <Form.Item
                            {...restField}
                            name={[name, 'feature_name']}
                            fieldKey={[fieldKey, 'feature_name']}
                            rules={[{ required: true, message: '请选择特征' }]}
                          >
                            <Select
                              style={{ width: '100%' }}
                              mode="multiple"
                              placeholder="请选择特征"
                            >
                              {labelList[key]?.data_id &&
                              selectLabelList[labelList[key]?.data_id] ? (
                                selectLabelList[labelList[key]?.data_id]
                                  ?.filter(li => li.type === '2')
                                  .map(item => <Option key={item.name}>{item.name}</Option>)
                              ) : (
                                <Option disabled>暂无匹配数据！</Option>
                              )}
                            </Select>
                          </Form.Item>
                        </Space>
                      ))}
                    </Form.Item>
                  </>
                )}
              </Form.List>
              <Item
                label="建模方法"
                name="approach"
                rules={[{ required: true, message: '请选择建模方法' }]}
                {...formItemLayout}
              >
                <Select placeholder="请选择建模方法" onChange={handleChangeApproach}>
                  {approachList.map(item => (
                    <Option key={item}>{stepFourEnums[item]}</Option>
                  ))}
                </Select>
              </Item>

              {approachData !== 'logistic-regression' ? null : (
                <Item
                  label="多分类方法"
                  name="task_type"
                  rules={[{ required: true, message: '请选择多分类方法' }]}
                  {...formItemLayout}
                >
                  <Select placeholder="请选择多分类方法" onChange={handleMultiChange}>
                    {multiClassList.map(item => (
                      <Option key={item}>{stepFourEnums[item]}</Option>
                    ))}
                  </Select>
                </Item>
              )}

              {approachData === 'logistic-regression' && multiData === 'binary' ? (
                <Item
                  label="贡献评估"
                  name="contribution"
                  rules={[{ required: true, message: '请选择多贡献评估' }]}
                  {...formItemLayout}
                >
                  <Radio.Group>
                    <Radio value>是</Radio>
                    <Radio value={false}>否</Radio>
                  </Radio.Group>
                </Item>
              ) : null}

              {approachData ? (
                <>
                  {approachData === 'logistic-regression' && multiData === 'multi' ? (
                    <Row style={{ marginBottom: 28 }}>
                      <Col style={{ width: 96 }}>数据切分</Col>
                      <Col span={17} className={styles.configContent}>
                        <Alert
                          type="info"
                          message="温馨提示：该方法不支持设置测试集，默认使用训练集数据进行预测。"
                          showIcon
                        />
                        <div className="color-progress2" style={{ width: '100%' }}>
                          <Range
                            count={2}
                            value={[sValue1, 100]}
                            allowCross={false}
                            // pushable
                            trackStyle={[{ backgroundColor: '#08CB94' }]}
                            railStyle={{ backgroundColor: '#0076D9' }}
                            onChange={onSliderChange}
                          />
                          <div className="colorContent">
                            <div className="colorItem">
                              <span className="colorBox color1" />
                              <span className="colorTxt">训练集 {sValue1}%</span>
                            </div>
                            <div className="colorItem">
                              <span className="colorBox color2" />
                              <span className="colorTxt">验证集 {sValue2 - sValue1}%</span>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  ) : (
                    <Item label="数据切分" {...formItemLayout}>
                      <div
                        className={approachData === 'kmeans' ? 'color-progress2' : 'color-progress'}
                        style={{ width: '100%' }}
                      >
                        <Range
                          count={2}
                          value={[sValue1, sValue2, 100]}
                          allowCross={false}
                          // pushable
                          trackStyle={[
                            { backgroundColor: '#eea844' },
                            { backgroundColor: '#08CB94' },
                          ]}
                          railStyle={{ backgroundColor: '#0076D9' }}
                          onChange={onSliderChange}
                        />
                        <div className="colorContent">
                          <div className="colorItem">
                            <span className="colorBox color1" />
                            <span className="colorTxt">训练集 {sValue1}%</span>
                          </div>
                          <div className="colorItem">
                            <span className="colorBox color3" />
                            <span className="colorTxt">测试集 {sValue2 - sValue1}%</span>
                          </div>
                          {approachData === 'kmeans' ? null : (
                            <div className="colorItem">
                              <span className="colorBox color2" />
                              <span className="colorTxt">验证集 {100 - sValue2}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Item>
                  )}

                  <Item
                    name="shuffle"
                    label="数据乱序"
                    rules={[{ required: true, message: `请选择数据乱序` }]}
                    {...formItemLayout}
                  >
                    <Radio.Group>
                      <Radio value>是</Radio>
                      <Radio value={false}>否</Radio>
                    </Radio.Group>
                  </Item>
                  {approachData === 'kmeans' ? (
                    <Item
                      label="聚类数"
                      name="k"
                      rules={[
                        { required: true, message: '请输入聚类数' },
                        { validator: validIntValue },
                      ]}
                      {...formItemLayout}
                    >
                      <Input placeholder="请输入聚类数" />
                    </Item>
                  ) : (
                    <>
                      {approachData === 'dnn' ? null : (
                        <>
                          <Item
                            label="优化器"
                            name="optimizer"
                            rules={[{ required: true, message: '请选择优化器' }]}
                            {...formItemLayout}
                          >
                            <Select placeholder="请选择优化器">
                              {optimizerList.map(item => (
                                <Option key={item}>{stepFourEnums[item]}</Option>
                              ))}
                            </Select>
                          </Item>
                        </>
                      )}
                      <Item
                        name="learning_rate"
                        label="学习率"
                        extra="建议输入0.0001-0.1之间的数值"
                        rules={[
                          { required: true, message: '请输入学习率' },
                          {
                            validator: (rule, v, callback) => {
                              if (v <= 0 || v >= 100) {
                                callback('请输入大于0且小于100的数');
                              }
                              callback();
                            },
                          },
                        ]}
                        {...formItemLayout}
                      >
                        <Input placeholder="请输入学习率" />
                      </Item>
                    </>
                  )}
                  <Item
                    name={approachData === 'dnn' ? 'epochs' : 'max_iter'}
                    label="最大迭代数"
                    extra="建议输入10-100之间的数值"
                    rules={[
                      { required: true, message: `请输入最大迭代数` },
                      {
                        validator: validValue,
                      },
                    ]}
                    {...formItemLayout}
                  >
                    <Input placeholder="请输入最大迭代数" />
                  </Item>
                  {approachData === 'kmeans' || approachData === 'dnn' ? null : (
                    <Item
                      name="early_stop"
                      label="早停方法"
                      rules={[{ required: true, message: `请选择早停方法` }]}
                      {...formItemLayout}
                    >
                      <Select placeholder="请选择早停方法">
                        {earlyStopList.map(item => (
                          <Option key={item}>{stepFourEnums[item]}</Option>
                        ))}
                      </Select>
                    </Item>
                  )}
                  {approachData === 'dnn' ? null : (
                    <>
                      <Item
                        name="tol"
                        label="误差值"
                        extra="建议输入0.0001-0.1之间的数值"
                        rules={[
                          { required: true, message: '请输入误差值' },
                          {
                            validator: (rule, v, callback) => {
                              if (v < 0) {
                                callback('请输入大于0的数');
                              }
                              callback();
                            },
                          },
                        ]}
                        {...formItemLayout}
                      >
                        <Input placeholder="请输入误差值" />
                      </Item>

                      {/* k-means数据 */}
                      {approachData === 'kmeans' ? (
                        <>
                          <Item
                            name="has_random"
                            label="随机种子"
                            rules={[{ required: true, message: `请选择随机种子` }]}
                            {...formItemLayout}
                          >
                            <Radio.Group onChange={handleRandomChange}>
                              <Radio value>有</Radio>
                              <Radio value={false}>无</Radio>
                            </Radio.Group>
                          </Item>

                          {random ? (
                            <Item
                              name="random_stat"
                              label="随机种子数"
                              rules={[
                                { required: true, message: '请输入随机种子数' },
                                {
                                  validator: validValue,
                                },
                              ]}
                              {...formItemLayout}
                            >
                              <Input placeholder="请输入随机种子数" />
                            </Item>
                          ) : null}
                        </>
                      ) : null}
                    </>
                  )}
                  {/* <Row style={{ marginBottom: 28 }}> */}
                  {/*  <Col style={{ width: 96 }}>资源配置</Col> */}
                  {/*  <Col span={17} className={styles.configContent}> */}
                  {/*    <Alert */}
                  {/*      type="info" */}
                  {/*      message={`温馨提示：当前CPU为${resourceInfo.cpu_cores}核，系统内存为${MB2GB( */}
                  {/*        resourceInfo.node_memory || 0, */}
                  {/*      )}，推荐默认参数为最佳资源分配效果。系统内存上限不填则表示不限。`} */}
                  {/*      showIcon */}
                  {/*    /> */}
                  {/*    <div className={styles.formList}> */}
                  {/*      <div className={styles.formListHeader}> */}
                  {/*        <div className={styles.formListHeaderItem}>配置内容</div> */}
                  {/*        <div className={styles.formListHeaderItem}>配置参数</div> */}
                  {/*      </div> */}
                  {/*      <Space align="baseline" className={styles.spaceContainer}> */}
                  {/*        <div className="label-name">cpu负载上限</div> */}
                  {/*        <div className={styles.formItem}> */}
                  {/*          <Form.Item */}
                  {/*            name="job_cpu_load_limit" */}
                  {/*            rules={[ */}
                  {/*              { required: true, message: '请输入cpu负载上限' }, */}
                  {/*              { validator: validIntValue }, */}
                  {/*            ]} */}
                  {/*          > */}
                  {/*            <Input palcehoder="请输入cpu负载上限" /> */}
                  {/*          </Form.Item> */}
                  {/*          <div className={styles.extra}>%</div> */}
                  {/*        </div> */}
                  {/*      </Space> */}
                  {/*      <Space align="baseline" className={styles.spaceContainer}> */}
                  {/*        <div className="label-name">系统内存上限</div> */}
                  {/*        <div className={styles.formItem}> */}
                  {/*          <Form.Item */}
                  {/*            name="job_memory_limit" */}
                  {/*            rules={[ */}
                  {/*              { */}
                  {/*                validator: (rule, v, callback) => { */}
                  {/*                  if (v && Number(v) <= 0) { */}
                  {/*                    callback('请输入大于0且小于系统内存上限的整数'); */}
                  {/*                  } else if (v && !Number.isInteger(Number(v))) { */}
                  {/*                    callback('请输入大于0且小于系统内存上限的整数'); */}
                  {/*                  } else if (v && Number(v) > resourceInfo.node_memory) { */}
                  {/*                    callback('请输入大于0且小于系统内存上限的整数'); */}
                  {/*                  } */}
                  {/*                  callback(); */}
                  {/*                }, */}
                  {/*              }, */}
                  {/*            ]} */}
                  {/*          > */}
                  {/*            <Input palcehoder="请输入系统内存上限" /> */}
                  {/*          </Form.Item> */}
                  {/*          <div className={styles.extra}>MB</div> */}
                  {/*        </div> */}
                  {/*      </Space> */}
                  {/*    </div> */}
                  {/*  </Col> */}
                  {/* </Row> */}
                  {type === 0 || (approachData !== 'kmeans' && approachData !== 'dnn') ? (
                    <Item label="高级配置" {...formItemLayout}>
                      <Button size="small" type="primary" onClick={handleHighConfig}>
                        设置高级配置
                      </Button>
                    </Item>
                  ) : null}
                </>
              ) : null}
            </Form>
          </div>
        </div>
      </Spin>
      <HighConfigModal
        visible={highVisible}
        selectList={selectHighList}
        isEdit={isEdit}
        initData={activeItem}
        onOk={handleHighOk}
        type={type}
        approach={approachData}
        onCancel={() => {
          setHighVisible(false);
        }}
      />
    </Drawer>
  );
};

export default DrawerStepThree;
