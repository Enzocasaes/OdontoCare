import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ children, roles }) => {
  const { token, user } = useSelector((state) => state.auth);

  // Se não estiver autenticado, redireciona para login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Se roles foram especificadas, verifica se o usuário tem permissão
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
