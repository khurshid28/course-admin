import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Button from '../ui/button/Button';

interface Section {
  id: number;
  title: string;
  subtitle?: string;
  order: number;
  courseId: number;
}

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SectionFormData) => Promise<void>;
  editingSection?: Section | null;
  initialCourseId?: number;
}

export interface SectionFormData {
  title: string;
  subtitle: string;
  order: number;
  courseId: number;
}

export default function SectionModal({
  isOpen,
  onClose,
  onSubmit,
  editingSection,
  initialCourseId = 0,
}: SectionModalProps) {
  const [formData, setFormData] = useState<SectionFormData>({
    title: '',
    subtitle: '',
    order: 1,
    courseId: initialCourseId,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingSection) {
      setFormData({
        title: editingSection.title,
        subtitle: editingSection.subtitle || '',
        order: editingSection.order,
        courseId: editingSection.courseId,
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        order: 1,
        courseId: initialCourseId,
      });
    }
  }, [editingSection, initialCourseId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SectionFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] m-4">
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {editingSection ? 'Bo\'limni Tahrirlash' : 'Yangi Bo\'lim'}
          </h4>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="custom-scrollbar max-h-[450px] overflow-y-auto px-2 pb-3 space-y-4">
            <div>
              <Label>Bo'lim nomi *</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Bo'lim nomini kiriting"
              />
            </div>
            <div>
              <Label>Qisqa matn</Label>
              <Input
                type="text"
                value={formData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                placeholder="Qisqa mazmunini kiriting"
              />
            </div>
            <div>
              <Label>Tartib raqami *</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                min="1"
                placeholder="1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Kichik raqam birinchi ko'rinadi (1, 2, 3...)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button type="button" size="sm" variant="outline" onClick={onClose} disabled={loading}>
              Bekor qilish
            </Button>
            <Button type="submit" size="sm" variant="primary" disabled={loading}>
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
