CREATE TABLE items ( 
        id     serial  NOT NULL,
        title  text    NOT NULL,
        completed boolean DEFAULT false,
        url text,
        CONSTRAINT items_pkey PRIMARY KEY ( id )
       );
