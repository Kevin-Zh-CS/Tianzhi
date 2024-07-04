import React from 'react';
import { Popover, Popconfirm, Tooltip } from 'antd';
import { ScissorOutlined } from '@ant-design/icons';
import './index.less';

const Relation = props => {
  const relation = props === null || props === 0 ? 0 : props.data;
  const renderRelationOperationItem = relations => {
    const sourcePropertyName = relations === null || relations === 0 ? 0 : relations.source;
    const targetPropertyName = relations === null || relations === 0 ? 0 : relations.target;
    return (
      <div className="relation-operation-item" key={relations.id}>
        <div className="relation-operation-item-content">
          <Tooltip placement="top" title={sourcePropertyName}>
            <span className="relation-property-source">{sourcePropertyName}</span>
          </Tooltip>
          (N:1)
          <Tooltip placement="top" title={targetPropertyName}>
            <span className="relation-property-target">{targetPropertyName}</span>
          </Tooltip>
        </div>
        <Popconfirm
          placement="leftTop"
          title="你确定要删除该关系吗？"
          okText="确定"
          cancelText="取消"
          onConfirm={() => {
            if (props) {
              props.deleteRelation(relation.id);
            }
          }}
        >
          <ScissorOutlined />
        </Popconfirm>
      </div>
    );
  };
  const renderPopoverContent = () => (
    <div className="relation-operation-container">{renderRelationOperationItem(relation)}</div>
  );
  return (
    <Popover
      trigger="hover"
      content={renderPopoverContent()}
      overlayClassName="relation-operation-popover"
    >
      <div className="relation-count-container">{1}</div>
    </Popover>
  );
};
export default Relation;
