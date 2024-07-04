import React from 'react';
import InterfacePublishPage from '../component/InterfacePublished';

function InterfacePublish(props) {
  const {
    location: { query },
  } = props;
  const { namespace, id } = query;
  return <InterfacePublishPage namespace={namespace} id={id} needGoback />;
}

export default InterfacePublish;
