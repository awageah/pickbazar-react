import { AddStaffInput, User } from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';
import { KolshiPageResponse } from '@/utils/pagination';

export interface StaffListParams {
  shopId: string | number;
  page?: number;
  size?: number;
}

export const staffClient = {
  /**
   * GET /shops/{shopId}/staff
   * Returns paginated list of staff members for a shop.
   */
  paginated: ({ shopId, page, size }: StaffListParams) =>
    HttpClient.getPaginated<User>(
      `${API_ENDPOINTS.SHOPS}/${shopId}/staff`,
      { page, size },
    ),

  /**
   * POST /shops/{shopId}/staff
   * Adds an existing user as a staff member of the shop.
   */
  addStaff: ({ shopId, userId }: AddStaffInput) =>
    HttpClient.post<User>(
      `${API_ENDPOINTS.SHOPS}/${shopId}/staff`,
      { userId },
    ),

  /**
   * DELETE /shops/{shopId}/staff/{staffId}
   */
  removeStaff: ({
    shopId,
    staffId,
  }: {
    shopId: string | number;
    staffId: string | number;
  }) =>
    HttpClient.delete<void>(
      `${API_ENDPOINTS.SHOPS}/${shopId}/staff/${staffId}`,
    ),
};
