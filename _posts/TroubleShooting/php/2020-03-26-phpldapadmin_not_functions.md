---
layout: post
title: "[phpldapadmin] Function create_function() is deprecated"
subtitle: "Unrecoginized error number: 8192: Function create_function() is deprecated"
date: 2020-03-26 15:09:00+0900
categories: TroubleShooting
tags: PHP phpldapadmin
mathjax: true
---

# 오류 내용
Unrecognized error number: 8192: Function create_function() is deprecated
![error_png](/resource/phpldapadmin/phpldapadmin_create_function_is_deprecated.png)

# 시스템 구성
- Ubuntu 18.04 LTS
- PHP 7.2.24-0ubuntu0.18.04.3
- Apache/2.4.29
- phpldapadmin/bionic,bionic,now 1.2.2-6ubuntu1
- OpenLDAP: slapd  (Ubuntu) (Aug  8 2019 18:08:36)

# 원인 분석
Error를 발생 시킨 create_function()은 PHP 7.2부터 제거된 함수입니다.  
> Warning : This function has been DEPRECATED as of PHP 7.2.0. Relying on this function is highly discouraged.

# 문제 해결
phpldapadmin의 official website에서는 최신버전을 [sourceforege](https://sourceforge.net/projects/phpldapadmin/files)에서 다운로드 하라고 안내하고 있습니다.  
하지만 sourcefore에는 2012-10-01 이후로 업데이트 내역(2020-03-26 기준)이 없습니다.  
(php의 버전을 낮추는 것도 한 방법입니다...?)

혹시나 싶어서 github에 검색을 해보니 phpldapadmin 수정본(?)이 있었고, 그 중 leenoks님의 [phpLDAPadmin](https://github.com/leenooks/phpLDAPadmin)을 재설치하였습니다.

## 설치 방법
1. 기존에 apt 패키지 관리자로 설치한 경우, 기존 phpldapadmin 제거
```bash
#apt remove phpldapadmin
```
2. phpLDAPadmin를 github에서 다운로드
```bash
#git clone https://github.com/leenooks/phpLDAPadmin
```
3. phpLDAPadmin 환경 설정
```bash
#cp ./phpLDAPadmin/config/config.php.example ./phpLDAPadmin/conf/config.php
#vi ./phpLDAPadmin/config/config.php
```
4. phpLDAPadmin을 웹루트로 이동
```bash
#mv phpLDAPadmin /var/www/html/phpLDAPadmin
```
5. apache 재시작
```bash
#service apache2 restart
```
