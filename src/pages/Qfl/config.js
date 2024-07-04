import { Tag } from 'quanta-design';
import React from 'react';
import { PROJECT_STATUS } from '@/utils/enums';

export const PROJECT_CARD_TAG = [
  <Tag color="success" bordered>
    横向联邦
  </Tag>,
  <Tag color="processing" bordered>
    纵向联邦
  </Tag>,
];

export const PROJECT_STATUS_TAG = {
  '1': <Tag color="warning">等待中</Tag>,
  '2': <Tag color="processing">进行中</Tag>,
  '3': <Tag color="error">已取消</Tag>,
  '4': <Tag color="success">已完成</Tag>,
  '5': <Tag color="error">已失败</Tag>,
};

export const PROJECT_TYPE = ['横向联邦', '纵向联邦'];
export const PROJECT_TYPE_LIST = {
  transverse: 0,
  portrait: 1,
};

export const resolveDataPrepareParams = {
  approach: '预处理方法',
  scale: '无量纲化方法',
  intersection: 'ID对齐方法',
  columnLower: '最小值',
  columnUpper: '最大值',
  mean: '均值',
  std: '标准差',
  variable: '特征',
  binning: '分箱',
  pearson: '特征相关性分析',
  bin_num: '分箱数',
  rsa: 'RSA',
  raw: 'RAW',
  dh: 'DH',
};

export const resolveDataPrepareData = {
  scale: '无量纲化',
  standard: 'standard 标准化',
  minmax: 'minmax 归一化',
  intersection: 'ID对齐',
  rsa: 'RSA',
  raw: 'RAW',
  dh: 'DH',
};

export const stepThreeEnums = {
  binning: '分箱',
  quantile: '等频分箱',
};

export const stepFourEnums = {
  sgd: 'SGD',
  rsmprop: 'RSMPROP',
  diff: '差值',
  abs: '绝对值',
  weight_diff: '参数值',
  L1: 'L1正则化',
  L2: 'L2正则化',
  random_uniform: '随机数',
  ones: '置1',
  zeros: '置0',
  const: '常数',
  ovr: 'one vs rest',
  none: '无',
  Paillier: '同态加密',
  None: '无',
  kmeans: 'K-means',
  'logistic-regression': '逻辑回归',
  'linear-regression': '线性回归',
  binary: '二分类',
  multi: '多分类',
  dnn: 'DNN',
  rmsprop: 'rmsprop',
};

export const Step = {
  '0': '数据预处理',
  '1': '特征工程',
  '2': '安全建模',
};

export const STEP_STATUS = {
  waiting: 1, // 等待执行
  loading: 2, // 执行中
  closed: 3, // 已关闭
  success: 4, // 成功
  fail: 5, // 失败
  pause: 6, // 暂停
};

export const MODAL_ALGO = [
  {
    key: 'logistic-regression',
    value: '逻辑回归',
  },
  {
    key: 'kmeans',
    value: 'K-means',
  },
  {
    key: 'linear-regression',
    value: '线性回归',
  },
];
export const TRANSVERSE_MODAL_ALGO = [
  {
    key: 'logistic-regression',
    value: '逻辑回归',
  },
];

export const ERROR_STEP = [
  '',
  '失败原因：数据读取失败',
  '失败原因：数据格式转换失败',
  '失败原因：id对齐失败',
  '失败原因：归一化失败',
  '失败原因：横向特征分箱失败',
  '失败原因：纵向特征分箱失败',
];

export const LABEL_TYPE = ['double', 'int'];

// 模型来源(model_source) 0本地导入， 1项目训练
export const MODEL_SOURCE = ['本地导入', '项目训练'];

// 数据导入来源 data_source
export const DATA_SOURCE = {
  local: 1, // 本地导入
  invite: 2, // 邀请加入
  hasGot: 3, // 已获取数据
};

export const getFlatList = dataList => {
  const list = dataList.map(item => {
    const { data_list } = item;
    const itemList = data_list
      .filter(
        ul =>
          ul.data_status === PROJECT_STATUS.PARTICIPANT_CONFIGURE_FINISHED ||
          ul.data_status === PROJECT_STATUS.INITIATOR_CONFIGURE_FINISHED ||
          ul.data_status === PROJECT_STATUS.READY,
      )
      .map(li => ({
        data_name: `${item.org_name}：${li.data_name}`,
        data_id: li.data_id,
        key: li.data_id,
      }));
    return [...itemList];
  });
  return list.flat();
};

export const getStepTwoFlatList = (dataList, type) => {
  const list = dataList.map(item => {
    const { data_list } = item;
    const itemList = data_list
      .filter(ul => {
        if (type === 0) {
          return ul.data_status === PROJECT_STATUS.INITIATOR_CONFIGURE_FINISHED;
        }

        return (
          ul.data_status === PROJECT_STATUS.PARTICIPANT_CONFIGURE_FINISHED ||
          ul.data_status === PROJECT_STATUS.INITIATOR_CONFIGURE_FINISHED
        );
      })
      .map(li => ({
        data_name: `${item.org_name}：${li.data_name}`,
        data_id: li.data_id,
        key: li.data_id,
      }));
    return [...itemList];
  });
  return list.flat();
};

export const formItemLayout = {
  labelCol: { style: { width: 96, textAlign: 'left' } },
  wrapperCol: { span: 17 },
};

export const goDownload = function(res) {
  const names = decodeURIComponent(res.headers['content-disposition'].split(';')[1].split('=')[1]); // 请求头中文件名
  const blob = new Blob([res.data]);
  const elink = document.createElement('a');
  elink.download = names;
  elink.style.display = 'none';
  elink.href = URL.createObjectURL(blob);
  document.body.appendChild(elink);
  elink.click();
  URL.revokeObjectURL(elink.href); // 释放URL 对象
  document.body.removeChild(elink);
};
