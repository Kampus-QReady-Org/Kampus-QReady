--
-- PostgreSQL database dump
--

\restrict M4r33YsexypyPKTWSyKUQrnm682TSNUdocyO3clibBcLCHzS59cR7sfqLnBXmwA

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-09-15 13:24:32

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 16465)
-- Name: APPOINTMENT; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."APPOINTMENT" (
    "Visit_ID" integer NOT NULL,
    "Appt_Date" date,
    "Appt_time" time without time zone,
    "Appt_Status" character varying(50) DEFAULT 'scheduled'::character varying NOT NULL,
    CONSTRAINT chk_appointment_status CHECK ((("Appt_Status")::text = ANY ((ARRAY['scheduled'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'no_show'::character varying])::text[])))
);


--
-- TOC entry 224 (class 1259 OID 16434)
-- Name: CLINIC_VISIT; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CLINIC_VISIT" (
    "Visit_ID" integer NOT NULL,
    "User_ID" integer,
    "Visit_Start_Time" timestamp with time zone,
    "Visit_End_Time" timestamp with time zone,
    "Visit_Type" character(1) NOT NULL,
    CONSTRAINT chk_visit_type CHECK (("Visit_Type" = ANY (ARRAY['A'::bpchar, 'Q'::bpchar])))
);


--
-- TOC entry 223 (class 1259 OID 16433)
-- Name: CLINIC_VISIT_Visit_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."CLINIC_VISIT_Visit_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 223
-- Name: CLINIC_VISIT_Visit_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."CLINIC_VISIT_Visit_ID_seq" OWNED BY public."CLINIC_VISIT"."Visit_ID";


--
-- TOC entry 225 (class 1259 OID 16450)
-- Name: QUEUE; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."QUEUE" (
    "Visit_ID" integer NOT NULL,
    "Queue_Num" integer DEFAULT 0 NOT NULL,
    "Queue_Join_date" date NOT NULL,
    "Queue_Join_Time" time without time zone NOT NULL
);


--
-- TOC entry 222 (class 1259 OID 16419)
-- Name: STAFF; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."STAFF" (
    "User_ID" integer NOT NULL,
    "Staff_Number" character varying(50) NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 16407)
