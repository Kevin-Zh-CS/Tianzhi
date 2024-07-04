import React, { useState } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Radio,
  Form,
  Input,
  Button,
  Select,
  Tooltip,
  message,
  DatePicker,
  TimePicker,
} from 'quanta-design';
import styles from './index.less';
import active from '@/assets/riskControl/taskConfig/active.png';

const TaskCreate = props => {
  const { dispatch, taskQueue, animation, resultVisible, setFlag, setIsNew, loadData } = props;

  const [taskType, setTaskType] = useState('');
  const [periodType, setPeriodType] = useState(0);
  const [executeType, setExecuteType] = useState(0);
  const [beginDate, setBeginDate] = useState(moment().startOf('day'));
  const [beginTime, setBeginTime] = useState(
    moment()
      .add(1, 'hours')
      .startOf('hour'),
  );
  const riskControlBoxRef = document.getElementById('riskControlBox');
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { style: { width: 98, textAlign: 'left' } },
    wrapperCol: {},
  };

  const reset = () => {
    form.resetFields();
    setTaskType('');
    setPeriodType(0);
    setBeginDate(moment());
    setBeginTime(
      moment()
        .add('hours', 1)
        .startOf('hour'),
    );
  };

  const onOk = async () => {
    const formValues = await form.validateFields();
    const _beginTime = moment()
      .hour(beginTime.hour())
      .minute(beginTime.minute())
      .second(beginTime.second());
    if (_beginTime < moment()) {
      message.error('开始时间必须晚于当前时间');
      return;
    }
    dispatch({
      type: 'riskControl/taskCreate',
      payload: {
        task_type: taskType,
        threshold: formValues.threshold,
        execute_type: formValues.executeType,
        period_time: formValues.periodTime,
        period_type: periodType,
        cycle_time: formValues.cycleTime,
        begin_time: _beginTime.valueOf(),
      },
      callback: () => {
        const _resultVisible = resultVisible; // 块级作用域
        if (_resultVisible) setFlag(true);
        setTimeout(() => {
          if (!_resultVisible && !animation) loadData();
          dispatch({ type: 'riskControl/info' });
        }, 1000);
        message.success({
          content: '任务创建成功！',
          className: 'riskControlMessage',
          duration: 2,
          onClose: () => {
            message.destroy();
          },
        });
        setIsNew(false);
        reset();
      },
    });
  };

  const onCancel = () => {
    reset();
    if (resultVisible) setFlag(true);
    if (taskQueue.length) setIsNew(false);
  };

  const selectAfter = (
    <>
      <Select
        value={periodType}
        onChange={e => setPeriodType(e)}
        dropdownClassName="riskControlDropdown"
        getPopupContainer={() => riskControlBoxRef}
        suffixIcon={null}
      >
        <Select.Option value={0}>日</Select.Option>
        <Select.Option value={1}>月</Select.Option>
        <Select.Option value={2}>年</Select.Option>
      </Select>
      <i className={`iconfont iconxfangxiangxing_tianchongjiantou_xia ${styles.arrow}`} />
    </>
  );

  const handleClickItem = type => {
    setTaskType(type);
    form.validateFields(['taskType']);
  };

  const disabledDate = current => current && current < moment().subtract(1, 'days');

  const range = (start, end) => {
    const result = [];
    // eslint-disable-next-line no-plusplus
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  const disabledHours = () =>
    beginDate.date() === moment().date() ? range(0, moment().hour()) : [];

  const handleBeginTimeChange = e => {
    if (!disabledHours().includes(e.hour())) setBeginTime(e);
  };

  return (
    <>
      <Form
        initialValues={{
          taskType,
          threshold: '',
          periodTime: '',
          periodType,
          executeType,
          cycleTime: '',
          beginDate,
        }}
        form={form}
        hideRequiredMark
        className={styles.taskForm}
        validateTrigger="onBlur"
      >
        <Form.Item
          name="taskType"
          label="任务类型"
          {...formItemLayout}
          rules={[
            {
              validator() {
                if (taskType || taskType === 0) {
                  return Promise.resolve();
                }
                return Promise.reject('请选择任务类型');
              },
            },
          ]}
        >
          <ul className={styles.taskType}>
            <li
              className={`${styles.taskTypeItem} ${taskType === 0 ? styles.active : ''}`}
              onClick={() => handleClickItem(0)}
            >
              <i className={`iconfont iconxian ${styles.left}`} />
              <div className={styles.right}>
                <p>短期内频繁开户</p>
                <p>一段时间内同一用户在多家银行频繁开户</p>
              </div>
              {taskType === 0 && <img alt="" src={active} className={styles.activeIcon} />}
            </li>
            <li
              className={`${styles.taskTypeItem} ${taskType === 1 ? styles.active : ''}`}
              onClick={() => handleClickItem(1)}
            >
              <i className={`iconfont iconxian1 ${styles.left}`} />
              <div className={styles.right}>
                <p>一人多企</p>
                <p>同一用户在多个企业任法人/责任人/联系人</p>
              </div>
              {taskType === 1 && <img alt="" src={active} className={styles.activeIcon} />}
            </li>
          </ul>
        </Form.Item>
        {executeType === 0 ? (
          <Form.Item
            name="periodTime"
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 2 }}>时间范围</span>
                <Tooltip
                  arrowPointAtCenter
                  overlayClassName="riskControlTooltip"
                  placement="topRight"
                  title="设定查询所使用数据的时间区间"
                  getPopupContainer={() => riskControlBoxRef}
                >
                  <i className={`iconfont icontishixing_bangzhu_yuanxingx ${styles.tooltipIcon}`} />
                </Tooltip>
              </div>
            }
            {...formItemLayout}
            rules={[
              { required: true, message: '请输入时间范围' },
              { pattern: '^[1-9][0-9]*$', message: '请输入大于0的整数' },
            ]}
          >
            <Input
              addonAfter={selectAfter}
              onChange={e => form.setFieldsValue({ cycleTime: e.target.value })}
              placeholder="请输入时间范围"
            />
          </Form.Item>
        ) : (
          <Form.Item
            name="cycleTime"
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 2 }}>执行周期</span>
                <Tooltip
                  arrowPointAtCenter
                  overlayClassName="riskControlTooltip"
                  placement="topRight"
                  title="设置任务循环的周期，每次执行所使用的数据即在该执行周期内更新的数据"
                  getPopupContainer={() => riskControlBoxRef}
                >
                  <i className={`iconfont icontishixing_bangzhu_yuanxingx ${styles.tooltipIcon}`} />
                </Tooltip>
              </div>
            }
            {...formItemLayout}
            rules={[
              { required: true, message: '请输入执行周期' },
              { pattern: '^[1-9][0-9]*$', message: '请输入大于0的整数' },
            ]}
          >
            <Input
              addonAfter={selectAfter}
              onChange={e => form.setFieldsValue({ periodTime: e.target.value })}
              placeholder="请输入执行周期"
            />
          </Form.Item>
        )}
        <Form.Item
          name="threshold"
          label={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 2 }}>预警阈值</span>
              <Tooltip
                arrowPointAtCenter
                overlayClassName="riskControlTooltip"
                placement="topRight"
                title={
                  <>
                    <p>当选择【短期内频繁开户】时，则代表风险用户开卡数量最小值；</p>
                    <p>当选择【一人多企】时，则代表风险企业的企业数量最小值；</p>
                  </>
                }
                getPopupContainer={() => riskControlBoxRef}
              >
                <i className={`iconfont icontishixing_bangzhu_yuanxingx ${styles.tooltipIcon}`} />
              </Tooltip>
            </div>
          }
          {...formItemLayout}
          rules={[
            { required: true, message: '请输入预警阈值' },
            { pattern: '^(([1-9]\\d+)|([2-9]))$', message: '请输入大于1的整数' },
          ]}
        >
          <Input style={{ width: '100%' }} placeholder="请输入预警阈值" />
        </Form.Item>
        <Form.Item
          name="executeType"
          label="执行方式"
          {...formItemLayout}
          rules={[{ required: true, message: '请选择执行方式' }]}
        >
          <Radio.Group onChange={e => setExecuteType(e.target.value)}>
            <Radio value={0}>单次执行</Radio>
            <Radio value={1}>循环执行</Radio>
          </Radio.Group>
        </Form.Item>
        {executeType !== 0 && (
          <Form.Item
            name="beginDate"
            label="开始时间"
            {...formItemLayout}
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <div className={styles.beginTime}>
              <DatePicker
                dropdownClassName="taskConfigDate"
                value={beginDate}
                onChange={e => setBeginDate(e)}
                allowClear={false}
                suffixIcon={<i className="iconfont iconCalendar" />}
                disabledDate={disabledDate}
                getPopupContainer={() => riskControlBoxRef}
              />
              <TimePicker
                popupClassName="taskConfigTime"
                value={beginTime}
                onChange={handleBeginTimeChange}
                allowClear={false}
                suffixIcon={<i className="iconfont iconTime" />}
                disabledHours={disabledHours}
                getPopupContainer={() => riskControlBoxRef}
              />
            </div>
          </Form.Item>
        )}
      </Form>
      <div className={styles.btnGroup}>
        <Button type="text" onClick={onCancel}>
          取消
        </Button>
        <Button type="primary" onClick={onOk}>
          {executeType ? '确定创建' : '立即执行'}
        </Button>
      </div>
    </>
  );
};

export default connect(({ riskControl }) => ({
  taskQueue: riskControl.taskQueue,
  animation: riskControl.animation,
  resultVisible: riskControl.resultVisible,
}))(TaskCreate);
