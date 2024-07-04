import React from 'react';
import UploadModal from './UploadModal';

function AddVersion(props) {
  const { location } = props;
  return <UploadModal title="新建版本" pageSource="add" location={location} />;
}

export default AddVersion;
