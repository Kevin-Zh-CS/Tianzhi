import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Alert, Form, Modal, message, Button, Table, Icons } from 'quanta-design';
import router from 'umi/router';
import Page from '@/components/Page';
import { Prompt } from 'react-router';
import ItemTitle from '@/components/ItemTitle';
import Step1 from './step-one';
import Step2 from './Step2';
import styles from './index.less';
import { updateDatasource } from '@/services/datasource';
import classnames from 'classnames';
import { getTableList } from '@/services/resource';
import WithLoading from '@/components/WithLoading';

let isSave = true;
const { CloseIcon } = Icons;

function Publish(props) {
  const { location, dispatch, datasourceDetail, tableDetailListMongo } = props;
  const { id, namespace, ...last } = location.query;
  const [stepCurrent, setStepCurrent] = useState(1);
  const [showFloat, setShowFloat] = useState(false);
  const [tableDetailList, setTableDetailList] = useState({});
  const fields =
    JSON.stringify(datasourceDetail) !== '{}' &&
    datasourceDetail.args !== null &&
    datasourceDetail.args !== '{}'
      ? JSON.parse(datasourceDetail.args).fields
      : [];

  const [form] = Form.useForm();
  const dbFields = [];
  const columns = [];
  if (fields) {
    for (let i = 0; i < fields.length; i += 1) {
      dbFields.push({ name: fields[i].name, desc: '', example: '', type: fields[i].type });
      columns.push({ key: fields[i].name, dataIndex: fields[i].name, title: fields[i].name });
    }
  }

  const getInfo = () => {
    dispatch({
      type: 'datasource/datasourceDetail',
      payload: {
        namespace,
        id,
      },
    });
  };

  useEffect(() => {
    getInfo();
    return () => {
      isSave = true;
    };
  }, []);

  const handleSave = async () => {
    const values = form.getFieldsValue();
    isSave = true;
    const params = {
      ...values,
      id,
      need_approval: values.need_approval !== undefined ? values.need_approval : true,
      fields: dbFields,
    };

    if (values.packages) {
      params.packages = values.packages.map(item => ({ ...item, credit: item.price * 100 }));
    }
    console.log(params);
    await updateDatasource(namespace, params);
  };
  const closeModalSave = async res => {
    await handleSave();
    router.push({
      pathname: res.pathname,
      query: { namespace, id, ...last },
    });
  };
  const showModalSave = res => {
    Modal.info({
      title: '确认离开当前正在编辑的页面吗？',
      content: '若不保存，当前正在编辑的内容将丢失。',
      okText: '保存',
      cancelText: '不保存',
      style: { top: 240 },
      closable: true,
      closeIcon: <CloseIcon fill="#888" />,
      onOk: async () => {
        await closeModalSave(res);
        message.success('编辑内容保存成功！');
      },
      onCancel: e => {
        if (!e.triggerCancel) {
          isSave = true;
          router.replace({
            pathname: res.pathname,
            query: { namespace, id, ...last },
          });
        }
        Modal.destroyAll();
      },
    });
  };
  const handlePrompt = res => {
    if (
      !isSave &&
      !location.pathname.startsWith('/manage/inner/repository/origin/publish/success')
    ) {
      showModalSave(res);
      return false;
    }
    return true;
  };

  const publishDatasource = () => {
    if (dispatch) {
      dispatch({
        type: 'datasource/publishDatasource',
        payload: {
          fields: dbFields,
          id: datasourceDetail.did,
          namespace,
        },
      })
        .then(() => {
          message.success('数据发布成功！');
          isSave = true;
          router.push(
            `/manage/inner/repository/origin/publish/success?namespace=${namespace}&id=${datasourceDetail.did}`,
          );
        })
        .catch(() => {
          message.error('数据发布失败！');
        });
    }
  };

  const handleNext = async method => {
    const data = await form.validateFields();
    const params = {
      ...data,

      id: datasourceDetail.did,
      need_approval: data.need_approval === true,
      fields: dbFields,
    };
    if (data.need_approval) {
      params.approve_content = method;
    }

    if (data.packages) {
      params.packages = data.packages.map(item => ({ ...item, credit: item.credit * 100 }));
    }
    await updateDatasource(namespace, params);
    setStepCurrent(2);
  };
  const handleBefore = () => {
    getInfo();
    setStepCurrent(1);
  };

  const getList = async (current = 1, size = 10) => {
    if (datasourceDetail.db_type !== 'mongo') {
      const data = await getTableList(namespace, {
        namespace,
        table_name: datasourceDetail.table_name,
        db_hash: datasourceDetail.hash,
        args: datasourceDetail.args,
        page: current,
        size,
      });
      setTableDetailList({
        currentPage: current,
        records: data.records,
        total: data.total,
      });
      setShowFloat(true);
    } else {
      dispatch({
        type: 'database/mongoList',
        payload: {
          namespace,
          dbHash: datasourceDetail.hash,
          tableName: datasourceDetail.table_name,
          page: current,
          size,
        },
        callback: () => setShowFloat(true),
      });
    }
  };

  const changePage = ({ current, pageSize }) => {
    getList(current, pageSize);
  };

  const onFormChange = () => {
    isSave = false;
  };
  return (
    <div>
      <Prompt message={handlePrompt} />
      <Page
        title="发布数据"
        alert={
          <Alert
            type="info"
            message={
              <span>
                温馨提示：数据发布时仅发布数据元信息（如数据名称、数据描述等）至区块链，并可为某些机构设置默认的数据访问权限；原始数据不发布。
              </span>
            }
            showIcon
            // closable
          />
        }
        showBackIcon
        noContentLayout
      >
        <div style={{ position: 'relative' }}>
          <div className={classnames(styles.floatModal, showFloat ? '' : styles.hidden)}>
            <div
              className={styles.btn}
              onClick={() => {
                setShowFloat(false);
              }}
            >
              <div className={styles.horizontal} />
            </div>
            <div className={styles.title}>
              <span>{datasourceDetail.title}</span>
            </div>
            <div className={styles.table}>
              <Table
                columns={columns}
                dataSource={
                  datasourceDetail.db_type !== 'mongo'
                    ? tableDetailList.records
                    : tableDetailListMongo.records
                }
                onChange={changePage}
                pagination={{
                  total:
                    datasourceDetail.db_type !== 'mongo'
                      ? tableDetailList.total
                      : tableDetailListMongo.total,
                  current:
                    datasourceDetail.db_type !== 'mongo'
                      ? tableDetailList.currentPage
                      : tableDetailListMongo.currentPage,
                  size: 'small',
                  showSizeChanger: false,
                  showQuickJumper: false,
                }}
                emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
              />
            </div>
          </div>
        </div>
        <div className={styles.stepWrap}>
          <ItemTitle
            title="数据元信息"
            extra={
              <Button
                onClick={() => {
                  getList();
                }}
              >
                查看原始数据
              </Button>
            }
          />
          {stepCurrent === 1 ? (
            <Step1
              handleFormChange={onFormChange}
              info={datasourceDetail}
              form={form}
              handleNext={handleNext}
            />
          ) : (
            <Step2
              fields={fields}
              dbFields={dbFields}
              publishDatasource={publishDatasource}
              setStepCurrent={handleBefore}
            />
          )}
        </div>
      </Page>
    </div>
  );
}

export default connect(({ datasource, database, loading, global }) => ({
  datasourceDetail: datasource.datasourceDetail,
  tableDetailListMongo: database.tableDetailList,
  loading: loading.global || global.loading,
}))(WithLoading(Publish));
