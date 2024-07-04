import React from 'react';
import ModelPublishPage from '../../../component/ModelPublished';

function ModelPublish(props) {
  const {
    location: { query },
  } = props;
  const { namespace, id } = query;
  return <ModelPublishPage namespace={namespace} id={id} />;
}

export default ModelPublish;
