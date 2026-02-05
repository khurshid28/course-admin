import axiosClient from './axios.service';

export interface TestItem {
  id: number;
  number: number;
  question: string;
  answer_A: string;
  answer_B: string;
  answer_C?: string;
  answer_D?: string;
  answer: string;
  test_id?: number;
  createdt?: string;
}

export interface GeneratedTest {
  id: string;
  specialTestId: number;
  items: TestItem[];
  createdAt: string;
  answerKey: { [key: number]: string };
}

export interface Group {
  id: number;
  name: string;
  hasTime?: boolean;
  timeMinutes?: number;
  fullTime?: number;
  createdt?: string;
  updatedAt?: string;
}

export interface SpecialTestGroup {
  id: number;
  specialTestId: number;
  groupId: number;
  group?: Group;
}

export interface SpecialTestSection {
  id: number;
  specialTestId: number;
  sectionId: number;
  section?: Record<string, unknown>;
}

export interface SpecialTest {
  id?: number;
  name: string;
  description?: string;
  subject_id: number;
  book_ids?: number[]; // Multiple books support
  section_id?: number;
  section_ids?: number[]; // Multiple sections support
  group_ids: number[];
  activation_start?: string;
  activation_end?: string;
  time_per_question?: number;
  total_time?: number;
  force_next_question?: boolean;
  question_count: number;
  questions?: TestItem[];
  status?: string;
  generatedTest?: GeneratedTest;
  specialTestGroups?: SpecialTestGroup[];
  specialTestSections?: SpecialTestSection[];
}

class SpecialTestService {
  async getAll(): Promise<SpecialTest[]> {
    const response = await axiosClient.get('/special-test/all');
    return response.data;
  }

  async getById(id: number): Promise<SpecialTest> {
    const response = await axiosClient.get(`/special-test/${id}`);
    return response.data;
  }

  async create(data: Omit<SpecialTest, 'id'>): Promise<SpecialTest> {
    const response = await axiosClient.post('/special-test', data);
    return response.data;
  }

  async update(id: number, data: Partial<SpecialTest>): Promise<SpecialTest> {
    const response = await axiosClient.put(`/special-test/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete(`/special-test/${id}`);
  }

  async generateTest(id: number): Promise<GeneratedTest> {
    const response = await axiosClient.post(`/special-test/${id}/generate`);
    return response.data;
  }

  async getGeneratedTest(id: number): Promise<GeneratedTest> {
    const response = await axiosClient.get(`/special-test/${id}/generated`);
    return response.data;
  }
}

const specialTestService = new SpecialTestService();
export default specialTestService;
