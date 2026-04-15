import React, { useState, useMemo } from 'react';
import type {
  AssignedStaffMember,
  Booking,
  BookingStatus,
  Order,
} from '@types';
import {
  App,
  Card,
  Col,
  Descriptions,
  Divider,
  Modal,
  Row,
  Statistic,
  Tag,
  Button,
  Tabs,
  Space,
  Empty,
  Tooltip,
} from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { bookingApi } from '@services/BookingService';
import { ordersService } from '@services/OrdersService';
import {
  buildForbiddenReason,
  isPermissionDeniedError,
} from '@/auth/permissionPolicy';
import { CheckoutForm } from '@features/orders/CheckoutForm';
import { OrderDetail } from '@features/orders/OrderDetail';
import { formatMoneyVND } from '@utils/money';
import { BookingSessionsPanel } from '@features/bookings/BookingSessionsPanel';
import { formatAssignmentDateTime } from '@utils/assignmentDateTime';
import { printInvoice } from '@utils/printInvoice';

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
  const seenKeys = new Set<string>();
  const normalizedAssignments: AssignedStaffMember[] = [];

  for (const staff of combinedAssignments) {
    if (!staff?.id) {
      continue;
    }

    const sourceKey =
      'sourceKey' in staff && typeof staff.sourceKey === 'string'
        ? staff.sourceKey
        : undefined;
    const serviceLabel =
      'serviceLabel' in staff && typeof staff.serviceLabel === 'string'
        ? staff.serviceLabel
        : undefined;
    const job =
      'job' in staff && typeof staff.job === 'string' ? staff.job : undefined;
    // Use sourceKey for dedup - it's unique per assignment row on backend
    // so same staff on different services each has a distinct sourceKey
    const dedupeKey = sourceKey;
    if (!dedupeKey) {
      continue;
    }

    if (seenKeys.has(dedupeKey)) {
      continue;
    }

    seenKeys.add(dedupeKey);

    normalizedAssignments.push({
      sourceKey,
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phoneNumber: staff.phoneNumber,
      isActive: staff.isActive,
      job,
      serviceLabel,
      locationName:
        'locationName' in staff && typeof staff.locationName === 'string'
          ? staff.locationName
          : undefined,
      startTime:
        'startTime' in staff && typeof staff.startTime === 'string'
          ? staff.startTime
          : undefined,
      endTime:
        'endTime' in staff && typeof staff.endTime === 'string'
          ? staff.endTime
          : undefined,
    });
  }

  return normalizedAssignments;
};

export const BookingDetailWithOrders: React.FC<
  BookingDetailWithOrdersProps
