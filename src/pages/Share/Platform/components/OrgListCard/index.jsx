import React, { useEffect, useState } from 'react';
import company from '@/assets/share/company.png';
import Organization from '@/pages/Share/Platform/components/Organization';
import styles from '@/pages/Share/Platform/index.less';
import { getAllOrgList } from '@/services/datasharing';
import { router } from 'umi';

function OrgListCard({ selected, setSelected }) {
  const [orgList, setOrgList] = useState({});
  const [org, setOrg] = useState([]);
  const { list = [] } = orgList;
  const allOrg = {
    org_logo: company,
    org_name: `全部机构（${orgList.totalOrgCount}个）`,
    desc: '',
    provided_data_num: `${orgList.totalProvidedDataNum}`,
    obtained_data_num: `${orgList.totalObtainedDataNum}`,
  };

  const initList = async () => {
    const res = await getAllOrgList();
    setOrgList(res);
  };

  // getAllOrgList
  useEffect(() => {
    initList();
  }, []);
  // 直接操作筛选条件tag引起变化
  useEffect(() => {
    setOrg(org.filter(el => selected.indexOf(el) > -1));
  }, [selected]);

  const handleAllOrg = () => {
    setOrg([]);
    // 清除 selected 中所有机构名
    const tmp = selected.filter(el => {
      let isExist = false;
      list.forEach(obj => {
        if (obj.org_name === el) {
          isExist = true;
        }
      });
      return !isExist;
    });
    setSelected(tmp);
  };

  const handleClickOrg = (active, name, org_id) => {
    setOrg([name]);
    if (active) {
      setSelected(selected.filter(el => el !== name));
    } else {
      setSelected(origin => {
        const tmp = origin.filter(el => {
          let isExist = false;
          list.forEach(obj => {
            if (obj.org_name === el) {
              isExist = true;
            }
          });
          return !isExist;
        });
        return tmp.concat(name);
      });
    }
    router.push({
      pathname: '/share/platform/search-list',
      state: { orgAddress: org_id, orgName: name },
    });
  };

  return (
    <>
      <div className={styles.title}>数据所属机构</div>
      <Organization onClick={handleAllOrg} {...allOrg} active={!org.length} />
      {list.map(item => (
        <Organization
          active={org.indexOf(item.org_name) !== -1}
          onClick={() =>
            handleClickOrg(org.indexOf(item.org_name) !== -1, item.org_name, item.org_id)
          }
          key={item.key}
          {...item}
        />
      ))}
    </>
  );
}

export default OrgListCard;
