import { useState, useEffect } from 'react';
import axiosClient from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import Select from '../../components/form/Select';

interface Admin {
  id: number;
  login: string;
  phone: string;
  fullName?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const AdminsPage = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    login: '',
    phone: '',
    password: '',
    fullName: '',
    role: 'ADMIN',
    isActive: true,
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/admin');
      setAdmins(response.data);
    } catch (error: any) {
      toast.error('Adminlarni yuklashda xato!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAdmin) {
        const updateData: any = { ...formData };
        if (!updateData.password) delete updateData.password;
        await axiosClient.patch(`/admin/${editingAdmin.id}`, updateData);
        toast.success('Admin yangilandi!');
      } else {
        await axiosClient.post('/admin/register', formData);
        toast.success("Admin qo'shildi!");
      }
      fetchAdmins();
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;

    try {
      await axiosClient.delete(`/admin/${id}`);
      toast.success("Admin o'chirildi!");
      fetchAdmins();
    } catch (error: any) {
      toast.error("O'chirishda xato!");
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      login: admin.login,
      phone: admin.phone,
      password: '',
      fullName: admin.fullName || '',
      role: admin.role,
      isActive: admin.isActive,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      login: '',
      phone: '',
      password: '',
      fullName: '',
      role: 'ADMIN',
      isActive: true,
    });
    setEditingAdmin(null);
  };

  const getRoleText = (role: string) => {
    const roles: { [key: string]: string } = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN: 'Admin',
      MODERATOR: 'Moderator',
    };
    return roles[role] || role;
  };

  return (
    <>
      <PageMeta title="Adminlar" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Adminlar</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            + Yangi Admin
          </button>
        </div>

        {loading && <div className="text-center py-4">Yuklanmoqda...</div>}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  To'liq Ism
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Holat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {admin.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {admin.login}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {admin.fullName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {admin.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {getRoleText(admin.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        admin.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {admin.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(admin)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDelete(admin.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingAdmin ? 'Adminni Tahrirlash' : 'Yangi Admin'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Login</label>
                  <input
                    type="text"
                    value={formData.login}
                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    required
                    disabled={!!editingAdmin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To'liq Ism</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefon</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    required
                    placeholder="+998901234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Parol {editingAdmin && '(Bo\'sh qoldiring, o\'zgartirish kerak bo\'lmasa)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    required={!editingAdmin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <Select
                    options={[
                      { value: 'ADMIN', label: 'Admin' },
                      { value: 'MODERATOR', label: 'Moderator' },
                      { value: 'SUPER_ADMIN', label: 'Super Admin' },
                    ]}
                    defaultValue={formData.role}
                    onChange={(value) => setFormData({ ...formData, role: value })}
                    placeholder="Rol tanlang"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium">Faol</label>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50"
                  >
                    {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminsPage;
