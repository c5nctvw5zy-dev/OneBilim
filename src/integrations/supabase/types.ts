export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          address: string | null
          bin: string | null
          city: string | null
          created_at: string
          director_email: string | null
          director_id_url: string | null
          director_iin: string | null
          director_name: string | null
          director_phone: string | null
          email: string | null
          id: string
          license_url: string | null
          phone: string | null
          region: string | null
          registration_cert_url: string | null
          review_note: string | null
          reviewed_by: string | null
          school_name: string
          school_type: string | null
          stamp_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          bin?: string | null
          city?: string | null
          created_at?: string
          director_email?: string | null
          director_id_url?: string | null
          director_iin?: string | null
          director_name?: string | null
          director_phone?: string | null
          email?: string | null
          id?: string
          license_url?: string | null
          phone?: string | null
          region?: string | null
          registration_cert_url?: string | null
          review_note?: string | null
          reviewed_by?: string | null
          school_name: string
          school_type?: string | null
          stamp_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          bin?: string | null
          city?: string | null
          created_at?: string
          director_email?: string | null
          director_id_url?: string | null
          director_iin?: string | null
          director_name?: string | null
          director_phone?: string | null
          email?: string | null
          id?: string
          license_url?: string | null
          phone?: string | null
          region?: string | null
          registration_cert_url?: string | null
          review_note?: string | null
          reviewed_by?: string | null
          school_name?: string
          school_type?: string | null
          stamp_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          class_id: string
          created_at: string
          date: string
          id: string
          status: string
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          date: string
          id?: string
          status?: string
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          date?: string
          id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      book_borrowers: {
        Row: {
          book_id: string
          borrow_end: string
          borrow_start: string
          borrower_name: string
          created_at: string
          id: string
          registered_by: string
          returned: boolean
          school_id: string
        }
        Insert: {
          book_id: string
          borrow_end: string
          borrow_start: string
          borrower_name: string
          created_at?: string
          id?: string
          registered_by: string
          returned?: boolean
          school_id: string
        }
        Update: {
          book_id?: string
          borrow_end?: string
          borrow_start?: string
          borrower_name?: string
          created_at?: string
          id?: string
          registered_by?: string
          returned?: boolean
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_borrowers_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string
          created_at: string
          id: string
          online_link: string | null
          registered_by: string
          school_id: string
          title: string
        }
        Insert: {
          author: string
          created_at?: string
          id?: string
          online_link?: string | null
          registered_by: string
          school_id: string
          title: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: string
          online_link?: string | null
          registered_by?: string
          school_id?: string
          title?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string
          grade_level: number
          homeroom_teacher_id: string | null
          id: string
          name: string
          school_id: string
          section: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade_level: number
          homeroom_teacher_id?: string | null
          id?: string
          name: string
          school_id: string
          section?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade_level?: number
          homeroom_teacher_id?: string | null
          id?: string
          name?: string
          school_id?: string
          section?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_homeroom_teacher_id_fkey"
            columns: ["homeroom_teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          created_at: string
          file_name: string | null
          file_size: string | null
          file_url: string | null
          id: string
          school_id: string
          signature_url: string | null
          signed_at: string | null
          signed_by: string | null
          status: string | null
          title: string
          uploaded_by: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          school_id: string
          signature_url?: string | null
          signed_at?: string | null
          signed_by?: string | null
          status?: string | null
          title: string
          uploaded_by: string
        }
        Update: {
          category?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          school_id?: string
          signature_url?: string | null
          signed_at?: string | null
          signed_by?: string | null
          status?: string | null
          title?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          created_at: string
          grade: number | null
          grade_date: string
          grade_type: string | null
          id: string
          journal_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          grade?: number | null
          grade_date: string
          grade_type?: string | null
          id?: string
          journal_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          grade?: number | null
          grade_date?: string
          grade_type?: string | null
          id?: string
          journal_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "journals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          created_at: string
          end_date: string
          id: string
          school_id: string
          start_date: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          school_id: string
          start_date: string
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          school_id?: string
          start_date?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      homework: {
        Row: {
          class_id: string
          created_at: string
          description: string | null
          due_date: string
          file_url: string | null
          id: string
          subject_id: string
          teacher_id: string
          title: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string | null
          due_date: string
          file_url?: string | null
          id?: string
          subject_id: string
          teacher_id: string
          title: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string | null
          due_date?: string
          file_url?: string | null
          id?: string
          subject_id?: string
          teacher_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journals: {
        Row: {
          class_id: string
          created_at: string
          end_date: string
          id: string
          quarter: number
          start_date: string
          subject_id: string
          teacher_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          end_date: string
          id?: string
          quarter: number
          start_date: string
          subject_id: string
          teacher_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          end_date?: string
          id?: string
          quarter?: number
          start_date?: string
          subject_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journals_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journals_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journals_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          created_at: string
          file_name: string | null
          file_size: string | null
          file_type: string | null
          file_url: string | null
          id: string
          school_id: string
          subject_id: string | null
          title: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          school_id: string
          subject_id?: string | null
          title: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          school_id?: string
          subject_id?: string | null
          title?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      parent_students: {
        Row: {
          id: string
          parent_id: string
          student_id: string
        }
        Insert: {
          id?: string
          parent_id: string
          student_id: string
        }
        Update: {
          id?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      password_resets: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          iin: string
          temp_password_hash: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          iin: string
          temp_password_hash: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          iin?: string
          temp_password_hash?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          face_id_data: string | null
          face_id_registered: boolean
          full_name: string
          gender: string | null
          id: string
          iin: string | null
          phone: string | null
          school_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          face_id_data?: string | null
          face_id_registered?: boolean
          full_name: string
          gender?: string | null
          id?: string
          iin?: string | null
          phone?: string | null
          school_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          face_id_data?: string | null
          face_id_registered?: boolean
          full_name?: string
          gender?: string | null
          id?: string
          iin?: string | null
          phone?: string | null
          school_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          class_id: string
          created_at: string
          day_of_week: number
          end_time: string | null
          id: string
          lesson_order: number
          school_id: string
          start_time: string | null
          subject_id: string
          teacher_id: string | null
        }
        Insert: {
          class_id: string
          created_at?: string
          day_of_week: number
          end_time?: string | null
          id?: string
          lesson_order: number
          school_id: string
          start_time?: string | null
          subject_id: string
          teacher_id?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string | null
          id?: string
          lesson_order?: number
          school_id?: string
          start_time?: string | null
          subject_id?: string
          teacher_id?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          bin: string | null
          city: string | null
          created_at: string
          director_id_url: string | null
          email: string | null
          id: string
          license_url: string | null
          name: string
          phone: string | null
          region: string | null
          registration_cert_url: string | null
          school_type: string | null
          stamp_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          bin?: string | null
          city?: string | null
          created_at?: string
          director_id_url?: string | null
          email?: string | null
          id?: string
          license_url?: string | null
          name: string
          phone?: string | null
          region?: string | null
          registration_cert_url?: string | null
          school_type?: string | null
          stamp_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          bin?: string | null
          city?: string | null
          created_at?: string
          director_id_url?: string | null
          email?: string | null
          id?: string
          license_url?: string | null
          name?: string
          phone?: string | null
          region?: string | null
          registration_cert_url?: string | null
          school_type?: string | null
          stamp_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_classes: {
        Row: {
          class_id: string
          group_name: string | null
          id: string
          student_id: string
        }
        Insert: {
          class_id: string
          group_name?: string | null
          id?: string
          student_id: string
        }
        Update: {
          class_id?: string
          group_name?: string | null
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          id: string
          name: string
          name_en: string | null
          name_ru: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          name_en?: string | null
          name_ru?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          name_en?: string | null
          name_ru?: string | null
        }
        Relationships: []
      }
      test_questions: {
        Row: {
          correct_answer: string | null
          id: string
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          question_order: number | null
          question_text: string
          test_id: string
        }
        Insert: {
          correct_answer?: string | null
          id?: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question_order?: number | null
          question_text: string
          test_id: string
        }
        Update: {
          correct_answer?: string | null
          id?: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question_order?: number | null
          question_text?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          class_id: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          status: string
          subject_id: string
          teacher_id: string
          title: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          status?: string
          subject_id: string
          teacher_id: string
          title: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          status?: string
          subject_id?: string
          teacher_id?: string
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_school_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "director"
        | "zavuch"
        | "teacher"
        | "student"
        | "parent"
        | "librarian"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "director",
        "zavuch",
        "teacher",
        "student",
        "parent",
        "librarian",
      ],
    },
  },
} as const
