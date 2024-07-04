import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import styles from './index.less';

class ResourceInfo extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { isInner } = this.props;
    return (
      <div className={styles.resourceInfoWrap}>
        <div className={styles.leftInfoWrap}>
          <Avatar
            style={{ backgroundColor: '#0084F2', width: 24, height: 24, lineHeight: '24px' }}
            icon={<UserOutlined />}
          />
          <div className={styles.contentWrap}>
            <span style={{ color: '#888888' }}>{`${isInner ? '内' : '外'}`}部资源库数量</span>
            <span>12</span>
          </div>
        </div>
        <div className={styles.rightInfoWrap}>
          <div className={styles.publishWrap}>
            <Avatar
              style={{ backgroundColor: '#0084F2', width: 24, height: 24, lineHeight: '24px' }}
              icon={<UserOutlined />}
            />
            <div className={styles.contentWrap}>
              <span style={{ color: '#888888' }}>已发布数据总量</span>
              <span>2312</span>
            </div>
          </div>
          <div className={styles.partWrap}>
            <div className={styles.contentWrap}>
              <span>文件总量（个）</span>
              <span>1123</span>
            </div>
            <div className={styles.contentWrap}>
              <span>模型总量（个）</span>
              <span>6123</span>
            </div>
            <div className={styles.contentWrap}>
              <span>接口总量（个）</span>
              <span>7123</span>
            </div>
            <div className={styles.contentWrap}>
              <span>数据源总量（个）</span>
              <span>923</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ResourceInfo;
