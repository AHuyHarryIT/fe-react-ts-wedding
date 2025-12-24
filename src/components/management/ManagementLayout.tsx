import type { ReactNode } from 'react';
import { Card } from 'antd';
import { useTheme } from '@hooks';

interface ManagementLayoutProps {
  header: ReactNode;
  searchBar: ReactNode;
  table: ReactNode;
  createModal?: ReactNode;
  editModal?: ReactNode;
  additionalModals?: ReactNode[];
}

/**
 * Reusable layout for all management pages
 * Provides consistent structure with:
 * - Header section
 * - Search bar
 * - Table in card
 * - Modals for create/edit
 */
export function ManagementLayout({
  header,
  searchBar,
  table,
  createModal,
  editModal,
  additionalModals,
}: ManagementLayoutProps) {
  const { darkMode: isDark } = useTheme();

  return (
    <div
      style={{
        padding: '24px',
        minHeight: '100vh',
        backgroundColor: isDark ? '#111827' : '#f9fafb',
      }}
    >
      {/* Header Section */}
      {header}

      {/* Search Section */}
      {searchBar}

      {/* Table Section */}
      <Card
        style={{
          backgroundColor: isDark ? '#1f2937' : '#fff',
          borderColor: isDark ? '#374151' : '#d9d9d9',
        }}
      >
        {table}
      </Card>

      {/* Modals */}
      {createModal}
      {editModal}
      {additionalModals &&
        additionalModals.map((modal, index) => (
          <div key={`additional-modal-${index}`}>{modal}</div>
        ))}
    </div>
  );
}
