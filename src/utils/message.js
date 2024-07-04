import { router } from 'umi';

export const gotoMessageDetail = (record, pathname) => {
  switch (record.navigation_number) {
    case 1001:
      router.push(`/share/obtain/detail?orderId=${record.msg_key}&isProvider=${0}`);
      if (pathname === '/share/obtain/detail') window.location.reload();
      break;
    case 1002:
      router.push(`/share/obtain/detail?orderId=${record.msg_key}&isProvider=${0}`);
      if (pathname === '/share/obtain/detail') window.location.reload();
      break;
    case 1003:
      router.push(`/share/provide/detail?orderId=${record.msg_key}&isProvider=${1}`);
      if (pathname === '/share/provide/detail') window.location.reload();
      break;
    case 3001:
      // 1:共享参与 2:邀请参与
      if (record.data_source === 2) {
        router.push(
          `/federate/partner/detail?type=2&taskId=${record.msg_key}&dataId=${record.data_id}`,
        );
      } else {
        router.push(
          `/federate/partner/detail?type=1&taskId=${record.msg_key}&dataId=${record.data_id}`,
        );
      }

      if (pathname === '/federate/partner/detail') window.location.reload();
      break;
    case 3004:
      if (record.data_source === 2) {
        router.push(
          `/federate/partner/detail?type=2&taskId=${record.msg_key}&dataId=${record.data_id}`,
        );
      } else {
        router.push(
          `/federate/partner/detail?type=1&taskId=${record.msg_key}&dataId=${record.data_id}`,
        );
      }
      if (pathname === '/federate/partner/detail') window.location.reload();
      break;
    case 3002:
      router.push(`/federate/sponsor/task?taskId=${record.msg_key}`);
      window.location.reload();
      break;
    case 3003:
      router.push(`/federate/sponsor/task?taskId=${record.msg_key}`);
      window.location.reload();
      break;
    case 3007:
      router.push(`/federate/partner?type=2`);
      if (pathname === '/federate/partner') window.location.reload();
      break;
    case 3005:
      router.push(
        `/federate/sponsor/editor?dataType=${record.data_source === 1 ? 1 : 3}&taskId=${
          record.msg_key
        }&dataId=${record.data_id}`,
      );
      if (pathname === '/federate/sponsor/editor') window.location.reload();
      break;
    case 3006:
      router.push(
        `/federate/sponsor/editor?dataType=${record.data_source === 1 ? 1 : 3}&taskId=${
          record.msg_key
        }&dataId=${record.data_id}`,
      );
      if (pathname === '/federate/sponsor/editor') window.location.reload();
      break;
    default:
      break;
  }
};
