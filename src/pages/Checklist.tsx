import DashboardLayout from '@/components/DashboardLayout';

export default function Checklist() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Project Checklist</h1>
        <p className="text-muted-foreground">Track your startup progress with guided checklists</p>
        {/* Checklist interface here */}
      </div>
    </DashboardLayout>
  );
}