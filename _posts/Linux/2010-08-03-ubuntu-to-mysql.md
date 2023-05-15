---
layout: post
title: "Ubuntu에서 MySQL 원격 접속하기"
date: 2010-08-03 00:19:00+0900
categories: Linux
tags: Linux Utility MySQL
mathjax: true
---

MY-SQL 설치는 간단하게  
```
$sudo apt-get install mysql-server
```
으로 설치 하였습니다.

먼저 외부에서 접속이 가능하도록 설정파일을 수정

```
$sudo vim /etc/mysql/my.cnf   
```
으로 파일을 연뒤

> bind-address = 127.0.0.1 <-- 이부분을 #으로 주석처리 해줍니다. bind-address는 접속가능한 주소를 설정해주는 부분인데, 특정한 곳에서만 접속하고 싶다면 이 부분에 특정한 곳의 IP 주소를 입력해주면 됩니다.

그 다음으로 해야 할 일이 mysql에서 접속가능하도록 아이디를 설정해주는 부분입니다.
이 부분을 해주지 않으면

access denied for user 'root'@~~~~~~ 라는 에러가 뜹니다.

```
$mysql -u root -p
```
입력하면  
> Enter password:

가 뜨는데 mysql을 설치할때 설정한 루트 비밀번호를 입력하시면 됩니다

그럼 mysql가 실행되었으면 mysql>으로  프롬프트가 바뀌게 됩니다.  

```
mysql> use mysql;
mysql> GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '루트비밀번호' WITH GRANT OPTION;
```

이렇게 하면 root가 mysql에 접속할 권한을 가지게 됩니다.  
다른 아이디에게 접속 권하을 주려면 root자리에 해당 아이디를, 루트비밀번호에 해당 아이디의 비밀번호를 넣으시면 됩니다.  
