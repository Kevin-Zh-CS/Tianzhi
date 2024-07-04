import React from 'react';
import { IconBase, Icons, message, Tabs, Empty } from 'quanta-design';
// import { Empty } from 'antd';
import { ReactComponent as UnfoldIcon } from '@/icons/unfold.svg';
import { ReactComponent as PauseIcon } from '@/icons/pause.svg';
import { ReactComponent as EmptyIcon } from '@/icons/empty-image.svg';
import { UPLOAD_STATUS_TAG, fileIconMap, UPLOAD_STATUS, DOWNLOAD_STATUS_TAG } from '../../config';
import { addFile, interrupt, cancelUpload, cancelDownload } from '@/services/resource';
import styles from './index.less';

const { CloseIcon, MinusIcon, CaretRightIcon, RefreshIcon } = Icons;
const { TabPane } = Tabs;

class UploadModal extends React.Component {
  constructor() {
    super();
    this.state = {
      collapsed: false,
      stopProgress: 0,
    };
  }

  // 暂停
  handleParse = async (item, i) => {
    const { namespace, editFileList } = this.props;
    const { stopProgress } = this.state;
    await interrupt(namespace, { file_name: item.fileName, dir: item.path });
    this.setState(
      {
        stopProgress: stopProgress + item.progress,
      },
      () => {
        editFileList(i, {
          ...item,
          progress: 0,
          status: UPLOAD_STATUS.stop,
        });
      },
    );
  };

  handleCancel = async (item, i) => {
    const { namespace, editFileList } = this.props;
    // 调用接口
    await cancelUpload(namespace, { dir: item.path, file_name: item.fileName });
    editFileList(i, { ...item, loaded: 0, status: UPLOAD_STATUS.cancel });
  };

  // 取消下载
  handleDownloadCancel = async (item, i) => {
    const { namespace, editDownloadFile } = this.props;
    await cancelDownload(namespace, { dir: item.path, names: item.names });
    item.status = UPLOAD_STATUS.cancel;
    editDownloadFile(i, { ...item, status: UPLOAD_STATUS.cancel });
  };

  // 继续下载
  goOn = (item, i) => {
    const params = { ...item, status: UPLOAD_STATUS.init };
    this.addData(item, params, i, 2);
  };

  handleRefresh = (item, i) => {
    // this.handleParse(item, i, status);
    const params = { ...item, status: UPLOAD_STATUS.init, type: 1 };
    this.addData(item, params, i, 1, 1);
  };

  addData = (item, params, i, upload_type = 1, type) => {
    const { namespace, reloadData, editFileList } = this.props;
    const { path, file } = item;
    if (type) params.loaded = 0;
    addFile(
      namespace,
      {
        dir: encodeURIComponent(path),
        file_name: encodeURIComponent(file.name),
        upload_type,
      },
      file,
      progressEvent => {
        // const completePercent = (params.loaded + progressEvent.loaded) / progressEvent.total;
        // const completePercent = progressEvent.loaded / progressEvent.total;
        // params.loaded += progressEvent.loaded;
        // params.progress = completePercent * 100;
        const completePercent = progressEvent.loaded / progressEvent.total;
        params.progress = completePercent * 100;
        editFileList(i, params);
      },
    )
      .then(res => {
        if (res.data.code === 0) {
          params.status = UPLOAD_STATUS.success;
          params.progress = 100;
          reloadData();
        } else {
          message.error(res.data.message);
        }
      })
      .catch(() => {
        params.status = UPLOAD_STATUS.stop;
      })
      .finally(() => {
        if (params.status === UPLOAD_STATUS.stop) {
          params.status = UPLOAD_STATUS.stop;
        }
      });
    editFileList(i, { ...params });
  };

  iconRender = (item, i) => {
    let element;
    switch (item.status) {
      case 0:
        element = (
          <>
            <IconBase
              icon={PauseIcon}
              onClick={e => {
                e.stopPropagation();
                this.handleParse(item, i);
              }}
              fill="#888"
              style={{ marginRight: 6 }}
            />
            <CloseIcon
              fill="#888"
              onClick={() => {
                this.handleCancel(item, i);
              }}
            />
          </>
        );
        break;
      case 1:
        element = (
          <>
            <CaretRightIcon
              fill="#888"
              style={{ marginRight: 6 }}
              onClick={e => {
                e.stopPropagation();
                this.goOn(item, i);
              }}
            />
            <CloseIcon
              fill="#888"
              onClick={() => {
                this.handleCancel(item, i);
              }}
            />
          </>
        );
        break;
      case 3:
        element = (
          <RefreshIcon
            fill="#888"
            onClick={() => {
              this.handleRefresh(item, i);
            }}
          />
        );
        break;
      default:
        element = null;
        break;
    }
    return element;
  };

