import React from 'react';
import OriginPublishPage from '../../../component/OriginPublished';

function OriginPublish(props) {
  const {
    location: { query },
  } = props;
  const { namespace, id } = query;
  return <OriginPublishPage namespace={namespace} id={id} />;
}

export default OriginPublish;
