---
layout: post
title: "데이터 유무 확인을 위한 SQL 구현"
subtitle: "IN보다 Exists를 사용하자"
date: 2020-03-10 18:13:00+0900
categories: Database
tags: SQL MySQL
mathjax: true
---

IN 연산자는 보통 특정 Table(or View) Data에서 데이터를 추출하기 위해 사용합니다.  이를 응용하여 해당 테이블에 IN에서 지정된 데이터가 있는지 확인하는 용도로도 사용됩니다.
> select count(*) from data in (~~~)

하지만 IN에 지정되는 값을 모두 확인하기 때문에 IN에 지정된 데이터가 많아질 수록 느려질 수 밖에 없습니다.

# Exists 함수
서브 쿼리를 만족하면 그 즉시 해당 데이터를 반환합니다. 

## 사용법
EXISTS는 IN과 다르게 서브 쿼리를 이용하며, 서브 쿼리에는 검사하고자 하는 조건이 포함되어야 합니다.
> select * from ([데이터 A] where exists ([데이터 B]) B where [조건]);


## 예시
다음처럼 List 형태의 데이터를 가지고 있는 테이블이 있습니다.  
  * approval_id : tb_approval의 id(PK)
  * next_approval_approval_id : approval_id를 가리킴.  

next_approval_approval_id에 데이터가 있는데, 해당 데이터가 가리키는 데이터 없는 경우 문제가 발생합니다.  
해서, next_approaval_approval_id이 가리키는 approval_id가 없는 경우 찾고자 합니다.

> select A.next_approval_approval_id from   
	  (select * from tb_approval where next_approval_approval_id is not null) A where not exists   
			(select * from (select * from tb_approval) B where A.next_approval_approval_id = B.approval_id);  

(없는 경우를 찾고자 했으므로, not exists를 사용하였습니다.)


