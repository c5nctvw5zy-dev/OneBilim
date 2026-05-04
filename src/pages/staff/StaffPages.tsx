import SimpleCrud from "@/components/SimpleCrud";

// Психолог
export const PsychologistConsult = () => (
  <SimpleCrud
    title="🧑‍⚕️ Кеңес беру"
    table="psych_consultations"
    fields={[
      { key: "student_name", label: "Оқушы аты-жөні", required: true },
      { key: "class_name", label: "Сыныбы" },
      { key: "consultation_text", label: "Кеңес мәтіні", type: "textarea", required: true },
      { key: "recommendation", label: "Ұсынымдар", type: "textarea" },
    ]}
    listColumns={["student_name", "class_name", "consultation_text"]}
  />
);

export const PsychologistTests = () => (
  <SimpleCrud
    title="🧪 Тест жүргізу"
    table="tests"
    fields={[
      { key: "title", label: "Тест атауы", required: true },
      { key: "duration_minutes", label: "Уақыт (мин)", type: "number" },
    ]}
    listColumns={["title", "status", "duration_minutes"]}
    defaults={{ subject_id: "00000000-0000-0000-0000-000000000000" }}
    scope="user"
  />
);

export const PsychologistWork = () => (
  <SimpleCrud
    title="📁 Оқушылармен жұмыс"
    table="materials"
    fields={[
      { key: "title", label: "Тақырып", required: true },
      { key: "file_url", label: "Файл сілтемесі" },
    ]}
    listColumns={["title", "file_url"]}
  />
);

// Әлеуметтік педагог
export const SocialMonitoring = () => (
  <SimpleCrud
    title="📊 Әлеуметтік жағдайды бақылау"
    table="social_records"
    fields={[
      { key: "student_name", label: "Оқушы", required: true },
      { key: "class_name", label: "Сыныбы" },
      { key: "family_status", label: "Отбасы жағдайы" },
      { key: "income_level", label: "Табыс деңгейі" },
      { key: "parent_contact", label: "Ата-ана байланысы" },
      { key: "notes", label: "Ескертулер", type: "textarea" },
      { key: "needs_support", label: "Көмек қажет", type: "boolean" },
    ]}
    listColumns={["student_name", "class_name", "family_status", "needs_support"]}
  />
);

export const SocialFamily = () => (
  <SimpleCrud
    title="👨‍👩‍👧 Отбасымен байланыс"
    table="social_records"
    fields={[
      { key: "student_name", label: "Оқушы", required: true },
      { key: "class_name", label: "Сыныбы" },
      { key: "parent_contact", label: "Ата-ана байланыс ақпараты", required: true },
      { key: "notes", label: "Жүргізілген әңгіме", type: "textarea" },
    ]}
    defaults={{ needs_support: true }}
    listColumns={["student_name", "parent_contact", "notes"]}
    filter={{ needs_support: true }}
  />
);

// Логопед / Дефектолог
export const SpeechIndividual = () => (
  <SimpleCrud
    title="🧑‍🏫 Жеке сабақ өткізу"
    table="inclusive_sessions"
    fields={[
      { key: "student_name", label: "Оқушы", required: true },
      { key: "class_name", label: "Сыныбы" },
      { key: "session_date", label: "Сабақ күні", type: "date", required: true },
      { key: "topic", label: "Тақырып" },
      { key: "notes", label: "Жазбалар", type: "textarea" },
      { key: "progress", label: "Үлгерім" },
    ]}
    listColumns={["student_name", "session_date", "topic", "progress"]}
  />
);

export const SpeechInclusive = () => (
  <SimpleCrud
    title="♿ Инклюзивті білім беру"
    table="inclusive_sessions"
    fields={[
      { key: "student_name", label: "Оқушы", required: true },
      { key: "class_name", label: "Сыныбы" },
      { key: "session_date", label: "Күні", type: "date", required: true },
      { key: "topic", label: "Тақырып" },
      { key: "progress", label: "Жалпы үлгерім", type: "textarea" },
    ]}
    listColumns={["student_name", "class_name", "session_date", "progress"]}
  />
);

// Медбике
export const NurseHealth = () => (
  <SimpleCrud
    title="🩺 Денсаулықты тексеру"
    table="health_check_results"
    fields={[
      { key: "student_name", label: "Оқушы", required: true },
      { key: "class_name", label: "Сыныбы" },
      { key: "check_date", label: "Тексеру күні", type: "date", required: true },
      { key: "height_cm", label: "Бойы (см)", type: "number" },
      { key: "weight_kg", label: "Салмағы (кг)", type: "number" },
      { key: "vision", label: "Көру" },
      { key: "notes", label: "Қорытынды", type: "textarea" },
    ]}
    listColumns={["student_name", "check_date", "height_cm", "weight_kg", "vision"]}
  />
);

