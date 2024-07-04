import React, { useEffect } from 'react';
import classnames from 'classnames';
import { Modal, Alert, Form, Tooltip, IconBase, message } from 'quanta-design';
import { Input, Space } from 'antd';
import styles from './index.less';
import { ReactComponent as plusSquareIcon } from '@/icons/plus_square.svg';
import { ReactComponent as minusSquareIcon } from '@/icons/minus_square.svg';
import { validatorInput, validatorPrice } from '@/pages/Manage/Inner/config';
import { updatePackages } from '@/services/resource';

function PriceListModal(props) {
  const { visible, onCancel, loadData, defaultValue = [{}], dataId } = props;
  const [form] = Form.useForm();

  const handleOk = async () => {
    // 调用接口
    const values = await form.validateFields();
    const { packages } = values;
    const params = {
      packages: packages.map(item => ({ ...item, credit: item.credit * 100 })),
      did: dataId,
    };
    await updatePackages(params);
    message.success('积分套餐设置修改成功！');
    onCancel();
    loadData();
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        packages: defaultValue.map(item => ({ ...item, credit: item.credit / 100 })),
      });
    }
  }, [visible]);

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      className={classnames(styles.shareRecordModal, 'modal-has-top-border')}
      title="编辑套餐设置"
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      style={{ margin: '0 auto' }}
      width={720}
    >
      <div>
        <Alert
          type="info"
          message={
            <>
              <div>套餐设置规则</div>
              <div>
                <div>1.有效时间设置为0，即永久有效；有效次数设置为0，即无限次数；</div>
                <div>2.同一数据积分发布时，至少有1组套餐，至多有10组套餐。</div>
              </div>
            </>
          }
          showIcon
        />
        <Form form={form}>
          <Form.List name="packages" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                <Form.Item>
                  <div className={styles.priceContainer}>
                    <div className={styles.plusItem}>
                      <Tooltip
                        arrowPointAtCenter
                        placement="topLeft"
                        title={fields.length === 10 ? '至多设置10组套餐！' : ''}
                      >
                        <IconBase
                          icon={plusSquareIcon}
                          onClick={() => {
                            if (fields.length === 10) return;
                            add();
                          }}
                          fill={fields.length === 10 ? '#b7b7b7' : '#888'}
                        />
                      </Tooltip>
                    </div>
                    <div className={styles.priceItem}>有效时间</div>
                    <div className={styles.priceItem}>有效次数</div>
                    <div>积分价格</div>
                  </div>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                    <Space key={key} className={styles.spaceContainer} align="baseline">
                      <div className={styles.plusItem}>
                        <Tooltip
                          arrowPointAtCenter
                          placement="topLeft"
                          title={fields.length === 1 ? '请至少设置1组套餐！' : ''}
                        >
                          <IconBase
                            icon={minusSquareIcon}
                            onClick={() => {
                              if (fields.length === 1) return;
                              remove(name);
                            }}
                            fill={fields.length === 1 ? '#b7b7b7' : '#888'}
                          />
                        </Tooltip>
                      </div>
                      <Form.Item
                        {...restField}
                        name={[name, 'duration']}
                        fieldKey={[fieldKey, 'duration']}
                        rules={[
                          { required: true, message: '请输入有效时间' },
                          { validator: validatorPrice },
                        ]}
                      >
                        <Input style={{ width: 200 }} placeholder="请输入有效时间" suffix="天" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        fieldKey={[fieldKey, 'quantity']}
                        rules={[
                          { required: true, message: '请输入有效次数' },
                          { validator: validatorPrice },
                        ]}
                      >
                        <Input style={{ width: 200 }} placeholder="请输入有效次数" suffix="次" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'credit']}
                        fieldKey={[fieldKey, 'credit']}
                        rules={[
                          { required: true, message: '请输入积分价格' },
                          { validator: validatorInput },
                        ]}
                      >
                        <Input style={{ width: 198 }} placeholder="请输入积分价格" suffix="Bx" />
                      </Form.Item>
                    </Space>
                  ))}
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </div>
    </Modal>
  );
}

export default PriceListModal;
