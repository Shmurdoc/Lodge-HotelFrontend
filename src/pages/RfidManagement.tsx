import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Fingerprint, Plus, Search, Edit, Eye, ToggleLeft, ToggleRight,
  Clock, Calendar, CheckCircle, XCircle, AlertTriangle, AlertCircle,
  QrCode, X, Trash2, Download, Users, Shield, Key
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { RfidTag, AttendanceRecord } from '../store/useAppStore';
import { RoomsDataContainer } from '@/components/containers/RoomsDataContainer';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-gray-500/20 text-gray-400',
  lost: 'bg-red-500/20 text-red-400',
  blocked: 'bg-orange-500/20 text-orange-400',
};

function RfidManagementContent() {
  const {
    rfidTags,
    users,
    guests,
    rooms,
    attendance,
    addRfidTag,
    updateRfidTag,
    deleteRfidTag,
    addAttendance,
    addAuditLog,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'tags' | 'attendance'>('tags');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<RfidTag | null>(null);
  const [showEditModal, setShowEditModal] = useState<RfidTag | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<RfidTag | null>(null);
  const [showManualCheckin, setShowManualCheckin] = useState(false);

  // Create form state
  const [createTagNumber, setCreateTagNumber] = useState('');
  const [createAutoGenerate, setCreateAutoGenerate] = useState(true);
  const [createAssignTo, setCreateAssignTo] = useState('');
  const [createAssignType, setCreateAssignType] = useState<'staff' | 'guest'>('staff');
  const [createAccessLevel, setCreateAccessLevel] = useState('Full Access');
  const [createRoomAccess, setCreateRoomAccess] = useState<string[]>([]);
  const [createNotes, setCreateNotes] = useState('');

  // Edit form state
  const [editAssignTo, setEditAssignTo] = useState('');
  const [editAssignName, setEditAssignName] = useState('');
  const [editAccessLevel, setEditAccessLevel] = useState('');
  const [editStatus, setEditStatus] = useState<RfidTag['status']>('active');
  const [editNotes, setEditNotes] = useState('');

  // Manual check-in state
  const [checkinUserId, setCheckinUserId] = useState('');

  // Attendance filter state
  const [attendanceDateFilter, setAttendanceDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceUserFilter, setAttendanceUserFilter] = useState('all');

  const filteredTags = useMemo(() => {
    return rfidTags.filter(tag => {
      const matchesSearch = tag.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tag.userName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || tag.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rfidTags, searchQuery, statusFilter]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter(a => {
      const matchesDate = a.date === attendanceDateFilter;
      const matchesUser = attendanceUserFilter === 'all' || a.userId === attendanceUserFilter;
      return matchesDate && matchesUser;
    });
  }, [attendance, attendanceDateFilter, attendanceUserFilter]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayAttendance = useMemo(() => attendance.filter(a => a.date === todayStr), [attendance, todayStr]);
  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;
  const absentCount = todayAttendance.filter(a => a.status === 'absent').length;

  // Stats
  const stats = useMemo(() => ({
    total: rfidTags.length,
    active: rfidTags.filter(t => t.status === 'active').length,
    inactive: rfidTags.filter(t => t.status === 'inactive').length,
    lost: rfidTags.filter(t => t.status === 'lost').length,
    blocked: rfidTags.filter(t => t.status === 'blocked').length,
  }), [rfidTags]);

  const handleToggleStatus = useCallback((tag: RfidTag) => {
    const newStatus = tag.status === 'active' ? 'inactive' : 'active';
    updateRfidTag(tag.id, { status: newStatus });
    addAuditLog({
      id: `LOG-${Date.now()}`,
      action: 'update',
      entityType: 'user',
      entityId: tag.id,
      entityName: `RFID Tag ${tag.tagNumber}`,
      userId: 'system',
      userName: 'System',
      userRole: 'system',
      details: `RFID tag ${tag.tagNumber} status changed from ${tag.status} to ${newStatus}`,
      oldValue: tag.status,
      newValue: newStatus,
      timestamp: new Date().toISOString(),
    });
    toast.success(`Tag ${tag.tagNumber} ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
  }, [updateRfidTag, addAuditLog]);

  const handleDeleteTag = useCallback((tag: RfidTag) => {
    deleteRfidTag(tag.id);
    addAuditLog({
      id: `LOG-${Date.now()}`,
      action: 'delete',
      entityType: 'user',
      entityId: tag.id,
      entityName: `RFID Tag ${tag.tagNumber}`,
      userId: 'system',
      userName: 'System',
      userRole: 'system',
      details: `RFID tag ${tag.tagNumber} assigned to ${tag.userName} was deleted`,
      timestamp: new Date().toISOString(),
    });
    toast.success(`Tag ${tag.tagNumber} deleted`);
    setShowDeleteConfirm(null);
  }, [deleteRfidTag, addAuditLog]);

  const handleCreateTag = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const tagNumber = createAutoGenerate
      ? `RFID-${Date.now().toString().slice(-6)}`
      : createTagNumber.trim();

    if (!tagNumber) {
      toast.error('Tag number is required');
      return;
    }
    if (!createAssignTo) {
      toast.error('Please select a person to assign the tag to');
      return;
    }

    let assigneeName = '';
    if (createAssignType === 'staff') {
      const user = users.find(u => u.id === createAssignTo);
      assigneeName = user?.name ?? '';
    } else {
      const guest = guests.find(g => g.id === createAssignTo);
      assigneeName = guest?.name ?? '';
    }

    if (!assigneeName) {
      toast.error('Selected person not found');
      return;
    }

    const newTag: RfidTag = {
      id: `rfid-${Date.now()}`,
      tagNumber,
      userId: createAssignTo,
      userName: assigneeName,
      status: 'active',
      accessLevel: createRoomAccess.length > 0
        ? `Rooms: ${createRoomAccess.join(', ')}`
        : createAccessLevel,
      createdAt: new Date().toISOString().split('T')[0],
      notes: createNotes || undefined,
    };

    addRfidTag(newTag);
    addAuditLog({
      id: `LOG-${Date.now()}`,
      action: 'create',
      entityType: 'user',
      entityId: newTag.id,
      entityName: `RFID Tag ${tagNumber}`,
      userId: 'system',
      userName: 'System',
      userRole: 'system',
      details: `RFID tag ${tagNumber} created and assigned to ${assigneeName} (${createAssignType})`,
      timestamp: new Date().toISOString(),
    });
    toast.success(`RFID tag ${tagNumber} created for ${assigneeName}`);

    // Reset form
    setCreateTagNumber('');
    setCreateAutoGenerate(true);
    setCreateAssignTo('');
    setCreateAssignType('staff');
    setCreateAccessLevel('Full Access');
    setCreateRoomAccess([]);
    setCreateNotes('');
    setShowCreateModal(false);
  }, [createAutoGenerate, createTagNumber, createAssignTo, createAssignType, createAccessLevel, createRoomAccess, createNotes, users, guests, addRfidTag, addAuditLog]);

  const openEditModal = useCallback((tag: RfidTag) => {
    setEditAssignTo(tag.userId);
    setEditAssignName(tag.userName);
    setEditAccessLevel(tag.accessLevel);
    setEditStatus(tag.status);
    setEditNotes(tag.notes ?? '');
    setShowEditModal(tag);
  }, []);

  const handleEditSave = useCallback(() => {
    if (!showEditModal) return;

    const assigneeName = editAssignTo
      ? (users.find(u => u.id === editAssignTo)?.name ?? guests.find(g => g.id === editAssignTo)?.name ?? editAssignName)
      : editAssignName;

    updateRfidTag(showEditModal.id, {
      userId: editAssignTo || showEditModal.userId,
      userName: assigneeName || showEditModal.userName,
      accessLevel: editAccessLevel,
      status: editStatus,
      notes: editNotes || undefined,
    });
    addAuditLog({
      id: `LOG-${Date.now()}`,
      action: 'update',
      entityType: 'user',
      entityId: showEditModal.id,
      entityName: `RFID Tag ${showEditModal.tagNumber}`,
      userId: 'system',
      userName: 'System',
      userRole: 'system',
      details: `RFID tag ${showEditModal.tagNumber} updated: assignee=${assigneeName}, access=${editAccessLevel}, status=${editStatus}`,
      timestamp: new Date().toISOString(),
    });
    toast.success(`Tag ${showEditModal.tagNumber} updated successfully`);
    setShowEditModal(null);
  }, [showEditModal, editAssignTo, editAssignName, editAccessLevel, editStatus, editNotes, users, guests, updateRfidTag, addAuditLog]);

  const handleManualCheckin = useCallback(() => {
    if (!checkinUserId) {
      toast.error('Please select a user');
      return;
    }
    const user = users.find(u => u.id === checkinUserId);
    if (!user) {
      toast.error('User not found');
      return;
    }

    const now = new Date();
    const hour = now.getHours();
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      checkIn: now.toISOString(),
      date: now.toISOString().split('T')[0],
      status: hour > 8 ? 'late' : 'present',
    };
    addAttendance(record);
    addAuditLog({
      id: `LOG-${Date.now()}`,
      action: 'create',
      entityType: 'user',
      entityId: record.id,
      entityName: `Attendance ${record.id}`,
      userId: 'system',
      userName: 'System',
      userRole: 'system',
      details: `Manual check-in recorded for ${user.name} at ${now.toLocaleTimeString()} (${record.status})`,
      timestamp: now.toISOString(),
    });
    toast.success(`${user.name} checked in (${record.status})`);
    setCheckinUserId('');
    setShowManualCheckin(false);
  }, [checkinUserId, users, addAttendance, addAuditLog]);

  const handleQuickCheckIn = useCallback((userId: string, userName: string) => {
    const now = new Date();
    const hour = now.getHours();
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId,
      userName,
      checkIn: now.toISOString(),
      date: now.toISOString().split('T')[0],
      status: hour > 8 ? 'late' : 'present',
    };
    addAttendance(record);
    addAuditLog({
      id: `LOG-${Date.now()}`,
      action: 'create',
      entityType: 'user',
      entityId: record.id,
      entityName: `Attendance ${record.id}`,
      userId: 'system',
      userName: 'System',
      userRole: 'system',
      details: `Quick check-in: ${userName} at ${now.toLocaleTimeString()} (${record.status})`,
      timestamp: now.toISOString(),
    });
    toast.success(`${userName} checked in (${record.status})`);
  }, [addAttendance, addAuditLog]);

  const handleExportCsv = useCallback(() => {
    const headers = ['Tag Number', 'Assigned To', 'User ID', 'Status', 'Access Level', 'Created At', 'Last Used', 'Notes'];
    const rows = rfidTags.map(tag => [
      tag.tagNumber,
      tag.userName,
      tag.userId,
      tag.status,
      tag.accessLevel,
      tag.createdAt,
      tag.lastUsed ?? 'Never',
      tag.notes ?? '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rfid-tags-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('RFID tags exported to CSV');
  }, [rfidTags]);

  const handleToggleRoomAccess = useCallback((roomNumber: string) => {
    setCreateRoomAccess(prev =>
      prev.includes(roomNumber)
        ? prev.filter(r => r !== roomNumber)
        : [...prev, roomNumber]
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">RFID & Attendance</h1>
          <p className="text-muted-foreground">Manage RFID tags and track staff attendance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowManualCheckin(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            Manual Check-in
          </button>
          <button
            onClick={() => {
              setCreateTagNumber('');
              setCreateAutoGenerate(true);
              setCreateAssignTo('');
              setCreateAssignType('staff');
              setCreateAccessLevel('Full Access');
              setCreateRoomAccess([]);
              setCreateNotes('');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Tag
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/30">
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'tags'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          RFID Tags ({rfidTags.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Attendance
        </button>
      </div>

      {activeTab === 'tags' ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass rounded-xl p-4 hover-lift hover-glow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Tags</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-4 hover-lift hover-glow border border-green-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-4 hover-lift hover-glow border border-gray-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inactive}</p>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-4 hover-lift hover-glow border border-red-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.lost}</p>
                  <p className="text-sm text-muted-foreground">Lost</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-4 hover-lift hover-glow border border-orange-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.blocked}</p>
                  <p className="text-sm text-muted-foreground">Blocked</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by tag number or assigned to..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="lost">Lost</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {/* Tags Table */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border/30">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tag ID</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned To</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Access Level</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Used</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTags.length > 0 ? filteredTags.map((tag) => (
                    <tr key={tag.id} className="border-b border-border/20 hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Fingerprint className="w-4 h-4 text-primary" />
                          <span className="font-medium font-mono text-sm">{tag.tagNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xs font-bold">
                            {tag.userName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm">{tag.userName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{tag.accessLevel}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${statusColors[tag.status] || 'bg-gray-500/20 text-gray-400'}`}>
                          {tag.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{tag.createdAt}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {tag.lastUsed ? new Date(tag.lastUsed).toLocaleString() : 'Never'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowViewModal(tag)}
                            className="p-1.5 hover:bg-muted rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => openEditModal(tag)}
                            className="p-1.5 hover:bg-muted rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(tag)}
                            className="p-1.5 hover:bg-muted rounded transition-colors"
                            title={tag.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {tag.status === 'active' ? (
                              <ToggleRight className="w-4 h-4 text-green-400" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(tag)}
                            className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No RFID tags found matching your search
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Attendance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-4 text-center hover-lift hover-glow border border-green-500/30">
              <p className="text-3xl font-bold text-green-400">{presentCount}</p>
              <p className="text-sm text-muted-foreground">Present Today</p>
            </div>
            <div className="glass rounded-xl p-4 text-center hover-lift hover-glow border border-yellow-500/30">
              <p className="text-3xl font-bold text-yellow-400">{lateCount}</p>
              <p className="text-sm text-muted-foreground">Late Today</p>
            </div>
            <div className="glass rounded-xl p-4 text-center hover-lift hover-glow border border-red-500/30">
              <p className="text-3xl font-bold text-red-400">{absentCount}</p>
              <p className="text-sm text-muted-foreground">Absent Today</p>
            </div>
            <div className="glass rounded-xl p-4 text-center hover-lift hover-glow">
              <p className="text-3xl font-bold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total Staff</p>
            </div>
          </div>

          {/* Quick Check-in Kiosk */}
          <div className="glass rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Quick Check-in Kiosk
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click a staff member to record their check-in
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {users.map((user) => {
                const hasCheckedIn = todayAttendance.some(a => a.userId === user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => !hasCheckedIn && handleQuickCheckIn(user.id, user.name)}
                    disabled={hasCheckedIn}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      hasCheckedIn
                        ? 'bg-green-500/20 border-green-500/30 cursor-not-allowed'
                        : 'bg-muted/30 border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                    <div className={`mt-3 text-sm ${hasCheckedIn ? 'text-green-400' : 'text-muted-foreground'}`}>
                      {hasCheckedIn ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Checked In
                        </span>
                      ) : (
                        'Click to check in'
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attendance Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={attendanceDateFilter}
                onChange={(e) => setAttendanceDateFilter(e.target.value)}
                className="px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
            <select
              value={attendanceUserFilter}
              onChange={(e) => setAttendanceUserFilter(e.target.value)}
              className="px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            >
              <option value="all">All Staff</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Attendance Table */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border/30 flex items-center justify-between">
              <h3 className="font-semibold">
                Attendance Records ({attendanceDateFilter === todayStr ? 'Today' : attendanceDateFilter})
              </h3>
              <span className="text-sm text-muted-foreground">
                {filteredAttendance.length} record(s)
              </span>
            </div>
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border/30">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check-in Time</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check-out Time</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.length > 0 ? filteredAttendance.map((record) => (
                  <tr key={record.id} className="border-b border-border/20 hover:bg-primary/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xs font-bold">
                          {record.userName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium">{record.userName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${
                        record.status === 'present' ? 'bg-green-500/20 text-green-400' :
                        record.status === 'late' ? 'bg-yellow-500/20 text-yellow-400' :
                        record.status === 'absent' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {record.status === 'present' ? <CheckCircle className="w-3 h-3" /> :
                         record.status === 'late' ? <Clock className="w-3 h-3" /> :
                         record.status === 'absent' ? <XCircle className="w-3 h-3" /> :
                         <AlertTriangle className="w-3 h-3" />}
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No attendance records found for this date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* View Tag Modal */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowViewModal(null)} />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative z-10 glass-strong rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold gradient-text">Tag Details</h2>
                  <button onClick={() => setShowViewModal(null)} className="p-2 hover:bg-muted rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Fingerprint className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold font-mono">{showViewModal.tagNumber}</h3>
                  <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full mt-2 ${statusColors[showViewModal.status]}`}>
                    {showViewModal.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Assigned To</span>
                    <span className="text-sm font-medium">{showViewModal.userName}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">User ID</span>
                    <span className="text-sm font-medium font-mono">{showViewModal.userId}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Access Level</span>
                    <span className="text-sm font-medium">{showViewModal.accessLevel}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium">{showViewModal.createdAt}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Last Used</span>
                    <span className="text-sm font-medium">
                      {showViewModal.lastUsed ? new Date(showViewModal.lastUsed).toLocaleString() : 'Never'}
                    </span>
                  </div>
                  {showViewModal.expiresAt && (
                    <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Expires</span>
                      <span className="text-sm font-medium">{showViewModal.expiresAt}</span>
                    </div>
                  )}
                  {showViewModal.notes && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground block mb-1">Notes</span>
                      <span className="text-sm">{showViewModal.notes}</span>
                    </div>
                  )}
                </div>

                {/* Scan History (simulated from recent attendance) */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Recent Activity
                  </h4>
                  {(() => {
                    const userAttendance = attendance
                      .filter(a => a.userId === showViewModal.userId)
                      .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
                      .slice(0, 5);
                    return userAttendance.length > 0 ? (
                      <div className="space-y-2">
                        {userAttendance.map(a => (
                          <div key={a.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg text-sm">
                            <span>{a.date}</span>
                            <span className="text-muted-foreground">
                              {new Date(a.checkIn).toLocaleTimeString()}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              a.status === 'present' ? 'bg-green-500/20 text-green-400' :
                              a.status === 'late' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    );
                  })()}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowViewModal(null);
                      openEditModal(showViewModal);
                    }}
                    className="flex-1 py-2.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleToggleStatus(showViewModal);
                      setShowViewModal(null);
                    }}
                    className="flex-1 py-2.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
                  >
                    {showViewModal.status === 'active' ? (
                      <><ToggleLeft className="w-4 h-4" /> Deactivate</>
                    ) : (
                      <><ToggleRight className="w-4 h-4" /> Activate</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Tag Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditModal(null)} />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative z-10 glass-strong rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold gradient-text">Edit Tag {showEditModal.tagNumber}</h2>
                  <button onClick={() => setShowEditModal(null)} className="p-2 hover:bg-muted rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Assign To</label>
                    <select
                      value={editAssignTo}
                      onChange={(e) => {
                        setEditAssignTo(e.target.value);
                        const u = users.find(u => u.id === e.target.value);
                        const g = guests.find(g => g.id === e.target.value);
                        setEditAssignName(u?.name ?? g?.name ?? '');
                      }}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    >
                      <option value="">Select person...</option>
                      <optgroup label="Staff">
                        {users.map(user => (
                          <option key={`staff-${user.id}`} value={user.id}>{user.name} - {user.role}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Guests">
                        {guests.map(guest => (
                          <option key={`guest-${guest.id}`} value={guest.id}>{guest.name} ({guest.segment})</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Access Level</label>
                    <select
                      value={editAccessLevel}
                      onChange={(e) => setEditAccessLevel(e.target.value)}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    >
                      <option value="Full Access">Full Access</option>
                      <option value="Front Desk">Front Desk</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Finance">Finance</option>
                      <option value="Security">Security</option>
                      <option value="Guest">Guest</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as RfidTag['status'])}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="lost">Lost</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes</label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
                      placeholder="Optional notes..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(null)}
                      className="flex-1 py-2.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleEditSave}
                      className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-lg transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative z-10 glass-strong rounded-2xl shadow-2xl w-full max-w-sm"
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold">Delete RFID Tag</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Are you sure you want to delete tag <strong>{showDeleteConfirm.tagNumber}</strong> assigned to <strong>{showDeleteConfirm.userName}</strong>?
                  </p>
                  <p className="text-xs text-red-400 mt-2">This action cannot be undone.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 py-2.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteTag(showDeleteConfirm)}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete Tag
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Tag Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative z-10 glass-strong rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold gradient-text">Create RFID Tag</h2>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateTag} className="space-y-4">
                  {/* Tag Number */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tag Number</label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="autoGenerate"
                        checked={createAutoGenerate}
                        onChange={(e) => setCreateAutoGenerate(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="autoGenerate" className="text-sm text-muted-foreground">Auto-generate tag ID</label>
                    </div>
                    {!createAutoGenerate && (
                      <input
                        type="text"
                        placeholder="RFID-XXX"
                        value={createTagNumber}
                        onChange={(e) => setCreateTagNumber(e.target.value)}
                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                      />
                    )}
                  </div>

                  {/* Assign Type */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Assign Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setCreateAssignType('staff'); setCreateAssignTo(''); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          createAssignType === 'staff'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <Users className="w-4 h-4 inline mr-1" /> Staff
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCreateAssignType('guest'); setCreateAssignTo(''); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          createAssignType === 'guest'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <Key className="w-4 h-4 inline mr-1" /> Guest
                      </button>
                    </div>
                  </div>

                  {/* Assign To */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Assign To ({createAssignType === 'staff' ? 'Staff Member' : 'Guest'})
                    </label>
                    <select
                      value={createAssignTo}
                      onChange={(e) => setCreateAssignTo(e.target.value)}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    >
                      <option value="">Select {createAssignType}...</option>
                      {createAssignType === 'staff'
                        ? users.map(user => (
                            <option key={user.id} value={user.id}>{user.name} - {user.role}</option>
                          ))
                        : guests.map(guest => (
                            <option key={guest.id} value={guest.id}>{guest.name} ({guest.segment})</option>
                          ))
                      }
                    </select>
                  </div>

                  {/* Access Level */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Access Level</label>
                    <select
                      value={createAccessLevel}
                      onChange={(e) => setCreateAccessLevel(e.target.value)}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    >
                      <option value="Full Access">Full Access</option>
                      <option value="Front Desk">Front Desk</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Finance">Finance</option>
                      <option value="Security">Security</option>
                      <option value="Guest">Guest</option>
                    </select>
                  </div>

                  {/* Room Access Multi-select */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Room Access ({createRoomAccess.length} selected)
                    </label>
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-2 bg-muted/30 rounded-lg border border-border">
                      {rooms.map(room => (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => handleToggleRoomAccess(room.number)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            createRoomAccess.includes(room.number)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {room.number}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes</label>
                    <textarea
                      value={createNotes}
                      onChange={(e) => setCreateNotes(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
                      placeholder="Optional notes..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-2.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-lg transition-all"
                    >
                      Create Tag
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Check-in Modal */}
      <AnimatePresence>
        {showManualCheckin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowManualCheckin(false)} />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative z-10 glass-strong rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold gradient-text">Manual Check-in</h2>
                  <button onClick={() => setShowManualCheckin(false)} className="p-2 hover:bg-muted rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select a staff member for manual attendance check-in
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Staff Member</label>
                    <select
                      value={checkinUserId}
                      onChange={(e) => setCheckinUserId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    >
                      <option value="">Select staff member...</option>
                      {users.map(user => {
                        const alreadyIn = todayAttendance.some(a => a.userId === user.id);
                        return (
                          <option key={user.id} value={user.id} disabled={alreadyIn}>
                            {user.name} - {user.role}{alreadyIn ? ' (Already checked in)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Current time: {new Date().toLocaleTimeString()}
                    {new Date().getHours() > 8 && (
                      <span className="ml-2 text-yellow-400">(will be marked as late)</span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowManualCheckin(false)}
                      className="flex-1 py-2.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleManualCheckin}
                      disabled={!checkinUserId}
                      className={`flex-1 py-2.5 rounded-lg transition-all ${
                        checkinUserId
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      Record Check-in
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Export wrapper for real data + RBAC integration
// ═══════════════════════════════════════════════════════════════════════════════

export default function RfidManagement() {
  return (
    <RoomsDataContainer
      requiredPermission="view:rooms"
      enableRealtime={true}
      render={(props) => <RfidManagementContent {...(props as any)} />}
    />
  );
}
