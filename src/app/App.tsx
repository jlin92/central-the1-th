import { DemoProvider } from '@/app/DemoContext';
import { AppShell } from '@/components/layout/AppShell';

export default function App() {
  return (
    <DemoProvider>
      <AppShell />
    </DemoProvider>
  );
}
