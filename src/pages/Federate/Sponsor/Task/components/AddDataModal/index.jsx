import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Modal, Form, Select, Button, Input, Alert, message, IconBase } from 'quanta-design';
import { Cascader } from 'antd';
import { ReactComponent as DataPlatformIcon } from '@/icons/data_platform.svg';
import { ReactComponent as InvitationIcon } from '@/icons/invitation.svg';
import successNoteIcon from '@/icons/success_note.png';
import SetFormatModal from '../SetFormatModal';
import RadioCard from '@/pages/Federate/components/RadioCard';
import HintText from '@/components/HintText';
import { ReactComponent as RightIcon } from '@/icons/right.svg';
import {
  sponsorDataAdd,
  partnerDataAdd,
  partnerDataApply,
  searchOrgData,
} from '@/services/sponsor';

function AddDataModal(props) {
  const { dispatch, visible, onCancel, taskId, orgId, orgName, isSponsor = true } = props;
  const [radioOption, setRadioOption] = useState(0);
  const [formatVisible, SetFormatVisible] = useState(false);
  const [formatContext, setFormatContext] = useState({});
  const [target, setTarget] = useState({});
  const [selectList, setSelectList] = useState([]);
  const [selectInitList, setSelectInitList] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { style: { width: 70, textAlign: 'left', marginRight: 12 } },
    wrapperCol: {},
  };
  const getTaskInfo = () => {
    dispatch({
      type: 'sponsor/taskInfo',
      payload: taskId,
    });
  };
  const getTaskDetail = () => {
    dispatch({
      type: 'sponsor/taskDetail',
      payload: taskId,
    });
  };
  const getDataList = () => {
    dispatch({
      type: 'sponsor/partnerDataList',
      payload: taskId,
    });
  };

  const handleSearch = async (params = '') => {
    const res = await searchOrgData({ taskId, orgId, params });
    setSelectList(res);
    setSelectInitList(res);
  };

  useEffect(() => {
    if (isSponsor && dispatch) {
      dispatch({
        type: 'resource/resourceList',
        callback: res => {
          const list = res.map(obj => {
            const t = {
              value: obj.ns_id,
              label: obj.name || obj.ns_name,
              isLeaf: false,
            };
            return t;
          });
          setOptions(list);
        },
      });
    }
    if (visible) {
      handleSearch();
    }
  }, [visible]);

  const onClose = () => {
    setFormatContext({});
    setRadioOption(0);
    onCancel();
  };

  const handleAddData = async () => {
    const formValues = await form.validateFields();
    if (isSponsor) {
      // 发起方添加本地数据
      try {
        setLoading(true);
        await sponsorDataAdd({
          taskId,
          orgId,
          nsId: formValues.data[0],
          dataName: target,
          dataId: formValues.data[1],
        });
        message.success('数据添加成功！');
        getTaskDetail();
        getTaskInfo();
        getDataList();
        onClose();
      } finally {
        setLoading(false);
      }
    } else if (radioOption === 0) {
      // 选择已获取数据
      try {
        setLoading(true);
        await partnerDataAdd({
          taskId,
          orgId,
          nsId: selectList.find(item => formValues.data === `${item.appkey}-${item.ns_id}`).ns_id,
          appkey: formValues.data.split('-')[0],
        });
        message.success('数据添加成功！');
        getTaskDetail();
        getTaskInfo();
        onClose();
      } finally {
        setLoading(false);
      }
    } else {
      // 邀请对方添加数据
      if (!Object.keys(formatContext).length) {
        form.setFields([
          {
            name: 'format',
            value: '',
            errors: ['请设置数据格式'],
          },
        ]);
        return;
      }
      setLoading(true);
      const { dataName, dataDesc, dataMeta } = formatContext;
      partnerDataApply({
        taskId,
        orgId,
        address: formValues.address,
        dataName,
        dataDesc,
        dataMeta: dataMeta.filter(val => val),
      })
        .then(() => {
          setLoading(false);
          message.success('发送邀请成功');
          getTaskDetail();
          getTaskInfo();
          onClose();
        })
        .catch(() => {
          setLoading(false);
          form.setFields([
            {
              name: 'address',
              value: formValues.address,
              errors: ['对接人地址不存在，请重新输入'],
            },
          ]);
        });
    }
  };

  const handleSearchData = val => {
    const list = selectInitList.filter(item => item.data_name.includes(val));
    setSelectList(list);
  };

  const loadData = selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    dispatch({
      type: 'importer/dataList',
      payload: {
        namespace: targetOption.value,
        taskId,
      },
      callback: info => {
        // 获取所有二级选项 TODO: 滚动加载
        dispatch({
          type: 'importer/dataList',
          payload: {
            namespace: targetOption.value,
            size: info.total || 10,
            taskId,
          },
          callback: res => {
            targetOption.loading = false;
            if (res.imported_data_list?.length) {
              targetOption.children = res.imported_data_list.map(obj => {
                const t = {
                  value: obj.data_id,
                  label: obj.name,
                  disabled: obj.exist,
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

  const closeModal = () => {
    if (!formatContext.dataName) {
      form.setFields([
        {
          name: 'format',
          value: '',
          errors: '',
        },
      ]);
    }
    SetFormatVisible(false);
  };

  const onChange = (datas, e) => {
    setTarget(e[1]?.label);
    if (e.length > 1) {
      form.setFieldsValue({ data: datas });
    } else {
      form.setFieldsValue({ data: [] });
    }
  };

  return (
    <div>
      <Modal
        maskClosable={false}
        keyboard={false}
        destroyOnClose
        title="添加数据"
        okText="确定"
        visible={visible}
        onOk={handleAddData}
        okButtonProps={{
          loading,
        }}
        onCancel={onClose}
        className="test-modal"
      >
        <div>
          <HintText>
            {isSponsor
              ? '本机构作为发起方，添加的数据为数据管理平台中已导入的数据。'
              : '添加参与方的数据为数据共享平台已获取数据或邀请加入指定数据。'}
          </HintText>
          {!isSponsor && radioOption ? (
            <Alert
              type="info"
              message="温馨提示：确定邀请后，将使用您的私钥签名进行验证。"
              showIcon
              style={{ marginTop: 12 }}
            />
          ) : null}
          <Form
            form={form}
            colon={false}
            preserve={false}
            hideRequiredMark
            style={{ padding: '12px 35px 0px' }}
          >
            <Form.Item label="所属机构" {...formItemLayout}>
              {orgName}
            </Form.Item>
            <Form.Item label="数据来源" {...formItemLayout}>
              {isSponsor ? (
                <RadioCard
                  onClick={() => setRadioOption(0)}
                  active={radioOption === 0}
                  icon={DataPlatformIcon}
                  title="本地数据"
                  desc="数据管理平台中导入的数据"
                />
              ) : (
                <>
                  <RadioCard
                    onClick={() => setRadioOption(0)}
                    active={radioOption === 0}
                    icon={DataPlatformIcon}
                    title="共享数据"
                    desc="本机构在数据共享平台中已获取的数据"
                  />
                  <RadioCard
                    style={{ marginTop: 8 }}
                    onClick={() => setRadioOption(1)}
                    active={radioOption === 1}
                    icon={InvitationIcon}
                    title="邀请加入"
                    desc="邀请参与方加入指定要求的数据"
                  />
                </>
              )}
            </Form.Item>
            {radioOption ? (
              <>
                <Form.Item
                  name="address"
                  label="对接人地址"
                  {...formItemLayout}
                  rules={[{ required: true, message: '请输入对接人地址' }]}
                >
                  <Input style={{ width: 280 }} placeholder="请输入对接人地址" />
                </Form.Item>
                <Form.Item name="format" label="数据格式" {...formItemLayout}>
                  <Button onClick={() => SetFormatVisible(true)} size="small">
                    {Object.keys(formatContext).length ? '修改数据格式' : '设置数据格式'}
                  </Button>
                  {Object.keys(formatContext).length !== 0 && (
                    <>
                      <img
                        alt=""
                        src={successNoteIcon}
                        width={20}
                        style={{ margin: '0 4px 0 8px' }}
                      />
                      <span style={{ color: '#595959' }}>已设置！</span>
                    </>
                  )}
                </Form.Item>
              </>
            ) : (
              <Form.Item
                name="data"
                label="加入数据"
                {...formItemLayout}
                rules={[{ required: true, message: '请选择数据' }]}
              >
                {isSponsor ? (
                  <Cascader
                    expandIcon={<IconBase icon={RightIcon} fill="#999" />}
                    suffixIcon={
                      <IconBase
                        icon={RightIcon}
                        fill="#999"
                        style={{ transform: 'rotate(90deg)' }}
                      />
                    }
                    style={{ width: 280 }}
                    options={options}
                    loadData={loadData}
                    onChange={onChange}
                    notFoundContent="暂无数据"
                    placeholder="请选择数据"
                  />
                ) : (
                  <Select
                    onSearch={handleSearchData}
                    filterOption={false}
                    showSearch
                    placeholder="请选择数据"
                    notFoundContent="暂无该机构的已获取数据！"
                    style={{ width: 280 }}
                  >
                    {selectList.map(item => (
                      <Select.Option key={`${item.appkey}-${item.ns_id}`} disabled={item.is_exist}>
                        {item.data_name + (item.ns_name ? `(${item.ns_name})` : '')}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            )}
          </Form>
        </div>
      </Modal>
      <SetFormatModal
        visible={formatVisible}
        setFormatContext={setFormatContext}
        formatContext={formatContext}
        onCancel={closeModal}
      />
    </div>
  );
}

export default connect()(AddDataModal);
