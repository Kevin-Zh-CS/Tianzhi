import React from 'react';
import FilePublishPage from '../component/FilePublished';

function FilePublish(props) {
  const {
    location: { query },
  } = props;
  const { namespace, dir, id } = query;
  return <FilePublishPage namespace={namespace} dir={dir} resouceId={id} needGoback />;
}

export default FilePublish;
