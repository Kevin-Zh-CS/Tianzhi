import React from 'react';
import { toFixPrice } from '@/utils/helper';
import { router } from 'umi';
import warningNoteIcon from '@/icons/warning_note.png';
import successNoteIcon from '@/icons/success_note.png';
import failNoteIcon from '@/icons/fail_note.png';
import closeIcon from '@/icons/data_error.png';
import { ORDER_TYPE } from '@/utils/enums';

export function getStatusText(dataDetail, info) {
  let statusText = '';
  if (dataDetail.order_type === ORDER_TYPE.auth) {
    if (dataDetail.in_white_list) {
      statusText = '您所在的机构目前处于该数据的授权名单中，可以直接获取数据。';
    } else {
      statusText =
        dataDetail.org_node === info.org_id
          ? '本机构数据不可获取。'
          : '您所在的机构未处于该数据的授权名单中，需要向数据所属机构提交申请，审核通过后才能使用。';
    }
  } else if (dataDetail.order_type === ORDER_TYPE.publish) {
    statusText = '该数据为公开数据，可以直接获取该数据。';
  } else {
    statusText = '该数据需用积分购买，购买成功后才能使用。';
  }

  return statusText;
}

export function getAuthStatus(data) {
  const { auth = 0, status = 0, extra } = data;
  const list = extra ? JSON.parse(extra) : {};
  const { creditPackages = [] } = list;
  if (auth) {
    if (auth === 2) {
      return <span style={{ color: '#08CB94' }}>公开</span>;
    }
    return status ? (
      <span style={{ color: '#08CB94' }}>已授权</span>
    ) : (
      <span style={{ color: '#b7b7b7' }}>未授权</span>
    );
  }
  return <span style={{ color: '#ffad32' }}>{toFixPrice(creditPackages[0]?.credit || 0)} Bx</span>;
}

export function getTip(dataDetail, info) {
  let statusText = '';
  if (dataDetail.order_type === ORDER_TYPE.publish) {
    if (dataDetail.in_white_list) {
      statusText = '数据提供方已将此数据授权给本机构，可以直接获取数据。';
    } else {
      statusText =
        dataDetail.org_node === info.org_id
          ? '本机构数据不可获取。'
          : '您所在的机构未处于该数据的授权名单中，需要向数据所属机构提交申请，审核通过后才能使用。';
    }
  } else if (dataDetail.order_type === ORDER_TYPE.publish) {
    statusText = '该数据为公开数据，可以直接获取该数据。';
  } else {
    statusText = '该数据需用积分购买，购买成功后才能使用。';
  }

  return statusText;
}

export function getStatusTxt(data) {
  const { order_type, in_white_list } = data;
  if (order_type === ORDER_TYPE.publish) {
    return <span style={{ color: '#08CB94' }}>公开</span>;
  }
  return in_white_list ? (
    <span style={{ color: '#08CB94' }}>已授权</span>
  ) : (
    <span style={{ color: '#b7b7b7' }}>未授权</span>
  );
}

export function getOrderType(type) {
  let text = '-';
  switch (type) {
    case 0:
      text = '积分共享';
      break;
    case 1:
      text = '授权共享';
      break;
    case 2:
      text = '公开共享';
      break;
    default:
      text = '-';
      break;
  }
  return text;
}

export const noteTitleList = [
  '获取成功',
  '已取消',
  '待审核',
  '审核通过',
  '审核驳回',
  '已支付',
  '待支付',
  '获取成功',
  '已失效',
];

export const noteDescList = [
  '您所在机构目前处于该数据的授权名单内，可永久且不限次使用数据。',
  '订单已取消，获取数据失败。',
  '获取该数据需要数据提供方进行资格审核，请耐心等待。',
  '',
  '',
  <p>
    系统已成功从您的积分余额中扣除相应积分，已拿到数据访问凭证，可在
    <a onClick={() => router.push('/manage/outer')}>【数据管理平台-外部资源管理】</a>
    中请求该数据。
  </p>,
  '获取该数据需要积分支付，支付后才能使用。',
  '该数据为公开数据，已获取永久使用权限。',
  '数据已失效，数据需求方不能使用当前数据。',
];

// [
//   '获取成功',
//   '已取消',
//   '待审核',
//   '审核通过',
//   '审核驳回',
//   '已支付',
//   '待支付',
//   '获取成功',
//   '已失效',
// ];
export const getDescList = (data, isProvide) => {
  const { order_type, in_white_list, od_status } = data;

  let desc = '';
  //   白名单数据
  if (order_type === ORDER_TYPE.auth) {
    if (in_white_list) {
      if (isProvide) {
        desc = '当前机构目前处于该数据的授权名单内，可永久且不限次使用数据。';
      } else {
        desc = '您所在机构目前处于该数据的授权名单内，可永久且不限次使用数据。';
      }
    } else if (isProvide) {
      if (od_status === 2) {
        desc = '需对数据需求方进行资格审核，审核通过后申请方才能使用该数据。';
      } else if (od_status === 4) {
        desc = '审核驳回，数据需求方不能使用该数据。';
      } else if (od_status === 3) {
        desc = '审核通过，数据需求方可在提供方所限定的有效时间和有效次数内使用该数据。';
      } else if (od_status === 8) {
        desc = '数据已失效，数据需求方不能使用当前数据。';
      }
    } else if (!isProvide) {
      if (od_status === 2) {
        desc = '获取该数据需要数据提供方进行资格审核，请耐心等待。';
      } else if (od_status === 4) {
        desc = '数据提供方审核驳回，您所在的机构不能使用当前数据。';
      } else if (od_status === 3) {
        desc = '数据提供方审核通过，您所在的机构可在提供方所限定的有效时间和有效次数内使用该数据。';
      } else if (od_status === 8) {
        desc = '数据已失效，您所在的机构不能使用当前数据。';
      }
    }
  } else if (order_type === ORDER_TYPE.credit) {
    if (isProvide) {
      if (od_status === 5) {
        desc = '支付成功，数据需求方可在套餐指定的有效期或有效次数内使用数据。';
      } else if (od_status === 8) {
        desc = '数据已失效，数据需求方不能使用当前数据。';
      }
    } else if (!isProvide) {
      if (od_status === 5) {
        desc = '支付成功，已获得数据访问凭证，可在套餐指定的有效期或有效次数内使用数据。';
      } else if (od_status === 8) {
        desc = '数据已失效，您所在的机构不能使用当前数据。';
      }
    }
  } else if (order_type === ORDER_TYPE.publish) {
    if (isProvide) {
      desc = '该数据为公开数据，当前机构可永久且不限次使用。';
    } else if (!isProvide) {
      desc = '该数据为公开数据，可永久且不限次使用。';
    }
  }

  return desc;
};

