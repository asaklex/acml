import { useEffect, useState } from 'react';
import api from '../api/client';
import { BookOpen, MapPin, Plus, Edit, Trash2, Users, GraduationCap } from 'lucide-react';
import Modal from '../components/Modal';

interface Course {
  id: string;
  name: string;
  description: string;
  schedule: string;
  current_session: string;
  status: string;
  teacher?: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  course: string;
  level?: string;
  payment_status: string;
  enrolled_at: string;
}

interface CourseFormData {
  name: string;
  description: string;
  schedule: string;
  current_session: string;
  status: string;
}

interface StudentFormData {
  first_name: string;
  last_name: string;
  course: string;
  birth_date: string;
  payment_status: string;
}

const EducationPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'students'>('courses');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [courseForm, setCourseForm] = useState<CourseFormData>({
    name: '',
    description: '',
    schedule: '',
    current_session: '',
    status: 'ACTIVE'
  });

  const [studentForm, setStudentForm] = useState<StudentFormData>({
    first_name: '',
    last_name: '',
    course: '',
    birth_date: '',
    payment_status: 'PENDING'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, studentsRes] = await Promise.all([
        api.get('/education/courses/'),
        api.get('/education/students/')
      ]);
      setCourses(coursesRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error('Error fetching education data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      name: '',
      description: '',
      schedule: '',
      current_session: '',
      status: 'ACTIVE'
    });
    setShowCourseModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      description: course.description,
      schedule: course.schedule,
      current_session: course.current_session,
      status: course.status
    });
    setShowCourseModal(true);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;
    try {
      await api.delete(`/education/courses/${id}/`);
      setCourses(courses.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        const res = await api.put(`/education/courses/${editingCourse.id}/`, courseForm);
        setCourses(courses.map(c => c.id === editingCourse.id ? res.data : c));
      } else {
        const res = await api.post('/education/courses/', courseForm);
        setCourses([...courses, res.data]);
      }
      setShowCourseModal(false);
    } catch (err: any) {
      console.error('Error saving course:', err);
      alert(err.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleCreateStudent = () => {
    setStudentForm({
      first_name: '',
      last_name: '',
      course: '',
      birth_date: '',
      payment_status: 'PENDING'
    });
    setShowStudentModal(true);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/education/students/', studentForm);
      setStudents([...students, res.data]);
      setShowStudentModal(false);
      alert('Élève inscrit avec succès!');
    } catch (err: any) {
      console.error('Error saving student:', err);
      alert(err.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    }
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.name || 'Cours inconnu';
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'OVERDUE': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PAID': 'Payé',
      'PENDING': 'En attente',
      'OVERDUE': 'En retard'
    };
    return labels[status] || status;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'ACTIVE': 'Actif',
      'INACTIVE': 'Inactif',
      'FULL': 'Complet'
    };
    return labels[status] || status;
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Programmes Éducatifs</h1>
        <button className="btn btn-primary" onClick={handleCreateStudent}>
          <Plus size={16} /> Inscrire un élève
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Cours
        </button>
        <button
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Élèves
        </button>
      </div>

      {activeTab === 'courses' && (
        <div className="section">
          <div className="section-header">
            <h2>Cours Disponibles</h2>
            <button className="btn btn-primary" onClick={handleCreateCourse}>
              <Plus size={16} /> Nouveau cours
            </button>
          </div>
          <div className="courses-grid">
            {courses.length === 0 ? (
              <div className="card empty-state">
                <BookOpen size={48} />
                <p>Aucun cours disponible.</p>
              </div>
            ) : (
              courses.map(course => (
                <div key={course.id} className="card course-card">
                  <div className="course-header">
                    <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)' }}>
                      {getStatusLabel(course.status)}
                    </span>
                    <div className="course-actions">
                      <button className="icon-btn" onClick={() => handleEditCourse(course)}>
                        <Edit size={16} />
                      </button>
                      <button className="icon-btn" onClick={() => handleDeleteCourse(course.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3>{course.name}</h3>
                  <p className="course-description">{course.description || 'Aucune description'}</p>

                  <div className="course-details">
                    <div className="course-detail">
                      <MapPin size={16} />
                      <span>{course.schedule || 'Non spécifié'}</span>
                    </div>
                    <div className="course-detail">
                      <GraduationCap size={16} />
                      <span>{course.current_session || 'Session non définie'}</span>
                    </div>
                    <div className="course-detail">
                      <Users size={16} />
                      <span>
                        {students.filter(s => s.course === course.id).length} élève(s)
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="section">
          <div className="section-header">
            <h2>Élèves Inscrits</h2>
            <button className="btn btn-primary" onClick={handleCreateStudent}>
              <Plus size={16} /> Inscrire un élève
            </button>
          </div>
          <div className="card table-container">
            <table>
              <thead>
                <tr>
                  <th>ÉLÈVE</th>
                  <th>COURS</th>
                  <th>DATE D'INSCRIPTION</th>
                  <th>PAIEMENT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">Aucun élève inscrit.</td>
                  </tr>
                ) : (
                  students.map(student => (
                    <tr key={student.id}>
                      <td>
                        <strong>{student.first_name} {student.last_name}</strong>
                      </td>
                      <td>{getCourseName(student.course)}</td>
                      <td>{new Date(student.enrolled_at).toLocaleDateString('fr-CA')}</td>
                      <td>
                        <span
                          className="badge"
                          style={{ background: `${getPaymentStatusColor(student.payment_status)}15`, color: getPaymentStatusColor(student.payment_status) }}
                        >
                          {getPaymentStatusLabel(student.payment_status)}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm">Voir détails</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        title={editingCourse ? 'Modifier le cours' : 'Nouveau cours'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCourseModal(false)}>
              Annuler
            </button>
            <button
              onClick={(e) => {
                // Trigger form submission manually since buttons are outside the form
                const form = document.getElementById('course-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              className="btn btn-primary"
            >
              {editingCourse ? 'Mettre à jour' : 'Créer'}
            </button>
          </>
        }
      >
        <form id="course-form" onSubmit={handleCourseSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label>Nom du cours *</label>
            <input
              type="text"
              value={courseForm.name}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Horaire</label>
            <input
              type="text"
              value={courseForm.schedule}
              onChange={(e) => setCourseForm({ ...courseForm, schedule: e.target.value })}
              placeholder="Ex: Samedis 10:00-12:00"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Session actuelle</label>
              <input
                type="text"
                value={courseForm.current_session}
                onChange={(e) => setCourseForm({ ...courseForm, current_session: e.target.value })}
                placeholder="Ex: Automne 2024"
              />
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select
                value={courseForm.status}
                onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
              >
                <option value="ACTIVE">Actif</option>
                <option value="INACTIVE">Inactif</option>
                <option value="FULL">Complet</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        title="Inscrire un élève"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowStudentModal(false)}>
              Annuler
            </button>
            <button
              onClick={() => {
                const form = document.getElementById('student-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              className="btn btn-primary"
            >
              Inscrire
            </button>
          </>
        }
      >
        <form id="student-form" onSubmit={handleStudentSubmit} className="flex flex-col gap-4">
          <div className="form-row">
            <div className="form-group">
              <label>Prénom *</label>
              <input
                type="text"
                value={studentForm.first_name}
                onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                value={studentForm.last_name}
                onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date de naissance</label>
              <input
                type="date"
                value={studentForm.birth_date}
                onChange={(e) => setStudentForm({ ...studentForm, birth_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Statut de paiement</label>
              <select
                value={studentForm.payment_status}
                onChange={(e) => setStudentForm({ ...studentForm, payment_status: e.target.value })}
              >
                <option value="PENDING">En attente</option>
                <option value="PAID">Payé</option>
                <option value="OVERDUE">En retard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Cours *</label>
            <select
              value={studentForm.course}
              onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
              required
            >
              <option value="">Sélectionner un cours</option>
              {courses.filter(c => c.status === 'ACTIVE').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EducationPage;
