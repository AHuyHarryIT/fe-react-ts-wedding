import { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Table,
  Select,
  DatePicker,
  Form,
  message,
  Tag,
  Divider,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { bookingApi } from '@services/BookingService';
import { customerApi } from '@services/CustomerService';

const { TextArea } = Input;

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  type: 'service' | 'package';
}

interface CartItemExtended {
  id: string;
  type: string;
  name: string;
  price: number;
  qty: number;
}

export function POSView() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form] = Form.useForm();

  const { data: servicesData } = useQuery({
    queryKey: ['pos-services'],
    queryFn: () => bookingApi.getServices({ page: 1, limit: 100 }),
  });

  const { data: packagesData } = useQuery({
    queryKey: ['pos-packages'],
    queryFn: () =>
      Promise.resolve({
        data: {
          data: [] as Array<{ id: string; name: string; price: number }>,
        },
      }),
  });

  const { data: customersData } = useQuery({
    queryKey: ['pos-customers'],
    queryFn: () => customerApi.getAll({ page: 1, limit: 100 }),
  });

  const services: Array<{ id: string; name: string; price: number }> =
    servicesData?.data?.data ?? [];
  const packagesList: Array<{ id: string; name: string; price: number }> =
    packagesData?.data?.data ?? [];
  const customers: Array<{
    id: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }> = customersData?.data?.data ?? [];

  const addToCart = (item: CartItem) => {
    const exists = cart.find((c) => c.id === item.id);
    if (exists) {
      setCart(
        cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (id: string) =>
    setCart(cart.filter((c) => c.id !== id));

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const handleCheckout = async () => {
    const values = await form.validateFields();
    if (cart.length === 0) {
      message.error('Add at least 1 item');
      return;
    }

    try {
      await bookingApi.create({
        customerId: values.customerId as string,
        packageIds: cart.filter((c) => c.type === 'package').map((c) => c.id),
        serviceIds: cart.filter((c) => c.type === 'service').map((c) => c.id),
        totalPrice: total,
        notes: (values.notes as string) || '',
        eventDate:
          (values.eventDate as dayjs.Dayjs)?.toISOString() ??
          dayjs().toISOString(),
        status: 'PENDING',
      });
      message.success('Booking created');
      setCart([]);
      form.resetFields();
    } catch (e) {
      const error = e as Record<string, unknown>;
      const data = error.response as Record<string, unknown> | undefined;
      message.error((data?.message as string) ?? 'Failed to create booking');
    }
  };

  const cartTableData: CartItemExtended[] = cart.map((c) => ({ ...c }));

  return (
    <Row gutter={16} style={{ padding: 24 }}>
      {/* Left: Item Selection */}
      <Col xs={24} md={14}>
        <h2 style={{ marginBottom: 16 }}>Quick Select</h2>
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <h3>Services</h3>
          </Col>
          {services.map((s) => (
            <Col key={s.id} xs={8} md={6}>
              <Card
                hoverable
                size="small"
                onClick={() =>
                  addToCart({
                    id: s.id,
                    name: s.name,
                    price: s.price,
                    type: 'service',
                  })
                }
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                <div style={{ color: '#1677ff' }}>
                  {new Intl.NumberFormat('vi-VN').format(s.price)}₫
                </div>
              </Card>
            </Col>
          ))}
          <Col span={24}>
            <h3>Packages</h3>
          </Col>
          {packagesList.map((p) => (
            <Col key={p.id} xs={8} md={6}>
              <Card
                hoverable
                size="small"
                onClick={() =>
                  addToCart({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    type: 'package',
                  })
                }
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                <div style={{ color: '#722ed1' }}>
                  {new Intl.NumberFormat('vi-VN').format(p.price)}₫
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Col>

      {/* Right: Cart + Payment */}
      <Col xs={24} md={10}>
        <h2 style={{ marginBottom: 16 }}>Cart ({cart.length})</h2>
        <Card style={{ marginBottom: 16 }}>
          <Table
            size="small"
            dataSource={cartTableData}
            rowKey="id"
            columns={[
              {
                title: 'Item',
                key: 'name',
                render: (_v: unknown, r: CartItemExtended) => (
                  <>
                    <Tag color={r.type === 'package' ? 'purple' : 'blue'}>
                      {r.type}
                    </Tag>
                    {r.name}
                  </>
                ),
              },
              { title: 'Qty', dataIndex: 'qty', key: 'qty', width: 60 },
              {
                title: 'Total',
                key: 'total',
                render: (_v: unknown, r: CartItemExtended) =>
                  `${new Intl.NumberFormat('vi-VN').format(r.price * r.qty)}₫`,
              },
              {
                title: '',
                key: 'actions',
                render: (_v: unknown, r: CartItemExtended) => (
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeFromCart(r.id)}
                  />
                ),
              },
            ]}
            pagination={false}
          />
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ fontSize: 20, fontWeight: 700, textAlign: 'right' }}>
            Total: {new Intl.NumberFormat('vi-VN').format(total)}₫
          </div>
        </Card>

        <Card title="Checkout">
          <Form form={form} layout="vertical">
            <Form.Item
              name="customerId"
              label="Customer"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                placeholder="Select customer"
                options={customers.map((c) => ({
                  label: `${c.firstName ?? ''} ${c.lastName ?? ''} (${c.phoneNumber ?? ''})`,
                  value: c.id,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="eventDate"
              label="Event Date"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="notes" label="Notes">
              <TextArea rows={2} />
            </Form.Item>
            <Button
              type="primary"
              block
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCheckout}
              style={{ background: '#e11d48', border: 'none' }}
            >
              Complete Checkout
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
