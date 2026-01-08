/**
 * Admin Activity Logs Page
 *
 * Comprehensive system activity tracking with:
 * - User activity logs
 * - System events
 * - API requests
 * - Security events
 * - Filtering and search
 * - Export functionality
 */

'use client';

import { useState } from 'react';
import { PermissionGuard } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type LogType = 'all' | 'user' | 'system' | 'api' | 'security';
type LogLevel = 'all' | 'info' | 'warning' | 'error' | 'critical';

type LogEntry = {
  id: string;
  timestamp: Date;
  type: LogType;
  level: LogLevel;
  user?: string;
  action: string;
  description: string;
  ip_address?: string;
  metadata?: Record<string, any>;
};

export default function AdminLogsPage() {
  const [logType, setLogType] = useState<LogType>('all');
  const [logLevel, setLogLevel] = useState<LogLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock log data - replace with actual API call
  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60000),
      type: 'user',
      level: 'info',
      user: 'admin@paywe.com',
      action: 'USER_LOGIN',
      description: 'User logged in successfully',
      ip_address: '192.168.1.1',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60000),
      type: 'system',
      level: 'warning',
      action: 'EMAIL_SERVICE_DEGRADED',
      description: 'Email service response time increased',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60000),
      type: 'api',
      level: 'info',
      user: 'api_key_12345',
      action: 'API_REQUEST',
      description: 'GET /api/v1/transactions',
      ip_address: '203.0.113.45',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 45 * 60000),
      type: 'security',
      level: 'error',
      user: 'unknown@example.com',
      action: 'LOGIN_FAILED',
      description: 'Failed login attempt - invalid credentials',
      ip_address: '198.51.100.23',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 60 * 60000),
      type: 'user',
      level: 'info',
      user: 'admin@paywe.com',
      action: 'KYC_APPROVED',
      description: 'KYC document approved for organization ORG-123',
      ip_address: '192.168.1.1',
    },
  ];

  const logTypes: { value: LogType; label: string; icon: string }[] = [
    { value: 'all', label: 'All Logs', icon: '📋' },
    { value: 'user', label: 'User Activity', icon: '👤' },
    { value: 'system', label: 'System Events', icon: '⚙️' },
    { value: 'api', label: 'API Requests', icon: '🔌' },
    { value: 'security', label: 'Security', icon: '🔒' },
  ];

  const levelColors = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    critical: 'bg-purple-100 text-purple-800',
  };

  const levelIcons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    critical: '🚨',
  };

  const filteredLogs = logs.filter((log) => {
    if (logType !== 'all' && log.type !== logType) return false;
    if (logLevel !== 'all' && log.level !== logLevel) return false;
    if (searchQuery && !log.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.action.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <PermissionGuard permission={PERMISSIONS.MANAGE_SETTINGS}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
            <p className="text-gray-600 mt-1">
              Monitor system activity, user actions, and security events
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <span className="mr-2">⬇️</span>
              Export Logs
            </Button>
            <Button variant="outline">
              <span className="mr-2">🔄</span>
              Refresh
            </Button>
          </div>
        </div>

        {/* Log Type Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {logTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setLogType(type.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                logType === type.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Log Level
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value as LogLevel)}
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
              </div>
              <span className="text-2xl">📋</span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredLogs.filter(l => l.level === 'error').length}
                </p>
              </div>
              <span className="text-2xl">❌</span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredLogs.filter(l => l.level === 'warning').length}
                </p>
              </div>
              <span className="text-2xl">⚠️</span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Security Events</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredLogs.filter(l => l.type === 'security').length}
                </p>
              </div>
              <span className="text-2xl">🔒</span>
            </div>
          </Card>
        </div>

        {/* Logs List */}
        {filteredLogs.length === 0 ? (
          <Card className="p-12 text-center">
            <span className="text-6xl mb-4 block">📋</span>
            <h2 className="text-2xl font-semibold mb-2">No Logs Found</h2>
            <p className="text-gray-600">
              {searchQuery || logType !== 'all' || logLevel !== 'all'
                ? 'Try adjusting your filters'
                : 'No activity logs available yet'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-2xl">
                    {levelIcons[log.level as keyof typeof levelIcons]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{log.action}</h3>
                          <Badge className={levelColors[log.level as keyof typeof levelColors]}>
                            {log.level.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {log.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{log.description}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500 flex-shrink-0">
                        {format(log.timestamp, 'MMM dd, HH:mm:ss')}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {log.user && (
                        <span className="flex items-center gap-1">
                          <span>👤</span>
                          {log.user}
                        </span>
                      )}
                      {log.ip_address && (
                        <span className="flex items-center gap-1">
                          <span>🌐</span>
                          {log.ip_address}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Details →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredLogs.length > 0 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page 1 of 1
            </span>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
