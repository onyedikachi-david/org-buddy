import OrgBuddyFeature from '@/components/org-buddy/org-buddy-feature';
const links: { label: string; path: string }[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Budget', path: '/budget' },
  { label: 'Fund Allocation', path: '/fund-allocation' },
  { label: 'Payouts', path: '/payouts' },
  { label: 'Members', path: '/members' },
];
export default function Page() {
  return <OrgBuddyFeature />;
}
