'use client';

import { useCallback, useEffect, useState } from 'react';
import 'react-calendar-heatmap/dist/styles.css';
import ThemeToggle from './components/ThemeToggle';

// Types
interface User {
  id: number;
  name: string;
  initials: string;
  color: string;
}

interface CoffeeBean {
  id: number;
  name: string;
  origin: string | null;
  roastLevel: string | null;
  notes: string | null;
}

interface DrinkingRecord {
  id: number;
  makerId: number | null;
  drinkerIds: number[];
  drinkers: Array<{ id: number; name: string; initials: string; color: string }>;
  beanId: number | null;
  cups: number;
  notes: string | null;
  recordedAt: string;
  makerName: string | null;
  makerInitials: string | null;
  makerColor: string | null;
  beanName: string | null;
}

interface Stats {
  today: number;
  week: number;
  month: number;
}

interface DailyStats {
  daily: Array<{ date: string; cups: number }>;
}

// ============================================
// Main App Component
// ============================================
export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [records, setRecords] = useState<DrinkingRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [usersRes, beansRes, recordsRes, statsRes, dailyRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/beans'),
        fetch('/api/drinking?limit=10'),
        fetch('/api/stats'),
        fetch('/api/stats?daily=true&days=30'),
      ]);
      
      setUsers(await usersRes.json());
      setBeans(await beansRes.json());
      setRecords(await recordsRes.json());
      setStats(await statsRes.json());
      setDailyStats(await dailyRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRecordSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
    fetchData();
  };

  return (
    <div className="app-container compact">
      {/* Header */}
      <header className="header compact-header">
        <div className="logo">
          <span className="logo-icon">☕</span>
          <span>Espresso</span>
        </div>
        <ThemeToggle />
      </header>

      {/* 3-Area Dashboard */}
      <main className="dashboard-grid">
        {/* Stats Area */}
        <StatsArea stats={stats} dailyStats={dailyStats} />

        {/* Recording Area */}
        <RecordingArea
          users={users}
          beans={beans}
          onRecordSuccess={handleRecordSuccess}
        />

        {/* Manage Area */}
        <ManageArea
          users={users}
          beans={beans}
          records={records}
          onRefresh={fetchData}
        />
      </main>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-icon">✓</div>
          <div className="success-text">Recorded!</div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Stats Area
// ============================================
import CalendarHeatmap from 'react-calendar-heatmap';
import StatsChart from './components/StatsChart';

interface StatsAreaProps {
  stats: Stats | null;
  dailyStats: DailyStats | null;
}

function StatsArea({ stats, dailyStats }: StatsAreaProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'heatmap'>('chart');

  return (
    <section className="dashboard-section stats-section">
      {/* Compact Stats Row */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{stats?.today || 0}</span>
          <span className="stat-label">Today</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">{stats?.week || 0}</span>
          <span className="stat-label">Week</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">{stats?.month || 0}</span>
          <span className="stat-label">Month</span>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-toggle" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button
          className={`toggle-btn ${viewMode === 'chart' ? 'active' : ''}`}
          onClick={() => setViewMode('chart')}
          style={{ 
             background: 'none', 
             border: 'none', 
             cursor: 'pointer', 
             opacity: viewMode === 'chart' ? 1 : 0.5,
             fontSize: '1.2rem'
          }}
          title="Line Chart"
        >
          📈
        </button>
        <button
          className={`toggle-btn ${viewMode === 'heatmap' ? 'active' : ''}`}
          onClick={() => setViewMode('heatmap')}
          style={{ 
             background: 'none', 
             border: 'none', 
             cursor: 'pointer', 
             opacity: viewMode === 'heatmap' ? 1 : 0.5,
             fontSize: '1.2rem',
             marginLeft: '8px'
          }}
          title="Heatmap"
        >
          📅
        </button>
      </div>

      {viewMode === 'chart' ? (
        <StatsChart data={dailyStats?.daily || []} />
      ) : (
        <Heatmap data={dailyStats?.daily || []} />
      )}
    </section>
  );
}

// ============================================
// Heatmap Component
// ============================================
interface HeatmapProps {
  data: Array<{ date: string; cups: number }>;
}

function Heatmap({ data }: HeatmapProps) {
  const maxCups = Math.max(...data.map(d => d.cups), 1);
  const dataMap = new Map(data.map(d => [d.date, d.cups]));
  
  // Last 3 months (approx 90 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 90);

  // Prepare data for library
  const heatmapValues = Array.from(dataMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <div className="github-heatmap" style={{ height: '140px' }}>
         <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={heatmapValues}
            classForValue={(value: any) => {
              if (!value || value.count === 0) {
                return 'color-empty';
              }
              const intensity = Math.min(Math.ceil((value.count / maxCups) * 4), 4);
              return `color-scale-${intensity}`;
            }}
            tooltipDataAttrs={(value: any): any => {
               if (!value || !value.date) { 
                 return { 'data-tooltip': 'No records' }; 
               }
               return {
                'data-tooltip': `${value.date}: ${value.count} cups`,
              };
            }}
            showWeekdayLabels={true}
          />
    </div>
  );
}

// ... (RecordingArea)

// ... (ManageArea modifications below)


// RecordingArea
interface RecordingAreaProps {
  users: User[];
  beans: CoffeeBean[];
  onRecordSuccess: () => void;
}

function RecordingArea({ users, beans, onRecordSuccess }: RecordingAreaProps) {
  const [cups, setCups] = useState(1);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]); // First is maker, rest are drinkers
  const [selectedBeanId, setSelectedBeanId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleUser = (userId: number) => {
    setSelectedUserIds(prev => {
      const newSelection = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      
      // Auto-update cups based on selection count, but only if selection is non-empty
      if (newSelection.length > 0) {
        setCups(newSelection.length);
      }
      
      return newSelection;
    });
  };

  const handleSubmit = async () => {
    if (cups < 1) return;
    
    setIsSubmitting(true);
    try {
      const makerId = selectedUserIds.length > 0 ? selectedUserIds[0] : null;
      const drinkerIds = selectedUserIds.length > 1 ? selectedUserIds.slice(1) : null;
      
      const response = await fetch('/api/drinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cups,
          makerId,
          beanId: selectedBeanId,
          drinkerIds,
        }),
      });

      if (response.ok) {
        setCups(1);
        setSelectedUserIds([]);
        setSelectedBeanId(null);
        onRecordSuccess();
      }
    } catch (error) {
      console.error('Error recording:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="dashboard-section recording-section">
      {/* People Selection - First is maker, rest are drinkers */}
      <div className="selection-group">
        <div className="selection-label">👥 People <span className="label-hint">(1st = maker)</span></div>
        <div className="chips-grid">
          {users.map((user) => {
            const isSelected = selectedUserIds.includes(user.id);
            const isMaker = selectedUserIds[0] === user.id;
            // Show emoji only when selected. Maker gets chef, others get cup (or nothing, request said "drinking emoji") on name
            
            return (
              <button
                key={user.id}
                className={`chip ${isSelected ? 'selected' : ''} ${isMaker ? 'maker' : ''}`}
                onClick={() => toggleUser(user.id)}
                style={{ 
                  borderColor: isSelected ? user.color : undefined,
                  backgroundColor: isSelected ? `${user.color}15` : undefined,
                }}
              >
                {/* Name logic: Emoji + Text */}
                <span className="chip-text">
                  {isSelected && (
                    <span style={{ marginRight: '6px' }}>
                      {isMaker ? '👨‍🍳' : '☕'}
                    </span>
                  )}
                  {user.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bean Selection */}
      <div className="selection-group">
        <div className="selection-label">🫘 Beans</div>
        <div className="chips-grid">
          {beans.map((bean) => (
            <button
              key={bean.id}
              className={`chip ${selectedBeanId === bean.id ? 'selected' : ''}`}
              onClick={() => setSelectedBeanId(selectedBeanId === bean.id ? null : bean.id)}
            >
              <span className="chip-text">{bean.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Row: Compact Stepper + Submit Button */}
      <div className="recording-actions-row">
        {/* Cup Stepper - Compact */}
        <div className="cup-stepper-compact">
          <button
            className="stepper-btn-sm"
            onClick={() => setCups(Math.max(1, cups - 1))}
            disabled={cups <= 1}
          >
            −
          </button>
          <div className="cup-display-sm">
            <span className="cup-num">{cups}</span>
            <span className="cup-lbl">{cups === 1 ? 'cup' : 'cups'}</span>
          </div>
          <button
            className="stepper-btn-sm"
            onClick={() => setCups(cups + 1)}
          >
            +
          </button>
        </div>

        {/* Submit Button */}
        <button
          className="btn btn-primary btn-block record-btn"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? '...' : `Record`}
        </button>
      </div>
    </section>
  );
}

// ============================================
// Manage Area
// ============================================
interface ManageAreaProps {
  users: User[];
  beans: CoffeeBean[];
  records: DrinkingRecord[];
  onRefresh: () => void;
}

function ManageArea({ users, beans, records, onRefresh }: ManageAreaProps) {
  const [expandedSection, setExpandedSection] = useState<'records' | 'users' | 'beans' | null>('records');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'user' | 'bean'>('user');
  const [editingItem, setEditingItem] = useState<User | CoffeeBean | null>(null);

  // ... inside ManageArea ...
  const [deleteRequest, setDeleteRequest] = useState<{ type: 'record' | 'user' | 'bean'; id: number; name?: string } | null>(null);

  const handleDeleteRecord = (id: number) => {
    setDeleteRequest({ type: 'record', id });
  };

  const handleDeleteUser = (user: User) => {
    setDeleteRequest({ type: 'user', id: user.id, name: user.name });
  };

  const handleDeleteBean = (bean: CoffeeBean) => {
    setDeleteRequest({ type: 'bean', id: bean.id, name: bean.name });
  };

  const executeDelete = async () => {
    if (!deleteRequest) return;

    try {
      let endpoint = '';
      if (deleteRequest.type === 'record') endpoint = `/api/drinking?id=${deleteRequest.id}`;
      if (deleteRequest.type === 'user') endpoint = `/api/users?id=${deleteRequest.id}`;
      if (deleteRequest.type === 'bean') endpoint = `/api/beans?id=${deleteRequest.id}`;

      await fetch(endpoint, { method: 'DELETE' });
      onRefresh();
      setDeleteRequest(null);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const openAddModal = (type: 'user' | 'bean') => {
    setModalType(type);
    setEditingItem(null);
    setShowModal(true);
  };

  const openEditModal = (type: 'user' | 'bean', item: User | CoffeeBean) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  return (
    <section className="dashboard-section manage-section">
      {/* ... Accordions ... */}
      
      {/* Records Accordion */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${expandedSection === 'records' ? 'expanded' : ''}`}
          onClick={() => setExpandedSection(expandedSection === 'records' ? null : 'records')}
        >
          <span>📋 Recent Records</span>
          <span className="accordion-badge">{records.length}</span>
          <span className="accordion-arrow">{expandedSection === 'records' ? '▼' : '▶'}</span>
        </button>
        {expandedSection === 'records' && (
          <div className="accordion-content">
            {records.length === 0 ? (
              <div className="empty-mini">No records yet</div>
            ) : (
              <div className="compact-list">
                {records.map((record) => (
                  <div key={record.id} className="compact-record">
                    {/* Simplified Order: Beans, Cups, Chef */}
                    <span className="record-bean" style={{ flex: 1, fontWeight: 500 }}>{record.beanName || 'No beans'}</span>
                    
                    <div className="record-cups-badge" style={{ margin: '0 8px' }}>{record.cups}☕</div>
                    
                    {record.makerInitials && (
                       <span 
                         className="record-maker" 
                         title={`Maker: ${record.makerName}`}
                         style={{ 
                           display: 'inline-flex',
                           alignItems: 'center',
                           gap: '4px',
                           padding: '2px 8px',
                           borderRadius: '12px',
                           fontSize: '0.8rem',
                           fontWeight: 500,
                           color: 'var(--color-text-secondary)',
                           backgroundColor: 'var(--color-bg-tertiary)',
                           border: '1px solid var(--color-border)',
                         }}
                       >
                         <span>👨‍🍳</span> {record.makerInitials}
                       </span>
                    )}
                    
                    <button className="btn-icon" onClick={() => handleDeleteRecord(record.id)} style={{ marginLeft: '8px', opacity: 0.5 }}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Users Accordion */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${expandedSection === 'users' ? 'expanded' : ''}`}
          onClick={() => setExpandedSection(expandedSection === 'users' ? null : 'users')}
        >
          <span>👥 Users</span>
          <span className="accordion-badge">{users.length}</span>
          <span className="accordion-arrow">{expandedSection === 'users' ? '▼' : '▶'}</span>
        </button>
        {expandedSection === 'users' && (
          <div className="accordion-content">
            <button className="btn btn-sm add-btn" onClick={() => openAddModal('user')}>+ Add User</button>
            <div className="compact-list">
              {users.map((user) => (
                <div key={user.id} className="compact-entity">
                  <span className="mini-avatar" style={{ backgroundColor: user.color }}>{user.initials}</span>
                  <span className="entity-name">{user.name}</span>
                  <button className="btn-icon" onClick={() => openEditModal('user', user)}>✏️</button>
                  <button className="btn-icon" onClick={() => handleDeleteUser(user)}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Beans Accordion */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${expandedSection === 'beans' ? 'expanded' : ''}`}
          onClick={() => setExpandedSection(expandedSection === 'beans' ? null : 'beans')}
        >
          <span>🫘 Coffee Beans</span>
          <span className="accordion-badge">{beans.length}</span>
          <span className="accordion-arrow">{expandedSection === 'beans' ? '▼' : '▶'}</span>
        </button>
        {expandedSection === 'beans' && (
          <div className="accordion-content">
            <button className="btn btn-sm add-btn" onClick={() => openAddModal('bean')}>+ Add Bean</button>
            <div className="compact-list">
              {beans.map((bean) => (
                <div key={bean.id} className="compact-entity">
                  <span className="entity-icon">☕</span>
                  <span className="entity-name">{bean.name}</span>
                  <span className="entity-meta">{bean.origin || ''}</span>
                  <button className="btn-icon" onClick={() => openEditModal('bean', bean)}>✏️</button>
                  <button className="btn-icon" onClick={() => handleDeleteBean(bean)}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <Modal
          title={modalType === 'user' 
            ? (editingItem ? 'Edit User' : 'Add User')
            : (editingItem ? 'Edit Bean' : 'Add Bean')
          }
          onClose={() => { setShowModal(false); setEditingItem(null); }}
        >
          {modalType === 'user' ? (
            <UserForm
              user={editingItem as User | null}
              onSave={() => { setShowModal(false); setEditingItem(null); onRefresh(); }}
              onCancel={() => { setShowModal(false); setEditingItem(null); }}
            />
          ) : (
            <BeanForm
              bean={editingItem as CoffeeBean | null}
              onSave={() => { setShowModal(false); setEditingItem(null); onRefresh(); }}
              onCancel={() => { setShowModal(false); setEditingItem(null); }}
            />
          )}
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteRequest && (
        <Modal
          title="Confirm Delete"
          onClose={() => setDeleteRequest(null)}
        >
          <div className="confirmation-content">
            <p>
              Are you sure you want to delete this {deleteRequest.type}
              {deleteRequest.name ? <strong> "{deleteRequest.name}"</strong> : ''}?
            </p>
            <p className="confirmation-warning" style={{ color: 'var(--color-error)', fontSize: '0.9em', marginTop: '10px' }}>
              This action cannot be undone.
            </p>
            <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '20px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setDeleteRequest(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
                onClick={executeDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

    </section>
  );
}

// ============================================
// Modal Component
// ============================================
interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================
// User Form
// ============================================
interface UserFormProps {
  user: User | null;
  onSave: () => void;
  onCancel: () => void;
}

function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [name, setName] = useState(user?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users', {
        method: user ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user?.id, name: name.trim() }),
      });

      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Name</label>
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name..."
          autoFocus
        />
      </div>
      <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!name.trim() || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}

// ============================================
// Bean Form
// ============================================
interface BeanFormProps {
  bean: CoffeeBean | null;
  onSave: () => void;
  onCancel: () => void;
}

function BeanForm({ bean, onSave, onCancel }: BeanFormProps) {
  const [name, setName] = useState(bean?.name || '');
  const [origin, setOrigin] = useState(bean?.origin || '');
  const [roastLevel, setRoastLevel] = useState(bean?.roastLevel || '');
  const [notes, setNotes] = useState(bean?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/beans', {
        method: bean ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bean?.id,
          name: name.trim(),
          origin: origin.trim() || null,
          roastLevel: roastLevel.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving bean:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Name *</label>
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Ethiopia Yirgacheffe"
          autoFocus
        />
      </div>
      <div className="form-group">
        <label className="form-label">Origin</label>
        <input
          type="text"
          className="form-input"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="e.g., Ethiopia"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Roast Level</label>
        <select
          className="select-input"
          value={roastLevel}
          onChange={(e) => setRoastLevel(e.target.value)}
        >
          <option value="">Select roast...</option>
          <option value="Light">Light</option>
          <option value="Medium-Light">Medium-Light</option>
          <option value="Medium">Medium</option>
          <option value="Medium-Dark">Medium-Dark</option>
          <option value="Dark">Dark</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <input
          type="text"
          className="form-input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tasting notes..."
        />
      </div>
      <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!name.trim() || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}

// ============================================
// Utility Functions
// ============================================
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
