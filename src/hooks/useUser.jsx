import { useSelector } from 'react-redux';

export const useUser = () => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  
  return {
    user,
    loading: false,
    isAuthenticated,
    switchRole: () => {} // Deprecated - roles are now managed by Apper authentication
  };
};