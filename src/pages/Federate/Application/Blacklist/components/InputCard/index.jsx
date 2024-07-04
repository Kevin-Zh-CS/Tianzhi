import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Input, Button, Tooltip, Icons, Form } from 'quanta-design';
import inputBackground from '@/assets/blacklist/inputBackground.png';
import { useForm } from 'antd/lib/form/Form';
import styles from './index.less';

const InputCard = forwardRef(({ inputRef, ...props }) => {
  const { showResultInfo, handleCloseModal, handleInputChange, handleQuery } = props;
  const [disabled, setDisabled] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [type, setType] = useState(1); // 查询类型 1-单条 2-批量
  const [form] = useForm();

  const { UploadIcon } = Icons;

  useImperativeHandle(inputRef, () => ({
    handleBatchSearch: params => {
      form.setFieldsValue({ fileName: params });
      setType(2);
    },
    setDataList: params => setDataList(params),
  }));

  const onFinish = value => {
    setDisabled(true);
    if (type === 1) {
      handleQuery(value.id, [
        {
          qid: value.id,
          qname: '',
        },
      ]);
    } else {
      handleQuery(value.fileName, dataList);
    }
  };

  useEffect(() => {
    if (showResultInfo) {
      setDisabled(false);
    }
  }, [showResultInfo]);

  const openBatchInputModal = () => {
    form.setFieldsValue({ id: null });
    form.setFieldsValue({ fileName: null });
    handleCloseModal();
  };

  return (
    <>
      <div className={styles.inputContainer}>
        <img alt="" src={inputBackground} />
        <Form form={form} name="input" onFinish={onFinish}>
          <div className={styles.inputCard}>
            <Tooltip title="批量导入" overlayClassName={styles.tooltip}>
              <span className={styles.upload}>
                <Button
                  disabled={disabled}
                  onClick={openBatchInputModal}
                  size="large"
                  icon={<UploadIcon />}
                />
              </span>
            </Tooltip>
            {type === 1 ? (
              <Form.Item
                name="id"
                validateTrigger={['onSubmit']}
                validateFirst
                rules={[
                  {
                    required: true,
                    validateTrigger: 'onSubmit',
                    message: '请输入身份证号或统一社会信用代码',
                  },
                  () => ({
                    validator(rule, value) {
                      const rule1 = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
                      const rule2 = /^([0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}|[1-9]\d{14})$/;
                      if (rule1.test(value) || rule2.test(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject('请输入正确格式的身份证或统一社会信用代码');
                    },
                  }),
                ]}
              >
                <Input
                  autoComplete="off"
                  onChange={e=>{
                    if(!e.currentTarget.value) form.resetFields();
                    handleInputChange();
                  }}
                  disabled={disabled}
                  allowClear={!disabled}
                  className={styles.input}
                  placeholder="请输入身份证号或统一社会信用代码"
                  size="large"
                />
              </Form.Item>
            ) : (
              <Form.Item name="fileName">
                <Input
                  autoComplete="off"
                  disabled={disabled}
                  allowClear={!disabled}
                  className={styles.input}
                  onChange={e => {
                    if(!e.currentTarget.value) form.resetFields();
                    setType(1);
                    handleInputChange();
                  }}
                  placeholder="请输入身份证号或统一社会信用代码"
                />
              </Form.Item>
            )}
            <Button disabled={disabled} htmlType="submit" type="primary" className={styles.button}>
              立即查询
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
});

export default InputCard;
