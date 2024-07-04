import { useState, useLayoutEffect } from 'react';
import { getAuth } from '@/services/resource';
import { useDispatch } from 'react-redux';

function useAuth({ resource_id, ns_id }) {
  const [auth, setAuth] = useState(['init']);
  const dispatch = useDispatch();

  const _getAuth = async () => {
    dispatch({
      type: 'global/loadingAuth',
      payload: true,
    });
    const res = await getAuth({ resource_id, ns_id });
    dispatch({
      type: 'global/loadingAuth',
      payload: false,
    });
    setAuth(res);
  };

  useLayoutEffect(() => {
    if (ns_id && resource_id !== null) _getAuth();
  }, [resource_id, ns_id]);

  return auth;
}

export default useAuth;
