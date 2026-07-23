import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get_my_profile";
import listClasses from "./tools/list_classes";
import listStudents from "./tools/list_students";
import listAnnouncements from "./tools/list_announcements";
import createAnnouncement from "./tools/create_announcement";
import listSchedule from "./tools/list_schedule";
import listGrades from "./tools/list_grades";
import listHomework from "./tools/list_homework";
import schoolStats from "./tools/school_stats";

// Build the OAuth issuer from the Supabase project ref (Vite inlines this at build time).
// Never use SUPABASE_URL — on Lovable Cloud it's the .lovable.cloud proxy and mcp-js
// rejects a mismatched issuer.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "bilimapp-mcp",
  title: "BilimApp",
  version: "0.1.0",
  instructions:
    "BilimApp білім беру платформасының MCP серверлері. Ағымдағы қосылған пайдаланушының атынан мектеп деректеріне (сыныптар, оқушылар, сабақ кестесі, бағалар, үй тапсырмалары, хабарландырулар) қол жеткізу және хабарландыру жариялау мүмкіндіктерін ұсынады. Барлық қол жеткізулер RLS арқылы пайдаланушының рөлі мен мектебіне сәйкес шектеледі.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getMyProfile,
    schoolStats,
    listClasses,
    listStudents,
    listSchedule,
    listGrades,
    listHomework,
    listAnnouncements,
    createAnnouncement,
  ],
});
