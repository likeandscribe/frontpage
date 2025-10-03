import { Card } from "@/lib/components/ui/card";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-6 p-6">{children}</Card>
    </div>
  );
}
