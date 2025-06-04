export interface ProfileDetail {
  label: string;
  value: string;
  prefix?: string;
  className?: string;
}

export const profileDetails: ProfileDetail[] = [
  { label: 'First name', value: 'Joseph' },
  { label: 'Last name', value: 'Micheal' },
  { label: 'Email Address', value: 'Sample@gmail.com', className: 'break-all' },
  { label: 'Date of Birth', value: '01 January 2000' },
  { label: 'Gender', value: 'Male' },
  { 
    label: 'Country', 
    value: 'Nigeria',
    prefix: '🇳🇬',
    className: 'items-center gap-2'
  },
  { label: 'Referred By', value: 'Null' }
]; 