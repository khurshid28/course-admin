import React, { ReactNode } from 'react';
import { Navigate } from 'react-router';

export const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/signin" />;
};
