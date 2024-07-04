import React from 'react';
import { BarsOutlined, DeleteOutlined } from '@ant-design/icons';
import './index.less';

const EntityType = {
  FACT: 'FACT',
  DIM: 'DIM',
  OTHER: 'OTHER',
};
const Entity = props => {
  const entity = props === null || props === 0 ? 0 : props.data;
  const getCls = () => {
    if ((entity === null || entity === 0 ? 0 : entity.entityType) === EntityType.FACT) {
      return 'fact';
    }
    if ((entity === null || entity === 0 ? 0 : entity.entityType) === EntityType.DIM) {
      return 'dim';
    }
    if ((entity === null || entity === 0 ? 0 : entity.entityType) === EntityType.OTHER) {
      return 'other';
    }
    return '';
  };

  // let _a;

  return (
    <div className={`entity-container ${getCls()}`}>
      <div className={`content ${getCls()}`}>
        <div className="head">
          <div>
            <BarsOutlined className="type" />
            <span>{entity === null || entity === 0 ? 0 : entity.entityName}</span>
          </div>
          <div
            className="del-icon"
            onClick={() => props.deleteNode(entity === null || entity === 0 ? 0 : entity.id)}
          >
            <DeleteOutlined />
          </div>
        </div>
        <div className="body">
          {/* {(_a = entity === null || entity === 0 ? 0 : entity.properties) === null || _a === 0 */}
          {/*  ? 0 */}
          {/*  : _a.map(property => ( */}
          {/*      <div className="body-item" key={property.propertyId}> */}
          {/*        <div className="name"> */}
          {/*          {(property === null || property === 0 ? 0 : property.isPK) && ( */}
          {/*            <span className="pk">PK</span> */}
          {/*          )} */}
          {/*          {(property === null || property === 0 ? 0 : property.isFK) && ( */}
          {/*            <span className="fk">FK</span> */}
          {/*          )} */}
          {/*          {property === null || property === 0 ? 0 : property.propertyName} */}
          {/*        </div> */}
          {/*        <div className="type">{property.propertyType}</div> */}
          {/*      </div> */}
          {/*    ))} */}
        </div>
      </div>
    </div>
  );
};
export default Entity;
