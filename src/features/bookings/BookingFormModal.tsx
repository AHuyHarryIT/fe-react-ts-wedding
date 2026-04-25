import { DeleteOutlined } from '@ant-design/icons';
import { useGenericSelect } from '@hooks/useGenericSelect';
import type {
  Booking,
  BookingFormData,
  BookingSelectedItem,
  BookingStaffAssignmentInput,
  BookingStaffConflictDetails,
  RequiredServiceAssignment,
  StaffAssignmentRow,
  User,
} from '@types';
import { formatMoneyVND } from '@utils/money';
import {
  Alert,
  AutoComplete,
  Button,
  Card,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Tag,
  type FormInstance,
} from 'antd';
import {
  ASSIGNMENT_DATETIME_FORMAT,
  parseAssignmentDateTime,
} from '@utils/assignmentDateTime';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

const { TextArea } = Input;

type BookingAssignmentConflictUiState = {
  hasConflict: boolean;
  message: string;
  details: BookingStaffConflictDetails;
  requiresOverride: boolean;
  requiredPermission: string | null;
  allowConflictOverride: boolean;
  canToggleOverride: boolean;
  overrideReason: string;
  overrideReasonLength: number;
  canRetryWithOverride: boolean;
  retryBlockedReason: string | null;
  isRetryPending: boolean;
  hasPendingAssignment: boolean;
  onToggleOverride: (enabled: boolean) => void;
  onReasonChange: (value: string) => void;
  onRetryWithOverride: () => Promise<void>;
  onClear: () => void;
};

interface BookingFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedBooking: Booking | null;
  form: FormInstance<BookingFormData>;
  selectedItems: BookingSelectedItem[];
  assignmentConflictState?: BookingAssignmentConflictUiState | null;
  onCancel: () => void;
  onSubmit: (
    values: BookingFormData,
    staffAssignments?: BookingStaffAssignmentInput[]
  ) => void;
  onItemAdd: (item: BookingSelectedItem) => void;
  onItemRemove: (itemId: string, type: 'package' | 'service') => void;
  onItemQuantityChange: (
    itemId: string,
    type: 'package' | 'service',
    quantity: number
  ) => void;
  calculateTotalPrice: () => number;
}

type CustomerExtra = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

type ServiceExtra = {
  id: string;
  name: string;
  price: number;
  isLocation?: boolean;
  isTime?: boolean;
  jobId?: string | null;
  job?: {
    id: string;
    name: string;
  } | null;
};

type PackageExtra = {
  id: string;
  name: string;
  price: number;
  services?: Array<{
    serviceId: string;
    service?: {
      id: string;
      name: string;
      isLocation?: boolean;
      isTime?: boolean;
      jobId?: string | null;
      job?: {
        id: string;
        name: string;
      } | null;
    };
  }>;
};

const getRequiredServiceAssignments = (
  selectedItems: BookingSelectedItem[],
  booking: Booking | null,
  availablePackages: PackageExtra[],
  availableServices: ServiceExtra[]
): RequiredServiceAssignment[] => {
  if (selectedItems.length === 0) {
    return [];
  }

  const assignments: RequiredServiceAssignment[] = [];
  const serviceMap = new Map<string, ServiceExtra>();

  // First priority: use booking's actual service data (has job info from backend)
  for (const item of booking?.services ?? []) {
    if (item.service) {
      serviceMap.set(item.service.id, item.service as ServiceExtra);
    }
  }

  // Second priority: use paginated availableServices as fallback
  for (const svc of availableServices) {
    if (!serviceMap.has(svc.id)) {
      serviceMap.set(svc.id, svc);
    }
  }

  for (const pkg of availablePackages) {
    for (const pkgSvc of pkg.services ?? []) {
      if (!pkgSvc.service || serviceMap.has(pkgSvc.service.id)) {
        continue;
      }

      serviceMap.set(pkgSvc.service.id, {
        id: pkgSvc.service.id,
        name: pkgSvc.service.name,
        price: 0,
        isLocation: pkgSvc.service.isLocation,
        isTime: pkgSvc.service.isTime,
        jobId: pkgSvc.service.jobId,
        job: pkgSvc.service.job,
      });
    }
  }

  for (const item of selectedItems) {
    if (item.type === 'service') {
      const service = serviceMap.get(item.id);
      const jobId = service?.jobId;
      const jobName = service?.job?.name;

      if (!jobId || !jobName) {
        continue;
      }

      const serviceLabel = service?.name || item.name || 'Service';
      assignments.push({
        sourceKey: `service:${service?.id || item.id}`,
        serviceLabel,
        requiredJobId: jobId,
        requiredJobName: jobName,
        requiresLocation: Boolean(service?.isLocation),
        requiresTime: Boolean(service?.isTime),
      });
    }
  }

  return assignments;
};

