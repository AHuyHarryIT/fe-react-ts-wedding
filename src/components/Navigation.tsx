import React, { useState } from 'react';
import { Button, Typography, Drawer, Menu } from 'antd';
import {
  MenuOutlined,
  HeartOutlined,
  MoonOutlined,
  SunOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { useTheme } from '@hooks';

const { Text } = Typography;

interface NavigationProps {
  transparent?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ transparent = false }) => {
  const { darkMode, setDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Track scroll position for background animation
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  const menuItems = [
    { key: 'home', label: 'Home' },
    { key: 'services', label: 'Services' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'about', label: 'About' },
    { key: 'blog', label: 'Blog' },
    { key: 'contact', label: 'Contact' },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          background:
            transparent && !isScrolled
              ? 'transparent'
              : darkMode
                ? 'rgba(17, 24, 39, 0.95)'
                : 'rgba(248, 250, 252, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom:
            transparent && !isScrolled
              ? 'none'
              : darkMode
                ? '1px solid rgba(75, 85, 99, 0.3)'
                : '1px solid rgba(203, 213, 225, 0.4)',
          boxShadow:
            transparent && !isScrolled
              ? 'none'
              : darkMode
                ? '0 4px 24px rgba(0, 0, 0, 0.1)'
                : '0 4px 32px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Animated Logo */}
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                whileHover={{
                  rotate: 360,
                  scale: 1.1,
                }}
                transition={{ duration: 0.6 }}
              >
                <HeartOutlined
                  className={`text-2xl ${
                    transparent && !isScrolled ? 'text-white' : 'text-pink-500'
                  }`}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Text
                  className={`text-xl font-bold bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent ${
                    transparent && !isScrolled ? '!text-white' : ''
                  }`}
                  style={{
                    background:
                      transparent && !isScrolled
                        ? 'transparent'
                        : 'linear-gradient(135deg, #ec4899, #ef4444)',
                    WebkitBackgroundClip:
                      transparent && !isScrolled ? 'unset' : 'text',
                    WebkitTextFillColor:
                      transparent && !isScrolled ? 'white' : 'transparent',
                    color: transparent && !isScrolled ? 'white' : 'transparent',
                  }}
                >
                  Studio HaMy
                </Text>
              </motion.div>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              className="hidden lg:flex items-center space-x-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.key}
                  onClick={() => scrollToSection(item.key)}
                  className={`text-sm font-medium tracking-wide uppercase transition-colors relative group ${
                    transparent && !isScrolled
                      ? 'text-white/90 hover:text-white'
                      : darkMode
                        ? 'text-gray-300 hover:text-pink-400'
                        : 'text-slate-600 hover:text-pink-600'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  {item.label}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-600"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              ))}
            </motion.div>

            {/* Right side actions */}
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Theme Toggle */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="text"
                  shape="circle"
                  icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
                  onClick={() => setDarkMode(!darkMode)}
                  className={`${
                    transparent && !isScrolled
                      ? 'text-white hover:bg-white/10'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-slate-600 hover:bg-slate-100/80'
                  }`}
                />
              </motion.div>

              {/* Call to Action */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <Button
                  type="primary"
                  icon={<PhoneOutlined />}
                  className={`hidden md:flex h-10 px-6 rounded-full font-medium shadow-lg ${
                    transparent && !isScrolled
                      ? 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
                      : 'bg-gradient-to-r from-pink-500 to-rose-600 border-none hover:from-pink-600 hover:to-rose-700 hover:shadow-xl'
                  }`}
                >
                  Book Consultation
                </Button>
              </motion.div>

              {/* Mobile Menu Button */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="text"
                  shape="circle"
                  icon={<MenuOutlined />}
                  onClick={() => setMobileMenuOpen(true)}
                  className={`lg:hidden ${
                    transparent && !isScrolled
                      ? 'text-white hover:bg-white/10'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-slate-600 hover:bg-slate-100/80'
                  }`}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <HeartOutlined className="text-pink-500 text-xl" />
            <Text
              strong
              className="text-lg bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent"
            >
              Studio HaMy
            </Text>
          </motion.div>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className={darkMode ? '[&_.ant-drawer-content]:bg-gray-900' : ''}
        width={280}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Menu
            mode="vertical"
            className={`border-none ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
            items={menuItems.map((item, index) => ({
              key: item.key,
              label: (
                <motion.button
                  onClick={() => scrollToSection(item.key)}
                  className="w-full text-left py-3 text-base font-medium uppercase tracking-wide transition-colors hover:text-pink-500"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  whileHover={{ x: 10 }}
                >
                  {item.label}
                </motion.button>
              ),
            }))}
          />

          <motion.div
            className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="primary"
                icon={<PhoneOutlined />}
                size="large"
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-600 border-none hover:from-pink-600 hover:to-rose-700 rounded-full font-medium shadow-lg hover:shadow-xl"
              >
                Book Consultation
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </Drawer>
    </>
  );
};

export default Navigation;
