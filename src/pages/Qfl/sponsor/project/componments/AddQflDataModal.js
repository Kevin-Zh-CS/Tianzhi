import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Modal, Form, Select, Button, Input, message, IconBase } from 'quanta-design';
import { Cascader } from 'antd';
import { ReactComponent as DataPlatformIcon } from '@/icons/inner_repository.svg';
import { ReactComponent as InvitationIcon } from '@/icons/invitation.svg';
import { ReactComponent as RightIcon } from '@/icons/right.svg';
import successNoteIcon from '@/icons/success_note.png';
import RadioCard from '@/pages/Federate/components/RadioCard';
import HintText from '@/components/HintText';
import {
  addSelfData,
  getSearchData,
  inviteOtherData,
  getImporterData,
  addAchieveData,
} from '@/services/qfl-sponsor';
import SetQFLFormatModal from '../../componments/SetQFLFormatModal';
import './index.less';
// import { getLocalDataList } from '@/services/qfl';
import { getSourceList } from '@/services/resource';

function AddQQflDataModal(props) {
  const { visible, onCancel, load, org_name, isSponsor = true, project_id, org_id, type } = props;
  const [formatVisible, SetFormatVisible] = useState(false);
  const [formatContext, setFormatContext] = useState({});
  const [selectList, setSelectList] = useState([]);
  const [selectInitList, setSelectInitList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [radioOption, setRadioOption] = useState(3);
  const [options, setOptions] = useState([]);
  const [target, setTarget] = useState({});
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { style: { width: 70, textAlign: 'left', marginRight: 12 } },
    wrapperCol: {},
  };

  const getIninitList = async () => {
    const data = await getSourceList();
    const list = data.map(obj => {
      const t = {
        value: obj.ns_id,
        label: obj.name || obj.ns_name,
        isLeaf: false,
      };
      return t;
    });
    setOptions(list);
  };

  const handleSearch = async () => {
    const data = await getSearchData({ project_id, org_id });
    setSelectList(data);
    setSelectInitList(data);
  };

  useEffect(() => {
    if (visible && isSponsor) {
      getIninitList();
    }
    if (visible && !isSponsor) {
      handleSearch();
    }
  }, [visible, isSponsor]);

  const onClose = () => {
    setFormatContext({});
    onCancel();
  };

  const loadData = async selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    const info = await getImporterData({ namespace: targetOption.value, size: 10 });
    const res = await getImporterData({
      namespace: targetOption.value,
      size: info.total || 10,
    });
    targetOption.loading = false;
    if (res.imported_data_list?.length) {
      targetOption.children = res.imported_data_list.map(obj => {
        const t = {
          value: obj.data_id,
          label: obj.name,
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
  };

  const onChange = (datas, e) => {
    setTarget(e[1]?.label);
    if (e.length > 1) {
      form.setFieldsValue({ data: datas });
    } else {
      form.setFieldsValue({ data: [] });
    }
  };

  const handleAddData = async () => {
    const formValues = await form.validateFields();
    const { data_id } = formValues;
    // 发起方添加本地数据
    if (isSponsor) {
      const params = {
        project_id,
        org_id,
        data_id: data_id[1],
        data_name: target,
        data_source: 1,
      };
      setLoading(true);
      try {
        await addSelfData(params);
        await load();
        onCancel();
        message.success('数据添加成功！');
      } finally {
        setLoading(false);
      }
    } else {
      // inviteOtherData
      // 邀请对方添加数据

      try {
        if (radioOption === 2) {
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
          const { dataName, dataDesc, dataMeta } = formatContext;
          const { participant_user_id } = formValues;
          setLoading(true);
          const params = {
            project_id,
            participant_user_id,
            participant_org_id: org_id,
            // 发起人需要的数据的描述
            data_name: dataName,
            // data_desc: dataDesc,
            format_desc: dataDesc,
            data_source: 2,
            require_format: dataMeta.filter(val => val),
          };
          await inviteOtherData(params);
          message.success('邀请发送成功！');
        } else {
          setLoading(true);
          const params = {
            project_id,
            data_source: 3,
            app_key: data_id,
          };
          await addAchieveData(params);
          message.success('添加数据成功！');
        }

        await load();
        onCancel();
        onClose();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearchData = val => {
    const list = selectInitList.filter(item => item.data_name.includes(val));
    setSelectList(list);
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
        <div className="add-data-modal">
          <HintText>
            {isSponsor
              ? '本机构作为发起方，添加的数据为数据管理平台中已导入的数据。'
              : '添加参与方的数据为数据共享平台已获取数据或邀请加入指定数据。'}
          </HintText>
          <Form
            form={form}
            colon={false}
            preserve={false}
            hideRequiredMark
            style={{ padding: '12px 35px 0px' }}
          >
            <Form.Item label="所属机构" {...formItemLayout}>
              {org_name}
            </Form.Item>
            <Form.Item label="数据来源" {...formItemLayout}>
              {isSponsor ? (
                <RadioCard
                  icon={DataPlatformIcon}
                  title="本地数据"
                  desc="数据管理平台中导入的数据"
                  active
                />
              ) : (
                <>
                  <RadioCard
                    onClick={() => setRadioOption(3)}
                    active={radioOption === 3}
                    icon={DataPlatformIcon}
                    title="已获取数据"
                    desc="数据共享平台中获取的数据"
                  />
                  <RadioCard
                    style={{ marginTop: 8 }}
                    onClick={() => setRadioOption(2)}
                    active={radioOption === 2}
                    icon={InvitationIcon}
                    title="邀请加入"
                    desc="邀请参与方加入指定要求的数据"
                  />
                </>
              )}
            </Form.Item>
            {radioOption === 2 ? (
              <>
                <Form.Item
                  name="participant_user_id"
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
                name="data_id"
                label="选择数据"
                {...formItemLayout}
                rules={[{ required: true, message: '请选择数据' }]}
              >
                {isSponsor ? (
                  <Cascader
                    style={{ width: 280 }}
                    expandIcon={<IconBase icon={RightIcon} fill="#999" />}
                    suffixIcon={
                      <IconBase
                        icon={RightIcon}
                        fill="#999"
                        style={{ transform: 'rotate(90deg)' }}
                      />
                    }
                    options={options}
                    loadData={loadData}
                    onChange={onChange}
                    notFoundContent="暂无本机构的已导入数据！"
                    placeholder="请选择数据"
                  />
                ) : (
                  <Select
                    onSearch={handleSearchData}
                    filterOption={false}
                    showSearch
                    placeholder="请选择数据"
                    notFoundContent={<div>暂无该机构的已获取数据！</div>}
                    style={{ width: 280 }}
                  >
                    {selectList.map(item => (
                      <Select.Option key={item.data_id || item.appkey} disabled={item.is_exist}>
                        {item.name || item.data_name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            )}
          </Form>
        </div>
      </Modal>
      <SetQFLFormatModal
        visible={formatVisible}
        setFormatContext={setFormatContext}
        formatContext={formatContext}
        type={type}
        onCancel={closeModal}
      />
    </div>
  );
}

export default connect()(AddQQflDataModal);
