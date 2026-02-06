import { useState, useEffect } from 'react';
import axiosClient, { getImageUrl } from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { PencilIcon, DeleteIcon, ChatIcon, PlusIcon, EyeIcon, VideoIcon } from '../../icons';
import Button from '../../components/ui/button/Button';
import CourseCommentsModal from '../../components/modals/CourseCommentsModal';
import { Modal } from '../../components/ui/modal';
import Badge from '../../components/ui/badge/Badge';
import { LoadSpinner } from '../../components/spinner/load-spinner';
import { useModal } from '../../hooks/useModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';

interface Course {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  price: number;
  isFree: boolean;
  rating: number;
  totalStudents: number;
  isActive: boolean;
  createdAt: string;
  teacher: { id: number; name: string };
  category: { id: number; name: string };
  sections?: Section[];
}

interface Section {
  id: number;
  title: string;
  subtitle