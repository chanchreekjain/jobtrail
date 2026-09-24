/* eslint-disable @next/next/no-img-element */

/**
 * The mark, as a plain <img>. next/image would want extra configuration
 * and buys nothing for a 256px PNG we ship ourselves.
 */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0"
    />
  );
}
