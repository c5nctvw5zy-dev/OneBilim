
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  online_link text,
  school_id uuid NOT NULL,
  registered_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School members can view books" ON public.books
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

CREATE POLICY "Librarians can manage books" ON public.books
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'librarian') AND school_id = get_my_school_id())
  WITH CHECK (has_role(auth.uid(), 'librarian') AND school_id = get_my_school_id());

CREATE POLICY "Directors can manage books" ON public.books
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'director') AND school_id = get_my_school_id())
  WITH CHECK (has_role(auth.uid(), 'director') AND school_id = get_my_school_id());

CREATE TABLE public.book_borrowers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  borrower_name text NOT NULL,
  borrow_start date NOT NULL,
  borrow_end date NOT NULL,
  school_id uuid NOT NULL,
  registered_by uuid NOT NULL,
  returned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.book_borrowers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School members can view borrowers" ON public.book_borrowers
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

CREATE POLICY "Librarians can manage borrowers" ON public.book_borrowers
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'librarian') AND school_id = get_my_school_id())
  WITH CHECK (has_role(auth.uid(), 'librarian') AND school_id = get_my_school_id());

CREATE TABLE public.holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  title text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  type text NOT NULL DEFAULT 'holiday',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School members can view holidays" ON public.holidays
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

CREATE POLICY "Directors can manage holidays" ON public.holidays
  FOR ALL TO authenticated
  USING ((has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'zavuch')) AND school_id = get_my_school_id())
  WITH CHECK ((has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'zavuch')) AND school_id = get_my_school_id());
