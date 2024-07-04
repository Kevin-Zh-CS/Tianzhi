import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import { router } from 'umi';
import styles from './index.less';
import MessageCard from './components/MessageCard';
import { IconBase } from 'quanta-design';
import { ReactComponent as EmptyIcon } from '@/icons/empty-image.svg';
import { getMessageList, markMessageRead } from '@/services/message';

let scrollDom;
function MessageModel(props) {
  const { show = false, setUploadModal, getNotReadMessage, gotoMessageDetail } = props;
  const [messageList, setMessageList] = useState([]);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const cardTitle = `消息通知（${total}）`;
  const emptyImg = (
    <IconBase width="32" viewBox="0 0 72 72" height="32" icon={EmptyIcon} fill="#DADADA" />
  );

  // 获取所有未读的消息
  const loadData = async (page = 1, size = 10, is_asc = false, msg_status = 0) => {
    const data = await getMessageList({ page, size, is_asc, msg_status });
    if (page !== 1) {
      setMessageList([...messageList, ...data.list]);
      setCurrentPage(page);
    } else {
      setMessageList(data.list);
      setCurrentPage(page);
    }
    setTotal(data.total);
  };

  useEffect(() => {
    if (show) {
      setScrollHeight(window.innerHeight - cardTitle.clientHeight);
      loadData();
    } else {
      setMessageList([]);
      setTotal(0);
    }
  }, [show]);

  // 处理滚动监听
  const handleScroll = () => {
    if (total / 10 <= currentPage) {
      return;
    }
    if (scrollDom.scrollTop + scrollDom.clientHeight >= scrollDom.scrollHeight) {
      setCurrentPage(currentPage + 1);
      loadData(currentPage + 1);
    }
  };

  const iKnow = async li => {
    const ids = li.msg_id;
    await markMessageRead(ids);
    getNotReadMessage();
    loadData(1);
  };

  const goToMore = () => {
    router.push('/message');
    setUploadModal();
  };

  return (
    <>
      {show ? (
        <div
          onClick={e => {
            e.stopPropagation();
          }}
        >
          {total > 0 ? (
            <div className={styles.wrap}>
              <Card
                title={cardTitle}
                className={styles.cardTitle}
                bodyStyle={{ padding: 0, borderTop: 'blue' }}
              >
                <div
                  ref={body => {
                    scrollDom = body;
                  }}
                  className={styles.content}
                  style={{ height: scrollHeight }}
                  onScroll={handleScroll}
                >
                  {messageList.map(item => (
                    <MessageCard
                      item={item}
                      key={item.msg_id}
                      iKnow={iKnow}
                      gotoMessageDetail={gotoMessageDetail}
                    />
                  ))}
                </div>
              </Card>
              <div
                className={styles.cardFooter}
                onClick={e => {
                  e.stopPropagation();
                  goToMore();
                }}
              >
                查看更多
              </div>
            </div>
          ) : (
            <div className={styles.wrap}>
              <Card
                title="消息通知"
                className={styles.cardTitle}
                bodyStyle={{ height: 112, padding: 0 }}
              >
                <div className={styles.emptyBody}>
                  <span className={styles.emptyImg}> {emptyImg} </span>
                  <span className={styles.emptyData}>暂无未读消息</span>
                </div>
              </Card>
              <div
                className={styles.cardFooter}
                onClick={e => {
                  e.stopPropagation();
                  goToMore();
                }}
              >
                查看更多
              </div>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}

export default MessageModel;
