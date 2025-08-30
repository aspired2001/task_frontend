// src/components/common/StatusBadge.tsx
import React from 'react';
import { Badge } from '../ui/badge';
import { getStatusColor } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  return (
    <Badge className={`${getStatusColor(status)} ${className || ''}`}>
      {status.replace('_', ' ')}
    </Badge>
  );
};