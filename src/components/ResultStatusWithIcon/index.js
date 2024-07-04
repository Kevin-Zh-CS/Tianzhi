import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, IconBase } from 'quanta-design';
import { ReactComponent as SuccessIcon } from '@/icons/check_circle_filled.svg';
import { ReactComponent as InfoIcon } from '@/icons/exclamation_circle_filled.svg';
import { ReactComponent as ErrorIcon } from '@/icons/close_circle_filled.svg';
import { ReactComponent as WaitingIcon } from '@/icons/process_circle_filled.svg';

import styles from './index.less';

const statusIconMap = {
  success: {
    icon: SuccessIcon,
    color: '#08cb94',
  },
  waiting: {
    icon: WaitingIcon,
    color: '#ffb64c',
  },
  error: {
    icon: ErrorIcon,
    color: '#f04134',
  },
  info: {
    icon: InfoIcon,
    color: '#0076d9',
  },
};

class ResultStatusWithIcon extends React.Component {
  static propTypes = {
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    desc: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    status: PropTypes.string.isRequired,
    withButton: PropTypes.bool,
    buttonStatus: PropTypes.object,
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    className: PropTypes.string,
  };

  static defaultProps = {
    children: '',
    withButton: false,
    buttonStatus: {},
    className: '',
  };

  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { title, desc, hint, status, buttonStatus, withButton, children, className } = this.props;
    const { primary, common } = buttonStatus;
    const statusClass = statusIconMap[status];
    return (
      <Row className={className}>
        <Col span={18} offset={3}>
          <div className={styles.resultStatusWithIcon}>
            {/* <i className={`iconfont ${statusClass.icon} ${styles[statusClass.color]}`} /> */}
            <img alt="" />
            <div style={{ position: 'relative' }}>
              <span>{title}</span>
              <div>{desc}</div>
              {hint ? <div>{hint}</div> : null}

              <div className={styles.iconWrap}>
                <IconBase icon={statusClass.icon} fill={statusClass.color} fontSize="72px" />
              </div>
            </div>
          </div>
          {withButton ? (
            <div className={styles.resultStatusButton}>
              <Button className={primary.className} type="primary" onClick={primary.callbackFunc}>
                {primary.title}
              </Button>
              {common && common.title && (
                <Button className={`upload ${common.className}`} onClick={common.callbackFunc}>
                  {common.title}
                </Button>
              )}
            </div>
          ) : null}
          {children}
        </Col>
      </Row>
    );
  }
}

export default ResultStatusWithIcon;
