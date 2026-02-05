import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '../../service/axios.service';
import { useFetchWithLoader } from '../../hooks/useFetchWithLoader';
import { useModal } from '../../hooks/useModal';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon } from '../../icons';
import { LoadSpinner } from '../../components/spinner/load-spinner';

interface FAQ {
  id: number;
  courseId: number;
  question: string;
  answer: string;
  order: number;
  course?: {
    title: string;
  };
}

export default function FAQsPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    courseId: 0,
    question: '',
    answer: '',
    order: 0,
  });

  const fetchFAQs = useCallback(() => {
    return axiosClient.get('/faqs').then(res => res.data);
  }, []);

  const { data, isLoading, refetch } = useFetchWithLoader({
    fetcher: fetchFAQs,
  });

  useEffect(() => {
    if (data) {
      setFaqs(data);
      setFilteredFAQs(data);
    }
  }, [data]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = faqs.filter(faq =>
        faq.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFAQs(filtered);
    } else {
      setFilteredFAQs(faqs);
    }
    setCurrentPage(1);
  }, [searchTerm, faqs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFAQ) {
        await axiosClient.patch(`/faqs/${editingFAQ.id}`, formData);
        toast.success('FAQ muvaffaqiyatli yangilandi');
      } else {
        await axiosClient.post('/faqs', formData);
        toast.success('FAQ muvaffaqiyatli yaratildi');
      }
      await refetch();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    try {
      await axiosClient.delete(`/faqs/${id}`);
      toast.success('FAQ o\'chirildi');
      await refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      courseId: faq.courseId,
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
    });
    openModal();
  };

  const handleCloseModal = () => {
    setEditingFAQ(null);
    setFormData({
      courseId: 0,
      question: '',
      answer: '',
      order: 0,
    });
    closeModal();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFAQs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFAQs.length / itemsPerPage);

  return (
    <>
      <PageMeta title="FAQs | Admin Panel" description="Tez-tez so'raladigan savollar" />
      <PageBreadcrumb pageTitle="FAQs" />

      <div className="space-y-6">
        {isLoading ? (
          <div className="min-h-[450px] flex justify-center items-center">
            <LoadSpinner />
          </div>
        ) : (
          <ComponentCard
            title="Tez-tez so'raladigan savollar"
            action={
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<PlusIcon className="size-5 fill-white" />}
                  onClick={() => {
                    setEditingFAQ(null);
                    handleCloseModal();
                    openModal();
                  }}
                >
                  Qo'shish
                </Button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left p-4">ID</th>
                    <th className="text-left p-4">Kurs</th>
                    <th className="text-left p-4">Savol</th>
                    <th className="text-left p-4">Javob</th>
                    <th className="text-left p-4">Tartib</th>
                    <th className="text-right p-4">Harakatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((faq) => (
                    <tr key={faq.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">{faq.id}</td>
                      <td className="p-4">{faq.course?.title || `Course #${faq.courseId}`}</td>
                      <td className="p-4 max-w-xs truncate">{faq.question}</td>
                      <td className="p-4 max-w-xs truncate">{faq.answer}</td>
                      <td className="p-4">{faq.order}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(faq)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <EditIcon className="size-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(faq.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                          >
                            <DeleteIcon className="size-5 fill-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Oldingi
                </button>
                <span className="px-4 py-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Keyingi
                </button>
              </div>
            )}
          </ComponentCard>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-2xl">
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-4">
            {editingFAQ ? 'FAQ tahrirlash' : 'Yangi FAQ'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Kurs ID</Label>
              <Input
                type="number"
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Savol</Label>
              <textarea
                required
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                rows={3}
              />
            </div>
            <div>
              <Label>Javob</Label>
              <textarea
                required
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                rows={5}
              />
            </div>
            <div>
              <Label>Tartib raqami</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Bekor qilish
              </Button>
              <Button type="submit" variant="primary">
                Saqlash
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