export const NurseFirstAid = () => (
  <SimpleCrud
    title="📕 Алғашқы көмек кітабы"
    table="first_aid_log"
    fields={[
      { key: "student_name", label: "Оқушы", required: true },
      { key: "class_name", label: "Сыныбы" },
      { key: "reason", label: "Себебі", required: true },
      { key: "treatment", label: "Көрсетілген көмек", type: "textarea" },
    ]}
    listColumns={["student_name", "class_name", "reason", "visit_date"]}
    orderBy="visit_date"
  />
);

export const NurseCards = () => (
  <SimpleCrud
    title="📁 Медициналық карталар"
    table="medical_records"
    fields={[
      { key: "student_name", label: "Оқушы", required: true },
      { key: "class_name", label: "Сыныбы" },
      { key: "blood_type", label: "Қан тобы" },
      { key: "allergies", label: "Аллергиялар" },
      { key: "chronic_conditions", label: "Созылмалы аурулар", type: "textarea" },
      { key: "vaccinations", label: "Вакциналар", type: "textarea" },
      { key: "notes", label: "Ескертулер", type: "textarea" },
    ]}
    listColumns={["student_name", "class_name", "blood_type", "allergies"]}
  />
);

// Кадр маманы
export const HrStaff = () => (
  <SimpleCrud
    title="👥 Қызметкерлерді тіркеу"
    table="staff"
    fields={[
      { key: "full_name", label: "Аты-жөні", required: true },
      { key: "position", label: "Лауазымы", required: true },
      { key: "phone", label: "Телефон" },
      { key: "iin", label: "ЖСН" },
      { key: "hire_date", label: "Қабылданған күні", type: "date" },
      { key: "notes", label: "Ескертулер", type: "textarea" },
    ]}
    listColumns={["full_name", "position", "phone", "hire_date", "status"]}
  />
);

export const HrHiring = () => (
  <SimpleCrud
    title="📄 Жұмысқа қабылдау"
    table="hire_documents"
    fields={[
      { key: "applicant_name", label: "Үміткер", required: true },
      { key: "doc_title", label: "Құжат атауы", required: true },
      { key: "file_url", label: "Файл сілтемесі" },
    ]}
    defaults={{ uploaded_by: undefined }}
    listColumns={["applicant_name", "doc_title", "status"]}
  />
);

// Хатшы
export const SecretaryOrders = () => (
  <SimpleCrud
    title="📜 Бұйрықты тіркеу кітабы"
    table="orders_book"
    fields={[
      { key: "order_no", label: "Бұйрық №", required: true },
      { key: "order_date", label: "Шығу күні", type: "date", required: true },
      { key: "reason", label: "Себебі", required: true },
      { key: "issued_by", label: "Кім шығарды" },
      { key: "file_url", label: "Файл сілтемесі" },
    ]}
    listColumns={["order_no", "order_date", "reason", "issued_by"]}
  />
);

export const SecretaryWriteLetter = () => (
  <SimpleCrud
    title="✉️ Хат жазу"
    table="direct_messages"
    fields={[
      { key: "to_user", label: "Алушы (user_id)", required: true },
      { key: "subject", label: "Тақырып" },
      { key: "body", label: "Мәтін", type: "textarea", required: true },
      { key: "file_url", label: "Файл сілтемесі" },
    ]}
    scope="user"
    defaults={{ from_user: undefined }}
    listColumns={["to_user", "subject", "created_at"]}
  />
);

export const SecretaryRegisterDocs = () => (
  <SimpleCrud
    title="📂 Құжаттарды тіркеу"
    table="documents"
    fields={[
      { key: "title", label: "Атауы", required: true },
      { key: "category", label: "Санаты" },
      { key: "file_url", label: "Файл сілтемесі" },
    ]}
    defaults={{ uploaded_by: undefined }}
    listColumns={["title", "category", "status"]}
  />
);

export const SecretaryDocsWork = () => (
  <SimpleCrud
    title="📁 Құжаттармен жұмыс"
    table="documents"
    fields={[
      { key: "title", label: "Атауы", required: true },
      { key: "category", label: "Санаты" },
    ]}
    defaults={{ uploaded_by: undefined }}
    listColumns={["title", "category", "status", "signed_at"]}
  />
);
