import React, { useState, useEffect } from 'react';
import { Divider, Form, IconBase, Modal, Spin } from 'quanta-design';
import { ReactComponent as DataPlatformIcon } from '@/icons/data_platform.svg';
import ItemTitle from '@/components/ItemTitle';
import ButtonGroup from '@/components/ButtonGroup';
import RadioCard from '@/pages/Federate/components/RadioCard';
import DataFormat from './QflDataFormat';
import { getParticipantInfo } from '@/services/qfl-partner';
import Prompt from 'umi/prompt';
import { router } from 'umi';
import { Cascader } from 'antd';
import { ReactComponent as RightIcon } from '@/icons/right.svg';

let isSave = true;
function Step1(props) {
  const { onOk, onCancel, dataId, projectId, dispatch } = props;
  const [dataInfo, setDataInfo] = useState({});
  const [selectList, setSelectList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'left' } },
    wrapperCol: {},
  };

  const getSelectData = async () => {
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
        setSelectList(list);
      },
    });
  };

  const getInfo = async () => {
    setLoading(true);
    try {
      const data = await getParticipantInfo({ project_id: projectId, data_id: dataId });
      const { projectBriefInfoVO = {} } = data;
      const info = {
        name: projectBriefInfoVO.project_name,
        desc: projectBriefInfoVO.project_desc,
        type: projectBriefInfoVO.project_type,
        initiator_name: projectBriefInfoVO.initiator_org_name,
        initiator_id: projectBriefInfoVO.initiator_user_id,
        created_time: projectBriefInfoVO.invite_time,
        participate_status: projectBriefInfoVO.participate_status,
        data_id: projectBriefInfoVO.initiator_data_id,
        data_name: projectBriefInfoVO.data_name,
        format_desc: data.format_desc,
        require_format: data.require_format || [],
        refuse_reason: data.refuse_reason,
      };
      setDataInfo(info);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInfo();
    getSelectData();
  }, [dataId]);

  const onNext = async () => {
    const formValues = await form.validateFields();
    isSave = true;
    onOk(formValues);
  };

  const showModalSave = path => {
    Modal.info({
      title: '确认离开当前正在编辑的页面吗？',
      content: '若不保存，当前正在编辑的内容将丢失。',
      okText: '确定',
      cancelText: '取消',
      style: { top: 240 },
      closable: true,
      onOk: () => {
        isSave = true;
        router.replace({
          pathname: path.pathname,
          query: { dataId, projectId },
        });
        Modal.destroyAll();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  const handlePrompt = path => {
    if (!isSave) {
      showModalSave(path);
      return false;
    }
    return true;
  };

  const loadData = selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    dispatch({
      type: 'importer/dataList',
      payload: {
        namespace: targetOption.value,
        type: 1,
      },
      callback: info => {
        // 获取所有二级选项 TODO: 滚动加载
        dispatch({
          type: 'importer/dataList',
          payload: {
            namespace: targetOption.value,
            size: info.total || 10,
            type: 1,
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

            setSelectList([...selectList]);
          },
        });
      },
    });
  };

  return (
    <Spin spinning={loading}>
      <Prompt message={handlePrompt} />
      <DataFormat isAddData {...dataInfo} />
      <Divider dashed />
      <ItemTitle>选择数据</ItemTitle>
      <Form
        form={form}
        colon={false}
        onFieldsChange={() => {
          isSave = false;
        }}
        hideRequiredMark
      >
        <Form.Item label="数据来源" {...formItemLayout}>
          <RadioCard active icon={DataPlatformIcon} title="本地数据" desc="本地数据中导入的数据" />
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
            dropdownClassName="add-data-cascader"
            popupClassName="add-data-cascader"
            style={{ width: 360 }}
            options={selectList}
            loadData={loadData}
            placeholder="请选择数据"
          />
        </Form.Item>
      </Form>
      <ButtonGroup
        change
        left="确定"
        onClickL={onNext}
        right="取消"
        onClickR={onCancel}
        style={{ marginLeft: 105 }}
      />
    </Spin>
  );
}

export default Step1;
