import React from 'react';
import { useRef, useEffect, useLayoutEffect, DialogHTMLAttributes } from 'react';
import dialogPolyfill from './polyfill';

export interface NativeDialogProps extends Omit<DialogHTMLAttributes<HTMLElement>, 'children'> {
  children: React.ReactNode;
  /**
   * Pass `true` to have the dialog close when its backdrop pseudo-element is clicked
   */
  backdropClickExits?: boolean;
  boundingBoxRef?: React.MutableRefObject<any>;
  /**
   * Controls whether the dialog is in an open state
   */
  isOpen?: boolean;
  /**
   * Function called to close dialog.
   */
  exit: (...args: any[]) => any;
  /**
   * A custom `id` attribute for the dialog element
   */
  id?: string;
  /**
   * Determines which native dialog method is called to open the dialog. If the dialog
   * is opened with `showModal`, focus will be trapped inside the dialog, and it will
   * need to be closed before the rest of the page can be interacted with. See the
   * [`showModal` MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal)
   * for more details.
   */
  showModal?: boolean;
}

/**
 * This is an internal component and may change without warning. Use at your own risk!
 */
export const NativeDialog = ({
  children,
  exit,
  isOpen,
  showModal,
  backdropClickExits,
  boundingBoxRef,
  ...dialogProps
}: NativeDialogProps) => {
  const dialogRef = useRef(null);

  if (isOpen === undefined) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        "The 'isOpen' prop is now used to control the state of Dialogs and Drawers. Please do not conditionally render these components to control their state. All Dialogs and Drawers will become invisible without this prop in the next major release. Using this prop will fix a focus-management issue that affects accessibility."
      );
    }
    isOpen = true;
  }

  // Register dialog with the polyfill if necessary
  useLayoutEffect(() => {
    // The registerDialog function itself determines if the polyfill needs to be applied
    dialogPolyfill.registerDialog(dialogRef.current);
  });

  // Call imperative show and close functions on mount/unmount
  useEffect(() => {
    const dialogNode = dialogRef.current;

    // Show or hide the dialog based on `isOpen` value. The `dialogNode.open` property is
    // a read-only value that will tell us if our dialog DOM element is actually in the
    // open state.
    let closingBecauseOfProp = false;
    if (isOpen) {
      if (!dialogNode.open) {
        showModal ? dialogNode.showModal() : dialogNode.show();
      }
    } else {
      if (dialogNode.open) {
        dialogNode.close();
        closingBecauseOfProp = true;
      }
    }

    // Bind close event listener for ESC press
    const handleClose = (event) => {
      event.preventDefault();
      // Only call the exit handler if the parent didn't close it by setting isOpen to false
      if (!closingBecauseOfProp) {
        exit(event);
      }
    };
    dialogNode.addEventListener('close', handleClose);

    return () => {
      dialogNode.removeEventListener('close', handleClose);
    };
  }, [isOpen, showModal, exit]);

  // Bind and unbind backdrop click event listeners on mount and unmount
  useEffect(() => {
    if (!backdropClickExits) {
      return;
    }

    const dialogNode = dialogRef.current;
    const handleClick = (event) => {
      const boundingNode = boundingBoxRef?.current ?? dialogRef.current;
      const rect = boundingNode.getBoundingClientRect();
      const isInDialog =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        exit();
      }
    };
    dialogNode.addEventListener('click', handleClick);
    return () => {
      dialogNode.removeEventListener('click', handleClick);
    };
  }, [exit, backdropClickExits]);

  return (
    <dialog ref={dialogRef} {...dialogProps}>
      {children}
    </dialog>
  );
};

export default NativeDialog;
