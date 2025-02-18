import React from 'react';
import classNames from 'classnames';
import useId from '../utilities/useId';
import { CloseIconThin } from '../Icons';

interface BaseCloseButtonProps {
  /**
   * An aria-label is required since the button content is only an X
   */
  'aria-label': string;
  /**
   * Additional classes to be added to the button element.
   */
  className?: string;
  /**
   * A custom `id` attribute for the dialog element
   */
  id?: string;
}

export type CloseButtonProps = Omit<
  React.ComponentPropsWithRef<'button'>,
  keyof BaseCloseButtonProps
> &
  BaseCloseButtonProps;

/**
 *
 */
export const CloseButton = ({ className, id: idProp, ...buttonAttributes }: CloseButtonProps) => {
  const id = useId('close-button--', idProp);
  return (
    <button
      className={classNames('ds-c-close-button', className)}
      type="button"
      id={id}
      {...buttonAttributes}
    >
      <CloseIconThin ariaHidden={false} id={`${id}__icon`} />
    </button>
  );
};

export default CloseButton;
