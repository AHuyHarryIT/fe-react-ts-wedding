import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Booking, BookingStatus, Order, User } from '@types';
import {
  Card,
  Col,
  AutoComplete,
  Descriptions,
  Divider,
  Modal,
  Row,
  Statistic,
  Tag,
  Button,
  message,
  Tabs,
  Space,
  Empty,
  Select,
  Spin,
} from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import {
  EditOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { bookingApi } from '@services/BookingService';
import { ordersService } from '@services/OrdersService';
import { CheckoutForm } from '@components/orders/CheckoutForm';
import { OrderDetail } from '@components/orders/OrderDetail';
import { useGenericSelect } from '@hooks/useGenericSelect';
import { formatMoneyVND } from '@utils/money';

type AssignedStaffMember = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
  job?: string;
};

type StaffAssignmentRow = {
  staffId: string;
  job: string;
};

interface BookingDetailWithOrdersProps {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  onBookingUpdated?: (booking: Booking) => void;
  onEditBooking?: (booking: Booking) => Promise<void> | void;
}

const statusColorMap: Record<BookingStatus, string> = {
  PENDING: 'orange',
  DEPOSIT_PAID: 'purple',
  CONFIRMED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
  RESCHEDULED: 'purple',
};

const formatBookingStatus = (status: BookingStatus) =>
  status.replace(/_/g, ' ');

const getBookingStaffAssignments = (booking: Booking | null) => {
  if (!booking) {
    return [];
  }

  const directAssignments = booking.assignedStaffs || [];

  const legacyAssignments =
    booking.staffs?.map((assignment) => assignment.staff).filter(Boolean) || [];

  const sessionAssignments =
    booking.sessions
      ?.flatMap((session) => session.staffs || [])
      .map((assignment) => assignment.staff)
      .filter(Boolean) || [];

  const combinedAssignments = [
    ...directAssignments,
    ...legacyAssignments,
    ...sessionAssignments,
  ];
  const seenIds = new Set<string>();
  const normalizedAssignments: AssignedStaffMember[] = [];

  for (const staff of combinedAssignments) {
    if (!staff?.id || seenIds.has(staff.id)) {
      continue;
    }

    seenIds.add(staff.id);
    const job =
      'job' in staff && typeof staff.job === 'string' ? staff.job : undefined;
    normalizedAssignments.push({
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phoneNumber: staff.phoneNumber,
      isActive: staff.isActive,
      job,
    });
  }

  return normalizedAssignments;
};

