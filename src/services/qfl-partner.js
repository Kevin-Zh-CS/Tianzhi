import promiseRequest from '@/utils/promiseRequest';
// import axios from 'axios';

export async function getParticipantList(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/participant/project/list`,
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/participant/project/info

export async function getParticipantInfo(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/participant/project/info`,
    method: 'get',
    data,
  });

  return res || {};
}

// /api/v1/qfl/participant/project/invite-confirm [POST]

export async function handleParticipantInvite(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/participant/project/invite-confirm`,
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/participant/project/data-confirm [POST]

export async function handleParticipantInviteConfirm(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/participant/project/data-confirm`,
    method: 'post',
    data,
  });

  return res || {};
}

// /participant/project/selfdata/confirm [POST]

export async function handleAddInviteConfirm(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/participant/project/data-add`,
    method: 'post',
    data,
  });

  return res || {};
}
