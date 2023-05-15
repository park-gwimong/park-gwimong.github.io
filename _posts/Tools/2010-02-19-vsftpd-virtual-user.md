---
layout: post
title: "가상유저로 vsftpd 운영하기"
date: 2010-02-19 08:21:00+0900
categories: Tools
tags: Tools vsftp
mathjax: true
---

실제 권한을 가지고 있는 계정이 아닌 ftp에 접속할 때만 사용되는 가상의 계정을 사용하여 ftp를 좀 더 안전하게 운영하는 방법이 있어서 해보았는데, 일주일동안 삽질을 하다가 어떨결에 성공하긴 했는데...이에 대해서 정리를 하고자 합니다.  

http://www.superuser.co.kr/linux/rootman/vsftp/vsftp_virtualuser.html <--를 참고하였습니다.  

# 설정 방법

## 1, 유저 파일 생성
가상으로 ftp에 접속할 아이디와 패스워드 텍스트 파일 생성
첫재줄은 유저아이디, 그다음줄은 그 위의 아이디에 대한 비밀번호, 그 다음줄은 아이디, 그 다음줄은 그 윗줄의 아이디에 대한 비밀번호......... 이런식으로 된 텍스트 파일 입니다  
```
$cat virtual_user.txt
gaga
1234
ggaa
1122
```

## 2. 유저 정보 설정
만들어진 아이디와 패스워드 파일을 DB 파일로 변환하여 /etc 밑에 저장합니다.  
(만약 db4-utils가 설치되어 있지 않다면 DB파일로 변환하기 위해 db4-utils 를 설치합니다.
현재 제가 설치한 버전은 db4.6-util 이였습니다.)

```
$apt-get install db4.6-util
$db4.6_load -T -t hash -f virtual_user.txt /etc/vsftpd_login.db
```

## 3. 접속 권한 설정
이제 저희가 만든 db파일로 pam 인증을 하기 위해 pam파일을 생성해 주어야 합니다.  
(만약 pam이 정식으로 포함되어 있지 않는 배포판이라면 따로 설치해 주셔야 합니다.  
http://link.allblog.net/11479312/http://jinsnet.com/13 참고)

vi편짐기로 /etc/pam.d/vsftpd를 열어 pam파일을 설정합니다.

```
$vi /etc/pam.d/vsftpd
```
(만약 /etc/pam.d/vsftpd에 이미 다른 내용들이 들어있다면 모두 주석처리를 합니다)

```
auth required /lib/security/pam_userdb.so db=/etc/vsftpd_login
account required /lib/security/pam_userdb.so db=/etc/vsftpd_login

/lib/security/pam_userdb.so db=/etc/vsftpd_login
pam_userdb.so모듈에 대한 DB파일의 경로를 지정
```

## 4. 실제 계정 생성
가상유저를 연결할 실제 계정과 디렉토리를 생성합니다.  
가상유저를 말그대로 실제로는 존재하지 않는 계정이기때문에 시스템에 어떠한 영향을 끼칠수 없습니다.  
그러면 실제로 파일을 생성하거나 삭제하거나 같은 작업을 할 수 없습니다. 그렇기 때문에 실제 계정을 하나 만들어 그 계정에 가상 유저들을 연결 시킴으로써 하나의 실제 계정으로 여러개의 가상 계정들을 관리할 수 있습니다.  
여기서는 실제 계정으로 virtual 이라는 계정을 생성하고 해당 계정이 사용할 디렉토리를 생성하였습니다.  

```
$mkdir /home/virtual
$useradd -d /home/virtual virtual
```

홈디렉토리로써의 역활을 하기 위해 hosts 파일을 복사합니다.
```
$cp /etc/hosts /home/virtual/hosts
```

## 5. 실제 디렉토리 생성
가상유저들이 사용할 디렉토리들을 생성합니다.  
가상유저들마다 독립적인 디렉토리를 가지게 하기 위해서 가상 유저들이 사용할 디렉토리들을 만들겠습니다.
```
$mkdir /home/virtual/gaga
$mkdir /home/virtual/ggaa
```
그리고 가상 유저들을 관리하는 실제 계정이 virtual 임으로 그룹과 소유 권한을 virtual로 지정해주겠습니다.  

```
$chown virtual.virtual /home/virtual/gaga
$chown virtual.virtual /home/virtual/ggaa
```

## 6. vsfpt 설정
이제 가상유저로 접속하기위 vsftp설정 파일을 수정합니다.  
```bash
$vi /etc/vsftpd.conf
#익명 접속을 막기위해, 익명 접속을 허용하려면  YES,
anonymous_enable=NO
#가상유저 계정도 실제계정을 통해 접속하므로 YES
local_enable=YES
#파일 쓰기 권한 허용, 허용하지 않으려면 NO
write_enable=YES
#업로드된 파일의 기본 권한 설정
local_umask=022
dirmessage_enable=YES
xferlog_enable=YES
connect_from_port_20=YES
xferlog_file=/var/log/vsftpd.log
#가상유저들이 자신의 홈디렉토리보다 상위로 올라가지 못하게 하기 위해
chroot_local_user=YES
#가상FTP는 Standalone 모드에서만 작동하기 때문에 listen을 YES로 설정
listen=YES
#접속할 포트 번호를 설정, 1004번으로 설정하였다
listen_port=1004
#가상유저를 사용할 것인지를 설정.
guest_enable=YES
#가상유저와 연결할 실제계정을 설정
guest_username=virtual
#가상유저로 인증할 pam 서비스 이름을 설정, 위에서 pam.d 디렉토리에 저장한 pam 파일 이름을 적어주면 됩니다.
pam_service_name=vsftpd
#가상유저들이 실제 시스템 유저의 권한을 주기 위한 설정
virtual_use_local_privs=YES
#가상유저들의 홈 디렉토리를 설정해주는 부분입니다.
user_sub_token=$USER
local_root=/home/virtual/$USER
```
(원래 있던 부분은 주석을 제거하시고 수정을 하시고, 없으신 내용만 추가하세요)

## 6. vsftp 재시작
이로써 모든 설정을 끝났습니다. vsftpd를 재시작 해주면 끝.  
```
$/etc/init.d/vsftpd restart
```