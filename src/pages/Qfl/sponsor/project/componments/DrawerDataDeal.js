import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  IconBase,
  Icons,
  Input,
  message,
  Select,
  Tooltip,
  Alert,
  Spin,
} from 'quanta-design';
import { Drawer, Space } from 'antd';
import RadioCard from '@/pages/Federate/components/RadioCard';
import styles from './index.less';
import { ReactComponent as DataPlatformIcon } from '@/icons/data_h.svg';
import { ReactComponent as InvitationIcon } from '@/icons/data_z.svg';
import {
  createPreprocess,
  getAllParams,
  getListFeature,
  restartStepTwoJob,
} from '@/services/qfl-sponsor';
import { resolveDataPrepareData, getFlatList, formItemLayout } from '@/pages/Qfl/config';
import { ReactComponent as plusSquareIcon } from '@/icons/plus_square.svg';
import { ReactComponent as minusSquareIcon } from '@/icons/minus_square.svg';
import { ReactComponent as deleteIcon } from '@/icons/delete.svg';

const { CloseIcon } = Icons;
const { Item } = Form;
const { Option } = Select;
const DrawerDataDeal = props => {
  const {
    visible,
    onCancel,
    type,
    dataList,
    projectId,
    len,
    onLoadData,
    isEdit,
    activeItem,
    auth,
  } = props;
  // const [selectList, setSelectList] = useState([]);
  const selectList = ['scale'];
  const [selectScaleList, setSelectScaleList] = useState([]);
  const [optionList, setOptionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectLabelList, setSelectLabelList] = useState({});
  const [labelList, setLabelList] = useState([]);
  const [itemLabelList, setItemLabelList] = useState([]);
  const [approachData, setApproachData] = useState(['scale']);
  const [load, setLoad] = useState(false);
  const [form] = Form.useForm();

  const getLabelMapList = async list => {
    try {
      setLoad(true);
      const data = list.map(item => item.data_id);
      const params = {
        data_ids: data,
        project_id: projectId,
      };
      const mapList = await getListFeature(params);
      setSelectLabelList(mapList);
    } finally {
      setLoad(false);
    }
  };

  const getListByKeys = (values, keys) => {
    const flatList = getFlatList(dataList);
    const keyList = [];
    const list = values.map((item, index) => {
      keyList.push({
        data_id: keys[index],
        data_name: flatList.filter(li => li.data_id === keys[index])[0].data_name,
        key: keys[index],
      });
      return { label_name: item, data_id: keys[index], feature_name: item || [] };
    });

    return { list, keyList };
  };

  const getFeatureListByKeys = (list = {}) => {
    const flatList = getFlatList(dataList);

    return flatList.map(item => ({
      data_id: item.data_id,
      feature_name: list[item.data_id] || [],
    }));
  };

  const initLabelMap = () => {
    const flatList = getFlatList(dataList);
    const { job_config = {} } = activeItem;
    const { scale_feature = {}, label_map } = job_config;
    const scaleKeys = Object.keys(scale_feature || {});

    const scaleKeyList = getFeatureListByKeys(scale_feature);
    const keys = Object.keys(label_map || {});
    const values = Object.values(label_map || {});
    const keyList = getListByKeys(values, keys);
    setItemLabelList(keyList.keyList || []);
    setLabelList(flatList);
    getLabelMapList(flatList);
    if (type === 0) {
      form.setFieldsValue({
        label_map: label_map && keys.length ? keyList.list : flatList,
      });
    } else {
      form.setFieldsValue({
        label_map: label_map && keys.length ? keyList.list : [{}],
      });
    }
    form.setFieldsValue({
      scale_feature: scale_feature && scaleKeys.length ? scaleKeyList : flatList,
    });
  };

  useEffect(() => {
    if (visible && dataList) {
      initLabelMap();
    }
  }, [visible, dataList]);

  const loadData = async () => {
    if (isEdit) {
      form.setFieldsValue({ ...activeItem });
    } else {
      const data = await getAllParams(type);
      const scaleList = data.filter(item => item.param_name === 'scale');
      const intersectionList = data.filter(item => item.param_name === 'intersection');
      setSelectScaleList(scaleList[0].options);
      setOptionList(intersectionList[0].options);
      form.setFieldsValue({
        approach: ['scale'],
      });
    }
  };

  useEffect(() => {
    if (type || type === 0) {
      loadData();
    }
  }, [type]);

  useEffect(() => {
    if (visible) {
      if (len) {
        const { job_config = {} } = activeItem;
        const { label_map, scale_feature, approach, ...rest } = job_config;
        form.setFieldsValue({
          ...activeItem,
          ...rest,
          approach: approach || [],
          job_desc: activeItem.desc,
          job_name: !isEdit ? `数据预处理${len + 1}` : activeItem.job_name,
        });
        setApproachData(approach || []);
      } else {
        form.setFieldsValue({
          job_name: `数据预处理${len + 1}`,
          approach: selectList,
          intersection: 'raw',
          scale: 'minmax',
        });
      }
    }
  }, [visible]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const list = getFlatList(dataList);
    // 判断标签字段是否重复
    const { approach, label_map, scale_feature } = values;
    const labelMap = {};
    if (type === 1) {
      const arr = label_map.map(item => item.data_id);
      const nary = arr.sort();
      // eslint-disable-next-line
      for (let i = 0; i < nary.length; i++) {
        if (nary[i] === nary[i + 1]) {
          message.error('同一标签来源仅能选择一个标签！');
          return;
        }
      }
      label_map.forEach(item => {
        labelMap[item.data_id] = item.label_name;
      });
    } else {
      label_map.forEach((item, index) => {
        labelMap[labelList[index].data_id] = item.label_name;
      });
    }

    if (approach && approach.length && approach.includes('scale')) {
      if (!scale_feature || (scale_feature && !scale_feature.length)) {
        message.error('无量纲化至少需要选择一方特征！');
        return;
      }

      const nameList = scale_feature.filter(
        item => item.feature_name && item.feature_name.length > 0,
      );
      if (!nameList.length) {
        message.error('无量纲化至少需要选择一方特征！');
        return;
      }
    }

    const data = list.map(item => item.data_id);
    const filter = {
      project_id: projectId, // 项目ID
      fl_type: type, // 项目类型常量，取值见项目类型常量表
      job_name: values.job_name, // 任务名称
      job_desc: values.job_desc, // 任务描述
      data_list: data,
      params: {
        // 参数名称->参数值，都以英文标识显示，具体对照关系查看参数汇总表
        approach: approach || [],
        label_map: labelMap,
        scale: values.scale,
        intersection: values.intersection,
      },
    };

    if (approach && scale_feature && scale_feature.length) {
      const featureMap = {};
      scale_feature.forEach((item, index) => {
        featureMap[labelList[index].data_id] = item.feature_name;
      });
      filter.params.scale_feature = featureMap;
    }
    setLoading(true);
    try {
      if (isEdit) {
        filter.job_id = activeItem.job_id;
        await restartStepTwoJob(filter);
        message.success('任务重新运行成功！');
      } else {
        await createPreprocess(filter);
        message.success('任务创建成功！');
      }
      onLoadData();
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLabel = i => {
    const values = form.getFieldsValue();
    if (!values.label_map[i]) values.label_map[i] = {};
    values.label_map[i].label_name = undefined;
    form.setFieldsValue(values);
    setItemLabelList(values.label_map);
  };

  const handleChangeSelect = val => {
    setApproachData(val);
  };

  const deleteItem = () => {
    setApproachData(null);
    form.setFieldsValue({
      approach: [],
    });
  };

  return (
    <Drawer
      className={styles.drawer}
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
          <div className={styles.drawerFooter}>
            <Button onClick={onCancel}>取消</Button>
            <Button loading={loading} type="primary" className={styles.confirm} onClick={handleOk}>
              {isEdit ? '重新运行' : '确定'}
            </Button>
          </div>
        ) : null
      }
    >
      <Spin spinning={load}>
        <div className={styles.drawerResolve}>
          <div className={styles.title}>
            <div>数据预处理</div>
            <CloseIcon onClick={onCancel} />
          </div>
          <div className={styles.subTitle}>数据预处理是各方数据协同加密预处理。</div>
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

              <Item label="预处理方法" name="approach" {...formItemLayout}>
                <Select
                  mode="multiple"
                  placeholder="请选择预处理方法"
                  onChange={handleChangeSelect}
                >
                  {selectList.map(item => (
                    <Option key={item}>{resolveDataPrepareData[item]}</Option>
                  ))}
                </Select>
              </Item>

              <div className={styles.itemTitle}>
                <div className={styles.itemTitleContent}>
                  <div>预处理方法——ID对齐 </div>
                </div>
              </div>

              <Item
                name="intersection"
                label="ID对齐方法"
                rules={[{ required: true, message: '请选择ID对齐方法' }]}
                {...formItemLayout}
              >
                <Select placeholder="请选择ID对齐方法">
                  {optionList.map(item => (
                    <Option key={item}>{resolveDataPrepareData[item]}</Option>
                  ))}
                </Select>
              </Item>
              {type === 0 ? (
                <Form.List name="label_map" initialValue={[{}]}>
                  {fields => (
                    <>
                      <Form.Item label="标签字段" {...formItemLayout} className={styles.formList}>
                        <div className={styles.formListHeader}>
                          <div className={styles.formListHeaderItem}>标签来源</div>
                          <div className={styles.formListHeaderItem}>标签字段</div>
                        </div>
                        {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                          <Space key={key} align="baseline" className={styles.spaceContainer}>
                            <div className="label-name">{labelList[index]?.data_name}</div>
                            <Form.Item
                              {...restField}
                              name={[name, 'label_name']}
                              fieldKey={[fieldKey, 'label_name']}
                              rules={[{ required: true, message: '请选择字段' }]}
                            >
                              <Select style={{ width: 150 }} placeholder="请选择字段">
                                {labelList[index]?.data_id &&
                                selectLabelList[labelList[index]?.data_id] ? (
                                  selectLabelList[labelList[index]?.data_id]?.map(item => (
                                    <Option key={item.name}>{item.name}</Option>
                                  ))
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
              ) : (
                <Form.List name="label_map" initialValue={[{}]}>
                  {(fields, { add, remove }) => (
                    <>
                      <Form.Item label="标签字段" {...formItemLayout} className={styles.formList2}>
                        <Alert
                          type="info"
                          message="温馨提示：同一标签来源仅能选择一个标签。"
                          showIcon
                        />
                        <div className={styles.formListHeader}>
                          <div className={styles.plusItem}>
                            <IconBase icon={plusSquareIcon} onClick={add} />
                          </div>
                          <div className={styles.formListHeaderItem}>标签来源</div>
                          <div className={styles.formListHeaderItem}>标签字段</div>
                        </div>
                        {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                          <Space key={key} className={styles.spaceContainer} align="baseline">
                            <div className={styles.plusItem}>
                              {fields.length === 1 ? (
                                <Tooltip
                                  arrowPointAtCenter
                                  placement="topLeft"
                                  title="请至少设置一组标签字段！"
                                >
                                  <IconBase
                                    icon={minusSquareIcon}
                                    onClick={() => {
                                      if (fields.length === 1) return;
                                      remove(name);
                                    }}
                                    fill="#b7b7b7"
                                  />
                                </Tooltip>
                              ) : (
                                <IconBase
                                  icon={minusSquareIcon}
                                  onClick={() => {
                                    remove(name);
                                  }}
                                />
                              )}
                            </div>
                            <Form.Item
                              {...restField}
                              name={[name, 'data_id']}
                              fieldKey={[fieldKey, 'data_id']}
                              rules={[{ required: true, message: '请选择标签来源' }]}
                            >
                              <Select
                                style={{ width: 175 }}
                                placeholder="请选择标签来源"
                                onChange={() => {
                                  handleChangeLabel(index);
                                }}
                              >
                                {labelList.map(item => (
                                  <Option key={item.data_id}>{item.data_name}</Option>
                                ))}
                              </Select>
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'label_name']}
                              fieldKey={[fieldKey, 'label_name']}
                              rules={[{ required: true, message: '请选择字段' }]}
                            >
                              <Select style={{ width: 150 }} placeholder="请选择字段">
                                {itemLabelList[index]?.data_id &&
                                selectLabelList[itemLabelList[index]?.data_id] ? (
                                  selectLabelList[itemLabelList[index]?.data_id]?.map(item => (
                                    <Option key={item.name}>{item.name}</Option>
                                  ))
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

              {approachData && approachData.length ? (
                <>
                  <div className={styles.itemTitle}>
                    <div className={styles.itemTitleContent}>
                      <div>预处理方法——无量纲化 </div>
                      <IconBase icon={deleteIcon} onClick={deleteItem} />
                    </div>
                  </div>

                  <Item
                    name="scale"
                    label="无量纲化方法"
                    rules={[{ required: true, message: '请选择无量纲化方法' }]}
                    labelCol={{ style: { width: 96, textAlign: 'left' } }}
                    wrapperCol={{ span: 17 }}
                  >
                    <Select placeholder="请选择无量纲化方法">
                      {selectScaleList.map(item => (
                        <Option key={item}>{resolveDataPrepareData[item]}</Option>
                      ))}
                    </Select>
                  </Item>
                  <Form.List name="scale_feature">
                    {fields => (
                      <>
                        <Form.Item
                          label="选择特征"
                          labelCol={{ style: { width: 96, textAlign: 'left' } }}
                          wrapperCol={{ span: 17 }}
                          className={styles.formList3}
                        >
                          {fields.map(({ key, name, fieldKey, ...restField }, index) => (
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
                                  {labelList[index]?.data_id &&
                                  selectLabelList[labelList[index]?.data_id] ? (
                                    selectLabelList[labelList[index]?.data_id].map(item => (
                                      <Option key={item.name}>{item.name}</Option>
                                    ))
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

export default DrawerDataDeal;
