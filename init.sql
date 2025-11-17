--
-- PostgreSQL database dump
--

\restrict Bmg5VbjNHddus5gERddEcMcTVqn4uIZMGtSbSOcOPQhfqOXlL2hWwIih36cPYh8

-- Dumped from database version 16.10 (Debian 16.10-1.pgdg13+1)
-- Dumped by pg_dump version 16.10 (Debian 16.10-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: boards; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.boards (
    id character varying(24) NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    userid character varying(24) NOT NULL
);


ALTER TABLE public.boards OWNER TO admin;

--
-- Name: boards_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.boards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.boards_id_seq OWNER TO admin;

--
-- Name: boards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.boards_id_seq OWNED BY public.boards.id;


--
-- Name: cards; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.cards (
    id character varying(24) NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    duedate date NOT NULL,
    priority integer NOT NULL,
    iscompleted boolean DEFAULT false NOT NULL,
    listid character varying(24) NOT NULL
);


ALTER TABLE public.cards OWNER TO admin;

--
-- Name: cards_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cards_id_seq OWNER TO admin;

--
-- Name: lists; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.lists (
    id character varying(24) NOT NULL,
    name character varying NOT NULL,
    boardid character varying(24) NOT NULL
);


ALTER TABLE public.lists OWNER TO admin;

--
-- Name: lists_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.lists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lists_id_seq OWNER TO admin;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.messages (
    id character varying(24) NOT NULL,
    userid character varying(24) NOT NULL,
    username text NOT NULL,
    content text NOT NULL,
    createdat timestamp without time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id character varying(24) NOT NULL,
    username character varying NOT NULL,
    password character varying NOT NULL
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: boards boards_pk; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_pk PRIMARY KEY (id);


--
-- Name: cards cards_pk; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pk PRIMARY KEY (id);


--
-- Name: lists lists_pk; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.lists
    ADD CONSTRAINT lists_pk PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: users users_pk; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pk PRIMARY KEY (id);


--
-- Name: boards boards_userid_fk; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_userid_fk FOREIGN KEY (userid)
    REFERENCES public.users(id)
    ON DELETE CASCADE;

--
-- Name: cards cards_listid_fk; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_listid_fk FOREIGN KEY (listid)
    REFERENCES public.lists(id)
    ON DELETE CASCADE;



--
-- Name: lists lists_boardid_fk; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.lists
    ADD CONSTRAINT lists_boardid_fk FOREIGN KEY (boardid)
    REFERENCES public.boards(id)
    ON DELETE CASCADE;


--
-- Name: messages messages_userid_fk; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_userid_fk FOREIGN KEY (userid)
    REFERENCES public.users(id)
    ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Bmg5VbjNHddus5gERddEcMcTVqn4uIZMGtSbSOcOPQhfqOXlL2hWwIih36cPYh8

