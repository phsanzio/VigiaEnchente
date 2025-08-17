-- drop database VigiaEnchente;
create database IF not exists VigiaEnchente;
use VigiaEnchente;

create table if not exists Users (
    id_user INT(11) AUTO_INCREMENT PRIMARY KEY,
    nome varchar(255) NOT NULL,
    email varchar(255) UNIQUE NOT NULL,
    phone varchar(15) UNIQUE NOT NULL,
    senha varchar(255) NOT NULL
);

create table Address (
    id_address INT AUTO_INCREMENT PRIMARY KEY,
    id_address_user INT(11) UNIQUE,
    FOREIGN KEY (id_address_user) REFERENCES Users(id_user)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    rua VARCHAR(45),
    num_rua VARCHAR(45),
    cep VARCHAR(8),
    bairro VARCHAR(45),
    cidade VARCHAR(45)
);

create table if not exists Phone (
    id_phone_user int(11),
    foreign key (id_phone_user) references Users(id_user)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    id_phone int,
    numero varchar(15),
    primary key (id_phone, id_phone_user)
);

create table if not exists Message (
    id_msg INT(11) AUTO_INCREMENT,
    id_user_msg int(11),
    date_msg date,
    hour_msg timestamp,
    content_msg text(4096),
    primary key (id_msg, id_user_msg),
    unique key (id_msg),
    foreign key (id_user_msg) references Users(id_user)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

create table if not exists Alert (
    id_alert INT(11) AUTO_INCREMENT,
    date_alert date,
    hour_alert timestamp,
    content_alert text(4096),
    id_msg_alert int(11),
    primary key (id_alert, id_msg_alert),
    foreign key (id_msg_alert) references Message(id_msg) 
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Subscriptions (
  endpoint VARCHAR(1024) PRIMARY KEY,
  p256dh VARCHAR(255),
  auth VARCHAR(255),
  user_id INT(11) NULL,
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id_user) ON DELETE SET NULL ON UPDATE CASCADE
);
