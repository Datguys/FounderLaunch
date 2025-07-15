import DashboardLayout from '@/components/DashboardLayout';

export default function Affiliate() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Affiliate Program</h1>
        <p className="text-muted-foreground">Earn 20% commission by referring StartupCoPilot</p>
        {/* Affiliate tracking interface here */}
      </div>
    </DashboardLayout>
  );
}