  render() {
    const { collapsed, stopProgress } = this.state;
    const {
      onClose,
      show = false,
      list = [],
      downloadList = [],
      activeKey = '1',
      setActive,
    } = this.props;

    return (
      <>
        {show ? (
          <div className={styles.wrap}>
            <div className={styles.header}>
              <div className={styles.btnWrap}>
                {collapsed ? (
                  <IconBase
                    icon={UnfoldIcon}
                    fill="#888"
                    style={{ marginRight: 6 }}
                    onClick={() => this.setState({ collapsed: false })}
                  />
                ) : (
                  <IconBase
                    icon={MinusIcon}
                    fill="#888"
                    style={{ marginRight: 6 }}
                    onClick={() => this.setState({ collapsed: true })}
                  />
                )}
                <CloseIcon fill="#888" onClick={onClose} />
              </div>
            </div>
            <div className={collapsed ? styles.noStyleCollapsed : styles.noCollapsed}>
              <Tabs activeKey={activeKey} onChange={setActive}>
                <TabPane tab="正在上传" key="1">
                  <div style={{ height: collapsed ? 0 : 'inherit' }}>
                    <div className={styles.paramTable}>
                      <div className={styles.tableTr} style={{ background: '#f6f6f6' }}>
                        <span
                          className={styles.headerTableItem}
                          style={{ width: 216, paddingRight: 12 }}
                        >
                          文件名称
                        </span>
                        <span
                          className={styles.headerTableItem}
                          style={{ width: 80, paddingRight: 12 }}
                        >
                          文件大小
                        </span>
                        <span
                          className={styles.headerTableItem}
                          style={{ width: 100, paddingRight: 12 }}
                        >
                          目标文件夹
                        </span>
                        <span
                          className={styles.headerTableItem}
                          style={{ width: 92, paddingRight: 12 }}
                        >
                          状态
                        </span>
                        <span className={styles.headerTableItem} style={{ width: 62 }}>
                          操作
                        </span>
                      </div>
                      {list.length > 0 ? (
                        <div className={styles.tableBody}>
                          {[...list]
                            .map((item, i) => (
                              <div style={{ position: 'relative', height: 48 }}>
                                {item.status === UPLOAD_STATUS.init ||
                                item.status === UPLOAD_STATUS.stop ? (
                                  <div
                                    className={styles.process}
                                    // style={{ width: `${item.progress}%` }}
                                    style={{
                                      width: `${
                                        item.status === UPLOAD_STATUS.init
                                          ? stopProgress + item.progress
                                          : stopProgress
                                      }%`,
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={styles.tableTr}
                                  style={{ position: 'absolute', top: 0, left: 0 }}
                                >
                                  <span style={{ width: 216, paddingRight: 12 }}>
                                    <IconBase
                                      icon={fileIconMap[item.icon]}
                                      style={{ marginRight: 8 }}
                                    />
                                    {item.fileName}
                                  </span>
                                  <span style={{ width: 80, paddingRight: 12 }}>{item.size}</span>
                                  <span style={{ width: 100, paddingRight: 12 }}>
                                    {item.target}
                                  </span>
                                  <span style={{ width: 92, paddingRight: 12 }}>
                                    {UPLOAD_STATUS_TAG[item.status]}
                                  </span>
                                  <span style={{ width: 92 }}>{this.iconRender(item, i)}</span>
                                </div>
                              </div>
                            ))
                            .reverse()}
                        </div>
                      ) : (
                        <Empty
                          style={{ paddingTop: 35 }}
                          image={
                            <IconBase
                              width="72"
                              viewBox="0 0 72 72"
                              height="72"
                              icon={EmptyIcon}
                              fill="#000"
                            />
                          }
                        />
                      )}
                    </div>
                  </div>
                </TabPane>
                <TabPane tab="正在下载" key="2">
                  <div style={{ height: collapsed ? 0 : 'inherit' }}>
                    <div className={styles.paramTable}>
                      <div className={styles.tableTr} style={{ background: '#f6f6f6' }}>
                        <span
                          className={styles.headerTableItem}
                          style={{ width: 266, paddingRight: 12 }}
                        >
                          文件名称
                        </span>
                        <span
                          className={styles.headerTableItem}
                          style={{ width: 100, paddingRight: 12 }}
                        >
                          目标文件夹
                        </span>
                        <span
                          className={styles.headerTableItem}
                          style={{ width: 122, paddingRight: 12 }}
                        >
                          状态
                        </span>
                        <span className={styles.headerTableItem} style={{ width: 62 }}>
                          操作
                        </span>
                      </div>
                      {downloadList.length > 0 ? (
                        <div className={styles.tableBody}>
                          {[...downloadList]
                            .map((item, i) => (
                              <div>
                                <div
                                  className={styles.tableTr}
                                  style={{ position: 'relative', height: 48 }}
                                >
                                  <span style={{ width: 266, paddingRight: 12 }}>
                                    <IconBase
                                      icon={fileIconMap[item.icon]}
                                      style={{ marginRight: 8 }}
                                    />
                                    {item.fileName}
                                  </span>
                                  <span style={{ width: 100, paddingRight: 12 }}>
                                    {item.target}
                                  </span>
                                  <span style={{ width: 122, paddingRight: 12 }}>
                                    {DOWNLOAD_STATUS_TAG[item.status]}
                                  </span>
                                  <span style={{ width: 92 }}>
                                    {item.status === UPLOAD_STATUS.init ? (
                                      <CloseIcon
                                        fill="#888"
                                        onClick={() => {
                                          this.handleDownloadCancel(item, i);
                                        }}
                                      />
                                    ) : null}
                                  </span>
                                </div>
                              </div>
                            ))
                            .reverse()}
                        </div>
                      ) : (
                        <Empty
                          style={{ paddingTop: 35 }}
                          image={
                            <IconBase
                              width="72"
                              viewBox="0 0 72 72"
                              height="72"
                              icon={EmptyIcon}
                              fill="#000"
                            />
                          }
                        />
                      )}
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </div>
        ) : null}
      </>
    );
  }
}

export default UploadModal;
