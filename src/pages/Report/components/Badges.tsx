// src/pages/Report/components/Badges.tsx
import React from 'react';
import { Text } from 'zmp-ui';
import styled from 'styled-components';
import tw from 'twin.macro';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ReportStatus, ReportPriority } from '../../../types/report';

dayjs.locale('vi');
dayjs.extend(relativeTime);

const Badge = styled.span`
  ${tw`px-2 py-1 rounded-full text-xs font-medium`}
`;

const getStatusInfo = (status: ReportStatus | 'overdue') => {
  const map = {
    pending: { text: 'Chờ làm', style: tw`bg-yellow-100 text-yellow-800` },
    in_progress: { text: 'Đang làm', style: tw`bg-blue-100 text-blue-800` },
    submitted: { text: 'Chờ duyệt', style: tw`bg-purple-100 text-purple-800` },
    approved: { text: 'Đã duyệt', style: tw`bg-green-100 text-green-800` },
    rejected: { text: 'Bị từ chối', style: tw`bg-red-100 text-red-800` },
    overdue: { text: 'Quá hạn', style: tw`bg-red-200 text-red-900` },
  };
  return map[status] || { text: 'Không rõ', style: tw`bg-gray-100 text-gray-800` };
};

export const ReportStatusBadge: React.FC<{ status: ReportStatus }> = ({ status }) => {
  const isOverdue = status !== 'approved' && dayjs().isAfter(dayjs(status));
  const displayStatus = isOverdue ? 'overdue' : status;
  const { text, style } = getStatusInfo(displayStatus);
  const BadgeComponent = styled(Badge)`${style}`;
  return <BadgeComponent>{text}</BadgeComponent>;
};

const getPriorityInfo = (priority: ReportPriority) => {
  const map = {
    high: { text: 'Cao', style: tw`bg-red-100 text-red-800` },
    medium: { text: 'Trung bình', style: tw`bg-yellow-100 text-yellow-800` },
    low: { text: 'Thấp', style: tw`bg-green-100 text-green-800` },
  };
  return map[priority] || { text: 'Không rõ', style: tw`bg-gray-100 text-gray-800` };
};

export const PriorityBadge: React.FC<{ priority: ReportPriority }> = ({ priority }) => {
  const { text, style } = getPriorityInfo(priority);
  const BadgeComponent = styled(Badge)`${style}`;
  return <BadgeComponent>{text}</BadgeComponent>;
};

export const TimeLeftTag: React.FC<{ dueDate: number; status: ReportStatus }> = ({ dueDate, status }) => {
  if (status === 'approved') {
    return <Text size="xSmall" className="text-gray-500">Đã hoàn thành</Text>;
  }
  const now = dayjs();
  const due = dayjs(dueDate);
  const isOverdue = now.isAfter(due);
  const diffText = due.fromNow();

  const className = isOverdue ? 'text-red-600' : 'text-gray-600';

  return <Text size="xSmall" className={className}>{isOverdue ? `Quá hạn ${diffText.replace('trước', '')}` : `Còn ${diffText.replace('sau', '')}`}</Text>;
};