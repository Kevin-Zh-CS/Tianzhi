import React, { useEffect, useState } from 'react';
import { Select } from 'quanta-design';
import { getSearchList } from '@/services/resource';

const { Option } = Select;

export default function SelectResource(props) {
  const [list, setList] = useState([]);

  const getList = async () => {
    const res = await getSearchList();
    setList(res);
  };

  useEffect(() => {
    getList();
  }, []);
  return (
    <Select placeholder="请选择" {...props}>
      {list.map(item => (
        <Option key={item.org_id} value={item.org_id}>
          {item.org_name}
        </Option>
      ))}
    </Select>
  );
}
