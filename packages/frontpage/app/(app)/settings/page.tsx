import {
  ExitIcon,
  DesktopIcon,
  MobileIcon,
  TrashIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";

import { Button } from "@/lib/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/lib/components/ui/alert-dialog";
import { UserAvatar } from "@/lib/components/user-avatar";
import { getUser } from "@/lib/data/user";
import { redirect } from "next/navigation";
import { getVerifiedHandle } from "@/lib/data/atproto/identity";

// Mock sessions data
const sessions = [
  {
    id: "1",
    device: "iPhone 13",
    location: "San Francisco, CA",
    lastActive: "Just now",
    ip: "192.168.1.1",
    isCurrent: true,
    type: "mobile",
  },
  {
    id: "2",
    device: "Chrome on Windows",
    location: "San Francisco, CA",
    lastActive: "Yesterday at 2:30 PM",
    ip: "192.168.1.2",
    isCurrent: false,
    type: "desktop",
  },
  {
    id: "3",
    device: "Firefox on MacBook Pro",
    location: "New York, NY",
    lastActive: "3 days ago",
    ip: "192.168.1.3",
    isCurrent: false,
    type: "laptop",
  },
  {
    id: "4",
    device: "Safari on iPad",
    location: "Chicago, IL",
    lastActive: "1 week ago",
    ip: "192.168.1.4",
    isCurrent: false,
    type: "tablet",
  },
];

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <MobileIcon className="h-4 w-4 mr-2" />;
      case "laptop":
        return <DesktopIcon className="h-4 w-4 mr-2" />;
      default:
        return <DesktopIcon className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      {/* User Profile Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <UserAvatar did={user.did} />
            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-2xl font-semibold">
                @{await getVerifiedHandle(user.did)}
              </h2>
              <p className="text-muted-foreground">{user.did}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Devices currently signed in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center">
                  {getDeviceIcon(session.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.device}</span>
                      {session.isCurrent && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-200"
                        >
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session.location} • {session.lastActive}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      IP: {session.ip}
                    </div>
                  </div>
                </div>

                {session.isCurrent ? (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <LockClosedIcon className="h-3 w-3" />
                    <span>This device</span>
                  </Badge>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <TrashIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Revoke session</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will sign out this device from your account. You
                          can always sign back in.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Revoke</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}

            {sessions.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No active sessions
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card>
        <CardHeader>
          <CardTitle>Sign Out</CardTitle>
          <CardDescription>Sign out from your current session</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <ExitIcon className="h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
