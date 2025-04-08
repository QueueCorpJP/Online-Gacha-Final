import { api } from '../lib/axios';

export enum InquiryStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export interface Inquiry {
  id: string;
  userId: string;
  subject: string;
  status: InquiryStatus;
  createdAt: string;
  message: string;
}

export const supportApi = {
  getInquiries: async () => {
    const response = await api.get<Inquiry[]>('/support/inquiries');
    return response.data;
  },

  updateInquiryStatus: async (id: string, status: InquiryStatus) => {
    // Make sure we're sending the exact enum value
    const response = await api.put<Inquiry>(`/support/inquiries/${id}/status`, { 
      status: status.toString() 
    });
    return response.data;
  },
};

// Helper function to convert status to Japanese display text
export const getStatusDisplayText = (status: InquiryStatus): string => {
  const statusMap: Record<InquiryStatus, string> = {
    [InquiryStatus.PENDING]: '未対応',
    [InquiryStatus.IN_PROGRESS]: '対応中',
    [InquiryStatus.RESOLVED]: '対応済み'
  };
  return statusMap[status] || status;
};
