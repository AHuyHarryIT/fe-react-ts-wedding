import { DeleteOutlined } from '@ant-design/icons';
import { useGenericSelect } from '@hooks/useGenericSelect';
import type {
  Booking,
  BookingFormData,
  BookingSelectedItem,
  BookingStaffAssignmentInput,
  RequiredServiceAssignment,
  StaffAssignmentRow,
  User,
} from '@types';
import { formatMoneyVND } from '@utils/money';
import {
  AutoComplete,
  Button,
  Card,
  DatePicker,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
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

interface BookingFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedBooking: Booking | null;
  form: FormInstance<BookingFormData>;
  selectedItems: BookingSelectedItem[];
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
  const packageMap = new Map<string, PackageExtra>();
  const serviceMap = new Map<string, ServiceExtra>();

  for (const pkg of availablePackages) {
    packageMap.set(pkg.id, pkg);
  }

  for (const svc of availableServices) {
    serviceMap.set(svc.id, svc);
  }

  for (const item of booking?.packages ?? []) {
    if (item.package) {
      packageMap.set(item.package.id, item.package as PackageExtra);
    }
  }

  for (const item of booking?.services ?? []) {
    if (item.service) {
      serviceMap.set(item.service.id, item.service as ServiceExtra);
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
      continue;
    }

    const pkg = packageMap.get(item.id);

    for (const pkgService of pkg?.services ?? []) {
      const jobId = pkgService.service?.jobId;
      const jobName = pkgService.service?.job?.name;

      if (!jobId || !jobName) {
        continue;
      }

      const serviceLabel = `${pkg?.name || item.name || 'Package'} / ${pkgService.service?.name || 'Service'}`;
      assignments.push({
        sourceKey: `package:${pkg?.id || item.id}:service:${pkgService.serviceId}`,
        serviceLabel,
        requiredJobId: jobId,
        requiredJobName: jobName,
        requiresLocation: Boolean(pkgService.service?.isLocation),
        requiresTime: Boolean(pkgService.service?.isTime),
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

  const customerOptions = useGenericSelect<CustomerExtra>({
    entity: 'customers',
  });

  const serviceOptions = useGenericSelect<ServiceExtra>({
    entity: 'services',
  });

  const packageOptions = useGenericSelect<PackageExtra>({
    entity: 'packages',
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
      return;
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
          disabled={selectedItems.length === 0}
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
          rules={[{ required: true, message: 'Please select a customer' }]}
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
          getValueProps={(value) => ({
            value: value ? dayjs(value) : undefined,
          })}
          normalize={(value) => value?.toISOString()}
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

        <Form.Item
          label="Select Packages or Services (at least 1)"
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
        >
          <div className="grid grid-cols-[1fr_1fr] gap-4">
            <Form.Item name="packages" label="Packages" noStyle>
              <Select
                placeholder="Select packages"
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
                onChange={(pkgId) => {
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
                    const pkg = packageOptions.options.find(
                      (p) => p.id === pkgId
                    );
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

            <Form.Item name="services" label="Services" noStyle>
              <Select
                placeholder="Select services"
                allowClear
                showSearch={{
                  filterOption: false,
                  onSearch: serviceOptions.onSearch,
                }}
                loading={serviceOptions.loading}
                options={serviceOptions.options.map((svc) => ({
                  label: `${svc.name} - ${formatMoneyVND(svc.price)}`,
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
                onChange={(svcId) => {
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
                    const svc = serviceOptions.options.find(
                      (s) => s.id === svcId
                    );
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
          </div>
        </Form.Item>

        {/* Selected Items Display */}
        <Form.Item label="Selected Items">
          {selectedItems.length === 0 ? (
            <Empty
              description="No items selected"
              style={{ marginTop: 20, marginBottom: 20 }}
            />
          ) : (
            <Card
              size="small"
              style={{ marginBottom: 16 }}
              title={`Selected Items (${selectedItems.length})`}
            >
              <div className="flex flex-col gap-3">
                {selectedItems.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Tag color={item.type === 'package' ? 'blue' : 'green'}>
                        {item.type === 'package' ? '📦' : '🎯'}
                      </Tag>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatMoneyVND(item.price)} × {item.quantity} ={' '}
                          {formatMoneyVND(
                            (item.price || 0) * (item.quantity || 1)
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={(value) =>
                          onItemQuantityChange(item.id, item.type, value || 1)
                        }
                        style={{ width: 60 }}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onItemRemove(item.id, item.type)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Form.Item>

        {selectedItems.length > 0 && (
          <Card
            style={{
              backgroundColor: '#f0f5ff',
              marginBottom: 16,
              borderColor: '#1890ff',
              borderWidth: 2,
            }}
          >
            <div className="font-bold text-lg">
              Total Price: {formatMoneyVND(totalPrice)}
            </div>
          </Card>
        )}

        {assignedStaffRows.length > 0 && (
          <>
            <Divider>Assign Staff</Divider>
            <Space
              direction="vertical"
              style={{ width: '100%', marginBottom: 16 }}
              size="middle"
            >
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300">
                Services with configured jobs are listed automatically below.
                Each service row can use the same staff member or a different
                one.
              </div>
              {assignedStaffRows.map((row, index) => (
                <div
                  key={row.sourceKey || `${row.staffId || 'new'}-${index}`}
                  className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-2"
                >
                  {row.isRequired && row.serviceLabel && (
                    <div className="md:col-span-2">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                        <Tag color="blue">{row.serviceLabel}</Tag>
                        <Tag color="purple">Job: {row.requiredJobName}</Tag>
                      </div>
                    </div>
                  )}
                  <Select
                    allowClear
                    placeholder="Select staff member"
                    showSearch
                    filterOption={false}
                    value={row.staffId || undefined}
                    onChange={(value) =>
                      updateAssignmentRow(index, { staffId: value })
                    }
                    loading={staffOptions.loading}
                    options={getAssignedStaffOptionsForRow(row)}
                    onSearch={staffOptions.onSearch}
                    optionFilterProp="label"
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
                    value={row.job}
                    onChange={(value) =>
                      updateAssignmentRow(index, {
                        job: value,
                      })
                    }
                    options={assignedJobOptions}
                    onSearch={jobOptions.onSearch}
                    onPopupScroll={(e) => {
                      const target = e.target as HTMLDivElement;
                      if (
                        target.scrollTop + target.offsetHeight >=
                        target.scrollHeight - 8
                      ) {
                        jobOptions.loadMore();
                      }
                    }}
                    filterOption={(inputValue, option) =>
                      String(option?.value ?? '')
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    }
                    notFoundContent={
                      jobOptions.options.length > 0
                        ? 'No matching jobs'
                        : 'No managed jobs yet'
                    }
                    placeholder="Select or type a job"
                    disabled={Boolean(row.isRequired)}
                    className="w-full"
                  />
                  {row.requiresLocation && (
                    <Input
                      value={row.locationName}
                      onChange={(event) =>
                        updateAssignmentRow(index, {
                          locationName: event.target.value,
                        })
                      }
                      placeholder="Location"
                    />
                  )}
                  {row.requiresTime && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <DatePicker
                        value={parseAssignmentDateTime(row.startTime)}
                        onChange={(value) =>
                          updateAssignmentRow(index, {
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
                        value={parseAssignmentDateTime(row.endTime)}
                        onChange={(value) =>
                          updateAssignmentRow(index, {
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
              ))}
            </Space>
          </>
        )}

        <Form.Item name="notes" label="Notes">
          <TextArea
            rows={4}
            placeholder="Add any additional notes about this booking"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
