import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { useRole } from '@/hooks/useRole';
import { BaseCrudService } from '@/integrations';
import { MemberRoles } from '@/entities';
import { Search, Edit2, Check, X, AlertCircle, Loader, Shield } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface UserWithRole {
  memberId: string;
  role: 'client' | 'trainer' | 'admin';
  status: string;
  assignmentDate?: Date | string;
}

export default function AdminDashboard() {
  const { member } = useMember();
  const { isAdmin, isLoading: roleLoading } = useRole();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<'client' | 'trainer' | 'admin'>('client');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load all users and their roles
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const { items } = await BaseCrudService.getAll<MemberRoles>('memberroles');
        
        const userList: UserWithRole[] = items.map(item => ({
          memberId: item.memberId || '',
          role: (item.role as 'client' | 'trainer' | 'admin') || 'client',
          status: item.status || 'active',
          assignmentDate: item.assignmentDate
        }));
        
        setUsers(userList);
        setFilteredUsers(userList);
      } catch (error) {
        console.error('Error loading users:', error);
        setMessage({ type: 'error', text: 'Failed to load users' });
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user =>
      user.memberId.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Handle role change
  const handleRoleChange = async (memberId: string, role: 'client' | 'trainer' | 'admin') => {
    setIsSaving(true);
    try {
      // Find the existing role entry
      const { items } = await BaseCrudService.getAll<MemberRoles>('memberroles');
      const existingRole = items.find(mr => mr.memberId === memberId);

      if (existingRole) {
        // Update existing role
        await BaseCrudService.update<MemberRoles>('memberroles', {
          _id: existingRole._id,
          role,
          status: 'active',
        });
      } else {
        // Create new role entry
        const newRoleEntry: MemberRoles = {
          _id: crypto.randomUUID(),
          memberId,
          role,
          assignmentDate: new Date(),
          status: 'active',
        };
        await BaseCrudService.create('memberroles', newRoleEntry);
      }

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.memberId === memberId ? { ...user, role } : user
        )
      );

      setMessage({ type: 'success', text: `User role updated to ${role}` });
      setEditingUserId(null);
    } catch (error) {
      console.error('Error updating role:', error);
      setMessage({ type: 'error', text: 'Failed to update user role' });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if user is admin
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-soft-white flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-soft-bronze" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-soft-white">
      {/* Header */}
      <section className="py-12 px-8 lg:px-20 bg-warm-sand-beige border-b border-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-soft-bronze" />
            <h1 className="font-heading text-5xl font-bold text-charcoal-black">
              Admin Dashboard
            </h1>
          </div>
          <p className="font-paragraph text-lg text-warm-grey">
            Manage user roles and permissions
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-8 lg:px-20">
        <div className="max-w-[100rem] mx-auto">
          {/* Message Alert */}
          {message && (
            <div
              className={`mb-8 p-4 rounded-lg flex gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="text-green-600 flex-shrink-0" size={20} />
              ) : (
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              )}
              <p
                className={`font-paragraph text-sm ${
                  message.type === 'success'
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Search Section */}
          <div className="mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-grey w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Member ID or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-lg"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader className="w-8 h-8 animate-spin text-soft-bronze" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16 px-8">
                <AlertCircle className="w-12 h-12 text-warm-grey mx-auto mb-4" />
                <p className="font-paragraph text-lg text-warm-grey">
                  {searchQuery ? 'No users found matching your search' : 'No users found'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-warm-sand-beige bg-warm-sand-beige/30">
                      <th className="text-left py-4 px-6 font-heading text-sm font-bold text-charcoal-black">
                        Member ID
                      </th>
                      <th className="text-left py-4 px-6 font-heading text-sm font-bold text-charcoal-black">
                        Current Role
                      </th>
                      <th className="text-left py-4 px-6 font-heading text-sm font-bold text-charcoal-black">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 font-heading text-sm font-bold text-charcoal-black">
                        Assigned Date
                      </th>
                      <th className="text-center py-4 px-6 font-heading text-sm font-bold text-charcoal-black">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.memberId}
                        className="border-b border-warm-sand-beige hover:bg-warm-sand-beige/20 transition-colors"
                      >
                        <td className="py-4 px-6 font-paragraph text-base text-charcoal-black">
                          <code className="bg-warm-sand-beige/50 px-3 py-1 rounded text-sm">
                            {user.memberId}
                          </code>
                        </td>
                        <td className="py-4 px-6">
                          {editingUserId === user.memberId ? (
                            <select
                              value={newRole}
                              onChange={(e) =>
                                setNewRole(e.target.value as 'client' | 'trainer' | 'admin')
                              }
                              className="px-3 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none font-paragraph text-base"
                            >
                              <option value="client">Client</option>
                              <option value="trainer">Trainer</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                                user.role === 'admin'
                                  ? 'bg-soft-bronze text-soft-white'
                                  : user.role === 'trainer'
                                  ? 'bg-soft-bronze/20 text-soft-bronze'
                                  : 'bg-warm-sand-beige text-charcoal-black'
                              }`}
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-paragraph text-base text-warm-grey">
                          <span className="inline-block px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200">
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-paragraph text-base text-warm-grey">
                          {user.assignmentDate
                            ? new Date(user.assignmentDate).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {editingUserId === user.memberId ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  handleRoleChange(user.memberId, newRole)
                                }
                                disabled={isSaving}
                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                                title="Save"
                              >
                                {isSaving ? (
                                  <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check size={18} />
                                )}
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                disabled={isSaving}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                title="Cancel"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingUserId(user.memberId);
                                setNewRole(user.role);
                              }}
                              className="p-2 rounded-lg bg-warm-sand-beige text-charcoal-black hover:bg-soft-bronze hover:text-soft-white transition-colors"
                              title="Edit role"
                            >
                              <Edit2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {[
              {
                label: 'Total Users',
                value: users.length,
                color: 'bg-warm-sand-beige',
              },
              {
                label: 'Trainers',
                value: users.filter(u => u.role === 'trainer').length,
                color: 'bg-soft-bronze/10',
              },
              {
                label: 'Clients',
                value: users.filter(u => u.role === 'client').length,
                color: 'bg-soft-bronze/20',
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`${stat.color} rounded-2xl p-8 border border-warm-sand-beige`}
              >
                <p className="font-paragraph text-sm text-warm-grey mb-2">
                  {stat.label}
                </p>
                <p className="font-heading text-4xl font-bold text-charcoal-black">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
