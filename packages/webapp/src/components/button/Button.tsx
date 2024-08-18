import { cx } from "@worm/shared";

import { ButtonProps } from ".";

const commonClass = "px-3.5 py-2 mx-0.5 rounded shadow";

const variantMap: Partial<Record<NonNullable<ButtonProps["variant"]>, string>> =
  {
    default: cx(
      "outline-2 outline-primary-600 text-primary-700 focus:ring focus:ring-primary-300",
      commonClass
    ),
    primary: cx(
      "text-white bg-primary-600 active:bg-primary-700 focus:outline-none focus:ring focus:ring-primary-300 hover:bg-primary-700",
      commonClass
    ),
  };

export default function Button({
  className,
  variant = "default",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(variantMap[variant], className)}
      type="button"
      {...rest}
    />
  );
}
