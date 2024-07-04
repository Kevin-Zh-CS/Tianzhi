import React, { useEffect, useState } from 'react';
import { Menu, Dropdown, Descriptions, Button, Table } from 'quanta-design';
import NewPage from '@/components/NewPage';
import { router } from 'umi';
import classnames from 'classnames';
import { Range } from 'rc-slider';
import styles from './diff.less';
import { MODAL_ALGO, PROJECT_TYPE, stepFourEnums } from '@/pages/Qfl/config';
import { formatTime, getValueFromList } from '@/utils/helper';
import {
  getModelContent,
  getModelInfo,
  getModelVersionList,
  getModelingInfo,
} from '@/services/qfl-modal';
import { PROJECT_STATUS } from '@/utils/enums';
import { getSponsorPartners } from '@/services/qfl-sponsor';

function Diff(props) {
  const { location } = props;
  const {
    jobId,
    modelId,
    tableId,
    diffModelId,
    diffJobId,
    diffTableId,
    parentModelId,
  } = location.query;
  const [jobInfo, setJobInfo] = useState({});
  const { job_config = {} } = jobInfo;
  const { common = {}, advanced = {}, select_feature } = job_config;
  const [selectFeatureData, setFeatureData] = useState([]);
  const [_selectFeatureData, setSelectFeatureData] = useState([]);
  const [diffJobInfo, setDiffJobInfo] = useState({});
  const { job_config: _job_config = {} } = diffJobInfo;
  const {
    common: _common = {},
    advanced: _advanced = {},
    select_feature: _select_feature,
  } = _job_config;
  const [visible, setVisible] = useState(false);
  const [expand, setExpand] = useState(false);
  const [dataInfo, setDataInfo] = useState({});
  const [diffDataInfo, setDiffDataInfo] = useState({});
  const [dataRowList, setDataRowList] = useState({});
  const [diffDataRowList, setDiffDataRowList] = useState({});
  const [dataList, setDataList] = useState([]);
  const [dataRowListCurrent, setDataRowListCurrent] = useState(1);
  const [diffDataRowListCurrent, setDiffDataRowListCurrent] = useState(1);
  const columns = [];
  const _columns = [];
  const arrList = Object.keys(diffDataRowList);
  const arr = Object.keys(dataRowList);

  if (arrList.length > 0 && diffDataRowList.records && diffDataRowList.records.length > 0) {
    Object.keys(diffDataRowList.records[0]).forEach(res => {
      _columns.push({
        key: res,
        dataIndex: res,
        title: res,
        render: txt => <div className={styles.column}>{txt || '-'}</div>,
      });
    });
  }

  if (arr.length > 0 && dataRowList.records && dataRowList.records.length > 0) {
    Object.keys(dataRowList.records[0]).forEach(res => {
      columns.push({
        key: res,
        dataIndex: res,
        title: res,
        render: txt => <div className={styles.column}>{txt || '-'}</div>,
      });
    });
  }

  const handleConfigData = (dlist, featureList) =>
    dlist
      .map(li => ({
        data_name: li.data_name,
        labels: featureList[li.data_id]?.join(','),
      }))
      .filter(li => li.labels);

  const initLabelMap = (data, list1, list2) => {
    const list = data.map(item => {
      const { data_list } = item;
      const itemList = data_list
        .filter(
          ul =>
            ul.data_status === PROJECT_STATUS.PARTICIPANT_CONFIGURE_FINISHED ||
            ul.data_status === PROJECT_STATUS.INITIATOR_CONFIGURE_FINISHED,
        )
        .map(li => ({
          data_name: `${item.org_name}-${li.data_name}`,
          data_id: li.data_id,
          key: li.data_id,
          data_status: li.data_status,
        }));
      return [...itemList];
    });
    const flatList = list.flat();
    const featureList1 = handleConfigData(flatList, list1);
    const featureList2 = handleConfigData(flatList, list2);

    setFeatureData(featureList1);
    setSelectFeatureData(featureList2);
  };

  const initList = async () => {
    const list = await getModelContent({
      model_id: modelId,
      model_table_id: tableId,
      page: 1,
      size: 5,
      is_asc: true,
    });
    setDataRowList(list);
    const _list = await getModelContent({
      model_id: diffModelId,
      model_table_id: diffTableId,
      page: 1,
      size: 5,
      is_asc: true,
    });
    setDiffDataRowList(_list);
  };

  const initInfo = async () => {
    // eslint-disable-next-line no-shadow
    const info = await getModelInfo(modelId);
    setDataInfo({ ...info });
    const _info = await getModelInfo(diffModelId);
    setDiffDataInfo({ ..._info });
    const list = await getSponsorPartners({
      project_id: info.project_id,
      caller_type: 0,
    });
    if (jobId) {
      // eslint-disable-next-line no-shadow
      const jobInfo = await getModelingInfo({ job_id: jobId });
      setJobInfo(jobInfo);
      const _jobInfo = await getModelingInfo({ job_id: diffJobId });
      setDiffJobInfo(_jobInfo);
      initLabelMap(list, jobInfo.job_config.select_feature, _jobInfo.job_config.select_feature);
    }
  };

  const getVersionList = async () => {
    const data = await getModelVersionList({ model_id: parentModelId });
    setDataList(data.list.filter(item => !item.version_status));
  };

  const loadData = async () => {
    await initInfo();
    await initList();
    await getVersionList();
  };

  // eslint-disable-next-line
  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async item => {
    setVisible(false);
    if (item.model_id === diffModelId) return;
    const info = await getModelInfo(item.model_id);
    setDiffDataInfo({ ...info });
    if (jobId) {
      router.replace(
        `/qfl/modal-manage/diff?modelId=${modelId}&tableId=${tableId}&jobId=${jobId}&diffModelId=${item.model_id}&diffTableId=${item.tableId}&diffJobId=${item.job_id}&parentModelId=${parentModelId}`,
      );
      const _list = await getModelContent({
        model_id: diffModelId,
        model_table_id: diffTableId,
        page: 1,
        size: 5,
        is_asc: true,
      });
      setDiffDataRowList(_list);
      const _jobInfo = await getModelingInfo({ job_id: item.job_id });
      setDiffJobInfo(_jobInfo);
    } else {
      router.replace(
        `/qfl/modal-manage/diff?modelId=${modelId}&tableId=${tableId}&diffModelId=${item.model_id}&diffTableId=${item.model_table_id}&parentModelId=${parentModelId}`,
      );
    }
  };

  const handleDropdown = _visible => {
    setVisible(_visible);
  };

  const handleExpand = () => {
    setExpand(!expand);
  };

  const menu = (
    <Menu>
      {dataList.map(item => (
        <Menu.Item>
          <div className={styles.versionInfo} onClick={() => handleToggle(item)}>
            <div className={styles.name}>{item.version_name}</div>
            <div className={styles.time}>{formatTime(item.saved_time)}</div>
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );

  const onTableChange = async page => {
    const list = await getModelContent({
      model_id: modelId,
      model_table_id: tableId,
      page,
      size: 5,
      is_asc: true,
    });
    setDataRowList(list);
    setDataRowListCurrent(page);
  };

  const onDiffTableChange = async page => {
    const _list = await getModelContent({
      model_id: diffModelId,
      model_table_id: diffTableId,
      page,
      size: 5,
      is_asc: true,
    });
    setDiffDataRowList(_list);
    setDiffDataRowListCurrent(page);
  };

  return (
    <NewPage title="模型版本对比" onBack={() => router.goBack()} noContentLayout>
      <div className={styles.title}>
        <div className={classnames(styles.titleItem, styles.current)}>
          <div className={styles.avatar}>当前</div>
          <div className={styles.versionInfo}>
            <div className={styles.name}>{dataInfo.version_name}</div>
            <div className={styles.time}>{formatTime(dataInfo.update_time)}</div>
          </div>
        </div>
        <div className={classnames(styles.titleItem, styles.history)}>
          <Dropdown
            overlay={menu}
            trigger={['click']}
            overlayClassName="qlfDiffDropdown"
            onVisibleChange={handleDropdown}
          >
            <div className={styles.itemContainer}>
              <div className={styles.avatar}>历史</div>
              <div className={styles.versionInfo}>
                <div className={styles.name}>
                  {diffDataInfo.version_name}
                  <i
                    className={classnames(
                      'iconfont iconxfangxiangxing_tianchongjiantou_xia',
                      visible ? styles.rotate : '',
                    )}
                  />
                </div>
                <div className={styles.time}>{formatTime(diffDataInfo.update_time)}</div>
              </div>
            </div>
          </Dropdown>
        </div>
      </div>
      <div className={styles.diff}>
        <div className={styles.bg} />
        {dataInfo.model_source === 1 && (
          <div className={styles.config}>
            <div className={classnames(styles.configItem, styles.current)}>
              {expand && (
                <Descriptions title="配置信息" labelStyle={{ width: 118 }} column={2}>
                  <Descriptions.Item label="数据切分" span={2}>
                    <div
                      className={
                        common.approach === 'kmeans'
                          ? 'color-progress2 detail-progress'
                          : 'color-progress detail-progress'
                      }
                    >
                      <div className="detail-progress-range">
                        <Range
                          count={2}
                          value={[
                            common.train_size * 100 || 80,
                            (common.test_size + common.train_size) * 100 || 90,
                            100,
                          ]}
                          pushable
                          trackStyle={[
                            { backgroundColor: '#eea844' },
                            { backgroundColor: '#08CB94' },
                          ]}
                          railStyle={{ backgroundColor: '#0076D9' }}
                        />
                      </div>
                      <div className="colorContent">
                        <div className="colorItem">
                          <span className="colorBox color1" />
                          <span className="colorTxt">
                            训练集 {Math.round(common.train_size * 100)}%
                          </span>
                        </div>
                        <div className="colorItem">
                          <span className="colorBox color3" />
                          <span className="colorTxt">
                            测试集 {Math.round(common.test_size * 100)}%
                          </span>
                        </div>
                        {common.approach === 'kmeans' ? null : (
                          <div className="colorItem">
                            <span className="colorBox color2" />
                            <span className="colorTxt">
                              验证集 {Math.round(common.validate_size * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Descriptions.Item>
                  {select_feature ? (
                    <Descriptions.Item label="选择特征" span={2}>
                      {selectFeatureData.map((item, index) => (
                        <span>
                          {item.labels}
                          <span className={styles.configText}>({item.data_name})</span>
                          {selectFeatureData.length === index + 1 ? null : '，'}
                        </span>
                      ))}
                    </Descriptions.Item>
                  ) : null}
                  <Descriptions.Item label="是否乱序">
                    {common.shuffle ? '是' : '否'}
                  </Descriptions.Item>
                  {common?.approach !== 'kmeans' ? (
                    <Descriptions.Item label="优化器">
                      {stepFourEnums[common.optimizer]}
                    </Descriptions.Item>
                  ) : (
                    <Descriptions.Item label="聚类数">{common.k}</Descriptions.Item>
                  )}
                  {common?.approach !== 'kmeans' ? (
                    <Descriptions.Item label="学习率">
                      {common.learning_rate || '-'}
                    </Descriptions.Item>
                  ) : null}
                  <Descriptions.Item label="最大迭代数">{common.max_iter}</Descriptions.Item>
                  {common?.approach !== 'kmeans' ? (
                    <Descriptions.Item label="早停方法">
                      {stepFourEnums[common.early_stop] || '-'}
                    </Descriptions.Item>
                  ) : null}
                  <Descriptions.Item label="误差值" span={common?.approach !== 'kmeans' ? 3 : 1}>
                    {common.tol}
                  </Descriptions.Item>
                  {common?.approach !== 'kmeans' ? null : (
                    <Descriptions.Item label="随机种子">{common.random_stat}</Descriptions.Item>
                  )}
                  {advanced ? (
                    <>
                      <Descriptions.Item label="正则化方法">
                        {stepFourEnums[advanced.penalty] || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="正则系数">
                        {advanced.alpha || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="批处理方法">
                        {advanced.batch_size && advanced.batch_size >= 0 ? '部分' : '全部'}
                      </Descriptions.Item>
                      <Descriptions.Item label="批大小">
                        {advanced.batch_size && advanced.batch_size >= 0
                          ? advanced.batch_size
                          : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="初始化方法">
                        {stepFourEnums[advanced.init_method]}
                      </Descriptions.Item>
                      <Descriptions.Item label="初始化系数">
                        {advanced.init_method === 'const' ? advanced.init_const : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="是否含偏置项">
                        {advanced.fit_intercept ? '是' : '否'}
                      </Descriptions.Item>
                      <Descriptions.Item label="多分类方法">
                        {advanced.multi_class ? stepFourEnums[advanced.multi_class] : '无'}
                      </Descriptions.Item>
                      <Descriptions.Item label="学习率衰减方法">
                        {advanced.decay_sqrt ? 'sqrt' : 'normal'}
                      </Descriptions.Item>
                      <Descriptions.Item label="学习率衰减系数">
                        {advanced.decay || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="加密方法">
                        {!advanced.encrypt_method
                          ? '-'
                          : stepFourEnums[advanced.encrypt_method || 'paillier']}
                      </Descriptions.Item>
                      <Descriptions.Item label="密钥长度">
                        {!advanced.encrypt_method || advanced.encrypt_method === 'None'
                          ? '-'
                          : advanced.encrypt_key_length || '-'}
                      </Descriptions.Item>
                    </>
                  ) : null}
                </Descriptions>
              )}
            </div>
            <div className={classnames(styles.configItem, styles.history)}>
              {expand && (
                <Descriptions title="配置信息" labelStyle={{ width: 118 }} column={2}>
                  <Descriptions.Item label="数据切分" span={2}>
                    <div
                      className={
                        _common.approach === 'kmeans'
                          ? 'color-progress2 detail-progress'
                          : 'color-progress detail-progress'
                      }
                    >
                      <div className="detail-progress-range">
                        <Range
                          count={2}
                          value={[
                            _common.train_size * 100 || 80,
                            (_common.test_size + _common.train_size) * 100 || 90,
                            100,
                          ]}
                          pushable
                          trackStyle={[
                            { backgroundColor: '#eea844' },
                            { backgroundColor: '#08CB94' },
                          ]}
                          railStyle={{ backgroundColor: '#0076D9' }}
                        />
                      </div>
                      <div className="colorContent">
                        <div className="colorItem">
                          <span className="colorBox color1" />
                          <span className="colorTxt">
                            训练集 {Math.round(_common.train_size * 100)}%
                          </span>
                        </div>
                        <div className="colorItem">
                          <span className="colorBox color3" />
                          <span className="colorTxt">
                            测试集 {Math.round(_common.test_size * 100)}%
                          </span>
                        </div>
                        {_common.approach === 'kmeans' ? null : (
                          <div className="colorItem">
                            <span className="colorBox color2" />
                            <span className="colorTxt">
                              验证集 {Math.round(_common.validate_size * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Descriptions.Item>

                  {_select_feature ? (
                    <Descriptions.Item label="选择特征" span={2}>
                      {_selectFeatureData.map((item, index) => (
                        <span>
                          {item.labels}
                          <span className={styles.configText}>({item.data_name})</span>
                          {_selectFeatureData.length === index + 1 ? null : '，'}
                        </span>
                      ))}
                    </Descriptions.Item>
                  ) : null}
                  <Descriptions.Item label="是否乱序">
                    {_common.shuffle ? '是' : '否'}
                  </Descriptions.Item>
                  {_common?.approach !== 'kmeans' ? (
                    <Descriptions.Item label="优化器">
                      {stepFourEnums[common.optimizer]}
                    </Descriptions.Item>
                  ) : (
                    <Descriptions.Item label="聚类数">{common.k}</Descriptions.Item>
                  )}
                  {_common?.approach !== 'kmeans' ? (
                    <Descriptions.Item label="学习率">
                      {_common.learning_rate || '-'}
                    </Descriptions.Item>
                  ) : null}
                  <Descriptions.Item label="最大迭代数">{_common.max_iter}</Descriptions.Item>
                  {_common?.approach !== 'kmeans' ? (
                    <Descriptions.Item label="早停方法">
                      {stepFourEnums[_common.early_stop] || '-'}
                    </Descriptions.Item>
                  ) : null}
                  <Descriptions.Item label="误差值" span={_common?.approach !== 'kmeans' ? 3 : 1}>
                    {_common.tol}
                  </Descriptions.Item>
                  {_common?.approach !== 'kmeans' ? null : (
                    <Descriptions.Item label="随机种子">{common.random_stat}</Descriptions.Item>
                  )}
                  {_advanced ? (
                    <>
                      <Descriptions.Item label="正则化方法">
                        {stepFourEnums[_advanced.penalty] || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="正则系数">
                        {_advanced.alpha || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="批处理方法">
                        {_advanced.batch_size && _advanced.batch_size >= 0 ? '部分' : '全部'}
                      </Descriptions.Item>
                      <Descriptions.Item label="批大小">
                        {_advanced.batch_size && _advanced.batch_size >= 0
                          ? _advanced.batch_size
                          : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="初始化方法">
                        {stepFourEnums[_advanced.init_method]}
                      </Descriptions.Item>
                      <Descriptions.Item label="初始化系数">
                        {_advanced.init_method === 'const' ? _advanced.init_const : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="是否含偏置项">
                        {_advanced.fit_intercept ? '是' : '否'}
                      </Descriptions.Item>
                      <Descriptions.Item label="多分类方法">
                        {_advanced.multi_class ? stepFourEnums[_advanced.multi_class] : '无'}
                      </Descriptions.Item>
                      <Descriptions.Item label="学习率衰减方法">
                        {_advanced.decay_sqrt ? 'sqrt' : 'normal'}
                      </Descriptions.Item>
                      <Descriptions.Item label="学习率衰减系数">
                        {_advanced.decay || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="加密方法">
                        {!_advanced.encrypt_method
                          ? '-'
                          : stepFourEnums[_advanced.encrypt_method || 'paillier']}
                      </Descriptions.Item>
                      <Descriptions.Item label="密钥长度">
                        {!advanced.encrypt_method || advanced.encrypt_method === 'None'
                          ? '-'
                          : advanced.encrypt_key_length || '-'}
                      </Descriptions.Item>
                    </>
                  ) : null}
                </Descriptions>
              )}
            </div>
            <div className={styles.expand}>
              <Button
                icon={
                  <i
                    className={classnames(
                      'iconfont',
                      expand
                        ? 'iconxfangxiangxing_shuangxianjiantou_shang'
                        : 'iconxfangxiangxing_shuangxianjiantou_xia',
                    )}
                  />
                }
                onClick={handleExpand}
              >
                {expand ? '收起配置对比' : '展开配置对比'}
              </Button>
            </div>
          </div>
        )}
        <div className={styles.detail}>
          <div className={classnames(styles.detailItem, styles.current)}>
            <Descriptions title="模型详情" labelStyle={{ width: 76 }} column={2}>
              <Descriptions.Item label="模型名称" span={2}>
                {dataInfo.model_name}
              </Descriptions.Item>
              <Descriptions.Item label="模型描述" span={2}>
                {dataInfo.model_desc}
              </Descriptions.Item>
              <Descriptions.Item label="模型类型">
                {PROJECT_TYPE[dataInfo.model_type || 0]}
              </Descriptions.Item>
              <Descriptions.Item label="模型算法">
                {getValueFromList(dataInfo.model_algo, MODAL_ALGO)}
              </Descriptions.Item>
              <Descriptions.Item label="模型内容" span={2} className={styles.modelContent}>
                <div>
                  <Table
                    columns={columns}
                    dataSource={dataRowList.records}
                    pagination={{
                      simple: true,
                      pageSize: 5,
                      current: dataRowListCurrent,
                      total: dataRowList.total,
                      onChange: onTableChange,
                    }}
                    // loading={tableLoading}
                    emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                  />
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
          <div className={classnames(styles.detailItem, styles.history)}>
            <Descriptions title="模型详情" labelStyle={{ width: 76 }} column={2}>
              <Descriptions.Item label="模型名称" span={2}>
                {diffDataInfo.model_name}
              </Descriptions.Item>
              <Descriptions.Item label="模型描述" span={2}>
                {diffDataInfo.model_desc}
              </Descriptions.Item>
              <Descriptions.Item label="模型类型">
                {PROJECT_TYPE[diffDataInfo.model_type || 0]}
              </Descriptions.Item>
              <Descriptions.Item label="模型算法">
                {getValueFromList(diffDataInfo.model_algo, MODAL_ALGO)}
              </Descriptions.Item>
              <Descriptions.Item label="模型内容" span={2} className={styles.modelContent}>
                <div>
                  <Table
                    columns={_columns}
                    dataSource={diffDataRowList.records}
                    pagination={{
                      simple: true,
                      pageSize: 5,
                      current: diffDataRowListCurrent,
                      total: diffDataRowList.total,
                      onChange: onDiffTableChange,
                    }}
                    // loading={tableLoading}
                    emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                  />
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </div>
    </NewPage>
  );
}

export default Diff;
