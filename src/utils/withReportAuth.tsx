// src/utils/withReportAuth.tsx

import React from "react";
import { useAuth } from "../contexts/AuthContext"; // kiểm tra đường dẫn nếu sai
import { Permission } from "./auth"; // dùng từ file auth.ts

export function withReportAuth<T extends object>(
  Component: React.ComponentType<T>,
  requiredPermission?: Permission
): React.FC<T> {
  return function WrappedComponent(props: T) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
      return <div>Đang tải...</div>;
    }

    if (!user) {
      return <div>Bạn cần đăng nhập để truy cập nội dung này.</div>;
    }

    if (requiredPermission && !user.permissions.includes(requiredPermission)) {
      return <div>Bạn không có quyền truy cập nội dung này.</div>;
    }

    return <Component {...props} />;
  };
}
