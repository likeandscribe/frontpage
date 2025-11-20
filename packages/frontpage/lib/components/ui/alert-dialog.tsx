"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/lib/components/ui/button";
import { useMediaQuery } from "@/lib/use-media-query";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { useContext, useState } from "react";
import { ResponsiveDialogContext } from "./dialog-context";

function AlertDialog(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Root>,
) {
  const [openState, setOpen] = useState(props.open ?? false);
  const shouldUseDrawer = !useMediaQuery("sm");

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    props.onOpenChange?.(newOpen);
  }

  const open = props.open ?? openState;

  return (
    <ResponsiveDialogContext
      value={{
        shouldUseDrawer,
        setOpen: handleOpenChange,
      }}
    >
      {shouldUseDrawer ? (
        <Drawer
          {...props}
          open={open}
          onOpenChange={handleOpenChange}
          dismissible={false}
        />
      ) : (
        <AlertDialogPrimitive.Root
          {...props}
          open={open}
          onOpenChange={handleOpenChange}
        />
      )}
    </ResponsiveDialogContext>
  );
}
AlertDialog.displayName = AlertDialogPrimitive.Root.displayName;

function AlertDialogTrigger(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>,
) {
  const { shouldUseDrawer } = useContext(ResponsiveDialogContext);

  if (shouldUseDrawer) {
    return <DrawerTrigger {...props} />;
  }

  return <AlertDialogPrimitive.Trigger {...props} />;
}
AlertDialogTrigger.displayName = AlertDialogPrimitive.Trigger.displayName;

function AlertDialogPortal(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>,
) {
  const { shouldUseDrawer } = useContext(ResponsiveDialogContext);

  if (shouldUseDrawer) {
    return <DrawerPortal {...props} />;
  }
  return <AlertDialogPrimitive.Portal {...props} />;
}
AlertDialogPortal.displayName = AlertDialogPrimitive.Portal.displayName;

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  const { shouldUseDrawer } = useContext(ResponsiveDialogContext);

  if (shouldUseDrawer) {
    return <DrawerContent {...props} className={className} resizable={false} />;
  }

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { shouldUseDrawer } = useContext(ResponsiveDialogContext);

  if (shouldUseDrawer) {
    return <DrawerHeader {...props} className={className} />;
  }

  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}
AlertDialogHeader.displayName = "AlertDialogHeader";

function AlertDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { shouldUseDrawer } = useContext(ResponsiveDialogContext);

  if (shouldUseDrawer) {
    return <DrawerFooter {...props} className={className} />;
  }

  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-y-2",
        className,
      )}
      {...props}
    />
  );
}
AlertDialogFooter.displayName = "AlertDialogFooter";

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  const { shouldUseDrawer } = useContext(ResponsiveDialogContext);

  if (shouldUseDrawer) {
    return <DrawerTitle {...props} className={className} />;
  }

  return (
    <AlertDialogPrimitive.Title
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  const { shouldUseDrawer } = useContext(ResponsiveDialogContext);

  if (shouldUseDrawer) {
    return <DrawerDescription {...props} className={className} />;
  }

  return (
    <AlertDialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

function AlertDialogAction({
  className: classNameProp,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  const { shouldUseDrawer, setOpen } = useContext(ResponsiveDialogContext);

  const className = cn(buttonVariants(), classNameProp);

  if (shouldUseDrawer) {
    return (
      <Button
        className={classNameProp}
        {...props}
        onClick={(event) => {
          setOpen(false);
          props.onClick?.(event);
        }}
      />
    );
  }

  return <AlertDialogPrimitive.Action className={className} {...props} />;
}

AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

function AlertDialogCancel({
  className: classNameProp,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  const { shouldUseDrawer, setOpen } = useContext(ResponsiveDialogContext);

  const buttonClassName = cn("mt-2 sm:mt-0", classNameProp);

  if (shouldUseDrawer) {
    return (
      <Button
        className={buttonClassName}
        variant="outline"
        {...props}
        onClick={(event) => {
          setOpen(false);
          props.onClick?.(event);
        }}
      />
    );
  }

  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), buttonClassName)}
      {...props}
    />
  );
}

AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
