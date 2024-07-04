import React, { useEffect, useState } from 'react';
import { Select } from 'quanta-design';
import { getSourceList } from '@/services/resource';

const { Option } = Select;

export default function SelectResource(props) {
  const [list, setList] = useState([]);

  const getList = async () => {
    const res = await getSourceList();
    setList(res);
  };

  useEffect(() => {
    getList();
  }, []);
  return (
    <Select placeholder="请选择" {...props}>
      {list.map(item => (
        <Option key={item.ns_id} value={item.ns_id}>
          {item.ns_name}
        </Option>
      ))}
    </Select>
  );
}
