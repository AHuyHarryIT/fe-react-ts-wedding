/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import React, { useEffect, useState } from 'react';
import {
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  ExportOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

import { inventoryApi } from '@/services/InventoryService';
import type { InventoryCategory, InventoryItem, InventoryLog } from '@types';

const { Title } = Typography;

// ──────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────
export function InventoryManagement() {
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [categories, setCategories] = React.useState<InventoryCategory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterCategory, setFilterCategory] = useState<string | undefined>();

  // Item modal state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemForm] = Form.useForm();

  // Category modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<InventoryCategory | null>(null);
  const [catForm] = Form.useForm();

  // Checkout drawer
  const [checkoutDrawerOpen, setCheckoutDrawerOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<InventoryItem | null>(null);
  const [checkoutForm] = Form.useForm();

  // Checkin drawer
  const [checkinDrawerOpen, setCheckinDrawerOpen] = useState(false);
  const [checkinItem, setCheckinItem] = useState<InventoryItem | null>(null);
  const [checkinForm] = Form.useForm();

  // Logs modal
  const [logsVisible, setLogsVisible] = useState(false);
  // logItemId removed - not used
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────
  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await inventoryApi.items.getAll({
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
        type: filterType,
        categoryId: filterCategory,
      });
      setItems(result.data);
      setTotal(result.pagination.total);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, filterType, filterCategory]);

  const fetchCategories = React.useCallback(async () => {
    try {
      const result = await inventoryApi.categories.getAll();
      setCategories(result.data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ── CRUD Item ───────────────────────────────────────────────────
  const openCreateItem = () => {
    setEditingItem(null);
    itemForm.resetFields();
    itemForm.setFieldsValue({
      isActive: true,
      stockCount: 0,
      costPrice: 0,
      sellPrice: 0,
    });
    setItemModalOpen(true);
  };

  const openEditItem = (record: InventoryItem) => {
    setEditingItem(record);
    itemForm.setFieldsValue(record);
    setItemModalOpen(true);
  };

  const handleSaveItem = async () => {
    try {
      const values = await itemForm.validateFields();
      if (editingItem) {
        await inventoryApi.items.update(editingItem.id, values);
        message.success('Item updated successfully');
      } else {
        await inventoryApi.items.create(values);
        message.success('Item created successfully');
      }
      setItemModalOpen(false);
      fetchItems();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || 'Failed to save item');
    }
  };

  const handleDeleteItem = (record: InventoryItem) => {
    Modal.confirm({
      title: 'Delete Item',
      content: `Are you sure you want to delete "${record.name}"?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await inventoryApi.items.delete(record.id);
          message.success('Item deleted');
          fetchItems();
        } catch (e: any) {
          message.error(e?.response?.data?.message || 'Failed to delete item');
        }
      },
    });
  };

  // ── CRUD Category ───────────────────────────────────────────────
  const openCreateCat = () => {
    setEditingCat(null);
    catForm.resetFields();
    setCatModalOpen(true);
  };

  const handleSaveCat = async () => {
    try {
      const values = await catForm.validateFields();
      if (editingCat) {
        await inventoryApi.categories.update(editingCat.id, values);
        message.success('Category updated');
      } else {
        await inventoryApi.categories.create(values);
        message.success('Category created');
      }
      setCatModalOpen(false);
      fetchCategories();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || 'Failed to save category');
    }
  };

  // handleDeleteCat - kept for future use

  // ── Checkout ────────────────────────────────────────────────────
  const openCheckout = (item: InventoryItem) => {
    setCheckoutItem(item);
    checkoutForm.resetFields();
    checkoutForm.setFieldsValue({ quantity: 1 });
    setCheckoutDrawerOpen(true);
  };

  const handleCheckout = async () => {
    if (!checkoutItem) return;
    try {
      const values = await checkoutForm.validateFields();
      if (values.expectedReturnDate) {
        values.expectedReturnDate = new Date(
          values.expectedReturnDate
        ).toISOString();
      }
      await inventoryApi.checkout(checkoutItem.id, values);
      message.success('Checked out successfully');
      setCheckoutDrawerOpen(false);
      fetchItems();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || 'Failed to checkout');
    }
  };

  // ── Checkin ─────────────────────────────────────────────────────
  const openCheckin = (item: InventoryItem) => {
    setCheckinItem(item);
    checkinForm.resetFields();
    checkinForm.setFieldsValue({ quantity: 1 });
    setCheckinDrawerOpen(true);
  };

  const handleCheckin = async () => {
    if (!checkinItem) return;
    try {
      const values = await checkinForm.validateFields();
      await inventoryApi.checkin(checkinItem.id, values);
      message.success('Checked in successfully');
      setCheckinDrawerOpen(false);
      fetchItems();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || 'Failed to checkin');
    }
  };

  // ── Logs ────────────────────────────────────────────────────────
  const openLogs = async (item: InventoryItem) => {
    setLogItemId(item.id);
    setLogsVisible(true);
    setLogsLoading(true);
    try {
      const result = await inventoryApi.logs.getByItem(item.id);
      setLogs(result.data);
    } catch {
      message.error('Failed to fetch logs');
    } finally {
      setLogsLoading(false);
    }
  };

  // ── Columns ─────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const color =
          type === 'SOLD' ? 'blue' : type === 'RENTAL' ? 'orange' : 'green';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 100,
      render: (v: string) => v || '—',
    },
    {
      title: 'Stock',
      dataIndex: 'stockCount',
      key: 'stockCount',
      width: 90,
      render: (v: number, r: InventoryItem) => {
        if (r.type === 'RENTAL') {
          return (
            <span>
              {v}{' '}
              <span style={{ color: '#999' }}>({r.checkedOutCount} out)</span>
            </span>
          );
        }
        return v;
      },
    },
    {
      title: 'Sell Price',
      dataIndex: 'sellPrice',
      key: 'sellPrice',
      width: 120,
      render: (v: number) =>
        new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(v),
    },
    {
      title: 'Rental/Day',
      dataIndex: 'rentalPricePerDay',
      key: 'rentalPricePerDay',
      width: 120,
      render: (v: number) =>
        v
          ? new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(v)
          : '—',
    },
    {
      title: 'Rental Status',
      dataIndex: 'rentalStatus',
      key: 'rentalStatus',
      width: 130,
      render: (v: string, r: InventoryItem) =>
        r.type === 'RENTAL' ? (
          <Tag
            color={
              v === 'AVAILABLE'
                ? 'green'
                : v === 'CHECKED_OUT'
                  ? 'orange'
                  : v === 'DAMAGED'
                    ? 'red'
                    : 'default'
            }
          >
            {v}
          </Tag>
        ) : (
          '—'
        ),
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 130,
      render: (v: string) => v || '—',
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'default'}>{v ? 'Yes' : 'No'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 260,
      render: (_: any, record: InventoryItem) => (
        <Space wrap>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditItem(record)}
          >
            Edit
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteItem(record)}
          >
            Delete
          </Button>

          {record.type === 'RENTAL' && (
            <>
              <Button
                size="small"
                type="primary"
                style={{ background: '#fa8c16' }}
                icon={<ExportOutlined />}
                onClick={() => openCheckout(record)}
                disabled={record.stockCount <= 0}
              >
                Checkout
              </Button>
              <Button
                size="small"
                type="primary"
                icon={<InboxOutlined />}
                onClick={() => openCheckin(record)}
                disabled={record.checkedOutCount <= 0}
              >
                Checkin
              </Button>
            </>
          )}

          <Button
            size="small"
            icon={<UndoOutlined />}
            onClick={() => openLogs(record)}
          >
            Logs
          </Button>
        </Space>
      ),
    },
  ];

  const logColumns = [
    { title: 'Type', dataIndex: 'type', key: 'type', width: 160 },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: 'Note', dataIndex: 'note', key: 'note', ellipsis: true },
    {
      title: 'Checkout',
      dataIndex: 'checkoutDate',
      key: 'checkoutDate',
      width: 170,
      render: (v: string) => (v ? new Date(v).toLocaleString() : '—'),
    },
    {
      title: 'Expected Return',
      dataIndex: 'expectedReturnDate',
      key: 'expectedReturnDate',
      width: 170,
      render: (v: string) => (v ? new Date(v).toLocaleString() : '—'),
    },
    {
      title: 'Actual Return',
      dataIndex: 'actualReturnDate',
      key: 'actualReturnDate',
      width: 170,
      render: (v: string) => (v ? new Date(v).toLocaleString() : '—'),
    },
    {
      title: 'Damage',
      key: 'damage',
      width: 160,
      render: (_: any, r: InventoryLog) =>
        r.damageNote ? (
          <span>
            {r.damageCost
              ? new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(r.damageCost)
              : ''}{' '}
            — {r.damageNote}
          </span>
        ) : (
          '—'
        ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (v: string) => new Date(v).toLocaleString(),
    },
  ];

  let pageTitle = 'Inventory Management';
  if (filterType) {
    pageTitle = `Inventory — ${filterType} Items`;
  }

  return (
    <div>
      <Title level={3}>{pageTitle}</Title>

      {/* ─── Filter Toolbar ──────────────────── */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Search items..."
          style={{ width: 240 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={() => {
            setCurrentPage(1);
            fetchItems();
          }}
          allowClear
        />

        <Select
          placeholder="Filter by type"
          allowClear
          style={{ width: 160 }}
          value={filterType}
          onChange={(v) => {
            setFilterType(v ?? undefined);
            setCurrentPage(1);
          }}
          options={[
            { label: 'Sold', value: 'SOLD' },
            { label: 'Rental', value: 'RENTAL' },
            { label: 'Service Addon', value: 'SERVICE_ADDON' },
          ]}
        />

        <Select
          placeholder="Category"
          allowClear
          style={{ width: 180 }}
          value={filterCategory}
          onChange={(v) => {
            setFilterCategory(v ?? undefined);
            setCurrentPage(1);
          }}
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
        />

        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateItem}>
          Add Item
        </Button>
        <Button icon={<PlusOutlined />} onClick={openCreateCat}>
          Add Category
        </Button>
      </Space>

      {/* ─── Items Table ─────────────────────── */}
      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={loading}
        scroll={{ x: 1300 }}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: (p, ps) => {
            setCurrentPage(p);
            if (ps !== pageSize) {
              setPageSize(ps);
              setCurrentPage(1);
            }
          },
          showSizeChanger: true,
          showTotal: (t) => `${t} items`,
        }}
      />

      {/* ─── Item Create/Edit Modal ──────────── */}
      <Modal
        title={editingItem ? 'Edit Item' : 'Create Item'}
        open={itemModalOpen}
        onOk={handleSaveItem}
        onCancel={() => setItemModalOpen(false)}
        destroyOnHidden
        width={560}
        okText={editingItem ? 'Update' : 'Create'}
      >
        <Form form={itemForm} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Sold', value: 'SOLD' },
                { label: 'Rental', value: 'RENTAL' },
                { label: 'Service Addon', value: 'SERVICE_ADDON' },
              ]}
            />
          </Form.Item>
          <Form.Item name="sku" label="SKU">
            <Input />
          </Form.Item>
          <Form.Item name="costPrice" label="Cost Price">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="sellPrice" label="Sell Price">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="rentalDeposit" label="Rental Deposit">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="rentalPricePerDay" label="Rental Price / Day">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="stockCount" label="Stock Count">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="lowStockThreshold" label="Low Stock Threshold">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="categoryId" label="Category">
            <Select
              allowClear
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>
          <Form.Item name="rentalStatus" label="Rental Status">
            <Select
              allowClear
              options={[
                { label: 'Available', value: 'AVAILABLE' },
                { label: 'Checked Out', value: 'CHECKED_OUT' },
                { label: 'Maintenance', value: 'MAINTENANCE' },
                { label: 'Damaged', value: 'DAMAGED' },
              ]}
            />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* ─── Category Modal ──────────────────── */}
      <Modal
        title={editingCat ? 'Edit Category' : 'Create Category'}
        open={catModalOpen}
        onOk={handleSaveCat}
        onCancel={() => setCatModalOpen(false)}
        destroyOnHidden
      >
        <Form form={catForm} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* ─── Checkout Drawer ─────────────────── */}
      <Drawer
        title={`Checkout: ${checkoutItem?.name}`}
        open={checkoutDrawerOpen}
        onClose={() => setCheckoutDrawerOpen(false)}
        size="default"
        extra={
          <Button type="primary" onClick={handleCheckout}>
            Confirm Checkout
          </Button>
        }
      >
        {checkoutItem && (
          <Descriptions column={1} bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Available Stock">
              {checkoutItem.stockCount}
            </Descriptions.Item>
            <Descriptions.Item label="Currently Checked Out">
              {checkoutItem.checkedOutCount}
            </Descriptions.Item>
          </Descriptions>
        )}
        <Form form={checkoutForm} layout="vertical">
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, type: 'number', min: 1 }]}
          >
            <InputNumber
              min={1}
              max={checkoutItem?.stockCount}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="expectedReturnDate" label="Expected Return Date">
            <Input type="date" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* ─── Checkin Drawer ──────────────────── */}
      <Drawer
        title={`Checkin: ${checkinItem?.name}`}
        open={checkinDrawerOpen}
        onClose={() => setCheckinDrawerOpen(false)}
        size="default"
        extra={
          <Button type="primary" onClick={handleCheckin}>
            Confirm Checkin
          </Button>
        }
      >
        {checkinItem && (
          <Descriptions column={1} bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Checked Out">
              {checkinItem.checkedOutCount}
            </Descriptions.Item>
          </Descriptions>
        )}
        <Form form={checkinForm} layout="vertical">
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, type: 'number', min: 1 }]}
          >
            <InputNumber
              min={1}
              max={checkinItem?.checkedOutCount}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="damageNote" label="Damage Note">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="damageCost" label="Damage Cost (VND)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* ─── Logs Modal ──────────────────────── */}
      <Modal
        title="Inventory Logs"
        open={logsVisible}
        onCancel={() => setLogsVisible(false)}
        footer={null}
        width={900}
        destroyOnHidden
      >
        <Table
          rowKey="id"
          dataSource={logs}
          columns={logColumns}
          loading={logsLoading}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10 }}
        />
      </Modal>
    </div>
  );
}
