import DashboardLayout from '@/components/DashboardLayout';

export default function Budget() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Budget Planning</h1>
        <p className="text-muted-foreground">Track and manage your startup finances</p>
        {/* Budget planning interface here */}
      </div>
    </DashboardLayout>
  );
}