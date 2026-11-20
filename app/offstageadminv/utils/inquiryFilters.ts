import type { Inquiry, InquiryFilterCriterion } from '../types';

export function filterInquiriesByCriterion(
  inquiries: Inquiry[],
  criterion: InquiryFilterCriterion
): Inquiry[] {
  return inquiries.filter((inquiry) => {
    if (criterion === 'all') {
      return true;
    }
    if (criterion === 'unread') {
      return inquiry.status === 'unread';
    }
    if (criterion === 'replied') {
      return inquiry.status === 'replied';
    }
    return inquiry.category === criterion;
  });
}