export function getInfoDescList(orderDetail) {
  let info = '-';
  switch (orderDetail.od_status) {
    case 0:
      info = (
        <span>
          您所在的机构已成功向{orderDetail.provider_name}获取“{orderDetail.data_name}”的授权!
          <br />
          可以在<a onClick={() => router.push('/share/obtain/list')}>【数据交换-数据获取】</a>
          中查看订单详情，并在
          <a onClick={() => router.push('/manage/outer/obtain')}>【数据管理-已获取数据】</a>
          中请求并获取数据。
        </span>
      );
      break;
    case 1:
      info = (
        <span>
          您所在的机构向{orderDetail.provider_name}申请的“{orderDetail.data_name}”已取消！
          <br />
          可以在<a onClick={() => router.push('/share/platform')}>【数据平台】</a>
          中继续查找所需数据。
        </span>
      );
      break;
    case 2:
      info = (
        <span>
          您所在的机构不在该数据的授权名单中，已将申请“{orderDetail.data_name}
          ”的信息发送给数据提供方！
          <br />
          可以在<a onClick={() => router.push('/share/obtain/list')}>【数据交换-数据获取】</a>
          中查看订单详情，待数据提供方审核通过后可在
          <a onClick={() => router.push('/manage/outer/obtain')}>【数据管理-已获取数据】</a>
          中请求并获取数据。
        </span>
      );
      break;
    case 3:
      info = (
        <span>
          数据提供方审核通过，您所在的机构可在有效期内请求该数据！
          <br />
          可以在<a onClick={() => router.push('/share/obtain/list')}>【数据交换-数据获取】</a>
          中查看订单详情，待支付成功后可在
          <a onClick={() => router.push('/manage/outer/obtain')}>【数据管理-已获取数据】</a>
          中请求并获取数据。
        </span>
      );
      break;
    case 4:
      info = (
        <span>
          您所在的机构不在该数据的授权名单中，已将申请“{orderDetail.data_name}
          ”的信息发送给数据提供方！
          <br />
          可以在<a onClick={() => router.push('/share/obtain/list')}>【数据交换-数据获取】</a>
          中查看订单详情。
        </span>
      );
      break;
    case 5:
      info = (
        <span>
          您所在的机构已成功向{orderDetail.provider_name}购买“{orderDetail.data_name}“！
          <br />
          <br />
          可以在<a onClick={() => router.push('/share/obtain/list')}>【数据交换-数据获取】</a>
          中查看订单详情，并在
          <a onClick={() => router.push('/manage/outer/obtain')}>【数据管理-已获取数据】</a>
          中请求并获取数据。
        </span>
      );
      break;
    case 6:
      info = (
        <span>
          您还未支付当前订单，获取该数据需要积分支付，支付后才能使用。
          <br />
          可以在<a onClick={() => router.push('/share/obtain/list')}>【数据交换-数据获取】</a>
          中查看订单详情。
        </span>
      );
      break;
    case 7:
      info = (
        <span>
          您所在的机构不在该数据的授权名单中，已将申请“{orderDetail.data_name}
          ”的信息发送给数据提供方！
          <br />
          可以在<a onClick={() => router.push('/share/obtain/list')}>【数据交换-数据获取】</a>
          中查看订单详情，并在
          <a onClick={() => router.push('/manage/outer/obtain')}>【数据管理-已获取数据】</a>
          中请求并获取数据。
        </span>
      );
      break;
    default:
      info = '-';
      break;
  }
  return info;
}

export const bgColorList = ['#E6FAF4', '', '#FFF6EA', '#E6FAF4', '#FCEBEC', '#E6FAF4', ''];

export const iconList = [
  successNoteIcon,
  failNoteIcon,
  warningNoteIcon,
  successNoteIcon,
  failNoteIcon,
  successNoteIcon,
  warningNoteIcon,
  successNoteIcon,
  closeIcon,
];

export const statusList = [
  'success',
  'error',
  'warning',
  'success',
  'error',
  'success',
  'warning',
  'success',
  'default',
];

export const getDuration = orderDetail => {
  let duration;
  if (orderDetail.order_type === 0) {
    duration = `${orderDetail.duration}天`;
  } else if (orderDetail.order_type === 1) {
    if (orderDetail.od_status === 3 || orderDetail.od_status === 8) {
      duration = `${orderDetail.approve_duration}天`;
    } else if (orderDetail.od_status === 0) {
      duration = '永久';
    } else {
      duration = '-';
    }
  } else {
    duration = '永久';
  }

  return duration;
};
