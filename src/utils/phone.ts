export const VIETNAM_PHONE_REGEX = /^(\+84|84|0)[1-9][0-9]{8}$/;

export function isVietnamesePhoneNumber(value: string): boolean {
  return VIETNAM_PHONE_REGEX.test(value.trim());
}
