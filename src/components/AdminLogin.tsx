import React, { useEffect } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import {
  LockOutlined,
  LoginOutlined,
  HeartOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { useAuthStore } from '@stores/authStore';
import { useTheme } from '@hooks';
import { AntdProvider } from '@providers/AntdProvider';
import type { LoginRequest } from '@/types';
import { authApi } from '@services/AuthService';

const { Title, Text, Paragraph } = Typography;

const AdminLogin: React.FC = () => {
  const { darkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      setAuth(data.user);
      messageApi.success('Login successful! Redirecting...');
      setTimeout(() => {
        navigate({ to: '/' });
      }, 1000);
    },
    onError: () => {
      messageApi.error('Invalid phone number or password');
    },
  });

  const onFinish = (values: LoginRequest) => {
    loginMutation.mutate(values);
  };

  return (
    <AntdProvider darkMode={darkMode}>
      {contextHolder}
      <div
        className={`min-h-screen flex items-center justify-center p-4 ${
          darkMode
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-pink-50/20'
        }`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob ${
              darkMode ? 'bg-pink-500' : 'bg-pink-300'
            }`}
          />
          <div
            className={`absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 ${
              darkMode ? 'bg-rose-500' : 'bg-rose-300'
            }`}
          />
          <div
            className={`absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 ${
              darkMode ? 'bg-purple-500' : 'bg-purple-300'
            }`}
          />
        </div>

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card
            className={`shadow-2xl border-none ${
              darkMode
                ? 'bg-gray-800/90 backdrop-blur-lg'
                : 'bg-white/90 backdrop-blur-lg'
            }`}
            styles={{
              body: { padding: '3rem' },
            }}
          >
            {/* Logo & Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                className="flex justify-center mb-4"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    darkMode
                      ? 'bg-gradient-to-br from-pink-500 to-rose-600'
                      : 'bg-gradient-to-br from-pink-500 to-rose-600'
                  }`}
                >
                  <HeartOutlined className="text-3xl text-white" />
                </div>
              </motion.div>

              <Title
                level={2}
                className="!mb-2 bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent"
              >
                Welcome Back
              </Title>
              <Paragraph
                className={`${darkMode ? 'text-gray-300' : 'text-slate-600'} !mb-0`}
              >
                Sign in to access your admin dashboard
              </Paragraph>
            </motion.div>

            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                size="large"
              >
                <Form.Item
                  name="phoneNumber"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter your phone number',
                    },
                    {
                      pattern: /^(\+84|84|0)[1-9][0-9]{8}$/,
                      message: 'Please enter a valid Vietnamese phone number',
                    },
                  ]}
                >
                  <Input
                    id="staff-phone-number"
                    name="phoneNumber"
                    prefix={
                      <PhoneOutlined
                        className={darkMode ? 'text-gray-400' : 'text-gray-400'}
                      />
                    }
                    placeholder="Phone number (e.g., +84981234567)"
                    autoComplete="username"
                    className="h-12"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'Please enter your password' },
                    {
                      min: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  ]}
                >
                  <Input.Password
                    id="staff-password"
                    name="password"
                    prefix={
                      <LockOutlined
                        className={darkMode ? 'text-gray-400' : 'text-gray-400'}
                      />
                    }
                    placeholder="Password"
                    autoComplete="current-password"
                    className="h-12"
                  />
                </Form.Item>

                <Form.Item>
                  <div className="flex items-center justify-between">
                    <Text
                      className={`text-sm cursor-pointer hover:text-pink-500 transition-colors ${
                        darkMode ? 'text-gray-300' : 'text-slate-600'
                      }`}
                    >
                      Forgot password?
                    </Text>
                  </div>
                </Form.Item>

                <Form.Item className="!mb-0">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loginMutation.isPending}
                      icon={<LoginOutlined />}
                      className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-600 border-none hover:from-pink-600 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300 font-medium text-base"
                    >
                      {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </motion.div>
                </Form.Item>
              </Form>
            </motion.div>

            {/* Divider */}
            <motion.div
              className="my-6"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="relative">
                <div
                  className={`absolute inset-0 flex items-center ${
                    darkMode ? 'text-gray-600' : 'text-slate-300'
                  }`}
                >
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span
                    className={`px-4 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-slate-500'}`}
                  >
                    Studio HaMy Admin
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex w-full flex-col gap-2">
                <Text
                  className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}
                >
                  Need access?{' '}
                  <span className="text-pink-500 cursor-pointer hover:text-pink-600 transition-colors">
                    Contact Administrator
                  </span>
                </Text>

                <Button
                  type="text"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </Button>
              </div>
            </motion.div>
          </Card>

          {/* Back to Home Link */}
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Button
              type="link"
              onClick={() => navigate({ to: '/' })}
              className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              ← Back to Home
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </AntdProvider>
  );
};

export default AdminLogin;
