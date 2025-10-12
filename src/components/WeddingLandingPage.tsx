import React from 'react';
import {
  Button,
  Typography,
  Card,
  Row,
  Col,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Statistic,
  FloatButton,
} from 'antd';
import {
  HeartOutlined,
  CameraOutlined,
  GiftOutlined,
  CrownOutlined,
  SoundOutlined,
  CarOutlined,
  PhoneOutlined,
  MailOutlined,
  InstagramOutlined,
  FacebookOutlined,
  TwitterOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { useTheme } from '../hooks';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// Hero Section Component
const HeroSection: React.FC = () => {
  const { darkMode } = useTheme();

  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div
          className={`absolute inset-0 ${darkMode ? 'bg-black/60' : 'bg-black/40'}`}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <Text className="text-sm tracking-[0.2em] uppercase !text-white/80 font-light">
            Welcome to Studio HaMy
          </Text>
        </div>

        <Title
          level={1}
          className="!text-white !mb-6 text-4xl md:text-6xl font-light tracking-wide"
        >
          Plan The Perfect Wedding
        </Title>

        <Paragraph className="text-lg md:text-xl !text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Create unforgettable memories with our comprehensive wedding planning
          services. From intimate ceremonies to grand celebrations, we make your
          dream wedding come true.
        </Paragraph>

        <Space size="large" className="flex-wrap justify-center">
          <Button
            type="primary"
            size="large"
            className="h-12 px-8 bg-gradient-to-r from-pink-500 to-rose-600 border-none hover:from-pink-600 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Explore Our Services
          </Button>
          <Button
            size="large"
            className="h-12 px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300"
          >
            View Our Work
          </Button>
        </Space>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

// Services Section Component
const ServicesSection: React.FC = () => {
  const { darkMode } = useTheme();

  const services = [
    {
      icon: <CameraOutlined className="text-3xl" />,
      title: 'Photos & Video',
      description:
        'Professional photography and videography to capture every precious moment of your special day.',
    },
    {
      icon: <HeartOutlined className="text-3xl" />,
      title: 'Wedding Makeup',
      description:
        'Expert makeup artists to ensure you look radiant and beautiful on your wedding day.',
    },
    {
      icon: <GiftOutlined className="text-3xl" />,
      title: 'Restaurant',
      description:
        'Exquisite catering services with customized menus for an unforgettable dining experience.',
    },
    {
      icon: <SoundOutlined className="text-3xl" />,
      title: 'Live Music & DJ',
      description:
        'Professional entertainment to keep your guests dancing all night long.',
    },
    {
      icon: <CrownOutlined className="text-3xl" />,
      title: 'Wedding Cake',
      description:
        'Custom-designed wedding cakes that are as beautiful as they are delicious.',
    },
    {
      icon: <CarOutlined className="text-3xl" />,
      title: 'Honeymoon',
      description:
        'Romantic honeymoon packages to exotic destinations for the perfect post-wedding getaway.',
    },
  ];

  return (
    <section
      id="services"
      className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-pink-50/20'}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Text className="text-sm tracking-[0.2em] uppercase text-gray-500 font-light mb-4 block">
            Our Services
          </Text>
          <Title level={2} className="!mb-4 text-3xl md:text-4xl font-light">
            What We Offer
          </Title>
          <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-rose-600 mx-auto" />
        </div>

        <Row gutter={[32, 32]}>
          {services.map((service, index) => (
            <Col xs={24} md={12} lg={8} key={index}>
              <Card
                className={`h-full text-center border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
                  darkMode
                    ? 'bg-gray-800'
                    : 'bg-white/70 backdrop-blur-sm border border-white/20'
                }`}
                bodyStyle={{ padding: '2rem' }}
              >
                <div
                  className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
                    darkMode
                      ? 'bg-pink-500/20 text-pink-400'
                      : 'bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600'
                  }`}
                >
                  {service.icon}
                </div>

                <Title level={4} className="!mb-4 font-medium">
                  {service.title}
                </Title>

                <Paragraph
                  className={`${darkMode ? 'text-gray-300' : 'text-slate-600'} leading-relaxed`}
                >
                  {service.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

// Wedding Features Gallery Component
const WeddingFeaturesSection: React.FC = () => {
  const { darkMode } = useTheme();

  const features = [
    {
      image:
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=987&auto=format&fit=crop',
      title: 'Couple Photography',
      category: 'PHOTOGRAPHY',
    },
    {
      image:
        'https://images.unsplash.com/photo-1464207687429-7505649dae38?q=80&w=2073&auto=format&fit=crop',
      title: 'Outdoor Events',
      category: 'EVENTS',
    },
    {
      image:
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop',
      title: 'Music & Entertainment',
      category: 'MUSIC LIVE',
    },
    {
      image:
        'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?q=80&w=2070&auto=format&fit=crop',
      title: 'Location Scouting',
      category: 'LOCATIONS',
    },
    {
      image:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop',
      title: 'Wedding Photography',
      category: 'PHOTOGRAPHY',
    },
    {
      image:
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop',
      title: 'Celebration Moments',
      category: 'EVENTS',
    },
  ];

  return (
    <section
      id="portfolio"
      className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30'}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Text className="text-sm tracking-[0.2em] uppercase text-gray-500 font-light mb-4 block">
            Our Wedding Feature
          </Text>
          <Title level={2} className="!mb-8 text-3xl md:text-4xl font-light">
            Capture Every Moment
          </Title>
        </div>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
                bodyStyle={{ padding: 0 }}
                cover={
                  <div className="relative overflow-hidden h-64">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <Text className="text-xs tracking-wider uppercase text-white/80 block mb-1">
                        {feature.category}
                      </Text>
                      <Title level={5} className="!text-white !mb-0">
                        {feature.title}
                      </Title>
                    </div>
                  </div>
                }
              />
            </Col>
          ))}
        </Row>

        <div className="text-center mt-12">
          <Button
            size="large"
            className={`h-12 px-8 ${
              darkMode
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 border-none text-white hover:from-pink-600 hover:to-rose-700'
                : 'bg-gradient-to-r from-pink-500 to-rose-600 border-none text-white hover:from-pink-600 hover:to-rose-700'
            } shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            View More Work
          </Button>
        </div>
      </div>
    </section>
  );
};

// Statistics Section Component
const StatisticsSection: React.FC = () => {
  const stats = [
    { number: 8765, label: 'Happy Couples', suffix: '' },
    { number: 568, label: 'Weddings', suffix: '' },
    { number: 849, label: 'Events', suffix: '' },
    { number: 2574, label: 'Photos Taken', suffix: '' },
  ];

  return (
    <section
      id="about"
      className="py-20 relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <Row gutter={[32, 32]} justify="center">
          {stats.map((stat, index) => (
            <Col xs={12} md={6} key={index} className="text-center">
              <div className="text-white">
                <Statistic
                  value={stat.number}
                  suffix={stat.suffix}
                  valueStyle={{
                    color: 'white',
                    fontSize: '3rem',
                    fontWeight: 300,
                    lineHeight: 1,
                  }}
                />
                <Text className="!text-white/80 text-lg font-light tracking-wider uppercase">
                  {stat.label}
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

// Contact/Request Section Component
const ContactSection: React.FC = () => {
  const { darkMode } = useTheme();
  const [form] = Form.useForm();

  const onFinish = (values: Record<string, unknown>) => {
    console.log('Form values:', values);
    // Handle form submission
  };

  return (
    <section
      id="contact"
      className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-pink-50/20 to-blue-50/30'}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <Row gutter={[48, 48]} align="middle">
          {/* Left side - Contact Form */}
          <Col xs={24} lg={12}>
            <div
              className={`p-8 rounded-2xl shadow-xl ${
                darkMode
                  ? 'bg-gray-800'
                  : 'bg-white/80 backdrop-blur-sm border border-white/30'
              }`}
              style={{
                backgroundImage: `linear-gradient(135deg, ${darkMode ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.03)'} 0%, ${darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.03)'} 100%)`,
              }}
            >
              <div className="mb-8">
                <Title level={3} className="!mb-2">
                  Make A Request
                </Title>
                <Paragraph
                  className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Contact us here if you have any wedding planning needs. Or if
                  simply have some questions, we're happy to help!
                </Paragraph>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="space-y-4"
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="firstName"
                      label="First Name"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter your first name',
                        },
                      ]}
                    >
                      <Input placeholder="First Name" className="h-12" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="lastName"
                      label="Last Name"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter your last name',
                        },
                      ]}
                    >
                      <Input placeholder="Last Name" className="h-12" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input placeholder="Email Address" className="h-12" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter your phone number',
                    },
                  ]}
                >
                  <Input placeholder="Phone Number" className="h-12" />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="service" label="Service">
                      <Select placeholder="Select Service" className="h-12">
                        <Select.Option value="photography">
                          Photography
                        </Select.Option>
                        <Select.Option value="makeup">
                          Wedding Makeup
                        </Select.Option>
                        <Select.Option value="catering">
                          Restaurant & Catering
                        </Select.Option>
                        <Select.Option value="music">
                          Live Music & DJ
                        </Select.Option>
                        <Select.Option value="planning">
                          Complete Planning
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="date" label="Wedding Date">
                      <DatePicker
                        placeholder="Select Date"
                        className="w-full h-12"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="message" label="Message">
                  <TextArea
                    placeholder="Tell us about your dream wedding..."
                    rows={4}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-600 border-none hover:from-pink-600 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Send Request
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>

          {/* Right side - Contact Info */}
          <Col xs={24} lg={12}>
            <div className="space-y-8">
              <div>
                <Title level={2} className="!mb-4">
                  Get In Touch
                </Title>
                <Paragraph
                  className={`text-lg ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}
                >
                  Ready to start planning your dream wedding? We're here to help
                  make your special day perfect.
                </Paragraph>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      darkMode
                        ? 'bg-pink-500/20 text-pink-400'
                        : 'bg-pink-50 text-pink-500'
                    }`}
                  >
                    <PhoneOutlined className="text-lg" />
                  </div>
                  <div>
                    <Text strong className="block">
                      Phone
                    </Text>
                    <Text
                      className={darkMode ? 'text-gray-300' : 'text-slate-600'}
                    >
                      0908350166
                    </Text>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      darkMode
                        ? 'bg-pink-500/20 text-pink-400'
                        : 'bg-pink-50 text-pink-500'
                    }`}
                  >
                    <MailOutlined className="text-lg" />
                  </div>
                  <div>
                    <Text strong className="block">
                      Email
                    </Text>
                    <Text
                      className={darkMode ? 'text-gray-300' : 'text-slate-600'}
                    >
                      example@gmail.com
                    </Text>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Text strong className="block mb-4">
                  Follow Us
                </Text>
                <Space size="large">
                  <Button
                    shape="circle"
                    icon={<InstagramOutlined />}
                    className={`w-12 h-12 border-2 ${
                      darkMode
                        ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-gray-900'
                        : 'border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white'
                    } transition-all duration-300`}
                  />
                  <Button
                    shape="circle"
                    icon={<FacebookOutlined />}
                    className={`w-12 h-12 border-2 ${
                      darkMode
                        ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-gray-900'
                        : 'border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white'
                    } transition-all duration-300`}
                  />
                  <Button
                    shape="circle"
                    icon={<TwitterOutlined />}
                    className={`w-12 h-12 border-2 ${
                      darkMode
                        ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-gray-900'
                        : 'border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white'
                    } transition-all duration-300`}
                  />
                </Space>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

// Blog Section Component
const BlogSection: React.FC = () => {
  const { darkMode } = useTheme();

  const blogPosts = [
    {
      image:
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop',
      title: 'New work shop first wedding photos',
      date: 'Aug 15, 2025 • 5 min read',
    },
    {
      image:
        'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
      title: 'New work shop first wedding photos',
      date: 'Aug 12, 2025 • 4 min read',
    },
    {
      image:
        'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?q=80&w=2070&auto=format&fit=crop',
      title: 'New work shop first wedding photos',
      date: 'Aug 10, 2025 • 6 min read',
    },
  ];

  return (
    <section
      id="blog"
      className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-white via-blue-50/20 to-slate-50'}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Text className="text-sm tracking-[0.2em] uppercase text-gray-500 font-light mb-4 block">
            Our Blog
          </Text>
          <Title level={2} className="!mb-4 text-3xl md:text-4xl font-light">
            Latest Stories
          </Title>
          <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-rose-600 mx-auto" />
        </div>

        <Row gutter={[32, 32]}>
          {blogPosts.map((post, index) => (
            <Col xs={24} md={8} key={index}>
              <Card
                className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 group ${
                  darkMode
                    ? 'bg-gray-700'
                    : 'bg-white/80 backdrop-blur-sm border border-white/30'
                }`}
                bodyStyle={{ padding: '1.5rem' }}
                cover={
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                }
              >
                <div className="space-y-3">
                  <Text
                    className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {post.date}
                  </Text>
                  <Title
                    level={4}
                    className="!mb-0 group-hover:text-pink-500 transition-colors"
                  >
                    {post.title}
                  </Title>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="text-center mt-12">
          <Button
            size="large"
            className={`h-12 px-8 ${
              darkMode
                ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-gray-900'
                : 'border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white'
            } transition-all duration-300`}
          >
            Read More Articles
          </Button>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer: React.FC = () => {
  const { darkMode } = useTheme();

  return (
    <footer
      className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-900'} border-t text-white`}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <Row gutter={[32, 32]}>
          <Col xs={24} md={6}>
            <div className="space-y-4">
              <Title level={3} className="!text-white !mb-4">
                Studio HaMy
              </Title>
              <Paragraph className="!text-gray-300">
                Creating magical moments and unforgettable weddings since 2010.
                Your dream wedding is our passion.
              </Paragraph>
              <Space>
                <Button
                  shape="circle"
                  icon={<InstagramOutlined />}
                  className="border-gray-600 text-gray-300 hover:text-pink-400 hover:border-pink-400"
                />
                <Button
                  shape="circle"
                  icon={<FacebookOutlined />}
                  className="border-gray-600 text-gray-300 hover:text-pink-400 hover:border-pink-400"
                />
                <Button
                  shape="circle"
                  icon={<TwitterOutlined />}
                  className="border-gray-600 text-gray-300 hover:text-pink-400 hover:border-pink-400"
                />
              </Space>
            </div>
          </Col>

          <Col xs={24} md={6}>
            <div className="space-y-4">
              <Title level={4} className="!text-white">
                Only For
              </Title>
              <div className="space-y-2">
                <div className="text-gray-300 hover:text-pink-400 cursor-pointer transition-colors">
                  Wedding Photography
                </div>
                <div className="text-gray-300 hover:text-pink-400 cursor-pointer transition-colors">
                  Event Planning
                </div>
                <div className="text-gray-300 hover:text-pink-400 cursor-pointer transition-colors">
                  Catering Services
                </div>
                <div className="text-gray-300 hover:text-pink-400 cursor-pointer transition-colors">
                  Venue Selection
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} md={6}>
            <div className="space-y-4">
              <Title level={4} className="!text-white">
                Privacy & Terms
              </Title>
              <div className="space-y-2">
                <div className="text-gray-300 hover:text-pink-400 cursor-pointer transition-colors">
                  Privacy Policy
                </div>
                <div className="text-gray-300 hover:text-pink-400 cursor-pointer transition-colors">
                  Terms of Service
                </div>
                <div className="text-gray-300 hover:text-pink-400 cursor-pointer transition-colors">
                  Cookie Policy
                </div>
                <div className="text-gray-300 hover:text-pink-400 cursor-pointer transition-colors">
                  Refund Policy
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} md={6}>
            <div className="space-y-4">
              <Title level={4} className="!text-white">
                Contact Info
              </Title>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <PhoneOutlined className="text-pink-400" />
                  <Text className="!text-gray-300">0908350166</Text>
                </div>
                <div className="flex items-center space-x-3">
                  <MailOutlined className="text-pink-400" />
                  <Text className="!text-gray-300">
                    hello@dreamweddings.com
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <Text className="!text-gray-400">
            Copyright © 2025 Studio HaMy. All rights reserved. | This template
            is made with ❤️
          </Text>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
const WeddingLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ServicesSection />
      <WeddingFeaturesSection />
      <StatisticsSection />
      <ContactSection />
      <BlogSection />
      <Footer />

      {/* Float Button for scroll to top */}
      <FloatButton.BackTop
        className="!bg-gradient-to-r from-pink-500 to-rose-600 !border-none"
        icon={<ArrowUpOutlined className="text-white" />}
      />
    </div>
  );
};

export default WeddingLandingPage;