const formatStaffLabel = (staff?: User | null) =>
  [
    `${staff?.lastName || ''} ${staff?.firstName || ''}`.trim(),
    staff?.phoneNumber ? `(${staff.phoneNumber})` : '',
    staff?.id ? `[${staff.id}]` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

export function BookingFormModal({
  type,
  open,
  loading,
  selectedBooking,
  form,
  selectedItems,
  assignmentConflictState,
  onCancel,
  onSubmit,
  onItemAdd,
  onItemRemove,
  onItemQuantityChange,
  calculateTotalPrice,
}: BookingFormModalProps) {
  const isEditMode = type === 'edit' && selectedBooking;
  const title = isEditMode ? 'Edit Booking' : 'Create New Booking';
  const totalPrice = calculateTotalPrice();
  const [assignedStaffRows, setAssignedStaffRows] = useState<
    StaffAssignmentRow[]
  >([]);
  const [includeInactiveCatalog, setIncludeInactiveCatalog] = useState(false);

  const includeInactiveSelection = isEditMode && includeInactiveCatalog;

  const customerOptions = useGenericSelect<CustomerExtra>({
    entity: 'customers',
  });

  const serviceOptions = useGenericSelect<ServiceExtra>({
    entity: 'services',
    extraParams: includeInactiveSelection
      ? { includeInactive: true }
      : undefined,
  });

  const packageOptions = useGenericSelect<PackageExtra>({
    entity: 'packages',
    extraParams: includeInactiveSelection
      ? { includeInactive: true }
      : undefined,
  });
  const staffOptions = useGenericSelect<User>({
    entity: 'users',
  });
  const jobOptions = useGenericSelect<{
    id: string;
    name: string;
    description?: string;
  }>({
    entity: 'jobs',
  });

  const requiredServiceAssignments = useMemo(
    () =>
      getRequiredServiceAssignments(
        selectedItems,
        selectedBooking,
        packageOptions.options,
        serviceOptions.options
      ),
    [
      selectedBooking,
      selectedItems,
      packageOptions.options,
      serviceOptions.options,
    ]
  );

  useEffect(() => {
    if (!open) {
      setAssignedStaffRows([]);
      setIncludeInactiveCatalog(false);
      return;
    }

    if (!isEditMode) {
      setIncludeInactiveCatalog(false);
    }

    setAssignedStaffRows((prevRows) => {
      const previousBySource = new Map(
        prevRows
          .filter((row) => row.sourceKey)
          .map((row) => [row.sourceKey as string, row])
      );

      const savedAssignments: Array<{
        sourceKey?: string;
        staffId: string;
        serviceLabel?: string;
        job: string;
        locationName?: string;
        startTime?: string;
        endTime?: string;
      }> =
        type === 'edit' && selectedBooking
          ? [
              ...(selectedBooking.assignedStaffs ?? []).map((assignment) => ({
                sourceKey: assignment.sourceKey,
                staffId: assignment.staffId,
                serviceLabel: assignment.serviceLabel,
                job: assignment.job || '',
                locationName: assignment.locationName || '',
                startTime: assignment.startTime || '',
                endTime: assignment.endTime || '',
              })),
              ...(selectedBooking.staffs?.map((assignment) => ({
                staffId: assignment.staffId,
                job: assignment.job || '',
                locationName: assignment.locationName || '',
                startTime: assignment.startTime || '',
                endTime: assignment.endTime || '',
              })) ?? []),
            ]
          : [];

      const remainingAssignments = [...savedAssignments];

      return requiredServiceAssignments.map((requiredAssignment) => {
        const previousRow = previousBySource.get(requiredAssignment.sourceKey);
        const matchedIndex = remainingAssignments.findIndex(
          (assignment) => assignment.sourceKey === requiredAssignment.sourceKey
        );
        const matchedAssignment =
          matchedIndex >= 0
            ? remainingAssignments.splice(matchedIndex, 1)[0]
            : null;

        return {
          staffId: previousRow?.staffId || matchedAssignment?.staffId || '',
          job: requiredAssignment.requiredJobName,
          requiredJobId: requiredAssignment.requiredJobId,
          requiredJobName: requiredAssignment.requiredJobName,
          serviceLabel: requiredAssignment.serviceLabel,
          sourceKey: requiredAssignment.sourceKey,
          isRequired: true,
          requiresLocation: requiredAssignment.requiresLocation,
          requiresTime: requiredAssignment.requiresTime,
          locationName:
            previousRow?.locationName || matchedAssignment?.locationName || '',
          startTime:
            previousRow?.startTime || matchedAssignment?.startTime || '',
          endTime: previousRow?.endTime || matchedAssignment?.endTime || '',
        };
      });
    });
  }, [open, requiredServiceAssignments, selectedBooking, type]);

  const assignedStaffOptions = useMemo(
    () =>
      staffOptions.options.map((staff) => ({
        value: staff.id,
        label: formatStaffLabel(staff),
        jobIds:
          staff.staffJobs?.map((staffJob) => staffJob.jobId).filter(Boolean) ??
          [],
      })),
    [staffOptions.options]
  );

  const assignedJobOptions = useMemo(
    () =>
      jobOptions.options
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((job) => ({
          value: job.name,
          label: job.name,
        })),
    [jobOptions.options]
  );

  const updateAssignmentRow = (
    index: number,
    patch: Partial<StaffAssignmentRow>
  ) => {
    setAssignedStaffRows((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    );
  };

  const getAssignedStaffOptionsForRow = (row: StaffAssignmentRow) => {
    if (!row.requiredJobId) {
      return assignedStaffOptions;
    }

    return assignedStaffOptions.filter((staff) =>
      staff.jobIds.includes(row.requiredJobId as string)
    );
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
          disabled={
            selectedItems.length === 0 ||
            Boolean(assignmentConflictState?.hasConflict)
          }
        >
          {isEditMode ? 'Update' : 'Create'}
        </Button>,
      ]}
      width={900}
    >
      <Form<BookingFormData>
        form={form}
        layout="vertical"
        onFinish={(values) => {
          const normalizedAssignments = assignedStaffRows
            .filter((row) => row.staffId)
            .map((row) => ({
              sourceKey: row.sourceKey,
              staffId: row.staffId,
              serviceLabel: row.serviceLabel,
              job: row.job || undefined,
              locationName: row.locationName?.trim() || undefined,
              startTime: row.startTime || undefined,
              endTime: row.endTime || undefined,
            }));

          onSubmit(
            values,
            normalizedAssignments.length > 0 ? normalizedAssignments : undefined
          );
        }}
        initialValues={{
          status: 'PENDING',
        }}
      >
        <Form.Item
          name="customerId"
          label="Customer"
          rules={[
            {
              required: true,
              type: 'string',
              message: 'Please select a customer',
            },
          ]}
        >
          <Select
            placeholder="Select a customer"
            showSearch={{
              filterOption: false,
              onSearch: customerOptions.onSearch,
            }}
            loading={customerOptions.loading}
            options={customerOptions.options.map((customer) => ({
              label: `${customer.lastName} ${customer.firstName} (${customer.phoneNumber})`,
              value: customer.id,
            }))}
            onPopupScroll={(e) => {
              const target = e.target as HTMLDivElement;
              if (
                target.scrollTop + target.offsetHeight >=
                target.scrollHeight - 8
              ) {
                customerOptions.loadMore();
              }
            }}
          />
        </Form.Item>

        <Form.Item
          name="eventDate"
          label="Event Date"
          rules={[
            {
              required: true,
              message: 'Please select event date',
            },
          ]}
          getValueProps={(value: string | null) => ({
            value: value ? dayjs(value) : undefined,
          })}
          normalize={(value: dayjs.Dayjs | null) => value?.toISOString()}
          initialValue={dayjs()}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD HH:mm"
            showTime
            disabledDate={(current) => {
              return current && current < dayjs().startOf('day');
            }}
          />
        </Form.Item>

        {isEditMode && (
          <Form.Item
            label="Legacy correction"
            style={{ marginBottom: 12 }}
            extra="Enable this only when you need to re-link deactivated services or packages for historical booking corrections."
          >
            <Switch
              checked={includeInactiveCatalog}
              onChange={setIncludeInactiveCatalog}
              checkedChildren="Include inactive"
              unCheckedChildren="Active only"
            />
          </Form.Item>
        )}

        <Form.Item
          label="Select Packages (optional)"
          style={{ marginBottom: 12 }}
        >
          <Select
            placeholder="Click to add packages..."
            allowClear
            showSearch={{
              filterOption: false,
              onSearch: packageOptions.onSearch,
            }}
            loading={packageOptions.loading}
            options={packageOptions.options.map((pkg) => ({
              label: `${pkg.name} - ${formatMoneyVND(pkg.price)}`,
              value: pkg.id,
            }))}
            onPopupScroll={(e) => {
              const target = e.target as HTMLDivElement;
              if (
                target.scrollTop + target.offsetHeight >=
                target.scrollHeight - 8
              ) {
                packageOptions.loadMore();
              }
            }}
            onChange={(pkgId: string) => {
              if (!pkgId) return;

              const existingItem = selectedItems.find(
                (item) => item.id === pkgId && item.type === 'package'
              );

              if (existingItem) {
                onItemQuantityChange(
                  pkgId,
                  'package',
                  existingItem.quantity + 1
                );
              } else {
                const pkg = packageOptions.options.find((p) => p.id === pkgId);
                if (pkg) {
                  onItemAdd({
                    id: pkg.id,
                    type: 'package',
                    name: pkg.name,
                    price: pkg.price,
                    quantity: 1,
                  });
                }
              }
            }}
          />
        </Form.Item>

        <Form.Item
          label="Select Services (at least 1 package or service)"
          required
          rules={[
            {
              validator: async () => {
                if (selectedItems.length > 0) {
                  return;
                }

                throw new Error('Please select at least 1 package or service');
              },
            },
          ]}
          style={{ marginBottom: 0 }}
        >
          <Select
            placeholder="Click to add services..."
            allowClear
            showSearch={{
              filterOption: false,
              onSearch: serviceOptions.onSearch,
            }}
            loading={serviceOptions.loading}
            options={serviceOptions.options.map((svc) => ({
              label: `${svc.name} - ${formatMoneyVND(svc.price)}${svc.job?.name ? ` [${svc.job.name}]` : ''}`,
              value: svc.id,
            }))}
            onPopupScroll={(e) => {
              const target = e.target as HTMLDivElement;
              if (
                target.scrollTop + target.offsetHeight >=
                target.scrollHeight - 8
              ) {
                serviceOptions.loadMore();
              }
            }}
            onChange={(svcId: string) => {
              if (!svcId) return;

              const existingItem = selectedItems.find(
                (item) => item.id === svcId && item.type === 'service'
              );

              if (existingItem) {
                onItemQuantityChange(
                  svcId,
                  'service',
                  existingItem.quantity + 1
                );
              } else {
                const svc = serviceOptions.options.find((s) => s.id === svcId);
                if (svc) {
                  onItemAdd({
                    id: svc.id,
                    type: 'service',
                    name: svc.name,
                    price: svc.price,
                    quantity: 1,
                  });
                }
              }
            }}
          />
        </Form.Item>

        {/* Selected Services with staff assignment */}
        {selectedItems.length > 0 && (
          <div>
            <Divider style={{ margin: '8px 0 16px' }} />
            <div className="flex flex-col gap-4">
              {selectedItems.map((item) => {
                if (item.type === 'package') {
                  return (
                    <div
                      key={`package-${item.id}`}
                      className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-800 dark:bg-blue-950/20"
                    >
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Tag color="blue">Package</Tag>
                          <div>
                            <div className="font-medium text-blue-700 dark:text-blue-300">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{formatMoneyVND(item.price)}</span>
                              {item.quantity > 1 && (
                                <>
                                  <span>×</span>
                                  <InputNumber
                                    min={1}
                                    size="small"
                                    value={item.quantity}
                                    onChange={(value) =>
                                      onItemQuantityChange(
                                        item.id,
                                        'package',
                                        value || 1
                                      )
                                    }
                                    style={{ width: 60 }}
                                  />
                                </>
                              )}
                              <span className="font-semibold text-gray-700 dark:text-gray-300">
                                = {formatMoneyVND(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => onItemRemove(item.id, 'package')}
                        />
                      </div>
                    </div>
                  );
                }

                const rowIndex = assignedStaffRows.findIndex(
                  (r) =>
                    r.sourceKey === `service:${item.id}` ||
                    (r.serviceLabel === item.name && r.isRequired)
                );
                const assignmentRow =
                  rowIndex >= 0 ? assignedStaffRows[rowIndex] : null;

                return (
                  <div
                    key={`service-${item.id}`}
                    className="rounded-xl border border-green-200 bg-green-50/40 p-4 dark:border-green-800 dark:bg-green-950/20"
                  >
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Tag color="green">Service</Tag>
                        <div>
                          <div className="font-medium text-green-700 dark:text-green-300">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{formatMoneyVND(item.price)}</span>
                            {item.quantity > 1 && (
                              <>
                                <span>×</span>
                                <InputNumber
                                  min={1}
                                  size="small"
                                  value={item.quantity}
                                  onChange={(value) =>
                                    onItemQuantityChange(
                                      item.id,
                                      'service',
                                      value || 1
                                    )
                                  }
                                  style={{ width: 60 }}
                                />
                              </>
                            )}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              = {formatMoneyVND(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => onItemRemove(item.id, 'service')}
                      />
                    </div>

                    {assignmentRow && (
                      <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                        <div className="mb-2 flex items-center gap-2 text-xs">
                          <Tag color="blue">{assignmentRow.serviceLabel}</Tag>
                          <Tag color="purple">
                            Job: {assignmentRow.requiredJobName}
                          </Tag>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <Select
                            allowClear
                            placeholder="Select staff member"
                            showSearch={{
                              filterOption: false,
                              onSearch: staffOptions.onSearch,
                              optionFilterProp: 'label',
                            }}
                            value={assignmentRow.staffId || undefined}
                            onChange={(value) =>
                              updateAssignmentRow(rowIndex, { staffId: value })
                            }
                            loading={staffOptions.loading}
                            options={getAssignedStaffOptionsForRow(
                              assignmentRow
                            )}
                            onPopupScroll={(e) => {
                              const target = e.target as HTMLDivElement;
                              if (
                                target.scrollTop + target.offsetHeight >=
                                target.scrollHeight - 8
                              ) {
                                staffOptions.loadMore();
                              }
                            }}
                          />
                          <AutoComplete
                            value={assignmentRow.job}
                            onChange={(value) =>
                              updateAssignmentRow(rowIndex, { job: value })
                            }
                            options={assignedJobOptions}
                            showSearch={{
                              onSearch: jobOptions.onSearch,
                              filterOption: (inputValue, option) =>
                                String(option?.value ?? '')
                                  .toLowerCase()
                                  .includes(inputValue.toLowerCase()),
                            }}
                            onPopupScroll={(e) => {
                              const target = e.target as HTMLDivElement;
                              if (
                                target.scrollTop + target.offsetHeight >=
                                target.scrollHeight - 8
                              ) {
                                jobOptions.loadMore();
                              }
                            }}
                            notFoundContent={
                              jobOptions.options.length > 0
                                ? 'No matching jobs'
                                : 'No managed jobs yet'
                            }
                            placeholder="Select or type a job"
                            disabled={Boolean(assignmentRow.isRequired)}
                            className="w-full"
                          />
                          {assignmentRow.requiresLocation && (
                            <Input
                              value={assignmentRow.locationName}
                              onChange={(event) =>
                                updateAssignmentRow(rowIndex, {
                                  locationName: event.target.value,
                                })
                              }
                              placeholder="Location"
                            />
                          )}
                          {assignmentRow.requiresTime && (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <DatePicker
                                value={parseAssignmentDateTime(
                                  assignmentRow.startTime
                                )}
                                onChange={(value) =>
                                  updateAssignmentRow(rowIndex, {
                                    startTime: value ? value.toISOString() : '',
                                  })
                                }
                                format={ASSIGNMENT_DATETIME_FORMAT}
                                showTime={{ format: 'HH:mm', minuteStep: 5 }}
                                inputReadOnly
                                className="w-full"
                                placeholder="Start time"
                              />
                              <DatePicker
                                value={parseAssignmentDateTime(
                                  assignmentRow.endTime
                                )}
                                onChange={(value) =>
                                  updateAssignmentRow(rowIndex, {
                                    endTime: value ? value.toISOString() : '',
                                  })
                                }
                                format={ASSIGNMENT_DATETIME_FORMAT}
                                showTime={{ format: 'HH:mm', minuteStep: 5 }}
                                inputReadOnly
                                className="w-full"
                                placeholder="End time"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total price */}
            <Card
              style={{
                backgroundColor: '#f0f5ff',
                marginTop: 16,
                marginBottom: 16,
                borderColor: '#1890ff',
                borderWidth: 2,
              }}
            >
              <div className="font-bold text-lg">
                Total Price: {formatMoneyVND(totalPrice)}
              </div>
            </Card>
          </div>
        )}

        {assignmentConflictState?.hasConflict && (
          <Alert
            type="warning"
            showIcon
            title="Staff assignment conflict detected"
            description={
              <div className="mt-2 space-y-3">
                <p className="mb-0">{assignmentConflictState.message}</p>
                {assignmentConflictState.requiredPermission && (
                  <p className="mb-0 text-sm">
                    Required permission:{' '}
                    {assignmentConflictState.requiredPermission}
                  </p>
                )}

                <div className="space-y-2">
                  {assignmentConflictState.details.conflicts.map((conflict) => (
                    <div
                      key={`${conflict.sourceKey}-${conflict.staffId}`}
                      className="rounded border border-amber-300 bg-amber-50 p-2 text-sm"
                    >
                      <div className="font-medium">
                        Staff {conflict.staffId} has overlapping assignment
                      </div>
                      <ul className="mb-0 mt-1 list-disc pl-5">
                        {conflict.conflicts.map((detail) => (
                          <li
                            key={`${detail.source}-${detail.sourceId}-${detail.overlapStart}-${detail.overlapEnd}`}
                          >
                            {detail.source.toUpperCase()}{' '}
                            {detail.sourceTitle || detail.sourceId}:{' '}
                            {dayjs(detail.overlapStart).format(
                              'YYYY-MM-DD HH:mm'
                            )}{' '}
                            -{' '}
                            {dayjs(detail.overlapEnd).format(
                              'YYYY-MM-DD HH:mm'
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="rounded border border-amber-300 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-medium">Override conflict</span>
                    <Switch
                      checked={assignmentConflictState.allowConflictOverride}
                      onChange={assignmentConflictState.onToggleOverride}
                      disabled={!assignmentConflictState.canToggleOverride}
                    />
                  </div>

                  {!assignmentConflictState.canToggleOverride &&
                    assignmentConflictState.retryBlockedReason && (
                      <p className="mb-2 text-sm text-amber-700">
                        {assignmentConflictState.retryBlockedReason}
                      </p>
                    )}

                  <Input.TextArea
                    value={assignmentConflictState.overrideReason}
                    onChange={(event) =>
                      assignmentConflictState.onReasonChange(event.target.value)
                    }
                    placeholder="Enter override reason (required)"
                    rows={3}
                    disabled={!assignmentConflictState.allowConflictOverride}
                  />

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-500">
                      Reason length:{' '}
                      {assignmentConflictState.overrideReasonLength}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button onClick={assignmentConflictState.onClear}>
                        Continue editing
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          assignmentConflictState.onRetryWithOverride();
                        }}
                        loading={assignmentConflictState.isRetryPending}
                        disabled={
                          !assignmentConflictState.canRetryWithOverride ||
                          Boolean(assignmentConflictState.retryBlockedReason)
                        }
                      >
                        Retry with override
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        )}

        <Form.Item
          name="notes"
          label="Notes"
          rules={[{ type: 'string', message: 'Notes must be text' }]}
        >
          <TextArea
            rows={4}
            placeholder="Add any additional notes about this booking"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
