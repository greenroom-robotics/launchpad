import gamepadData from './gamepads.json';

export type Platform = 'linux' | 'mac' | 'windows';

export interface GamepadRow {
  name: string;
  vendor_id: string;
  product_id: string;
  vendor: string;
  product: string;
  mapper: string;
  source: string;
}

export const { platforms } = gamepadData as {
  chromium: string;
  platforms: Record<Platform, GamepadRow[]>;
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  linux: 'Linux',
  mac: 'macOS',
  windows: 'Windows',
};

export const detectPlatform = (): Platform => {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'windows';
  if (/Mac/i.test(ua)) return 'mac';
  return 'linux';
};

/**
 * Extract vendor/product ids from a Gamepad.id string. Chromium formats vary:
 *   "Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)"
 *   "045e-028e-Microsoft X-Box 360 pad"
 * XInput devices on Windows expose no ids at all, so this can return undefined.
 */
export const parseGamepadId = (id: string): { vendorId: string; productId: string } | undefined => {
  const labelled = /Vendor:\s*([0-9a-f]{4})\s+Product:\s*([0-9a-f]{4})/i.exec(id);
  if (labelled)
    return { vendorId: labelled[1].toLowerCase(), productId: labelled[2].toLowerCase() };
  const dashed = /^([0-9a-f]{4})-([0-9a-f]{4})-/i.exec(id);
  if (dashed) return { vendorId: dashed[1].toLowerCase(), productId: dashed[2].toLowerCase() };
  return undefined;
};

export const findListed = (platform: Platform, vendorId: string, productId: string) =>
  platforms[platform].find((r) => r.vendor_id === vendorId && r.product_id === productId);
