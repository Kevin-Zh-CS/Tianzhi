import React, { useEffect, useState } from 'react';
import { Button, Form, Icons, Input, Select, message, IconBase, Spin } from 'quanta-design';
import { Drawer, Space } from 'antd';
import {
  createFeatureEngineer,
  getFeatureEngineerApproach,
  getFeListFeature,
  restartStepThreeJob,
} from '@/services/qfl-sponsor';
import {
  getFlatList,
  getStepTwoFlatList,
  resolveDataPrepareParams,
  stepThreeEnums,
} from '@/pages/Qfl/config';
import RadioCard from '@/pages/Federate/components/RadioCard';
import { ReactComponent as DataPlatformIcon } from '@/icons/data_h.svg';
import { ReactComponent as InvitationIcon } from '@/icons/data_z.svg';
import styles from './index.less';
import { ReactComponent as deleteIcon } from '@/icons/delete.svg';

const { CloseIcon } = Icons;
const { Item } = Form;
const { Option } = Select;
const DrawerStepTwo = props => {
  const {
    visible,
    onCancel,
    projectId,
    len,
    onloadData,
    prevJobId,
    isEdit,
    activeItem,
    dataList,
    type,
    auth,
    isPartner,
  } = props;
  const [selectList, setSelectList] = useState([]);
  const [optionList, setOptionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectLabelList, setSelectLabelList] = useState({});
  const [labelList, setLabelList] = useState([]);
  const [selectName, setSelectName] = useState(['binning']);
  const [load, setLoad] = useState(false);
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { style: { width: 96, textAlign: 'left' } },
    wrapperCol: { span: 17 },
  };

  const getLabelMapList = async () => {
    try {
      setLoad(true);
      const params = {
        project_id: projectId,
        prev_job_id: prevJobId,
      };
      const mapList = await getFeListFeature(params);

      setSelectLabelList(mapList);
    } finally {
      setLoad(false);
    }
  };

  const initLabelMap = () => {
    const flatList = getStepTwoFlatList(dataList, type);
    setLabelList(flatList);

    const dList = flatList.map(item => ({ data_id: item.data_id, feature_name: [] }));
    form.setFieldsValue({ bin_feature: type ? dList : [] });
    if (!isPartner) {
      getLabelMapList(flatList);
    }
  };

  useEffect(() => {
    if (visible && dataList) {
      initLabelMap();
    }
  }, [visible, dataList]);

  const loadData = async () => {
    const data = await getFeatureEngineerApproach(type);
    const list = data.filter(item => item.param_name === 'approach');
    setSelectList(list[0].options);
    const scaleData = data.filter(item => item.param_name === list[0].options[0]);
    setOptionList(scaleData[0].options);
  };

  const getFeatureList = (values, keys) => {
    const keyList = [];
    const flatList = getFlatList(dataList);
    const list = values.map((item, index) => {
      keyList.push({
        data_id: keys[index],
        data_name: flatList.filter(li => li.data_id === keys[index])[0].data_name,
        key: keys[index],
      });
      return { feature_name: item, data_id: keys[index] };
    });
    return list;
  };

  useEffect(() => {
    if (visible) {
      if (len) {
        const { job_config } = activeItem;
        const { bin_feature, pearson_feature } = job_config;
        const values = Object.values(bin_feature || {});
        const keys = Object.keys(bin_feature || {});
        const list = getFeatureList(values, keys);

        const pearsonValues = Object.values(pearson_feature || {});
        const pearsonKeys = Object.keys(pearson_feature || {});
        const pearsonList = getFeatureList(pearsonValues, pearsonKeys);
        setSelectName(job_config.approach);
        form.setFieldsValue({
          ...activeItem,
          ...job_config,
          job_desc: activeItem.desc,
          approach: job_config.approach,
          binning: job_config.binning,
          bin_num: job_config.bin_num,
          job_name: !isEdit ? `特征工程${len + 1}` : activeItem.job_name,
          bin_feature: type === 0 ? values[0] : list,
          pearson_feature: pearsonList,
        });
      } else {
        form.setFieldsValue({
          job_name: `特征工程${len + 1}`,
          approach: selectName,
        });
      }
    }
  }, [visible]);

  useEffect(() => {
    loadData();
  }, []);

  const handleOk = async () => {
    const values = await form.validateFields();
    const { job_name, job_desc, bin_num, binning, bin_feature, pearson_feature, approach } = values;

    const params = {
      job_name,
      job_desc,
      project_id: projectId, // 项目ID
      prev_job_id: prevJobId,
      params: {
        approach,
      },
    };

    const flatList = getStepTwoFlatList(dataList, type);
    if (bin_feature) {
      const featureMap = {};
      if (type === 0) {
        flatList.forEach(item => {
          featureMap[item.data_id] = bin_feature;
        });
      } else {
        const activeFeature = bin_feature.filter(item => item.feature_name.length > 0);
        if (!activeFeature.length) {
          message.error('分箱至少需要选择一方的特征！');
          return;
        }
        bin_feature.forEach((item, index) => {
          featureMap[labelList[index].data_id] = item.feature_name;
        });
      }

      params.params.bin_num = Number(bin_num);
      params.params.binning = binning;
      params.params.bin_feature = featureMap;
    }

    if (pearson_feature) {
      const featureMap = {};
      pearson_feature.forEach((item, index) => {
        featureMap[labelList[index].data_id] = item.feature_name;
      });
      params.params.pearson_feature = featureMap;
    }

    try {
      setLoading(true);
      if (isEdit) {
        params.job_id = activeItem.job_id;
        await restartStepThreeJob(params);
        message.success('任务重新运行成功！');
      } else {
        await createFeatureEngineer(params);
        message.success('任务创建成功！');
      }
      onloadData();
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  const handleChangeApproach = val => {
    setSelectName(val);
    const flatList = getFlatList(dataList);
    if (val.includes('pearson')) {
      form.setFieldsValue({
        pearson_feature: flatList,
      });
    }
    if (val.includes('binning')) {
      // bin_feature
      const dList = flatList.map(item => ({ data_id: item.data_id, feature_name: [] }));
      form.setFieldsValue({
        bin_feature: dList,
      });
    }
  };

  const deleteItem = val => {
    const data = selectName.filter(item => item !== val);
    setSelectName(data);
    form.setFieldsValue({ approach: data });
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
            <Button loading={loading} type="primary" className="confirm" onClick={handleOk}>
              {isEdit ? '重新运行' : '确定'}
            </Button>
          </div>
        ) : null
      }
    >
      <Spin spinning={load}>
        <div className="drawerStepTwo">
          <div className="title">
            <div>特征工程</div>
            <CloseIcon onClick={onCancel} />
          </div>
          <div className="subTitle">特征工程是协同各方数据提取模型特征。</div>
          <div>
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

              <Item
                label="特征工程方法"
                name="approach"
                rules={[{ required: true, message: '请选择特征工程方法' }]}
                {...formItemLayout}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择特征工程方法"
                  onChange={handleChangeApproach}
                >
                  {selectList.map(item => (
                    <Option key={item}>{resolveDataPrepareParams[item]}</Option>
                  ))}
                </Select>
              </Item>

              {selectName.includes('binning') ? (
                <>
                  <div className={styles.itemTitle}>
                    <div className={styles.itemTitleContent}>
                      <div>特征工程方法——分箱 </div>
                      <IconBase
                        icon={deleteIcon}
                        onClick={() => {
                          deleteItem('binning');
                        }}
                      />
                    </div>
                  </div>
                  <Item
                    name="binning"
                    label="分箱方法"
                    rules={[{ required: true, message: '请选择分箱方法' }]}
                    {...formItemLayout}
                  >
                    <Select placeholder="请选择分箱方法">
                      {optionList.map(item => (
                        <Option key={item}>{stepThreeEnums[item]}</Option>
                      ))}
                    </Select>
                  </Item>
                  <Item
                    name="bin_num"
                    label="分箱数"
                    rules={[
                      { required: true, message: '请输入分箱数' },
                      {
                        validator: (rule, v, callback) => {
                          if (v) {
                            if ((v && !Number(v)) || v < 0 || v > 9999999) {
                              callback('请输入大于0且小于9999999的整数');
                            } else if (v && !Number.isInteger(Number(v))) {
                              callback('请输入大于0且小于9999999的整数');
                            } else {
                              callback();
                            }
                          }
                          callback();
                        },
                      },
                    ]}
                    {...formItemLayout}
                  >
                    <Input placeholder="请输入分箱数" />
                  </Item>
                  {type === 0 ? (
                    <Item
                      label="选择特征"
                      name="bin_feature"
                      rules={[{ required: true, message: '请选择特征' }]}
                      {...formItemLayout}
                    >
                      <Select style={{ width: '100%' }} mode="multiple" placeholder="请选择特征">
                        {labelList[0]?.data_id && selectLabelList[labelList[0]?.data_id] ? (
                          selectLabelList[labelList[0]?.data_id]
                            ?.filter(li => li.type === '2' || li.type === '1')
                            .map(item => <Option key={item.name}>{item.name}</Option>)
                        ) : (
                          <Option disabled>暂无匹配数据！</Option>
                        )}
                      </Select>
                    </Item>
                  ) : (
                    <Form.List name="bin_feature">
                      {fields => (
                        <>
                          <Form.Item
                            label="选择特征"
                            {...formItemLayout}
                            className={styles.formList3}
                          >
                            {fields.map(({ key, name, fieldKey, ...restField }) => (
                              <Space key={key} className={styles.spaceContainer} align="baseline">
                                <div>{labelList[key]?.data_name}</div>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'feature_name']}
                                  fieldKey={[fieldKey, 'feature_name']}
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
                  )}
                </>
              ) : null}
              {selectName.includes('pearson') ? (
                <>
                  <div className={styles.itemTitle}>
                    <div className={styles.itemTitleContent}>
                      <div>特征工程方法——特征相关性分析 </div>
                      <IconBase
                        icon={deleteIcon}
                        onClick={() => {
                          deleteItem('pearson');
                        }}
                      />
                    </div>
                  </div>
                  <Form.List name="pearson_feature">
                    {fields => (
                      <>
                        <Form.Item
                          label="选择特征"
                          {...formItemLayout}
                          className={styles.formList3}
                        >
                          {fields.map(({ key, name, fieldKey, ...restField }) => (
                            <Space key={key} className={styles.spaceContainer} align="baseline">
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
                </>
              ) : null}
            </Form>
          </div>
        </div>
      </Spin>
    </Drawer>
  );
};

export default DrawerStepTwo;
