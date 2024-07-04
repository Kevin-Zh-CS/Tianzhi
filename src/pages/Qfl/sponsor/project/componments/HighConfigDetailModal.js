import React from 'react';
import { Modal } from 'quanta-design';
import '../index.less';
import { stepFourEnums } from '@/pages/Qfl/config';

const HighConfigDetailModal = props => {
  const { visible, onCancel, info = {}, type } = props;
  return (
    <Modal
      title="查看高级配置"
      visible={visible}
      footer={null}
      onCancel={onCancel}
      width={984}
      className="drawerStep"
    >
      <div>
        <div className="subModalTitle">高级配置不修改时，将使用系统默认值。</div>

        <div className="descriptionsItem">
          <div className="item">
            <div className="label">正则化方法</div>
            <div className="value">{stepFourEnums[info.penalty] || '-'}</div>
          </div>
          <div className="item">
            <div className="label">正则系数</div>
            <div className="value">{info.alpha || '-'}</div>
          </div>
        </div>

        <div className="descriptionsItem">
          <div className="item">
            <div className="label">批处理方法</div>
            <div className="value">{info.batch_size && info.batch_size >= 0 ? '部分' : '全部'}</div>
          </div>
          <div className="item">
            <div className="label">批大小</div>
            <div className="value">
              {info.batch_size && info.batch_size >= 0 ? info.batch_size : '-'}
            </div>
          </div>
        </div>
        <div className="descriptionsItem">
          <div className="item">
            <div className="label">初始化方法</div>
            <div className="value">{stepFourEnums[info.init_method]}</div>
          </div>
          <div className="item">
            <div className="label">初始化系数</div>
            <div className="value">{info.init_method === 'const' ? info.init_const : '-'}</div>
          </div>
        </div>

        <div className="descriptionsItem">
          <div className="item">
            <div className="label">是否含偏置项</div>
            <div className="value">{info.fit_intercept ? '是' : '否'}</div>
          </div>
          <div className="item">
            <div className="label">多分类方法</div>
            <div className="value">{info.multi_class ? stepFourEnums[info.multi_class] : '无'}</div>
          </div>
        </div>

        <div className="descriptionsItem">
          <div className="item">
            <div className="label">学习率衰减方法</div>
            <div className="value">{info.decay_sqrt ? 'sqrt' : 'normal'}</div>
          </div>
          <div className="item">
            <div className="label">学习率衰减系数</div>
            <div className="value">{info.decay || '-'}</div>
          </div>
        </div>

        <div className="descriptionsItem">
          <div className="item">
            <div className="label">加密方法</div>
            <div className="value">
              {type === '0' || !info.encrypt_method
                ? '-'
                : stepFourEnums[info.encrypt_method || 'paillier']}
            </div>
          </div>
          <div className="item">
            <div className="label">密钥长度</div>
            <div className="value">
              {type === '0' || !info.encrypt_method || info.encrypt_method === 'None'
                ? '-'
                : info.encrypt_key_length || '-'}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default HighConfigDetailModal;
