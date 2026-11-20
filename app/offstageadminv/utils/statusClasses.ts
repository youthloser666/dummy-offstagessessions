export type InquiryCategoryCssKey =
  | 'categoryBooking'
  | 'categoryCollab'
  | 'categoryPress'
  | 'categoryGeneral';

const CATEGORY_CLASS_MAP: Record<string, InquiryCategoryCssKey> = {
  booking: 'categoryBooking',
  collaboration: 'categoryCollab',
  press: 'categoryPress',
};

export function getInquiryCategoryClass(category?: string): InquiryCategoryCssKey {
  const normalized = (category || 'General').toLowerCase();
  return CATEGORY_CLASS_MAP[normalized] || 'categoryGeneral';
}

