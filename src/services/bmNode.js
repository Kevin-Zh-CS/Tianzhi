import promiseRequest from '@/utils/promiseRequest';

export async function getCpu() {
  return promiseRequest({
    url: '/api/v2/bminfomation/bmInfo/cpu',
  });
}

export async function getDisk() {
  return promiseRequest({
    url: '/api/v2/bminfomation/bmInfo/disk',
  });
}

export async function getMemory() {
  return promiseRequest({
    url: '/api/v2/bminfomation/bmInfo/memory',
  });
}