> = ({ open, booking, onClose, onBookingUpdated, onEditBooking }) => {
  const { message, modal } = App.useApp();
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const queryClient = useQueryClient();

  // Use TanStack Query for booking details
  const { data: detailedBooking } = useQuery({
    queryKey: ['booking-detail', booking?.id],
    queryFn: () => bookingApi.getOne(booking!.id).then((r) => r.data),
    enabled: !!booking?.id,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 10 * 1000, // 10 sec
    gcTime: 60 * 1000, // 1 min
  });

  const currentBooking = detailedBooking ?? booking;

  // Use TanStack Query for order
  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['order-by-booking', booking?.id],
    queryFn: () => ordersService.getOrderByBookingId(booking!.id),
    enabled: !!booking?.id,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => bookingApi.delete(id),
    onSuccess: (_data, id) => {
      setActionReasonState((prev) => ({ ...prev, deleteReason: null }));
      message.success('Booking deleted successfully');
      onClose();
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['booking-detail', id] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'deleteReason')) {
        return;
      }

      message.error('Failed to delete booking');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingApi.cancel(id),
    onSuccess: (data) => {
      setActionReasonState((prev) => ({ ...prev, cancelReason: null }));
      message.success('Booking cancelled successfully');
      onBookingUpdated?.(data.data);
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({
        queryKey: ['booking-detail', data.data.id],
      });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'cancelReason')) {
        return;
      }

      message.error('Failed to cancel booking');
    },
  });

  const markCompletedMutation = useMutation({
    mutationFn: (id: string) => bookingApi.update(id, { status: 'COMPLETED' }),
    onSuccess: (data) => {
      setActionReasonState((prev) => ({ ...prev, completeReason: null }));
      message.success('Booking marked as completed');
      onBookingUpdated?.(data.data);
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({
        queryKey: ['booking-detail', data.data.id],
      });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'completeReason')) {
        return;
      }

      message.error('Failed to update booking status');
    },
  });

  const assignedStaff = useMemo(
    () => getBookingStaffAssignments(currentBooking),
    [currentBooking]
  );

  const handleCheckoutSuccess = async (updatedOrder: Order | null) => {
    if (updatedOrder && currentBooking?.id) {
      queryClient.setQueryData(
        ['order-by-booking', currentBooking.id],
        updatedOrder
      );
    }
    setCheckoutModalOpen(false);
    await queryClient.invalidateQueries({
      queryKey: ['order-by-booking', currentBooking?.id],
    });
    await queryClient.invalidateQueries({
      queryKey: ['booking-detail', currentBooking?.id],
    });
    await queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  const canEditBooking =
    currentBooking?.status !== 'COMPLETED' &&
    currentBooking?.status !== 'CANCELLED';
  const canDeleteBooking = currentBooking?.status === 'PENDING';
  const canCancelBooking =
    currentBooking?.status !== 'COMPLETED' &&
    currentBooking?.status !== 'CANCELLED';
  const canManageSessions =
    currentBooking?.status !== 'COMPLETED' &&
    currentBooking?.status !== 'CANCELLED';
  const canMarkCompleted =
    currentBooking?.status === 'CONFIRMED' && order?.status === 'PAID';

  const [actionReasonState, setActionReasonState] = useState<{
    editReason: string | null;
    deleteReason: string | null;
    cancelReason: string | null;
    completeReason: string | null;
  }>({
    editReason: null,
    deleteReason: null,
    cancelReason: null,
    completeReason: null,
  });

  const applyForbiddenReason = (
    error: unknown,
    key: 'editReason' | 'deleteReason' | 'cancelReason' | 'completeReason'
  ) => {
    if (!isPermissionDeniedError(error)) {
      return false;
    }

    const reason = buildForbiddenReason(error);
    setActionReasonState((prev) => ({
      ...prev,
      [key]: reason,
    }));
    message.warning(reason);
    return true;
  };

  const editReason = actionReasonState.editReason;
  const deleteReason = actionReasonState.deleteReason;
  const cancelReason = actionReasonState.cancelReason;
  const completeReason = actionReasonState.completeReason;

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
    modal.confirm({
      title: 'Delete Booking',
      content: 'Are you sure you want to delete this booking?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        deleteMutation.mutate(currentBooking!.id);
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

    modal.confirm({
      title: 'Cancel Booking',
      content:
        'This will mark the booking as cancelled and hide payment actions for the customer. Continue?',
      okText: 'Cancel Booking',
      okButtonProps: { danger: true },
      onOk: () => {
        cancelMutation.mutate(currentBooking.id);
      },
    });
  };

  const handleMarkCompleted = () => {
    if (!currentBooking) {
      return;
    }

    if (!canMarkCompleted) {
      message.error(
        'Only confirmed bookings with a fully paid order can be marked completed'
      );
      return;
    }

    modal.confirm({
      title: 'Mark Booking Completed',
      content:
        'This will lock the booking from further edits. Continue to mark it as completed?',
      okText: 'Mark Completed',
      onOk: () => {
        markCompletedMutation.mutate(currentBooking.id);
      },
    });
  };

  const handlePrintInvoice = () => {
    if (!currentBooking) {
      return;
    }
    printInvoice(currentBooking);
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
                                className="rounded-lg border border-gray-200 p-3"
                              >
                                <div className="flex items-center justify-between gap-4">
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
                                      style={{
                                        fontSize: '12px',
                                        color: '#666',
                                      }}
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
                                {item.package?.services &&
                                  item.package.services.length > 0 && (
                                    <div className="mt-2 ml-8 border-t border-gray-100 pt-2">
                                      <div className="text-xs font-medium text-gray-500 mb-1">
                                        Included services:
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        {item.package.services.map(
                                          (pkgService) => {
                                            const svcName =
                                              pkgService.service?.name;
                                            const pkgName = item.package?.name;
                                            // Match staff specifically to this package service
                                            const packageServiceLabel =
                                              pkgName && svcName
                                                ? `${pkgName} / ${svcName}`
                                                : null;
                                            const relatedStaff =
                                              assignedStaff.filter(
                                                (s) =>
                                                  s.serviceLabel ===
                                                    packageServiceLabel ||
                                                  s.serviceLabel === svcName
                                              );

                                            return (
                                              <div
                                                key={pkgService.serviceId}
                                                className="flex flex-col gap-1 rounded border border-gray-100 p-2"
                                              >
                                                <div className="flex items-center justify-between gap-2 text-sm">
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-green-500">
                                                      ✓
                                                    </span>
                                                    <span>
                                                      {pkgService.service
                                                        ?.name ||
                                                        'Unnamed service'}
                                                    </span>
                                                  </div>
                                                  {pkgService.service?.job
                                                    ?.name ? (
                                                    <Tag
                                                      color="blue"
                                                      className="text-[10px] px-1 py-0"
                                                    >
                                                      {
                                                        pkgService.service.job
                                                          .name
                                                      }
                                                    </Tag>
                                                  ) : null}
                                                </div>
                                                {relatedStaff.length > 0 && (
                                                  <div className="ml-5 mt-1 flex flex-col gap-1">
                                                    {relatedStaff.map(
                                                      (staff) => (
                                                        <div
                                                          key={staff.id}
                                                          className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs"
                                                        >
                                                          <span className="text-blue-600">
                                                            👤
                                                          </span>
                                                          <span className="font-medium text-gray-700 dark:text-gray-300">
                                                            {staff.lastName}{' '}
                                                            {staff.firstName}
                                                          </span>
                                                          {staff.phoneNumber ? (
                                                            <span className="text-gray-400">
                                                              (
                                                              {
                                                                staff.phoneNumber
                                                              }
                                                              )
                                                            </span>
                                                          ) : null}
                                                          {staff.locationName ? (
                                                            <Tag
                                                              color="orange"
                                                              className="text-[10px] px-1 py-0"
                                                            >
                                                              📍{' '}
                                                              {
                                                                staff.locationName
                                                              }
                                                            </Tag>
                                                          ) : null}
                                                          {staff.startTime ||
                                                          staff.endTime ? (
                                                            <Tag
                                                              color="purple"
                                                              className="text-[10px] px-1 py-0"
                                                            >
                                                              🕐{' '}
                                                              {formatAssignmentDateTime(
                                                                staff.startTime
                                                              )}{' '}
                                                              -{' '}
                                                              {formatAssignmentDateTime(
                                                                staff.endTime
                                                              )}
                                                            </Tag>
                                                          ) : null}
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        </Card>
                      </>
                    )}

                  {/* All Booking Services */}
                  {currentBooking.services &&
                    currentBooking.services.length > 0 && (
                      <>
                        <Divider>
                          Services ({currentBooking.services.length})
                        </Divider>
                        <Card size="small">
                          <div className="flex flex-col gap-3">
                            {currentBooking.services.map((item) => {
                              const serviceName = item.service?.name;
                              // Match staff assigned specifically to THIS service
                              const relatedStaff = assignedStaff.filter(
                                (s) =>
                                  s.serviceLabel === serviceName ||
                                  (serviceName &&
                                    s.serviceLabel?.endsWith(
                                      ` / ${serviceName}`
                                    ))
                              );

                              return (
                                <div
                                  key={item.serviceId}
                                  className="rounded-lg border border-gray-200 p-3"
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <Tag color="green">🎯</Tag>
                                      <div>
                                        <div className="font-medium">
                                          {item.service?.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {item.service?.description}
                                        </div>
                                        {item.service?.job?.name ? (
                                          <div className="text-xs text-blue-500">
                                            Job: {item.service.job.name}
                                          </div>
                                        ) : null}
                                      </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                      <div
                                        style={{
                                          fontSize: '12px',
                                          color: '#666',
                                        }}
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
                                          (item.price || 0) *
                                            (item.quantity || 1)
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {relatedStaff.length > 0 && (
                                    <div className="mt-2 ml-8 border-t border-gray-100 pt-2">
                                      <div className="text-xs font-medium text-gray-500 mb-1">
                                        Assigned staff:
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        {relatedStaff.map((staff) => (
                                          <div
                                            key={staff.id}
                                            className="flex items-center gap-2 text-xs"
                                          >
                                            <span className="text-blue-600">
                                              👤
                                            </span>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                              {staff.lastName} {staff.firstName}
                                            </span>
                                            {staff.phoneNumber ? (
                                              <span className="text-gray-400">
                                                ({staff.phoneNumber})
                                              </span>
                                            ) : null}
                                            {staff.locationName ? (
                                              <Tag
                                                color="orange"
                                                className="text-[10px] px-1 py-0"
                                              >
                                                📍 {staff.locationName}
                                              </Tag>
                                            ) : null}
                                            {staff.startTime ||
                                            staff.endTime ? (
                                              <Tag
                                                color="purple"
                                                className="text-[10px] px-1 py-0"
                                              >
                                                🕐{' '}
                                                {formatAssignmentDateTime(
                                                  staff.startTime
                                                )}{' '}
                                                -{' '}
                                                {formatAssignmentDateTime(
                                                  staff.endTime
                                                )}
                                              </Tag>
                                            ) : null}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      </>
                    )}

                  {/* Action Buttons */}
                  <Divider />
                  <Space>
                    <Button
                      icon={<PrinterOutlined />}
                      onClick={handlePrintInvoice}
                    >
                      Print Invoice
                    </Button>
                    <Tooltip title={editReason ?? undefined}>
                      <Button
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                        disabled={!canEditBooking || Boolean(editReason)}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Tooltip title={cancelReason ?? undefined}>
                      <Button
                        danger
                        onClick={handleCancelBooking}
                        disabled={!canCancelBooking || Boolean(cancelReason)}
                      >
                        Cancel Booking
                      </Button>
                    </Tooltip>
                    <Tooltip title={deleteReason ?? undefined}>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDelete}
                        disabled={!canDeleteBooking || Boolean(deleteReason)}
                      >
                        Delete
                      </Button>
                    </Tooltip>
                    <Tooltip title={completeReason ?? undefined}>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={handleMarkCompleted}
                        disabled={!canMarkCompleted || Boolean(completeReason)}
                      >
                        Mark Completed
                      </Button>
                    </Tooltip>
                  </Space>
                </div>
              ),
            },
            {
              key: 'sessions',
              label: 'Sessions',
              children: (
                <BookingSessionsPanel
                  bookingId={currentBooking.id}
                  sessions={currentBooking.sessions}
                  canManage={Boolean(canManageSessions)}
                  onChanged={async () => {
                    await queryClient.invalidateQueries({
                      queryKey: ['booking-detail', currentBooking.id],
                    });
                    await queryClient.invalidateQueries({
                      queryKey: ['bookings'],
                    });
                  }}
                />
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
                  {isLoadingOrder ? (
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
