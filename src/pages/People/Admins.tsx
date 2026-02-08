import { useState, useEffect } from 'react';
import axiosClient from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import Select from '../../components/form/Select';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import { PencilIcon, DeleteIcon, PlusIcon, CloseIcon } from '../../icons';
import { useModal } from '../../hooks/useModal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';

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
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [deletingAdminId, setDeletingAdminId] = useState<number | null>(null);
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
      closeModal();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingAdminId(id);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAdminId) return;
    try {
      await axiosClient.delete(`/admin/${deletingAdminId}`);
      toast.success("Admin o'chirildi!");
      await fetchAdmins();
      closeDeleteModal();
      setDeletingAdminId(null);
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
    openModal();
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
          <h1 className="text-2xl font-bold dark:text-white">Adminlar</h1>
          <Button
            size="sm"
            variant="primary"
            startIcon={<PlusIcon className="size-5 fill-white" />}
            onClick={() => {
              resetForm();
              openModal();
            }}
          >
            Qo'shish
          </Button>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="mini"
                        variant="outline"
                        onClick={() => handleEdit(admin)}
                      >
                        <PencilIcon className="size-4 fill-black dark:fill-white" />
                      </Button>
                      <Button
                        size="mini"
                        variant="outline"
                        onClick={() => handleDeleteClick(admin.id)}
                      >
                        <DeleteIcon className="size-4 fill-black dark:fill-white" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] m-4">
          <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                {editingAdmin ? 'Adminni Tahrirlash' : 'Yangi Admin'}
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Admin ma'lumotlarini to'ldiring
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="px-2 overflow-y-auto custom-scrollbar">
                <div className="space-y-5">
                  <div>
                    <Label>Login</Label>
                    <Input
                      type="text"
                      value={formData.login}
                      onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                      placeholder="Login"
                      required
                      disabled={!!editingAdmin}
                    />
                  </div>
                  <div>
                    <Label>To'liq Ism</Label>
                    <Input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="To'liq ism"
                    />
                  </div>
                  <div>
                    <Label>Telefon</Label>
                    <Input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+998901234567"
                      required
                    />
                  </div>
                  <div>
                    <Label>
                      Parol {editingAdmin && '(Bo\'sh qoldiring, o\'zgartirish kerak bo\'lmasa)'}
                    </Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="********"
                      required={!editingAdmin}
                    />
                  </div>
                  <div>
                    <Label>Rol</Label>
                    <Select
                      options={[
                        { value: 'ADMIN', label: 'Admin' },
                        { value: 'MODERATOR', label: 'Moderator' },
                        { value: 'SUPER_ADMIN', label: 'Super Admin' },
                      ]}
                      defaultValue={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="Rol tanlang"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2 w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <Label className="mb-0!">Faol</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    closeModal();
                    resetForm();
                  }}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          isOpen={isDeleteOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Adminni o'chirish"
          message="Ushbu adminni o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi."
        />
      </div>
    </>
  );
};

export default AdminsPage;
