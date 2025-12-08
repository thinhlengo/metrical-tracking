export const VALIDATION_MESSAGES = {
  VALUE_REQUIRED: 'value is required',
  UNIT_REQUIRED: 'unit is required',
  DATE_REQUIRED: 'date is required',
  VALUE_MUST_BE_NUMBER: 'value must be a number',
  INVALID_UNIT: (unit: string) => `Invalid unit: ${unit}`,
  DISTANCE_CANNOT_BE_NEGATIVE: 'Distance cannot be negative',
  INVALID_DATE_FORMAT: 'Invalid date format',
};

export const CONVERT_UNIT_ERROR_MESSAGES = {
  UNKNOWN_TEMPERATURE_UNIT: (unit: string) => `Unknown temperature unit: ${unit}`,
  ERROR_CONVERTING_DISTANCE: (error: unknown, value: number, from: string, to: string) =>
    `Error converting distance: ${error} ${value} ${from} ${to}`,
  ERROR_CREATING_METRIC_RECORDS: 'Error creating metric records',
};

export const METRIC_SERVICE_LOG_MESSAGES = {
  CREATING_METRIC_RECORDS: (index: number, total: number) =>
    `Creating metric records ${index} of ${total}`,
  METRIC_RECORDS_CREATED_SUCCESSFULLY: (index: number, total: number, value: string) =>
    `Metric records created ${index} of ${total} successfully ${value}`,
  METRIC_RECORDS_CREATED: (index: number, total: number) =>
    `Metric records created ${index} of ${total}`,
  METRIC_RECORDS_CREATED_COUNT: (count: number) =>
    `Metric records created ${count} successfully`,
  ERROR_CREATING_METRIC_RECORDS_BATCH: (index: number, total: number) =>
    `Error creating metric records ${index} of ${total}`,
};
