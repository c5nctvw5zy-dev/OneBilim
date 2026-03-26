
-- Directors and zavuch can view grades for their school
CREATE POLICY "Directors and zavuch can view school grades"
ON public.grades FOR SELECT TO authenticated
USING (
  (has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'zavuch'))
  AND EXISTS (
    SELECT 1 FROM journals j
    JOIN classes c ON c.id = j.class_id
    JOIN profiles p ON p.school_id = c.school_id
    WHERE p.user_id = auth.uid() AND j.id = grades.journal_id
  )
);

-- Teachers can manage attendance
CREATE POLICY "Teachers can manage attendance"
ON public.attendance FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM journals j
    JOIN profiles p ON p.id = j.teacher_id
    WHERE p.user_id = auth.uid() AND j.class_id = attendance.class_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM journals j
    JOIN profiles p ON p.id = j.teacher_id
    WHERE p.user_id = auth.uid() AND j.class_id = attendance.class_id
  )
);

-- Directors can manage student_classes
CREATE POLICY "Directors can manage student classes"
ON public.student_classes FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'director') AND EXISTS (
    SELECT 1 FROM profiles p
    JOIN classes c ON c.school_id = p.school_id
    WHERE p.user_id = auth.uid() AND c.id = student_classes.class_id
  )
)
WITH CHECK (
  has_role(auth.uid(), 'director') AND EXISTS (
    SELECT 1 FROM profiles p
    JOIN classes c ON c.school_id = p.school_id
    WHERE p.user_id = auth.uid() AND c.id = student_classes.class_id
  )
);

-- Zavuch can manage journals
CREATE POLICY "Zavuch can manage school journals"
ON public.journals FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'zavuch') AND EXISTS (
    SELECT 1 FROM profiles p
    JOIN classes c ON c.school_id = p.school_id
    WHERE p.user_id = auth.uid() AND c.id = journals.class_id
  )
)
WITH CHECK (
  has_role(auth.uid(), 'zavuch') AND EXISTS (
    SELECT 1 FROM profiles p
    JOIN classes c ON c.school_id = p.school_id
    WHERE p.user_id = auth.uid() AND c.id = journals.class_id
  )
);
