import { useState } from 'react';
import {
  Button,
  Card,
  Space,
  Typography,
  DatePicker,
  Input,
  Switch,
  notification,
  Badge,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { FaHeart, FaGift, FaSmile, FaReact, FaBell } from 'react-icons/fa';
import { SiVite, SiTailwindcss, SiAntdesign } from 'react-icons/si';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { AntdProvider } from './providers/AntdProvider';
import { useTheme, useNotifications, useWeddingForm } from './hooks';

const { Title, Paragraph, Text } = Typography;

function App() {
  const [count, setCount] = useState(0);
  const { darkMode, setDarkMode } = useTheme();
  const { notifications, addNotification, clearAllNotifications } =
    useNotifications();
  const {
    formData,
    updateBride,
    updateGroom,
    updateWedding,
    saveForm,
    isLoading,
    errors,
  } = useWeddingForm();

  const showNotification = () => {
    notification.success({
      message: 'Wedding Planning Success!',
      description: 'Your wedding details have been saved successfully.',
      icon: <FaHeart style={{ color: '#f56a00' }} />,
    });

    // Also add to Zustand notification store
    addNotification({
      type: 'success',
      title: 'Wedding Details Saved',
      message: `Details saved for ${formData.bride.name || 'Bride'} and ${formData.groom.name || 'Groom'}`,
    });
  };

  const handleSaveForm = async () => {
    try {
      await saveForm();
      showNotification();
    } catch {
      notification.error({
        message: 'Validation Error',
        description: 'Please fill in all required fields.',
      });
    }
  };

  return (
    <AntdProvider darkMode={darkMode}>
      <div
        className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark:bg-gray-900 bg-gray-900' : 'bg-gray-50'}`}
      >
        {/* Header */}
        <div
          className={`p-6 shadow-sm border-b transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <SiVite className="w-8 h-8 text-blue-500" />
              <FaReact className="w-8 h-8 text-blue-400 animate-spin-slow" />
              <Title level={3} className="!mb-0">
                Wedding Planner
              </Title>
            </div>
            <Space>
              <MdLightMode
                className={`text-lg transition-colors ${darkMode ? 'text-gray-400' : 'text-yellow-500'}`}
              />
              <Switch checked={darkMode} onChange={setDarkMode} />
              <MdDarkMode
                className={`text-lg transition-colors ${darkMode ? 'text-yellow-400' : 'text-gray-600'}`}
              />
            </Space>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Counter Demo */}
            <Card
              title="Interactive Counter"
              extra={<FaSmile className="text-yellow-500" />}
              className="shadow-antd-sm hover:shadow-antd transition-shadow"
            >
              <div className="text-center">
                <Title level={2} className="text-primary-500">
                  {count}
                </Title>
                <Space direction="vertical" className="w-full">
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => setCount(count + 1)}
                    className="w-full"
                  >
                    Increment Count
                  </Button>
                  <Button onClick={() => setCount(0)} className="w-full">
                    Reset
                  </Button>
                </Space>
              </div>
            </Card>

            {/* Card 2: Wedding Form with Zustand */}
            <Card
              title={
                <div className="flex items-center justify-between">
                  <span>Wedding Details</span>
                  <Badge count={notifications.length} size="small">
                    <FaBell className="text-gray-500" />
                  </Badge>
                </div>
              }
              extra={<FaHeart className="text-red-500" />}
              className="shadow-antd-sm hover:shadow-antd transition-shadow"
            >
              <Space direction="vertical" className="w-full">
                <Input
                  placeholder="Bride's Name"
                  className="rounded-antd"
                  value={formData.bride.name}
                  onChange={(e) => updateBride({ name: e.target.value })}
                  status={errors['bride.name'] ? 'error' : ''}
                />
                {errors['bride.name'] && (
                  <Text type="danger" className="text-sm">
                    {errors['bride.name']}
                  </Text>
                )}

                <Input
                  placeholder="Groom's Name"
                  className="rounded-antd"
                  value={formData.groom.name}
                  onChange={(e) => updateGroom({ name: e.target.value })}
                  status={errors['groom.name'] ? 'error' : ''}
                />
                {errors['groom.name'] && (
                  <Text type="danger" className="text-sm">
                    {errors['groom.name']}
                  </Text>
                )}

                <DatePicker
                  placeholder="Wedding Date"
                  className="w-full rounded-antd"
                  value={
                    formData.wedding.date ? dayjs(formData.wedding.date) : null
                  }
                  onChange={(date: Dayjs | null) =>
                    updateWedding({ date: date ? date.toISOString() : '' })
                  }
                  status={errors['wedding.date'] ? 'error' : ''}
                />
                {errors['wedding.date'] && (
                  <Text type="danger" className="text-sm">
                    {errors['wedding.date']}
                  </Text>
                )}

                <Button
                  type="primary"
                  icon={<FaGift />}
                  onClick={handleSaveForm}
                  loading={isLoading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 border-none"
                >
                  Save Details ({notifications.length} saved)
                </Button>

                {notifications.length > 0 && (
                  <Button
                    size="small"
                    onClick={clearAllNotifications}
                    className="w-full"
                  >
                    Clear Notifications ({notifications.length})
                  </Button>
                )}
              </Space>
            </Card>

            {/* Card 3: Feature Showcase */}
            <Card
              title="Tech Stack"
              className="shadow-antd-sm hover:shadow-antd transition-shadow"
            >
              <Space direction="vertical" className="w-full">
                <div
                  className={`p-3 rounded-antd border transition-colors ${darkMode ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-200'}`}
                >
                  <div className="flex items-center gap-2">
                    <FaReact className="text-blue-600 text-lg" />
                    <Text strong className="text-blue-600">
                      React 19
                    </Text>
                  </div>
                  <Text type="secondary" className="text-sm">
                    Latest React with TypeScript
                  </Text>
                </div>

                <div
                  className={`p-3 rounded-antd border transition-colors ${darkMode ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-200'}`}
                >
                  <div className="flex items-center gap-2">
                    <SiAntdesign className="text-green-600 text-lg" />
                    <Text strong className="text-green-600">
                      Ant Design 5
                    </Text>
                  </div>
                  <Text type="secondary" className="text-sm">
                    Enterprise UI components
                  </Text>
                </div>

                <div
                  className={`p-3 rounded-antd border transition-colors ${darkMode ? 'bg-purple-900/20 border-purple-800/30' : 'bg-purple-50 border-purple-200'}`}
                >
                  <div className="flex items-center gap-2">
                    <SiTailwindcss className="text-purple-600 text-lg" />
                    <Text strong className="text-purple-600">
                      Tailwind CSS v4
                    </Text>
                  </div>
                  <Text type="secondary" className="text-sm">
                    Utility-first CSS framework
                  </Text>
                </div>

                <div
                  className={`p-3 rounded-antd border transition-colors ${darkMode ? 'bg-orange-900/20 border-orange-800/30' : 'bg-orange-50 border-orange-200'}`}
                >
                  <div className="flex items-center gap-2">
                    <FaReact className="text-orange-600 text-lg" />
                    <Text strong className="text-orange-600">
                      Zustand
                    </Text>
                  </div>
                  <Text type="secondary" className="text-sm">
                    Lightweight state management
                  </Text>
                </div>
              </Space>
            </Card>
          </div>

          {/* Footer Info */}
          <Card className="mt-6 shadow-antd-sm">
            <div className="text-center">
              <Paragraph className="!mb-2">
                <div className="flex items-center justify-center gap-2">
                  <FaHeart className="text-red-500" />
                  <Text strong>
                    Ant Design + Tailwind CSS + React Icons Integration
                  </Text>
                </div>
              </Paragraph>
              <Paragraph type="secondary" className="!mb-0">
                This demo shows how Ant Design components work seamlessly with
                Tailwind CSS utilities and React Icons. The setup includes
                proper theme configuration and prevents style conflicts.
              </Paragraph>
            </div>
          </Card>
        </div>
      </div>
    </AntdProvider>
  );
}

export default App;
