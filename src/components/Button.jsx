import { forwardRef } from 'react';
import './Button.css';

const Button = forwardRef(({
  children,
  as: Component = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseClass = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const disabledClass = disabled ? 'btn--disabled' : '';
  const loadingClass = loading ? 'btn--loading' : '';
  const iconClass = icon ? `btn--with-icon btn--icon-${iconPosition}` : '';

  const buttonClass = [
    baseClass,
    variantClass,
    sizeClass,
    disabledClass,
    loadingClass,
    iconClass,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  // Don't pass type to non-button elements
  const componentProps = Component === 'button'
    ? { type, onClick: handleClick, disabled: disabled || loading }
    : { onClick: handleClick };

  return (
    <Component
      ref={ref}
      className={buttonClass}
      {...componentProps}
      {...props}
    >
      {loading && (
        <span className="btn__spinner">
          <span className="btn__spinner-dot"></span>
          <span className="btn__spinner-dot"></span>
          <span className="btn__spinner-dot"></span>
        </span>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="btn__icon btn__icon--left">
          {icon}
        </span>
      )}
      
      <span className="btn__text">
        {children}
      </span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="btn__icon btn__icon--right">
          {icon}
        </span>
      )}
    </Component>
  );
});

Button.displayName = 'Button';

export default Button;
