import DashboardLayout from '@/components/DashboardLayout';

export default function Timeline() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Project Timeline</h1>
        <p className="text-muted-foreground">Plan and track your startup milestones</p>
        {/* Timeline interface here */}
      </div>
    </DashboardLayout>
  );
}