-- Name: STUDENT; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."STUDENT" (
    "User_ID" integer NOT NULL,
    "Student_No" character varying(8) NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: USER; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."USER" (
    "User_ID" integer NOT NULL,
    "U_FName" character varying(50) NOT NULL,
    "U_LName" character varying(50) NOT NULL,
    "U_Phone_Num" character varying(20),
    "U_Email" character varying(100) NOT NULL,
    "U_Pword_Hash" character varying(255) NOT NULL,
    "User_Is_Student" boolean DEFAULT false NOT NULL,
    "User_Is_Staff" boolean DEFAULT false NOT NULL,
    "User_Is_Admin" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: USER_User_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."USER_User_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 219
-- Name: USER_User_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."USER_User_ID_seq" OWNED BY public."USER"."User_ID";


--
-- TOC entry 4881 (class 2604 OID 16437)
-- Name: CLINIC_VISIT Visit_ID; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CLINIC_VISIT" ALTER COLUMN "Visit_ID" SET DEFAULT nextval('public."CLINIC_VISIT_Visit_ID_seq"'::regclass);


--
-- TOC entry 4877 (class 2604 OID 16393)
-- Name: USER User_ID; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."USER" ALTER COLUMN "User_ID" SET DEFAULT nextval('public."USER_User_ID_seq"'::regclass);


--
-- TOC entry 4899 (class 2606 OID 16473)
-- Name: APPOINTMENT APPOINTMENT_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."APPOINTMENT"
    ADD CONSTRAINT "APPOINTMENT_pkey" PRIMARY KEY ("Visit_ID");


--
-- TOC entry 4895 (class 2606 OID 16444)
-- Name: CLINIC_VISIT CLINIC_VISIT_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CLINIC_VISIT"
    ADD CONSTRAINT "CLINIC_VISIT_pkey" PRIMARY KEY ("Visit_ID");


--
-- TOC entry 4897 (class 2606 OID 16459)
-- Name: QUEUE QUEUE_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QUEUE"
    ADD CONSTRAINT "QUEUE_pkey" PRIMARY KEY ("Visit_ID");


--
-- TOC entry 4891 (class 2606 OID 16425)
-- Name: STAFF STAFF_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."STAFF"
    ADD CONSTRAINT "STAFF_pkey" PRIMARY KEY ("User_ID");


--
-- TOC entry 4889 (class 2606 OID 16413)
-- Name: STUDENT STUDENT_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."STUDENT"
    ADD CONSTRAINT "STUDENT_pkey" PRIMARY KEY ("User_ID");


--
-- TOC entry 4887 (class 2606 OID 16406)
-- Name: USER USER_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."USER"
    ADD CONSTRAINT "USER_pkey" PRIMARY KEY ("User_ID");


--
-- TOC entry 4893 (class 2606 OID 16427)
-- Name: STAFF Unique_staff_number; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."STAFF"
    ADD CONSTRAINT "Unique_staff_number" UNIQUE NULLS NOT DISTINCT ("Staff_Number");


--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 4893
-- Name: CONSTRAINT "Unique_staff_number" ON "STAFF"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT "Unique_staff_number" ON public."STAFF" IS 'Only 1 user can be linked to each staff number';


--
-- TOC entry 4904 (class 2606 OID 16474)
-- Name: APPOINTMENT fk_appointment_visit; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."APPOINTMENT"
    ADD CONSTRAINT fk_appointment_visit FOREIGN KEY ("Visit_ID") REFERENCES public."CLINIC_VISIT"("Visit_ID");


--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 4904
-- Name: CONSTRAINT fk_appointment_visit ON "APPOINTMENT"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT fk_appointment_visit ON public."APPOINTMENT" IS 'Appointment is a visit subtype';


--
-- TOC entry 4903 (class 2606 OID 16460)
-- Name: QUEUE fk_queue_visit; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QUEUE"
    ADD CONSTRAINT fk_queue_visit FOREIGN KEY ("Visit_ID") REFERENCES public."CLINIC_VISIT"("Visit_ID") ON DELETE CASCADE;


--
-- TOC entry 4901 (class 2606 OID 16428)
-- Name: STAFF fk_staff_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."STAFF"
    ADD CONSTRAINT fk_staff_user FOREIGN KEY ("User_ID") REFERENCES public."USER"("User_ID") ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 4901
-- Name: CONSTRAINT fk_staff_user ON "STAFF"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT fk_staff_user ON public."STAFF" IS 'Staff is a subtype of user';


--
-- TOC entry 4900 (class 2606 OID 16414)
-- Name: STUDENT fk_student_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."STUDENT"
    ADD CONSTRAINT fk_student_user FOREIGN KEY ("User_ID") REFERENCES public."USER"("User_ID") ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 4900
-- Name: CONSTRAINT fk_student_user ON "STUDENT"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT fk_student_user ON public."STUDENT" IS 'Student is a subtype of user';


--
-- TOC entry 4902 (class 2606 OID 16445)
-- Name: CLINIC_VISIT fk_visit_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CLINIC_VISIT"
    ADD CONSTRAINT fk_visit_user FOREIGN KEY ("User_ID") REFERENCES public."USER"("User_ID");


--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 4902
-- Name: CONSTRAINT fk_visit_user ON "CLINIC_VISIT"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT fk_visit_user ON public."CLINIC_VISIT" IS 'Each visit must have a patient';


-- Completed on 2026-09-15 13:24:33

--
-- PostgreSQL database dump complete
--

\unrestrict M4r33YsexypyPKTWSyKUQrnm682TSNUdocyO3clibBcLCHzS59cR7sfqLnBXmwA

