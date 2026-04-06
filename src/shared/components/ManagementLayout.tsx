import type { ReactNode } from 'react';
import { StaffPanel } from '@shared/components/ui';

interface ManagementLayoutProps {
  header: ReactNode;
  searchBar: ReactNode;
  table: ReactNode;
  createModal?: ReactNode;
  editModal?: ReactNode;
  additionalModals?: ReactNode[];
  className?: string;
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
  className = '',
}: ManagementLayoutProps) {
  return (
    <div className={`staff-page ${className}`.trim()}>
      {header}
      {searchBar}
      <StaffPanel bodyClassName="staff-table-wrap">{table}</StaffPanel>
      {createModal}
      {editModal}
      {additionalModals &&
        additionalModals.map((modal, index) => (
          <div key={`additional-modal-${index}`}>{modal}</div>
        ))}
    </div>
  );
}
