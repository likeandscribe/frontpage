import { createContext } from "react";

/**
 * We need shouldUseDrawer in context to ensure that all sub-components of the a Dialog/AlertDialog agree on
 * whether to use a Drawer or a Dialog.
 *
 * We need `open` and `setOpen` in context to work around an issue in the Drawer.Close component where it doesn't
 * trigger the close animation, we need to control the open state manually to ensure the animation plays.
 */
export const ResponsiveDialogContext = createContext({
  shouldUseDrawer: false,
  setOpen: (_open: boolean) => {},
});
