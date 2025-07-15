import DashboardLayout from '@/components/DashboardLayout';

export default function Settings() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
        {/* Settings interface here */}
      </div>
    </DashboardLayout>
  );
}