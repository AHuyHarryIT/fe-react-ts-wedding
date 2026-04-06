import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const ASSIGNMENT_DATETIME_FORMAT = 'HH:mm DD/MM/YYYY';

export function parseAssignmentDateTime(value?: string | null) {
  if (!value) {
    return null;
  }

  const directValue = dayjs(value);
  if (directValue.isValid()) {
    return directValue;
  }

  const formattedValue = dayjs(value, ASSIGNMENT_DATETIME_FORMAT, true);
  if (formattedValue.isValid()) {
    return formattedValue;
  }

  return null;
}

export function formatAssignmentDateTime(value?: string | null) {
  const parsedValue = parseAssignmentDateTime(value);
  return parsedValue
    ? parsedValue.format(ASSIGNMENT_DATETIME_FORMAT)
    : value || '';
}
