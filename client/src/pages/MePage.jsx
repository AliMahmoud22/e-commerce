import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

export default function me() {
  const { user } = useContext(UserContext);

  return <p>hello</p>;
}
