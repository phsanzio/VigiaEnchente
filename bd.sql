create database IF not exists VigiaEnchente;
use VigiaEnchente;

create table if not exists Users (
    id_user INT(11) primary key,
    nome varchar(255)
);

create table if not exists Address (
    id_address_user int(11),
    foreign key (id_address_user) references Users(id_user) 
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    id_address int,
    rua varchar(45),
    cep varchar(8),
    bairro varchar(45),
    num_rua varchar(45),
    primary key (id_address, id_address_user)
);

create table if not exists Phone (
    id_phone_user int(11),
    foreign key (id_phone_user) references Users(id_user) 
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    id_phone int,
    numero varchar(11),
    primary key (id_phone, id_phone_user)
);

create table if not exists Message (
    id_msg INT(11),
    date_msg date,
    hour_msg timestamp,
    content_msg text(4096),
    id_user_msg int(11),
    foreign key (id_user_msg) references Users(id_user) 
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    primary key (id_msg, id_user_msg)
);

create table if not exists Alert (
    id_alert INT(11),
    date_alert date,
    hour_alert timestamp,
    content_alert text(4096),
    id_msg_alert int(11),
    foreign key (id_msg_alert) references Message(id_msg) 
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    primary key (id_alert, id_msg_alert)
);