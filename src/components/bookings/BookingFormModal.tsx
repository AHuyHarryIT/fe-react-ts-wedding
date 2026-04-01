import { DeleteOutlined } from '@ant-design/icons';
import { useGenericSelect } from '@hooks/useGenericSelect';
import type {
  Booking,
  BookingStaffAssignmentInput,
  BookingStatus,
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
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

const { TextArea } = Input;

interface BookingFormData {
  customerId: string;
  packageIds?: string[];
  serviceIds?: string[];
  notes?: string;
  eventDate: string;
  totalPrice?: number;
  status?: BookingStatus;
}

type StaffAssignmentRow = {
  staffId: string;
  job: string;
  requiredJobId?: string;
  requiredJobName?: string;
  serviceLabel?: string;
  sourceKey?: string;
  isRequired?: boolean;
};

type RequiredServiceAssignment = {
  sourceKey: string;
  serviceLabel: string;
  requiredJobId: string;
  requiredJobName: string;
};

interface SelectedItem {
  id: string;
  type: 'package' | 'service';
  name: string;
  price: number;
  quantity: number;
}

interface BookingFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedBooking: Booking | null;
  form: FormInstance<BookingFormData>;
  selectedItems: SelectedItem[];
  onCancel: () => void;
  onSubmit: (
    values: BookingFormData,
    staffAssignments?: BookingStaffAssignmentInput[]
  ) => void;
  onItemAdd: (item: SelectedItem) => void;
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
      jobId?: string | null;
      job?: {
        id: string;
        name: string;
      } | null;
    };
  }>;
};

const getRequiredServiceAssignments = (
  selectedItems: SelectedItem[],
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

      assignments.push({
        sourceKey: `service:${service?.id || item.id}`,
        serviceLabel: service?.name || item.name || 'Service',
        requiredJobId: jobId,
        requiredJobName: jobName,
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

      assignments.push({
        sourceKey: `package:${pkg?.id || item.id}:service:${pkgService.serviceId}`,
        serviceLabel: `${pkg?.name || item.name || 'Package'} / ${pkgService.service?.name || 'Service'}`,
        requiredJobId: jobId,
        requiredJobName: jobName,
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
    extraParams: {
      bookingId: selectedBooking?.id,
    },
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

      const savedAssignments =
        type === 'edit' && selectedBooking
          ? [
              ...(selectedBooking.assignedStaffs ?? []).map((assignment) => ({
                staffId: assignment.staffId,
                job: assignment.job || '',
              })),
              ...(selectedBooking.staffs?.map((assignment) => ({
                staffId: assignment.staffId,
                job: assignment.job || '',
              })) ?? []),
            ]
          : [];

      const remainingAssignments = [...savedAssignments];

      return requiredServiceAssignments.map((requiredAssignment) => {
        const previousRow = previousBySource.get(requiredAssignment.sourceKey);
        const matchedIndex = remainingAssignments.findIndex(
          (assignment) =>
            assignment.job === requiredAssignment.requiredJobName &&
            (!previousRow?.staffId ||
              assignment.staffId === previousRow.staffId)
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
        };
      });
    });
  }, [open, requiredServiceAssignments, selectedBooking, type]);

  const assignedStaffOptions = useMemo(
    () =>
      staffOptions.options.map((staff) => ({
        value: staff.id,
        label: formatStaffLabel(staff),
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

  const filteredStaffOptionsByRow = useMemo(
    () =>
      assignedStaffRows.map((row) => {
        if (!row.requiredJobId) {
          return assignedStaffOptions;
        }

        return assignedStaffOptions.filter((staffOption) => {
          const matchedStaff = staffOptions.options.find(
            (option) => option.id === staffOption.value
          );

          return (matchedStaff?.staffJobs ?? []).some(
            (staffJob) => staffJob.jobId === row.requiredJobId
          );
        });
      }),
    [assignedStaffOptions, assignedStaffRows, staffOptions.options]
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
              staffId: row.staffId,
              job: row.job || undefined,
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
          rules={[{ required: true, message: 'Please select event date' }]}
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

        <Form.Item label="Select Packages or Services (at least 1)" required>
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
                Each row only shows staff who have the matching managed job.
              </div>
              {assignedStaffRows.map((row, index) => (
                <div
                  key={row.sourceKey || `${row.staffId || 'new'}-${index}`}
                  className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto]"
                >
                  {row.isRequired && row.serviceLabel ? (
                    <div className="md:col-span-3">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                        <Tag color="blue">{row.serviceLabel}</Tag>
                        <Tag color="purple">Job: {row.requiredJobName}</Tag>
                      </div>
                    </div>
                  ) : null}
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
                    options={filteredStaffOptionsByRow[index] ?? []}
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
                  <div />
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
