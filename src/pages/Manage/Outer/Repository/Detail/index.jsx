import React from 'react';
import OuterLeftDetail from '@/pages/Manage/Outer/component/OuterLeftDetail';

function RepositoryDetail(props) {
  const { namespace, id, dataType } = props.location.query;
  return <OuterLeftDetail type={Number(dataType)} namespace={namespace} id={id} />;
}

export default RepositoryDetail;
