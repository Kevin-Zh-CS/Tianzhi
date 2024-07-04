import React, { useState, useEffect } from 'react';
import { Divider, Form, Tooltip, IconBase, Radio } from 'quanta-design';
import { Cascader } from 'antd';
import { ReactComponent as DataPlatformIcon } from '@/icons/data_platform.svg';
import { ReactComponent as questionCircleIcon } from '@/assets/question_circle.svg';
import ItemTitle from '@/components/ItemTitle';
import ButtonGroup from '@/components/ButtonGroup';
import RadioCard from '@/pages/Federate/components/RadioCard';
import DataFormat from '../components/DataFormat';
import { ReactComponent as RightIcon } from '@/icons/right.svg';
import { ReactComponent as SubIcon } from '@/icons/sub.svg';
import { ReactComponent as ChiefIcon } from '@/icons/chiefSub.svg';

function Step1(props) {
  const { location, onOk, onCancel, dataInfo, dispatch = null } = props;
  const [options, setOptions] = useState([]);
  const [approvalMethod, setApprovalMethod] = useState(1);
  const [isApproval, setIsApproval] = useState(true);
  const { dataId } = location.query;
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'left' } },
    wrapperCol: {},
  };

  useEffect(() => {
    dispatch({
      type: 'partner/dataInfo',
      payload: { dataId },
    });
    dispatch({
      type: 'resource/resourceList',
      callback: res => {
        const list = res.map(obj => {
          const t = {
            value: obj.ns_id,
            label: obj.ns_name,
            isLeaf: false,
          };
          return t;
        });
        setOptions(list);
      },
    });
  }, []);

  const loadData = selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    dispatch({
      type: 'importer/dataList',
      payload: {
        namespace: targetOption.value,
        type: 0,
      },
      callback: info => {
        // 获取所有二级选项 TODO: 滚动加载
        dispatch({
          type: 'importer/dataList',
          payload: {
            namespace: targetOption.value,
            size: info.total || 10,
            type: 0,
          },
          callback: res => {
            targetOption.loading = false;
            if (res.imported_data_list?.length) {
              targetOption.children = res.imported_data_list.map(obj => {
                const t = {
                  value: obj.data_id,
                  label: obj.name || obj.ns_name,
                };
                return t;
              });
            } else {
              targetOption.children = [
                {
                  disabled: true,
                  value: '暂无数据',
                  label: '暂无数据',
                },
              ];
            }

            setOptions([...options]);
          },
        });
      },
    });
  };

  const onNext = async () => {
    const formValues = await form.validateFields();
    const data = { ...formValues };
    if (formValues.need_approval) {
      data.approve_content = approvalMethod;
    }
    onOk(data);
  };

  return (
    <>
      <DataFormat isAddData info={dataInfo} />
      <Divider dashed />
      <ItemTitle>选择数据</ItemTitle>
      <Form form={form} colon={false} hideRequiredMark>
        <Form.Item label="数据来源" {...formItemLayout}>
          <RadioCard
            active
            icon={DataPlatformIcon}
            title="本地数据"
            desc="数据管理平台中导入的数据"
          />
        </Form.Item>
        <Form.Item
          name="data"
          label="选择数据"
          rules={[{ required: true, message: '请选择数据' }]}
          {...formItemLayout}
        >
          <Cascader
            expandIcon={<IconBase icon={RightIcon} fill="#999" />}
            suffixIcon={
              <IconBase icon={RightIcon} fill="#999" style={{ transform: 'rotate(90deg)' }} />
            }
            style={{ width: 360 }}
            dropdownClassName="add-data-cascader"
            popupClassName="add-data-cascader"
            options={options}
            loadData={loadData}
            placeholder="请选择数据"
          />
        </Form.Item>
        <Form.Item
          name="isPrivate"
          initialValue={0}
          label={
            <div style={{ display: 'flex' }}>
              <span style={{ marginRight: 10 }}>使用限制</span>
              <Tooltip
                arrowPointAtCenter
                placement="topLeft"
                title="【不限】即数据使用不受限制，适用于隐私等级不高的数据；【仅限MPC隐私计算】即数据仅支持用于MPC隐私计算，适用于隐私等级较高的数据。"
              >
                <IconBase icon={questionCircleIcon} fontSize={20} fill="#888888" />
              </Tooltip>
            </div>
          }
          {...formItemLayout}
        >
          <Radio.Group>
            <Radio value={0}>不限</Radio>
            <Radio value={1}>仅限MPC隐私计算</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="need_approval"
          initialValue
          label={
            <div style={{ display: 'flex' }}>
              <span style={{ marginRight: 10 }}>是否审核</span>
              <Tooltip arrowPointAtCenter placement="topLeft" title="是否审核调用该数据的模型">
                <IconBase icon={questionCircleIcon} fontSize={20} fill="#888888" />
              </Tooltip>
            </div>
          }
          {...formItemLayout}
        >
          <Radio.Group onChange={e => setIsApproval(e.target.value)}>
            <Radio value>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        {isApproval ? (
          <Form.Item
            name="approve_content"
            label={
              <div style={{ display: 'flex' }}>
                <span style={{ marginRight: 10 }}>审核内容</span>
                <Tooltip
                  arrowPointAtCenter
                  placement="topLeft"
                  title="子模型用于直接调用该数据计算一个中间结果；主模型用于执行任务的计算逻辑，包含任务场景、是否使用MPC算法等信息。"
                >
                  <IconBase icon={questionCircleIcon} fontSize={20} fill="#888888" />
                </Tooltip>
              </div>
            }
            {...formItemLayout}
          >
            <div style={{ display: 'flex', flexDirection: 'row', width: 360, height: 63 }}>
              <RadioCard
                active={approvalMethod === 1}
                icon={SubIcon}
                title="子模型"
                desc="调用该数据计算中间结果"
                onClick={() => {
                  setApprovalMethod(1);
                }}
              />
              <RadioCard
                active={approvalMethod === 0}
                icon={ChiefIcon}
                title="子模型+主模型"
                desc="多方协作计算最终结果"
                onClick={() => {
                  setApprovalMethod(0);
                }}
              />
            </div>
          </Form.Item>
        ) : null}
      </Form>
      <ButtonGroup
        change
        left="下一步"
        onClickL={onNext}
        right="取消"
        onClickR={onCancel}
        style={{ marginLeft: 105 }}
      />
    </>
  );
}

export default Step1;