const formatStaffLabel = (staff?: AssignedStaffMember | User | null) =>
  [
    `${staff?.lastName || ''} ${staff?.firstName || ''}`.trim(),
    staff?.phoneNumber ? `(${staff.phoneNumber})` : '',
    staff?.id ? `[${staff.id}]` : '',
    staff && 'job' in staff && staff.job ? `- ${staff.job}` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

export const BookingDetailWithOrders: React.FC<
  BookingDetailWithOrdersProps
> = ({ open, booking, onClose, onBookingUpdated, onEditBooking }) => {
  const [resolvedBooking, setResolvedBooking] = useState<Booking | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [loadingBookingDetails, setLoadingBookingDetails] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [assignedStaffRows, setAssignedStaffRows] = useState<
    StaffAssignmentRow[]
  >([]);
  const [savingStaffAssignments, setSavingStaffAssignments] = useState(false);
  const queryClient = useQueryClient();
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
  const currentBooking = resolvedBooking ?? booking;

  // Load order for this booking
  const loadOrder = useCallback(async () => {
    if (!currentBooking?.id) return;
    try {
      setLoadingOrder(true);
      const data = await ordersService.getOrderByBookingId(currentBooking.id);
      setOrder(data);
    } catch {
      // Order may not exist yet
      setOrder(null);
    } finally {
      setLoadingOrder(false);
    }
  }, [currentBooking?.id]);

  const loadBookingDetails = useCallback(async () => {
    if (!booking?.id) return;

    try {
      setLoadingBookingDetails(true);
      const response = await bookingApi.getOne(booking.id);
      setResolvedBooking(response.data);
    } catch {
      setResolvedBooking(booking);
    } finally {
      setLoadingBookingDetails(false);
    }
  }, [booking]);

  useEffect(() => {
    if (open && booking?.id) {
      setResolvedBooking(booking);
      loadOrder();
      loadBookingDetails();
    }
  }, [open, booking, loadOrder, loadBookingDetails]);

  useEffect(() => {
    if (open) {
      setActiveTab('details');
    }
  }, [open, booking?.id]);

  useEffect(() => {
    if (!open || !currentBooking) {
      setAssignedStaffRows([]);
      return;
    }

    const directAssignments = currentBooking.assignedStaffs ?? [];
    const legacyAssignments =
      currentBooking.staffs?.map((assignment) => ({
        staffId: assignment.staffId,
        job: assignment.job || '',
      })) || [];

    const normalized = [...directAssignments, ...legacyAssignments].reduce<
      StaffAssignmentRow[]
    >((rows, assignment) => {
      if (!assignment?.staffId) {
        return rows;
      }

      if (rows.some((row) => row.staffId === assignment.staffId)) {
        return rows.map((row) =>
          row.staffId === assignment.staffId
            ? { ...row, job: row.job || assignment.job || '' }
            : row
        );
      }

      rows.push({
        staffId: assignment.staffId,
        job: assignment.job || '',
      });
      return rows;
    }, []);

    setAssignedStaffRows(normalized);
  }, [open, currentBooking]);

  const assignedStaff = useMemo(
    () => getBookingStaffAssignments(currentBooking),
    [currentBooking]
  );

  const assignmentRows = useMemo(
    () =>
      assignedStaffRows.length > 0
        ? assignedStaffRows
        : assignedStaff.map((staff) => ({
            staffId: staff.id,
            job: staff.job || '',
          })),
    [assignedStaff, assignedStaffRows]
  );

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

  const hasStaffAssignmentChanges = useMemo(() => {
    const currentAssignments = assignedStaff
      .map((staff) => ({
        staffId: staff.id,
        job: staff.job || '',
      }))
      .sort((a, b) => a.staffId.localeCompare(b.staffId));
    const selectedAssignments = [...assignmentRows].sort((a, b) =>
      a.staffId.localeCompare(b.staffId)
    );

    return (
      currentAssignments.length !== selectedAssignments.length ||
      currentAssignments.some(
        (assignment, index) =>
          assignment.staffId !== selectedAssignments[index]?.staffId ||
          assignment.job !== selectedAssignments[index]?.job
      )
    );
  }, [assignedStaff, assignmentRows]);

  const handleSaveStaffAssignments = async () => {
    if (!currentBooking) {
      return;
    }

    try {
      setSavingStaffAssignments(true);
      const response = await bookingApi.assignStaff(
        currentBooking.id,
        assignmentRows
      );
      message.success('Assigned staff updated successfully');
      setResolvedBooking(response.data);
      onBookingUpdated?.(response.data);
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update assigned staff';
      message.error(errorMessage);
    } finally {
      setSavingStaffAssignments(false);
    }
  };

  const handleCheckoutSuccess = async (updatedOrder: Order | null) => {
    // Immediately update with the returned order data
    if (updatedOrder) {
      setOrder(updatedOrder);
    }
    setCheckoutModalOpen(false);
    // Also reload to ensure we have the latest data
    await loadOrder();
    // Refresh booking to reflect order association
    await queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  const canEditBooking =
    currentBooking?.status !== 'COMPLETED' &&
    currentBooking?.status !== 'CANCELLED';
  const canDeleteBooking = currentBooking?.status === 'PENDING';
  const canCancelBooking =
    currentBooking?.status !== 'COMPLETED' &&
    currentBooking?.status !== 'CANCELLED';
  const canAssignStaff = canEditBooking;
  const canMarkCompleted =
    currentBooking?.status === 'CONFIRMED' && order?.status === 'PAID';

  const handleEdit = async () => {
    if (!currentBooking) {
      return;
    }

    if (!canEditBooking) {
      message.error('This booking cannot be edited');
      return;
    }

    onClose();
    await onEditBooking?.(currentBooking);
  };

  const handleDelete = async () => {
    if (!canDeleteBooking) {
      message.error('Cannot delete completed booking');
      return;
    }
    Modal.confirm({
      title: 'Delete Booking',
      content: 'Are you sure you want to delete this booking?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await bookingApi.delete(currentBooking!.id);
          message.success('Booking deleted successfully');
          onClose();
          await queryClient.invalidateQueries({ queryKey: ['bookings'] });
        } catch {
          message.error('Failed to delete booking');
        }
      },
    });
  };

  const handleCancelBooking = async () => {
    if (!currentBooking) {
      return;
    }

    if (!canCancelBooking) {
      message.error('This booking cannot be cancelled');
      return;
    }

    Modal.confirm({
      title: 'Cancel Booking',
      content:
        'This will mark the booking as cancelled and hide payment actions for the customer. Continue?',
      okText: 'Cancel Booking',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await bookingApi.cancel(currentBooking.id);
          message.success('Booking cancelled successfully');
          setResolvedBooking(response.data);
          onBookingUpdated?.(response.data);
          await queryClient.invalidateQueries({ queryKey: ['bookings'] });
        } catch (error) {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Failed to cancel booking';
          message.error(errorMessage);
        }
      },
    });
  };

  const handleMarkCompleted = async () => {
    if (!currentBooking) {
      return;
    }

    if (!canMarkCompleted) {
      message.error(
        'Only confirmed bookings with a fully paid order can be marked completed'
      );
      return;
    }

    Modal.confirm({
      title: 'Mark Booking Completed',
      content:
        'This will lock the booking from further edits. Continue to mark it as completed?',
      okText: 'Mark Completed',
      onOk: async () => {
        try {
          const response = await bookingApi.update(currentBooking.id, {
            status: 'COMPLETED',
          });
          message.success('Booking marked as completed');
          setResolvedBooking(response.data);
          onBookingUpdated?.(response.data);
          await queryClient.invalidateQueries({ queryKey: ['bookings'] });
        } catch (error) {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Failed to mark booking as completed';
          message.error(errorMessage);
        }
      },
    });
  };

  if (!currentBooking) {
    return null;
  }

  return (
    <>
      <Modal
        title="Booking Details"
        open={open}
        onCancel={onClose}
        footer={null}
        width={1000}
      >
        {/* Header Stats */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Total Price"
              value={formatMoneyVND(currentBooking.totalPrice)}
              styles={{ content: { color: '#1890ff', fontSize: '18px' } }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Items"
              value={
                (currentBooking.packages?.length || 0) +
                (currentBooking.services?.length || 0)
              }
              suffix="items"
            />
          </Col>
          <Col xs={24} sm={8}>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <Statistic
                title="Status"
                value={formatBookingStatus(
                  currentBooking.status as BookingStatus
                )}
                styles={{ content: { fontSize: '14px' } }}
                suffix={
                  <Tag
                    color={
                      statusColorMap[currentBooking.status as BookingStatus]
                    }
                  >
                    {formatBookingStatus(
                      currentBooking.status as BookingStatus
                    )}
                  </Tag>
                }
              />
            </div>
          </Col>
        </Row>

        <Divider />

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'details',
              label: 'Booking Details',
              children: (
                <div>
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Booking ID" span={2}>
                      <code style={{ fontSize: '12px' }}>
                        {currentBooking.id}
                      </code>
                    </Descriptions.Item>

                    <Descriptions.Item label="Customer Name" span={1}>
                      {currentBooking.customer
                        ? `${currentBooking.customer.lastName || ''} ${currentBooking.customer.firstName || ''}`
                        : '-'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Customer Email" span={1}>
                      {currentBooking.customer?.email || '-'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Phone Number" span={1}>
                      {currentBooking.customer?.phoneNumber || '-'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Assigned Staff" span={2}>
                      {assignedStaff.length > 0 ? (
                        <Space wrap>
                          {assignedStaff.map((staff) => (
                            <Tag key={staff.id} color="blue">
                              {formatStaffLabel(staff)}
                            </Tag>
                          ))}
                        </Space>
                      ) : (
                        <span style={{ color: '#8c8c8c' }}>
                          No staff assigned yet
                        </span>
                      )}
                    </Descriptions.Item>

                    <Descriptions.Item label="Event Date" span={1}>
                      <strong>
                        {new Date(currentBooking.eventDate).toLocaleDateString(
                          'vi-VN'
                        )}
                      </strong>
                      <br />
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(currentBooking.eventDate).toLocaleTimeString(
                          'vi-VN'
                        )}
                      </span>
                    </Descriptions.Item>

                    {currentBooking.notes && (
                      <Descriptions.Item label="Notes" span={2}>
                        <div
                          style={{
                            padding: '8px',
                            backgroundColor: '#fafafa',
                            borderRadius: '4px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {currentBooking.notes}
                        </div>
                      </Descriptions.Item>
                    )}

                    <Descriptions.Item label="Created Date" span={1}>
                      <div style={{ fontSize: '12px' }}>
                        {new Date(currentBooking.createdAt).toLocaleDateString(
                          'vi-VN'
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        {new Date(currentBooking.createdAt).toLocaleTimeString(
                          'vi-VN'
                        )}
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item label="Last Updated" span={1}>
                      <div style={{ fontSize: '12px' }}>
                        {new Date(currentBooking.updatedAt).toLocaleDateString(
                          'vi-VN'
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        {new Date(currentBooking.updatedAt).toLocaleTimeString(
                          'vi-VN'
                        )}
                      </div>
                    </Descriptions.Item>
                  </Descriptions>

                  {/* Packages */}
                  {currentBooking.packages &&
                    currentBooking.packages.length > 0 && (
                      <>
                        <Divider>
                          Packages ({currentBooking.packages.length})
                        </Divider>
                        <Card size="small">
                          <div className="flex flex-col gap-3">
                            {currentBooking.packages.map((item) => (
                              <div
                                key={item.packageId}
                                className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <Tag color="blue">📦</Tag>
                                  <div>
                                    <div className="font-medium">
                                      {item.package?.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {item.package?.description}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div
                                    style={{ fontSize: '12px', color: '#666' }}
                                  >
                                    {formatMoneyVND(item.price)} ×{' '}
                                    {item.quantity}
                                  </div>
                                  <div
                                    style={{
                                      fontWeight: 'bold',
                                      fontSize: '14px',
                                      color: '#1890ff',
                                    }}
                                  >
                                    {formatMoneyVND(
                                      (item.price || 0) * (item.quantity || 1)
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </>
                    )}

                  {/* Services */}
                  {currentBooking.services &&
                    currentBooking.services.length > 0 && (
                      <>
                        <Divider>
                          Services ({currentBooking.services.length})
                        </Divider>
                        <Card size="small">
                          <div className="flex flex-col gap-3">
                            {currentBooking.services.map((item) => (
                              <div
                                key={item.serviceId}
                                className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <Tag color="green">🎯</Tag>
                                  <div>
                                    <div className="font-medium">
                                      {item.service?.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {item.service?.description}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div
                                    style={{ fontSize: '12px', color: '#666' }}
                                  >
                                    {formatMoneyVND(item.price)} ×{' '}
                                    {item.quantity}
                                  </div>
                                  <div
                                    style={{
                                      fontWeight: 'bold',
                                      fontSize: '14px',
                                      color: '#52c41a',
                                    }}
                                  >
                                    {formatMoneyVND(
                                      (item.price || 0) * (item.quantity || 1)
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </>
                    )}

                  <Divider>Assign Staff</Divider>
                  <Card size="small">
                    {loadingBookingDetails ? (
                      <div style={{ padding: '24px 0', textAlign: 'center' }}>
                        <Spin tip="Loading booking assignment..." />
                      </div>
                    ) : null}
                    <Space
                      direction="vertical"
                      style={{ width: '100%' }}
                      size="middle"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300">
                          Pick a managed job or type a custom responsibility.
                          Active jobs come from the staff job catalog.
                        </div>
                        {assignmentRows.map((row, index) => (
                          <div
                            key={`${row.staffId || 'new'}-${index}`}
                            className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto]"
                          >
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
                              options={assignedStaffOptions}
                              onSearch={staffOptions.onSearch}
                              optionFilterProp="label"
                              disabled={!canAssignStaff}
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
                              disabled={!canAssignStaff}
                              className="w-full"
                            />
                            <Button
                              danger
                              type="text"
                              icon={<MinusCircleOutlined />}
                              onClick={() =>
                                setAssignedStaffRows((prev) =>
                                  prev.filter(
                                    (_, itemIndex) => itemIndex !== index
                                  )
                                )
                              }
                              disabled={!canAssignStaff}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() =>
                          setAssignedStaffRows((prev) => [
                            ...prev,
                            { staffId: '', job: '' },
                          ])
                        }
                        disabled={!canAssignStaff}
                      >
                        Add staff responsibility
                      </Button>
                      {!canAssignStaff ? (
                        <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                          Staff assignments can only be changed while the
                          booking is editable.
                        </span>
                      ) : null}
                      <Space>
                        <Button
                          onClick={() =>
                            setAssignedStaffRows(
                              assignedStaff.map((staff) => ({
                                staffId: staff.id,
                                job: staff.job || '',
                              }))
                            )
                          }
                          disabled={
                            savingStaffAssignments ||
                            !hasStaffAssignmentChanges ||
                            !canAssignStaff
                          }
                        >
                          Reset
                        </Button>
                        <Button
                          type="primary"
                          loading={savingStaffAssignments}
                          onClick={handleSaveStaffAssignments}
                          disabled={
                            savingStaffAssignments ||
                            !hasStaffAssignmentChanges ||
                            !canAssignStaff
                          }
                        >
                          Save Assignment
                        </Button>
                      </Space>
                    </Space>
                  </Card>

                  {/* Action Buttons */}
                  <Divider />
                  <Space>
                    {canEditBooking && (
                      <Button icon={<EditOutlined />} onClick={handleEdit}>
                        Edit
                      </Button>
                    )}
                    {canCancelBooking && (
                      <Button danger onClick={handleCancelBooking}>
                        Cancel Booking
                      </Button>
                    )}
                    {canDeleteBooking && (
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDelete}
                      >
                        Delete
                      </Button>
                    )}
                    {canMarkCompleted && (
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={handleMarkCompleted}
                      >
                        Mark Completed
                      </Button>
                    )}
                  </Space>
                </div>
              ),
            },
            {
              key: 'order',
              label: (
                <span>
                  <ShoppingCartOutlined />
                  Order & Payment
                </span>
              ),
              children: (
                <div>
                  {loadingOrder ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      Loading order information...
                    </div>
                  ) : order ? (
                    <OrderDetail
                      order={order}
                      onPayRemainingClick={() => setCheckoutModalOpen(true)}
                    />
                  ) : (
                    <Card>
                      <Empty description="No order created yet" />
                      <Divider />
                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={() => setCheckoutModalOpen(true)}
                      >
                        Create Order / Collect Deposit
                      </Button>
                    </Card>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Modal>

      {/* Checkout Modal */}
      <Modal
        title={order ? 'Collect Remaining Payment' : 'Deposit or Full Checkout'}
        open={checkoutModalOpen}
        onCancel={() => setCheckoutModalOpen(false)}
        footer={null}
        width={700}
      >
        {currentBooking && (
          <CheckoutForm
            bookingId={currentBooking.id}
            totalPrice={currentBooking.totalPrice}
            existingOrder={order}
            onCheckoutSuccess={handleCheckoutSuccess}
            onClose={() => setCheckoutModalOpen(false)}
          />
        )}
      </Modal>
    </>
  );
};
