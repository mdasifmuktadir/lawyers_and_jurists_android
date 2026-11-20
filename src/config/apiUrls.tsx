export const API_BASE_URL = "https://www.lawyersnjurists.com/wp-json/wp/v2/";
export const Custom_API_BASE_URL = "https://www.lawyersnjurists.com/wp-json/";
export const LEGAL_API_URL = "https://www.lawyersnjurists.com/wp-json/legal/v1";

export const lawyer_ci_url =
  "https://www.lawyersnjurists.com/lawyer_ci/frontend_controller/";

export const Auth_URL = `https://lawyers-and-jurists.onrender.com`;

const api_urls = {
  articles: `${API_BASE_URL}/articles/`,
  article_categories: `${API_BASE_URL}/articles/categories`,
  services: `${API_BASE_URL}/services`,
  carousel: `${API_BASE_URL}/carousel`,
  case_management_types: `${API_BASE_URL}/case-management/types`,
  docs: `${API_BASE_URL}/documentations-and-litigations`,
  doc_types: `${API_BASE_URL}/documentations-and-litigations/types/`,
  legal_courses_types: `${API_BASE_URL}/legal-courses/types/`,
  legal_courses: `${API_BASE_URL}/legal-courses/`,
  members_of: `${API_BASE_URL}/members-of`,
  course_types: `${API_BASE_URL}/course-materials/types`,
  course_materials: `${API_BASE_URL}/course-materials/`,
  convention_types: `${API_BASE_URL}/conventions-and-treaties/types/`,
  conventions: `${API_BASE_URL}/conventions-and-treaties/`,
  book_authors: `${API_BASE_URL}/books/authors/`,
  books: `${API_BASE_URL}/books/`,
  feedback: `${API_BASE_URL}/feedback/`,

  latest_videos: `${API_BASE_URL}/videos/`,
  videos_all: `${API_BASE_URL}/videos/all`,

  latest_articles: `${API_BASE_URL}/articles/latest/`,

  about_us: `${API_BASE_URL}/about-us/`,

  services_all: `${API_BASE_URL}/services/all`,

  clients_all: `${API_BASE_URL}/clients/all`,

  internship: `${API_BASE_URL}/career/Internship`,

  inhouse_lawyer: `${API_BASE_URL}/career/Inhouse_Lawyer`,

  message: `${API_BASE_URL}/message/`,

  lawyers_all: `${API_BASE_URL}/lawyers/all`,

  gallery_categories: `${API_BASE_URL}/gallery/distinct_categories`,

  gallery: `${API_BASE_URL}/gallery/`,

  articles_by_category: (category: string) =>
    `${API_BASE_URL}/articles/get_articles/?category=${category}`,
};

export default api_urls;
