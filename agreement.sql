CREATE TABLE document (
  documentid int(11) primary key NOT NULL AUTO_INCREMENT,
  filename varchar(50) NOT NULL,
  createddate timestamp DEFAULT CURRENT_TIMESTAMP,
  updateddate date 
 );

CREATE TABLE payment (
  paymentid int(11) primary key NOT NULL AUTO_INCREMENT,
  amount decimal(9,2) NOT NULL,
  type varchar(50) NOT NULL,
  verified boolean DEFAULT false,
  comment varchar(255),
  paymentby int(11),
  documentid int(11),
  createddate timestamp DEFAULT CURRENT_TIMESTAMP,
  updateddate date ,
  CONSTRAINT `fk_document` FOREIGN KEY (`documentid`) REFERENCES `document` (`documentid`),
  CONSTRAINT `fk_paymentby` FOREIGN KEY (`paymentby`) REFERENCES `users` (`userid`)
 );

CREATE TABLE deferment (
  defermentid int(11) primary key NOT NULL AUTO_INCREMENT,
  reason varchar(255) NOT NULL,
  status varchar(50) NOT NULL,
  createddate timestamp DEFAULT CURRENT_TIMESTAMP,
  updateddate date 
 );

CREATE TABLE agreement (
  agreementid int(11) primary key NOT NULL AUTO_INCREMENT,
  lender varchar(50) NOT NULL,
  borrower varchar(50) NOT NULL,
  lawyer varchar(50),
  witness1 varchar(50) NOT NULL,
  witness2 varchar(50) NOT NULL,
  defermentid int(11),
  paymentid int(11),
  borrowedamount decimal(9,2) NOT NULL,
  repaidamount decimal(9,2) NOT NULL DEFAULT '0.00',
  repaymenttype varchar(50),
  currencyType varchar(50) NOT NULL,
  createddate timestamp DEFAULT CURRENT_TIMESTAMP,
  refundDate date NOT NULL,
  updateddate date,
  CONSTRAINT `fk_deferment` FOREIGN KEY (`defermentid`) REFERENCES `deferment` (`defermentid`),
  CONSTRAINT `fk_payment` FOREIGN KEY (`paymentid`) REFERENCES `payment` (`paymentid`), 
  CONSTRAINT `fk_lender` FOREIGN KEY (`lender`) REFERENCES `users` (`email`),
  CONSTRAINT `fk_borrower` FOREIGN KEY (`borrower`) REFERENCES `users` (`email`),
  CONSTRAINT `fk_lawyerr` FOREIGN KEY (`lawyer`) REFERENCES `users` (`email`),
  CONSTRAINT `fk_witness1` FOREIGN KEY (`witness1`) REFERENCES `users` (`email`),
  CONSTRAINT `fk_witness2` FOREIGN KEY (`witness2`) REFERENCES `users` (`email`)
 );


INSERT INTO document ( filename ) VALUES ('payment1');
INSERT INTO payment ( amount, type, verified,  comment, paymentby, documentid) VALUES (5000, 'Online Payment', false, 'first payment, thank you.', 2, 1);
INSERT INTO deferment ( reason, status ) VALUES ('I am broke', 'Accepted');
INSERT INTO agrementstatus ( userid ) VALUES (1);
INSERT INTO agreement ( lender, borrower, witness1, witness2, borrowedamount, refundDate, currencyType ) 
VALUES ("babatunde@gmail.com","ademola@gmail.com","monsurat@gmail.com","asamad@gmail.com",5000,'2020-3-15 00:00:00', 'Naira');



CREATE TABLE agreementtemp (
  agreementid int(11) primary key NOT NULL AUTO_INCREMENT,
  lender varchar(50) NOT NULL,
  borrower varchar(50) NOT NULL,
  lawyer varchar(50),
  witness1 varchar(50) NOT NULL,
  witness2 varchar(50) NOT NULL,
  borrowedamount decimal(9,2) NOT NULL,
  repaidamount decimal(9,2) NOT NULL DEFAULT '0.00',
  repaymenttype varchar(50),
  currencyType varchar(50) NOT NULL,
  lendersigned boolean DEFAULT false,
  borrowersigned boolean DEFAULT false,
  laywersigned boolean DEFAULT false,
  witness1signed boolean DEFAULT false,
  witness2signed boolean DEFAULT false,
  createddate timestamp DEFAULT CURRENT_TIMESTAMP,
  refundDate date NOT NULL,
  updateddate date
 );


-- Create trigger to update agreement table when agreement is updated

DELIMITER $$

CREATE TRIGGER agreementtemp_after_update 
      AFTER UPDATE ON agreementtemp
      FOR EACH ROW BEGIN
    IF ((select count(*) from agreementtemp 
      WHERE NEW.lendersigned = true
      AND NEW.borrowersigned = true
      AND NEW.witness2signed = true
      AND NEW.witness1signed = true))
      THEN
          INSERT INTO agreement ( lender, borrower, witness1, witness2, borrowedamount, refundDate, currencyType ) 
          VALUES ( NEW.lender, NEW.borrower, NEW.witness1, NEW.witness2, NEW.borrowedamount, NEW.refundDate, NEW.currencyType );
    END IF;
END $$
 DELIMITER ;

    -- {
    
    -- "lender" : "babatunde@gmail.com",
    -- "borrower": "ademola@gmail.com",
    -- "witness1": "monsurat@gmail.com",
    -- "witness2" : "asamad@gmail.com",
    -- "borrowedamount" : 5000,
    -- "repaymentdate" : "2019-3-15 00:00:00"
    	
    -- }



--    repaymenttype varchar(50), ["enumeration from code"]

-- steps to create agreement
-- 1. get the userId of the agreement creator
-- 2. update its role in userrole
-- 3. update its status from agrementstatus and get the statusid
-- 3. save agreement 
--  Update role while the agreement is first created

SELECT * FROM agreement ag 
  JOIN users u ON  u.userid = ag.lender 
  JOIN payment p ON  p.paymentid = ag.paymentid 
  JOIN deferment d ON  d.defermentid = ag.defermentid
  JOIN agrementstatus ags ON  ags.statusid = ag.statusid 
  WHERE agreementid = 1;


-- agreementid int(11) primary key NOT NULL AUTO_INCREMENT,
--   lender int(11) NOT NULL,
--   borrower int(11) NOT NULL,
--   lawyer int(11),
--   witness1 int(11) NOT NULL,
--   witness2 int(11) NOT NULL,
--   defermentid int(11),
--   paymentid int(11),
--   borrowedamount decimal(9,2) NOT NULL,
--   repaidamount decimal(9,2) NOT NULL DEFAULT '0.00',
--   repaymenttype varchar(50),
--   statusid int(11) NOT NULL,
--   createddate timestamp DEFAULT CURRENT_TIMESTAMP,
--   repaymentdate date NOT NULL,
--   updateddate date,


SELECT 
agreementid, 
lender, 
borrower, 
lawyer, 
witness1, 
witness2,
borrowedamount, 
repaidamount,
lendersigned,
borrowersigned,
laywersigned,
witness1signed,
witness2signed,
repaymentdate,
createddate,
updateddate
FROM agreement
  WHERE agreementid = 1;

